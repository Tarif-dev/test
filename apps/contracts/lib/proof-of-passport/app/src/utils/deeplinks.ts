// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { parseUrl } from 'query-string';
import { Linking, Platform } from 'react-native';

import { countries } from '@selfxyz/common/constants/countries';
import type { IdDocInput } from '@selfxyz/common/utils';
import { useSelfAppStore } from '@selfxyz/mobile-sdk-alpha/stores';

import { navigationRef } from '@/navigation';
import useUserStore from '@/stores/userStore';

// Validation patterns for each expected parameter
const VALIDATION_PATTERNS = {
  sessionId: /^[a-zA-Z0-9_-]+$/,
  selfApp: /^[\s\S]*$/, // JSON strings can contain any characters, we'll validate JSON parsing separately
  mock_passport: /^[\s\S]*$/, // JSON strings can contain any characters, we'll validate JSON parsing separately
} as const;

type ValidatedParams = {
  sessionId?: string;
  selfApp?: string;
  mock_passport?: string;
};

// Define proper types for the mock data structure
type MockDataDeepLinkRawParams = {
  name?: string;
  surname?: string;
  nationality?: string;
  birth_date?: string;
  gender?: string;
};

/**
 * Validates and sanitizes a query parameter value
 * @param key - The parameter key
 * @param value - The parameter value to validate
 * @returns The sanitized value or undefined if invalid
 */
const validateAndSanitizeParam = (
  key: string,
  value: string,
): string | undefined => {
  if (!value) return undefined;

  // Decode the value first
  let decodedValue: string;
  try {
    decodedValue = decodeURIComponent(value);
  } catch (error) {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error(`Error decoding parameter ${key}:`, error);
    }
    return undefined;
  }

  // Validate against pattern if we have one for this key
  if (key in VALIDATION_PATTERNS) {
    const pattern =
      VALIDATION_PATTERNS[key as keyof typeof VALIDATION_PATTERNS];
    if (!pattern.test(decodedValue)) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error(`Parameter ${key} failed validation:`, decodedValue);
      }
      return undefined;
    }
  }

  return decodedValue;
};

/**
 * Creates a proper navigation stack for deeplink navigation
 * @param targetScreen - The target screen to navigate to
 * @param parentScreen - The parent screen that should appear when user goes back (default: 'Home')
 */
const createDeeplinkNavigationState = (
  targetScreen: string,
  parentScreen: string = 'Home',
) => ({
  index: 1, // Current screen index (targetScreen)
  routes: [{ name: parentScreen }, { name: targetScreen }],
});

// Store the correct parent screen determined by splash screen
let correctParentScreen: string = 'Home';

// Function for splash screen to get and clear the queued initial URL
export const getAndClearQueuedUrl = (): string | null => {
  const url = queuedInitialUrl;
  queuedInitialUrl = null;
  return url;
};

export const handleUrl = (uri: string) => {
  const validatedParams = parseAndValidateUrlParams(uri);
  const { sessionId, selfApp: selfAppStr, mock_passport } = validatedParams;

  if (selfAppStr) {
    try {
      const selfAppJson = JSON.parse(selfAppStr);
      useSelfAppStore.getState().setSelfApp(selfAppJson);
      useSelfAppStore.getState().startAppListener(selfAppJson.sessionId);

      // Reset navigation stack with correct parent -> ProveScreen
      navigationRef.reset(
        createDeeplinkNavigationState('ProveScreen', correctParentScreen),
      );

      return;
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('Error parsing selfApp:', error);
      }
      navigationRef.reset(
        createDeeplinkNavigationState('QRCodeTrouble', correctParentScreen),
      );
    }
  } else if (sessionId && typeof sessionId === 'string') {
    useSelfAppStore.getState().cleanSelfApp();
    useSelfAppStore.getState().startAppListener(sessionId);

    // Reset navigation stack with correct parent -> ProveScreen
    navigationRef.reset(
      createDeeplinkNavigationState('ProveScreen', correctParentScreen),
    );
  } else if (mock_passport) {
    try {
      const data = JSON.parse(mock_passport);
      const rawParams = data as MockDataDeepLinkRawParams;

      // Validate nationality is a valid country code
      const isValidCountryCode = (
        code: string | undefined,
      ): code is IdDocInput['nationality'] => {
        if (!code) return false;
        // Check if the code exists as a value in the countries object
        return Object.values(countries).some(
          countryCode => countryCode === code,
        );
      };

      useUserStore.getState().setDeepLinkUserDetails({
        name: rawParams.name,
        surname: rawParams.surname,
        nationality: isValidCountryCode(rawParams.nationality)
          ? rawParams.nationality
          : undefined,
        birthDate: rawParams.birth_date,
        gender: rawParams.gender,
      });

      // Reset navigation stack with correct parent -> MockDataDeepLink
      navigationRef.reset(
        createDeeplinkNavigationState('MockDataDeepLink', correctParentScreen),
      );
    } catch (error) {
      if (typeof __DEV__ !== 'undefined' && __DEV__) {
        console.error('Error parsing mock_passport data or navigating:', error);
      }
      navigationRef.reset(
        createDeeplinkNavigationState('QRCodeTrouble', correctParentScreen),
      );
    }
  } else if (Platform.OS === 'web') {
    // TODO: web handle links if we need to idk if we do
    // For web, we can handle the URL some other way if we dont do this loading app in web always navigates to QRCodeTrouble
  } else {
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      console.error('No sessionId or selfApp found in the data');
    }
    navigationRef.reset(
      createDeeplinkNavigationState('QRCodeTrouble', correctParentScreen),
    );
  }
};

/**
 * Parses and validates query parameters from a URL
 * @param uri - The URL to parse
 * @returns Validated and sanitized parameters
 */
export const parseAndValidateUrlParams = (uri: string): ValidatedParams => {
  // Parse the URL directly without pre-decoding to avoid issues with fragment separators
  const parsed = parseUrl(uri);
  const query = parsed.query || {};

  const validatedParams: ValidatedParams = {};

  // Only process expected parameters and validate them
  for (const [key, value] of Object.entries(query)) {
    if (key in VALIDATION_PATTERNS && typeof value === 'string') {
      const sanitizedValue = validateAndSanitizeParam(key, value);
      if (sanitizedValue !== undefined) {
        validatedParams[key as keyof ValidatedParams] = sanitizedValue;
      }
    } else if (typeof __DEV__ !== 'undefined' && __DEV__) {
      // Log unexpected parameters in development
      console.warn(`Unexpected or invalid parameter ignored: ${key}`);
    }
  }

  return validatedParams;
};

// Store the initial URL for splash screen to handle after initialization
let queuedInitialUrl: string | null = null;

/**
 * Sets the correct parent screen for deeplink navigation
 * This should be called by splash screen after determining the correct screen
 */
export const setDeeplinkParentScreen = (screen: string) => {
  correctParentScreen = screen;
};

export const setupUniversalLinkListenerInNavigation = () => {
  // Get the initial URL and store it for splash screen handling
  Linking.getInitialURL().then(url => {
    if (url) {
      // Store the initial URL instead of handling it immediately
      queuedInitialUrl = url;
    }
  });

  // Handle subsequent URL events normally (when app is already running)
  const linkingEventListener = Linking.addEventListener('url', ({ url }) => {
    handleUrl(url);
  });

  return () => {
    linkingEventListener.remove();
  };
};
