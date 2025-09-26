// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { FC } from 'react';
import { Dimensions } from 'react-native';
import { Separator, Text, XStack, YStack } from 'tamagui';

import {
  AadhaarData,
  isAadhaarDocument,
  isMRZDocument,
  PassportData,
} from '@selfxyz/common';
import {
  attributeToPosition,
  attributeToPosition_ID,
} from '@selfxyz/common/constants';

import { SvgXml } from '@/components/homeScreen/SvgXmlWrapper';
import AadhaarIcon from '@/images/icons/aadhaar.svg';
import EPassport from '@/images/icons/epassport.svg';
import LogoGray from '@/images/logo_gray.svg';
import {
  black,
  slate100,
  slate300,
  slate400,
  slate500,
  white,
} from '@/utils/colors';
import { dinot, plexMono } from '@/utils/fonts';

// Import the logo SVG as a string
const logoSvg = `<svg width="47" height="46" viewBox="0 0 47 46" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M12.7814 13.2168C12.7814 12.7057 13.1992 12.2969 13.7214 12.2969H30.0017L42.5676 0H11.2408L0 11.0001V29.0973H12.7814V13.2104V13.2168Z" fill="white"/>
<path d="M34.2186 16.8515V32.3552C34.2186 32.8663 33.8008 33.2751 33.2786 33.2751H17.4357L4.43236 46H35.7592L47 34.9999V16.8579H34.2186V16.8515Z" fill="white"/>
<path d="M28.9703 17.6525H18.0362V28.3539H28.9703V17.6525Z" fill="#00FFB6"/>
</svg>`;

interface IdCardLayoutAttributes {
  idDocument: PassportData | AadhaarData | null;
  selected: boolean;
  hidden: boolean;
}

