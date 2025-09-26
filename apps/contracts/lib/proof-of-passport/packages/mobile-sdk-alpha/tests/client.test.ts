// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { describe, expect, it, vi } from 'vitest';

import type { CryptoAdapter, DocumentsAdapter, NetworkAdapter, ScannerAdapter } from '../src';
import { createListenersMap, createSelfClient, SdkEvents } from '../src/index';
import { AuthAdapter } from '../src/types/public';

describe('createSelfClient', () => {
  // Test eager validation during client creation
  it('throws when scanner adapter missing during creation', () => {
    expect(() =>
      createSelfClient({
        config: {},
        // @ts-expect-error -- missing adapters
        adapters: {
          documents,
          auth,
          network,
          crypto,
        },
      }),
    ).toThrow('scanner adapter not provided');
  });

  it('throws when network adapter missing during creation', () => {
    // @ts-expect-error -- missing adapters
    expect(() => createSelfClient({ config: {}, adapters: { scanner, crypto, documents, auth } })).toThrow(
      'network adapter not provided',
    );
  });

  it('throws when crypto adapter missing during creation', () => {
    // @ts-expect-error -- missing adapters
    expect(() => createSelfClient({ config: {}, adapters: { scanner, network, documents, auth } })).toThrow(
      'crypto adapter not provided',
    );
  });

  it('throws when documents adapter missing during creation', () => {
    // @ts-expect-error -- missing adapters
    expect(() => createSelfClient({ config: {}, adapters: { scanner, network, crypto, auth } })).toThrow(
      'documents adapter not provided',
    );
  });

  it('creates client successfully with all required adapters', () => {
    const client = createSelfClient({
      config: {},
      adapters: { scanner, network, crypto, documents, auth },
      listeners: new Map(),
    });
    expect(client).toBeTruthy();
  });

  it('scans document with provided adapter', async () => {
    const scanMock = vi.fn().mockResolvedValue({ mode: 'qr', data: 'self://ok' });
    const client = createSelfClient({
      config: {},
      adapters: { scanner: { scan: scanMock }, network, crypto, documents, auth },
      listeners: new Map(),
    });
    const result = await client.scanDocument({ mode: 'qr' });
    expect(result).toEqual({ mode: 'qr', data: 'self://ok' });
    expect(scanMock).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: 'qr',
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('propagates scanner errors', async () => {
    const err = new Error('scan failed');
    const scanMock = vi.fn().mockRejectedValue(err);
    const client = createSelfClient({
      config: {},
      adapters: { scanner: { scan: scanMock }, network, crypto, documents, auth },
      listeners: new Map(),
    });
    await expect(client.scanDocument({ mode: 'qr' })).rejects.toBe(err);
  });

  it('emits and unsubscribes events', () => {
    const listeners = createListenersMap();

    const passportNotSupportedListener = vi.fn();
    const accountRecoveryChoiceListener = vi.fn();
    const anotherAccountRecoveryChoiceListener = vi.fn();

    listeners.addListener(SdkEvents.PROVING_PASSPORT_NOT_SUPPORTED, passportNotSupportedListener);
    listeners.addListener(SdkEvents.PROVING_ACCOUNT_RECOVERY_REQUIRED, accountRecoveryChoiceListener);
    listeners.addListener(SdkEvents.PROVING_ACCOUNT_RECOVERY_REQUIRED, anotherAccountRecoveryChoiceListener);

    const client = createSelfClient({
      config: {},
      adapters: { scanner, network, crypto, documents, auth },
      listeners: listeners.map,
    });

    client.emit(SdkEvents.PROVING_PASSPORT_NOT_SUPPORTED, { countryCode: 'test', documentCategory: 'passport' });
    client.emit(SdkEvents.PROVING_ACCOUNT_RECOVERY_REQUIRED);
    client.emit(SdkEvents.PROVING_REGISTER_ERROR_OR_FAILURE, { hasValidDocument: true });

    expect(accountRecoveryChoiceListener).toHaveBeenCalledTimes(1);
    expect(accountRecoveryChoiceListener).toHaveBeenCalledWith(undefined);
    expect(anotherAccountRecoveryChoiceListener).toHaveBeenCalledTimes(1);
    expect(anotherAccountRecoveryChoiceListener).toHaveBeenCalledWith(undefined);

    expect(passportNotSupportedListener).toHaveBeenCalledWith({ countryCode: 'test', documentCategory: 'passport' });
    expect(passportNotSupportedListener).toHaveBeenCalledTimes(1);

    client.emit(SdkEvents.PROVING_PASSPORT_NOT_SUPPORTED, { countryCode: 'test', documentCategory: 'passport' });
    client.emit(SdkEvents.PROVING_ACCOUNT_RECOVERY_REQUIRED);
    client.emit(SdkEvents.PROVING_REGISTER_ERROR_OR_FAILURE, { hasValidDocument: true });

    expect(passportNotSupportedListener).toHaveBeenCalledTimes(2);
    expect(accountRecoveryChoiceListener).toHaveBeenCalledTimes(2);
    expect(anotherAccountRecoveryChoiceListener).toHaveBeenCalledTimes(2);
  });

  it('parses MRZ via client', () => {
    const client = createSelfClient({
      config: {},
      adapters: { scanner, network, crypto, documents, auth },
      listeners: new Map(),
    });
    const sample = `P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408122F1204159ZE184226B<<<<<10`;
    const info = client.extractMRZInfo(sample);
    expect(info.documentNumber).toBe('L898902C3');
    expect(info.validation?.overall).toBe(true);
  });

  describe('when analytics adapter is given', () => {
    it('calls that adapter for trackEvent', () => {
      const trackEvent = vi.fn();
      const client = createSelfClient({
        config: {},
        adapters: {
          scanner,
          network,
          crypto,
          documents,
          analytics: { trackEvent },
          auth: { getPrivateKey: () => Promise.resolve('stubbed-private-key') },
        },
        listeners: new Map(),
      });

      client.trackEvent('test_event');
      expect(trackEvent).toHaveBeenCalledOnce();
      expect(trackEvent).toHaveBeenCalledWith('test_event', undefined);
      client.trackEvent('another_event', { foo: 'bar' });
      expect(trackEvent).toHaveBeenCalledWith('another_event', { foo: 'bar' });
    });
  });
  describe('when auth adapter is given', () => {
    it('getPrivateKey becomes callable on the client', async () => {
      const getPrivateKey = vi.fn(() => Promise.resolve('stubbed-private-key'));
      const client = createSelfClient({
        config: {},
        adapters: { scanner, network, crypto, documents, auth: { getPrivateKey } },
        listeners: new Map(),
      });

      await expect(client.getPrivateKey()).resolves.toBe('stubbed-private-key');
    });
    it('hasPrivateKey becomes callable on the client', async () => {
      const getPrivateKey = vi.fn(() => Promise.resolve('stubbed-private-key'));
      const client = createSelfClient({
        config: {},
        adapters: { scanner, network, crypto, documents, auth: { getPrivateKey } },
        listeners: new Map(),
      });
      await expect(client.hasPrivateKey()).resolves.toBe(true);
    });
  });
});

const scanner: ScannerAdapter = {
  scan: async () => ({ mode: 'qr', data: 'stub' }),
};

const network: NetworkAdapter = {
  http: { fetch: async () => new Response(null) },
  ws: {
    connect: () => ({
      send: () => {},
      close: () => {},
      onMessage: () => {},
      onError: () => {},
      onClose: () => {},
    }),
  },
};

const crypto: CryptoAdapter = {
  hash: async () => new Uint8Array(),
  sign: async () => new Uint8Array(),
};

const auth: AuthAdapter = {
  getPrivateKey: async () => 'secret',
};

const documents: DocumentsAdapter = {
  loadDocumentCatalog: async () => ({ documents: [] }),
  loadDocumentById: async () => null,
  saveDocumentCatalog: async () => {},
  saveDocument: async () => {},
  deleteDocument: async () => {},
};
