import { expect } from "chai";
import { ethers } from "hardhat";
import { deploySystemFixturesV2 } from "../utils/deploymentV2";
import { DeployedActorsV2 } from "../utils/types";
import { AADHAAR_ATTESTATION_ID } from "@selfxyz/common/constants/constants";
import { prepareAadhaarRegisterTestData } from "@selfxyz/common";
import path from "path";
import { generateRandomFieldElement } from "../utils/utils";
import { generateRegisterAadhaarProof } from "../utils/generateProof";
import fs from "fs";

const privateKeyPem = fs.readFileSync(
  path.join(__dirname, "../../../node_modules/anon-aadhaar-circuits/assets/testPrivateKey.pem"),
  "utf8",
);
const pubkeyPem = fs.readFileSync(
  path.join(__dirname, "../../../common/src/utils/aadhaar/assets/testPublicKey.pem"),
  "utf8",
);

describe("Aadhaar Registration test", function () {
  this.timeout(0);

  let deployedActors: DeployedActorsV2;
  let snapshotId: string;
  let attestationIdBytes32: string;

  before(async () => {
    deployedActors = await deploySystemFixturesV2();
    attestationIdBytes32 = ethers.zeroPadValue(ethers.toBeHex(BigInt(AADHAAR_ATTESTATION_ID)), 32);

    console.log("🎉 System deployment and initial setup completed!");
  });

  beforeEach(async () => {
    snapshotId = await ethers.provider.send("evm_snapshot", []);
  });

  afterEach(async () => {
    await ethers.provider.send("evm_revert", [snapshotId]);
  });

  describe("UIDAI Pubkey Commitment", () => {
    it("should successfully register UIDAI pubkey commitment from the owner", async () => {
      const block = await ethers.provider.getBlock("latest");
      if (!block) {
        throw new Error("Block timestamp not found");
      }
      const blockTimestamp = BigInt(block.timestamp) + 1000n;
      await expect(deployedActors.registryAadhaar.registerUidaiPubkeyCommitment(1n, blockTimestamp)).to.emit(
        deployedActors.registryAadhaar,
        "UidaiPubkeyCommitmentRegistered",
      );
    });

    it("should not register UIDAI pubkey commitment if expiry is in the past", async () => {
      const block = await ethers.provider.getBlock("latest");
      if (!block) {
        throw new Error("Block timestamp not found");
      }
      const blockTimestamp = BigInt(block.timestamp) - 1000n;
      await expect(
        deployedActors.registryAadhaar.registerUidaiPubkeyCommitment(1n, blockTimestamp),
      ).to.be.revertedWithCustomError(deployedActors.registryAadhaar, "EXPIRY_IN_PAST");
    });
  });

  describe("Identity Commitment", () => {
    let aadhaarData: any;
    let registerProof: any;
    let registerSecret: string;

    before(async () => {
      aadhaarData = prepareAadhaarRegisterTestData(
        privateKeyPem,
        pubkeyPem,
        "1234",
        "Sumit Kumar",
        "01-01-1984",
        "M",
        "110051",
        "WB",
      );

      registerSecret = generateRandomFieldElement();

      registerProof = await generateRegisterAadhaarProof(registerSecret, aadhaarData.inputs);
    });

    it("should successfully register identity commitment", async () => {
      await expect(deployedActors.hub.registerCommitment(attestationIdBytes32, 0n, registerProof)).to.emit(
        deployedActors.registryAadhaar,
        "CommitmentRegistered",
      );

      const isRegistered = await deployedActors.registryAadhaar.nullifiers(registerProof.pubSignals[1]);
      expect(isRegistered).to.be.true;
    });

    it("should not register identity commitment if the proof is invalid", async () => {
      const newRegisterProof = structuredClone(registerProof);
      newRegisterProof.a[0] = 0n;
      await expect(
        deployedActors.hub.registerCommitment(attestationIdBytes32, 0n, {
          ...newRegisterProof,
          pubSignals: [...newRegisterProof.pubSignals],
        }),
      ).to.be.revertedWithCustomError(deployedActors.hub, "InvalidRegisterProof");
    });

    it("should fail with NoVerifierSet when using non-existent register verifier ID", async () => {
      const nonExistentVerifierId = 999999; // Non-existent verifier ID

      await expect(
        deployedActors.hub.registerCommitment(attestationIdBytes32, nonExistentVerifierId, registerProof),
      ).to.be.revertedWithCustomError(deployedActors.hub, "NoVerifierSet");
    });

    it("should fail with NoVerifierSet when register verifier exists but attestation ID is invalid", async () => {
      const invalidAttestationId = ethers.zeroPadValue(ethers.toBeHex(999), 32);

      await expect(
        deployedActors.hub.registerCommitment(invalidAttestationId, 0n, registerProof),
      ).to.be.revertedWithCustomError(deployedActors.hub, "NoVerifierSet");
    });

    it("should fail with InvalidAttestationId when register verifier exists but attestation ID is invalid", async () => {
      const invalidAttestationId = ethers.zeroPadValue(ethers.toBeHex(999), 32);

      await deployedActors.hub.updateRegisterCircuitVerifier(
        invalidAttestationId,
        1n,
        await deployedActors.registryAadhaar.getAddress(),
      );

      await expect(
        deployedActors.hub.registerCommitment(invalidAttestationId, 1n, registerProof),
      ).to.be.revertedWithCustomError(deployedActors.hub, "InvalidAttestationId");
    });

    it("should fail with InvalidUidaiPubkey when UIDAI pubkey commitment is not registered", async () => {
      const newRegisterProof = structuredClone(registerProof);
      newRegisterProof.pubSignals[0] = 0n;

      await expect(
        deployedActors.hub.registerCommitment(attestationIdBytes32, 0n, newRegisterProof),
      ).to.be.revertedWithCustomError(deployedActors.hub, "InvalidPubkey");
    });

    it("should not fail if timestamp is within 20 minutes", async () => {
      const newAadhaarData = prepareAadhaarRegisterTestData(
        privateKeyPem,
        pubkeyPem,
        "1234",
        "Sumit Kumar",
        "01-01-1984",
        "M",
        "110051",
        "WB",
        //timestamp 10 minutes ago and converted to timestamp string
        new Date(Date.now() - 10 * 60 * 1000).getTime().toString(),
      );
      const newRegisterProof = await generateRegisterAadhaarProof(registerSecret, newAadhaarData.inputs);

      await expect(deployedActors.hub.registerCommitment(attestationIdBytes32, 0n, newRegisterProof)).to.not.be
        .reverted;
    });

    it("should fail with InvalidUidaiTimestamp when UIDAI timestamp is not within 20 minutes of current time", async () => {
      const newAadhaarData = prepareAadhaarRegisterTestData(
        privateKeyPem,
        pubkeyPem,
        "1234",
        "Sumit Kumar",
        "01-01-1984",
        "M",
        "110051",
        "WB",
        //timestamp 30 minutes ago and converted to timestamp string
        new Date(Date.now() - 30 * 60 * 1000).getTime().toString(),
      );
      const newRegisterProof = await generateRegisterAadhaarProof(registerSecret, newAadhaarData.inputs);

      await expect(
        deployedActors.hub.registerCommitment(attestationIdBytes32, 0n, newRegisterProof),
      ).to.be.revertedWithCustomError(deployedActors.hub, "InvalidUidaiTimestamp");
    });
  });
});