// This layout should be fully adaptative. I should perfectly fit in any screen size.
// the font size should adapt according to the size available to fit perfectly.
// only svg are allowed.
// each element size should be determined as % of the screen or the parent element
// the border radius should be adaptative too, as well as the padding
// this is the v0 of this component so we should only use placholders for now, no need to pass the real passport data as parameters.
const IdCardLayout: FC<IdCardLayoutAttributes> = ({
  idDocument,
  selected,
  hidden,
}) => {
  // Early return if document is null
  if (!idDocument) {
    return null;
  }

  // Function to mask MRZ characters except '<' and spaces
  const maskMrzValue = (text: string): string => {
    return text.replace(/./g, 'X');
  };

  // Get screen dimensions for adaptive sizing
  const { width: screenWidth } = Dimensions.get('window');

  // Calculate adaptive sizes based on screen dimensions
  // Reduce width slightly to account for horizontal margins (8px each side = 16px total)
  const cardWidth = screenWidth * 0.95 - 16; // 90% of screen width minus margin space
  const cardHeight = selected ? cardWidth * 0.645 : cardWidth * 0.645 * 0.3; // ID card aspect ratio (roughly 1.6:1)
  const borderRadius = cardWidth * 0.04; // 4% of card width
  const padding = cardWidth * 0.035; // 4% of card width
  const fontSize = {
    large: cardWidth * 0.045,
    medium: cardWidth * 0.032,
    small: cardWidth * 0.028,
    xsmall: cardWidth * 0.022,
  };

  // Image dimensions (standard ID photo ratio)
  const imageSize = {
    width: cardWidth * 0.2, // 25% of card width
    height: cardWidth * 0.29, // ID photo aspect ratio
  };

  // Shared left offset for content that should align with the start of the attributes block
  const contentLeftOffset = imageSize.width + padding;

  return (
    // Container wrapper to handle shadow space properly
    <YStack
      width="100%" // Add space for horizontal margins
      alignItems="center"
      justifyContent="center"
    >
      <YStack
        width={cardWidth}
        height={cardHeight}
        backgroundColor={white}
        borderRadius={borderRadius}
        borderWidth={0.75}
        borderColor={'#E0E0E0'}
        padding={padding}
        // Improved shadow configuration for better visibility and containment
        shadowColor={black}
        shadowOffset={{ width: 0, height: 2 }}
        shadowOpacity={0.1}
        shadowRadius={4}
        elevation={4}
        // Add margins to provide space for shadow bleeding
        marginBottom={8}
        justifyContent="center"
      >
        {/* Header Section */}
        <XStack>
          <XStack alignItems="center">
            {idDocument.documentCategory === 'aadhaar' ? (
              <AadhaarIcon
                width={fontSize.large * 3}
                height={fontSize.large * 3 * 0.617}
              />
            ) : (
              <EPassport
                width={fontSize.large * 3}
                height={fontSize.large * 3 * 0.617}
              />
            )}
            <YStack marginLeft={imageSize.width - fontSize.large * 3}>
              <Text
                fontWeight="bold"
                fontFamily={dinot}
                fontSize={fontSize.large * 1.4}
                color="black"
              >
                {idDocument.documentCategory === 'passport'
                  ? 'Passport'
                  : idDocument.documentCategory === 'aadhaar'
                    ? 'Aadhaar'
                    : 'ID Card'}
              </Text>
              <Text
                fontSize={fontSize.small}
                color={'#9193A2'}
                fontFamily={dinot}
              >
                Verified{' '}
                {idDocument.documentCategory === 'passport'
                  ? 'Biometric Passport'
                  : idDocument.documentCategory === 'aadhaar'
                    ? 'Aadhaar Document'
                    : 'Biometric ID Card'}
              </Text>
            </YStack>
          </XStack>
          <XStack flex={1} justifyContent="flex-end">
            {idDocument.mock && (
              <YStack
                marginTop={padding / 4}
                borderWidth={1}
                borderColor={slate300}
                borderRadius={100}
                paddingHorizontal={padding / 2}
                alignSelf="flex-start"
                backgroundColor={slate100}
                paddingVertical={padding / 8}
              >
                <Text
                  fontSize={fontSize.xsmall}
                  color={slate400}
                  fontFamily={dinot}
                  letterSpacing={fontSize.xsmall * 0.15}
                >
                  DEVELOPER
                </Text>
              </YStack>
            )}
          </XStack>
        </XStack>

        {selected && (
          <Separator
            backgroundColor={'#E0E0E0'}
            height={1}
            width={cardWidth - 1}
            marginLeft={-padding}
            marginTop={padding}
          />
        )}

        {/* Main Content Section */}
        {selected && (
          <XStack height="60%" paddingVertical={padding}>
            {/* Person Image */}
            <YStack
              width={imageSize.width}
              height={imageSize.height}
              backgroundColor="#F5F5F5"
              borderRadius={borderRadius * 0.5}
              justifyContent="center"
              alignItems="center"
              marginRight={padding}
              opacity={hidden ? 0.3 : 1}
            >
              <SvgXml
                xml={logoSvg}
                width={imageSize.width * 0.6}
                height={imageSize.height * 0.6}
              />
            </YStack>

            {/* ID Attributes */}
            <YStack
              flex={1}
              justifyContent="space-between"
              height={imageSize.height}
            >
              <XStack flex={1} gap={padding * 0.3}>
                <YStack flex={1}>
                  <IdAttribute
                    name="TYPE"
                    value={
                      idDocument.documentCategory === 'passport'
                        ? 'PASSPORT'
                        : idDocument.documentCategory === 'aadhaar'
                          ? 'AADHAAR'
                          : 'ID CARD'
                    }
                    maskValue={
                      idDocument.documentCategory === 'passport'
                        ? 'PASSPORT'
                        : idDocument.documentCategory === 'aadhaar'
                          ? 'AADHAAR'
                          : 'ID CARD'
                    }
                    hidden={hidden}
                  />
                </YStack>
                <YStack flex={1}>
                  <IdAttribute
                    name="CODE"
                    value={idDocument.mock ? 'SELF DEV' : 'SELF ID'}
                    maskValue={idDocument.mock ? 'SELF DEV' : 'SELF ID'}
                    hidden={hidden}
                  />
                </YStack>
                <YStack flex={1}>
                  <IdAttribute
                    name="DOC NO."
                    value={getDocumentAttributes(idDocument).passNoSlice}
                    maskValue="XX-XXXXXXX"
                    hidden={hidden}
                  />
                </YStack>
              </XStack>
              <XStack flex={1} gap={padding * 0.3}>
                {idDocument.documentCategory === 'aadhaar' ? (
                  // Aadhaar: Combined name field spanning two columns
                  <>
                    <YStack flex={2}>
                      <IdAttribute
                        name="NAME"
                        value={(() => {
                          const nameData = getNameAndSurname(
                            getDocumentAttributes(idDocument).nameSlice,
                          );
                          const fullName = [
                            ...nameData.surname,
                            ...nameData.names,
                          ].join(' ');
                          return fullName;
                        })()}
                        maskValue="XXXXXXXXXXXXX"
                        hidden={hidden}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <IdAttribute
                        name="SEX"
                        value={getDocumentAttributes(idDocument).sexSlice}
                        maskValue="X"
                        hidden={hidden}
                      />
                    </YStack>
                  </>
                ) : (
                  // Other documents: Separate surname and name fields
                  <>
                    <YStack flex={1}>
                      <IdAttribute
                        name="SURNAME"
                        value={getNameAndSurname(
                          getDocumentAttributes(idDocument).nameSlice,
                        ).surname.join(' ')}
                        maskValue="XXXXXXXX"
                        hidden={hidden}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <IdAttribute
                        name="NAME"
                        value={getNameAndSurname(
                          getDocumentAttributes(idDocument).nameSlice,
                        ).names.join(' ')}
                        maskValue="XXXXX"
                        hidden={hidden}
                      />
                    </YStack>
                    <YStack flex={1}>
                      <IdAttribute
                        name="SEX"
                        value={getDocumentAttributes(idDocument).sexSlice}
                        maskValue="X"
                        hidden={hidden}
                      />
                    </YStack>
                  </>
                )}
              </XStack>
              <XStack flex={1} gap={padding * 0.3}>
                <YStack flex={1}>
                  <IdAttribute
                    name="NATIONALITY"
                    value={getDocumentAttributes(idDocument).nationalitySlice}
                    maskValue="XXX"
                    hidden={hidden}
                  />
                </YStack>
                <YStack flex={1}>
                  <IdAttribute
                    name="DOB"
                    value={formatDateFromYYMMDD(
                      getDocumentAttributes(idDocument).dobSlice,
                    )}
                    maskValue="XX/XX/XXXX"
                    hidden={hidden}
                  />
                </YStack>
                <YStack flex={1}>
                  <IdAttribute
                    name="EXPIRY DATE"
                    value={formatDateFromYYMMDD(
                      getDocumentAttributes(idDocument).expiryDateSlice,
                      true,
                    )}
                    maskValue="XX/XX/XXXX"
                    hidden={hidden}
                  />
                </YStack>
              </XStack>
              <XStack flex={1} gap={padding * 0.3}>
                <YStack flex={1}>
                  <IdAttribute
                    name="AUTHORITY"
                    value={getDocumentAttributes(idDocument).issuingStateSlice}
                    maskValue="XXX"
                    hidden={hidden}
                  />
                </YStack>
                <YStack flex={1} />
                <YStack flex={1} />
              </XStack>
            </YStack>
          </XStack>
        )}

        {/* Footer Section - MRZ or QR Data */}
        {selected && isMRZDocument(idDocument) && idDocument.mrz && (
          <XStack
            alignItems="center"
            backgroundColor={slate100}
            borderRadius={borderRadius / 3}
            paddingHorizontal={padding / 2}
            paddingVertical={padding / 4}
          >
            {/* Fixed-width spacer to align MRZ content with the attributes block */}
            <XStack width={contentLeftOffset} alignItems="center">
              <LogoGray width={fontSize.large} height={fontSize.large} />
            </XStack>

            <YStack marginLeft={-padding / 2}>
              {idDocument.documentCategory === 'passport' ? (
                // Passport: 2 lines, 88 chars total (44 chars each)
                <>
                  <Text
                    fontSize={fontSize.xsmall}
                    letterSpacing={fontSize.xsmall * 0.1}
                    fontFamily={plexMono}
                    color={slate400}
                  >
                    {hidden
                      ? maskMrzValue(idDocument.mrz.slice(0, 44))
                      : idDocument.mrz.slice(0, 44)}
                  </Text>
                  <Text
                    fontSize={fontSize.xsmall}
                    letterSpacing={fontSize.xsmall * 0.1}
                    fontFamily={plexMono}
                    color={slate400}
                  >
                    {hidden
                      ? maskMrzValue(idDocument.mrz.slice(44, 88))
                      : idDocument.mrz.slice(44, 88)}
                  </Text>
                </>
              ) : (
                // ID Card: 3 lines, 90 chars total (30 chars each)
                <>
                  <Text
                    fontSize={fontSize.xsmall}
                    letterSpacing={fontSize.xsmall * 0.44}
                    fontFamily={plexMono}
                    color={slate400}
                  >
                    {hidden
                      ? maskMrzValue(idDocument.mrz.slice(0, 30))
                      : idDocument.mrz.slice(0, 30)}
                  </Text>
                  <Text
                    fontSize={fontSize.xsmall}
                    letterSpacing={fontSize.xsmall * 0.44}
                    fontFamily={plexMono}
                    color={slate400}
                  >
                    {hidden
                      ? maskMrzValue(idDocument.mrz.slice(30, 60))
                      : idDocument.mrz.slice(30, 60)}
                  </Text>
                  <Text
                    fontSize={fontSize.xsmall}
                    letterSpacing={fontSize.xsmall * 0.44}
                    fontFamily={plexMono}
                    color={slate400}
                  >
                    {hidden
                      ? maskMrzValue(idDocument.mrz.slice(60, 90))
                      : idDocument.mrz.slice(60, 90)}
                  </Text>
                </>
              )}
            </YStack>
          </XStack>
        )}

        {/* Footer Section - Empty placeholder for Aadhaar (no MRZ) */}
        {selected && isAadhaarDocument(idDocument) && (
          <XStack
            alignItems="center"
            backgroundColor={slate100}
            borderRadius={borderRadius / 3}
            paddingHorizontal={padding / 2}
            paddingVertical={padding / 4}
            minHeight={fontSize.xsmall * 2.5} // Maintain consistent height
          >
            {/* Fixed-width spacer to align content with the attributes block */}
            <XStack width={contentLeftOffset} alignItems="center">
              <LogoGray width={fontSize.large} height={fontSize.large} />
            </XStack>

            <YStack marginLeft={-padding / 2} justifyContent="center">
              <Text
                fontSize={fontSize.xsmall}
                letterSpacing={fontSize.xsmall * 0.1}
                fontFamily={plexMono}
                color={slate400}
                opacity={0.5}
              >
                {/* Empty placeholder - no MRZ for Aadhaar */}
              </Text>
            </YStack>
          </XStack>
        )}
      </YStack>
    </YStack>
  );
};

// Interface for IdAttribute props
interface IdAttributeProps {
  name: string;
  value: string;
  maskValue: string;
  hidden?: boolean;
}

// This layout should be fully adaptative. I should perfectly fit in any screen size.
// the font size should adapt according to the size available to fit perfectly.
// only svg are allowed.
// each element size should be determined as % of the screen or the parent element
const IdAttribute: FC<IdAttributeProps> = ({
  name,
  value,
  maskValue,
  hidden = false,
}) => {
  const { width: screenWidth } = Dimensions.get('window');
  const fontSize = {
    label: screenWidth * 0.024,
    value: screenWidth * 0.02,
  };

  const displayValue = hidden ? maskValue : value;

  return (
    <YStack>
      <Text
        fontWeight="bold"
        fontSize={fontSize.label}
        color={slate500}
        fontFamily={dinot}
      >
        {name}
      </Text>
      <Text fontSize={fontSize.value} color={slate400} fontFamily={dinot}>
        {displayValue}
      </Text>
    </YStack>
  );
};

export default IdCardLayout;

// Helper functions to safely extract document data
function getDocumentAttributes(document: PassportData | AadhaarData) {
  if (isAadhaarDocument(document)) {
    return getAadhaarAttributes(document);
  } else if (isMRZDocument(document)) {
    return getPassportAttributes(document.mrz, document.documentCategory);
  } else {
    // Fallback for unknown document types
    return {
      nameSlice: '',
      dobSlice: '',
      yobSlice: '',
      issuingStateSlice: '',
      nationalitySlice: '',
      passNoSlice: '',
      sexSlice: '',
      expiryDateSlice: '',
      isPassportType: false,
    };
  }
}

function getAadhaarAttributes(document: AadhaarData) {
  const extractedFields = document.extractedFields;
  // For Aadhaar, we format the name to work with the existing getNameAndSurname function
  // We'll put the full name in the "surname" position and leave names empty
  const fullName = extractedFields?.name || '';
  const nameSliceFormatted = fullName ? `${fullName}<<` : ''; // Format like MRZ

  // Format DOB to YYMMDD for consistency with passport format
  let dobFormatted = '';
  if (extractedFields?.dob && extractedFields?.mob && extractedFields?.yob) {
    const year =
      extractedFields.yob.length === 4
        ? extractedFields.yob.slice(-2)
        : extractedFields.yob;
    const month = extractedFields.mob.padStart(2, '0');
    const day = extractedFields.dob.padStart(2, '0');
    dobFormatted = `${year}${month}${day}`;
  }

  return {
    nameSlice: nameSliceFormatted,
    dobSlice: dobFormatted,
    yobSlice: extractedFields?.yob || '',
    issuingStateSlice: extractedFields?.state || '',
    nationalitySlice: 'IND', // Aadhaar is always Indian
    passNoSlice: extractedFields?.aadhaarLast4Digits || '',
    sexSlice:
      extractedFields?.gender === 'M'
        ? 'M'
        : extractedFields?.gender === 'F'
          ? 'F'
          : extractedFields?.gender || '',
    expiryDateSlice: '', // Aadhaar doesn't expire
    isPassportType: false,
  };
}

function getPassportAttributes(mrz: string, documentCategory: string) {
  const isPassportType = documentCategory === 'passport';
  const attributePositions = isPassportType
    ? attributeToPosition
    : attributeToPosition_ID;

  const nameSlice = mrz.slice(
    attributePositions.name[0],
    attributePositions.name[1],
  );
  const dobSlice = mrz.slice(
    attributePositions.date_of_birth[0],
    attributePositions.date_of_birth[1] + 1,
  );
  const yobSlice = mrz.slice(
    attributePositions.date_of_birth[0],
    attributePositions.date_of_birth[0] + 1,
  );
  const issuingStateSlice = mrz.slice(
    attributePositions.issuing_state[0],
    attributePositions.issuing_state[1] + 1,
  );
  const nationalitySlice = mrz.slice(
    attributePositions.nationality[0],
    attributePositions.nationality[1] + 1,
  );
  const passNoSlice = mrz.slice(
    attributePositions.passport_number[0],
    attributePositions.passport_number[1] + 1,
  );
  const sexSlice = mrz.slice(
    attributePositions.gender[0],
    attributePositions.gender[1] + 1,
  );
  const expiryDateSlice = mrz.slice(
    attributePositions.expiry_date[0],
    attributePositions.expiry_date[1] + 1,
  );
  return {
    nameSlice,
    dobSlice,
    yobSlice,
    issuingStateSlice,
    nationalitySlice,
    passNoSlice,
    sexSlice,
    expiryDateSlice,
    isPassportType,
  };
}

function getNameAndSurname(nameSlice: string) {
  // Split by double << to separate surname from names
  const parts = nameSlice.split('<<');
  if (parts.length < 2) {
    return { surname: [], names: [] };
  }

  // First part is surname, second part contains names separated by single <
  const surname = parts[0].replace(/</g, '').trim();
  const namesString = parts[1];

  // Split names by single < and filter out empty strings
  const names = namesString.split('<').filter(name => name.length > 0);

  return {
    surname: surname ? [surname] : [],
    names: names[0] ? [names[0]] : [],
  };
}

function formatDateFromYYMMDD(
  dateString: string,
  isExpiry: boolean = false,
): string {
  if (dateString.length !== 6) {
    return dateString;
  }

  const yy = parseInt(dateString.substring(0, 2), 10);
  const mm = dateString.substring(2, 4);
  const dd = dateString.substring(4, 6);

  const currentYear = new Date().getFullYear();
  const century = Math.floor(currentYear / 100) * 100;
  let year = century + yy;

  if (isExpiry) {
    // For expiry: if year is in the past, assume next century
    if (year < currentYear) {
      year += 100;
    }
  } else {
    // For birth: if year is in the future, assume previous century
    if (year > currentYear) {
      year -= 100;
    }
  }

  return `${dd}/${mm}/${year}`;
}
