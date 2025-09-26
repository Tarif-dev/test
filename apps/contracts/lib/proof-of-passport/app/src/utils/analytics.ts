// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import { AppState, type AppStateStatus } from 'react-native';
import { ENABLE_DEBUG_LOGS, MIXPANEL_NFC_PROJECT_TOKEN } from '@env';
import NetInfo from '@react-native-community/netinfo';
import type { JsonMap, JsonValue } from '@segment/analytics-react-native';

import { TrackEventParams } from '@selfxyz/mobile-sdk-alpha';

import { createSegmentClient } from '@/Segment';
import { PassportReader } from '@/utils/passportReader';

const segmentClient = createSegmentClient();

// --- Analytics flush strategy ---
let mixpanelConfigured = false;
let eventCount = 0;
let isConnected = true;
let isNfcScanningActive = false; // Track NFC scanning state
const eventQueue: Array<{
  name: string;
  properties?: Record<string, unknown>;
}> = [];

function coerceToJsonValue(
  value: unknown,
  seen = new WeakSet(),
): JsonValue | undefined {
  if (
    value === null ||
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return value as JsonValue;
  }
  if (Array.isArray(value)) {
    const arr: JsonValue[] = [];
    for (const item of value) {
      const v = coerceToJsonValue(item, seen);
      if (v === undefined) continue;
      arr.push(v);
    }
    return arr as JsonValue;
  }
  if (typeof value === 'object' && value) {
    // Check for circular references
    if (seen.has(value)) {
      return undefined; // Skip circular references
    }
    seen.add(value);

    const obj: JsonMap = {};
    for (const [k, v] of Object.entries(value)) {
      const coerced = coerceToJsonValue(v, seen);
      if (coerced !== undefined) obj[k] = coerced;
    }
    return obj as JsonValue;
  }
  // drop functions/undefined/symbols
  return undefined;
}

function cleanParams(params: Record<string, unknown>): JsonMap {
  const cleaned: JsonMap = {};
  for (const [key, value] of Object.entries(params)) {
    const v = coerceToJsonValue(value);
    if (v !== undefined) cleaned[key] = v;
  }
  return cleaned;
}

/**
 * Validates event parameters to ensure they follow standards
 * - Ensures numeric values are properly formatted
 */
function validateParams(
  properties?: Record<string, unknown>,
): JsonMap | undefined {
  if (!properties) return undefined;

  const validatedProps = { ...properties };

  // Ensure duration is formatted as a number with at most 2 decimal places
  if (validatedProps.duration_seconds !== undefined) {
    const duration = Number(validatedProps.duration_seconds);
    validatedProps.duration_seconds = parseFloat(duration.toFixed(2));
  }

  return cleanParams(validatedProps);
}

/*
  Records analytics events and screen views
  In development mode, events are logged to console instead of being sent to Segment
 */
const analytics = () => {
  function _track(
    type: 'event' | 'screen',
    eventName: string,
    properties?: Record<string, unknown>,
  ) {
    // Validate and clean properties
    const validatedProps = validateParams(properties);

    if (__DEV__) {
      console.log(`[DEV: Analytics ${type.toUpperCase()}]`, {
        name: eventName,
        properties: validatedProps,
      });
      return;
    }

    if (!segmentClient) {
      return;
    }
    const trackMethod = (e: string, p?: JsonMap) =>
      type === 'screen'
        ? segmentClient.screen(e, p)
        : segmentClient.track(e, p);

    if (!validatedProps) {
      // you may need to remove the catch when debugging
      return trackMethod(eventName).catch(console.info);
    }

    // you may need to remove the catch when debugging
    trackMethod(eventName, validatedProps).catch(console.info);
  }

  return {
    // Using LiteralCheck will allow constants but not plain string literals
    trackEvent: (eventName: string, properties?: TrackEventParams) => {
      _track('event', eventName, properties);
    },
    trackScreenView: (
      screenName: string,
      properties?: Record<string, unknown>,
    ) => {
      _track('screen', screenName, properties);
    },
    flush: () => {
      if (!__DEV__ && segmentClient) {
        segmentClient.flush();
      }
    },
  };
};

export default analytics;

/**
 * Cleanup function to clear event queues
 */
export const cleanupAnalytics = () => {
  eventQueue.length = 0;
  eventCount = 0;
};

const setupFlushPolicies = () => {
  AppState.addEventListener('change', (state: AppStateStatus) => {
    // Never flush during active NFC scanning to prevent interference
    if (
      (state === 'background' || state === 'active') &&
      !isNfcScanningActive
    ) {
      flushMixpanelEvents().catch(console.warn);
    }
  });

  NetInfo.addEventListener(state => {
    isConnected = state.isConnected ?? true;
    // Never flush during active NFC scanning to prevent interference
    if (isConnected && !isNfcScanningActive) {
      flushMixpanelEvents().catch(console.warn);
    }
  });
};

const flushMixpanelEvents = async () => {
  if (!MIXPANEL_NFC_PROJECT_TOKEN) return;
  // Skip flush if NFC scanning is active to prevent interference
  if (isNfcScanningActive) {
    if (__DEV__) console.log('[Mixpanel] flush skipped - NFC scanning active');
    return;
  }
  try {
    if (__DEV__) console.log('[Mixpanel] flush');
    // Send any queued events before flushing
    while (eventQueue.length > 0) {
      const evt = eventQueue.shift()!;
      if (PassportReader.trackEvent) {
        await Promise.resolve(
          PassportReader.trackEvent(evt.name, evt.properties),
        );
      }
    }
    if (PassportReader.flush) await Promise.resolve(PassportReader.flush());
    eventCount = 0;
  } catch (err) {
    if (__DEV__) console.warn('Mixpanel flush failed', err);
    // re-queue on failure
    if (typeof err !== 'undefined') {
      // no-op, events are already queued if failure happened before flush
    }
  }
};

// --- Mixpanel NFC Analytics ---
export const configureNfcAnalytics = async () => {
  if (!MIXPANEL_NFC_PROJECT_TOKEN || mixpanelConfigured) return;
  const enableDebugLogs =
    String(ENABLE_DEBUG_LOGS ?? '')
      .trim()
      .toLowerCase() === 'true';

  // Check if PassportReader and configure method exist (Android doesn't have configure)
  if (PassportReader && typeof PassportReader.configure === 'function') {
    try {
      // iOS configure method only accepts token and enableDebugLogs
      // Android doesn't have this method at all
      await Promise.resolve(
        PassportReader.configure(MIXPANEL_NFC_PROJECT_TOKEN, enableDebugLogs),
      );
    } catch (error) {
      console.warn('Failed to configure NFC analytics:', error);
    }
  }

  setupFlushPolicies();
  mixpanelConfigured = true;
};

/**
 * Consolidated analytics flush function that flushes both Segment and Mixpanel events
 * This should be called when you want to ensure all analytics events are sent immediately
 */
export const flushAllAnalytics = () => {
  // Flush Segment analytics
  const { flush: flushAnalytics } = analytics();
  flushAnalytics();

  // Never flush Mixpanel during active NFC scanning to prevent interference
  if (!isNfcScanningActive) {
    flushMixpanelEvents().catch(console.warn);
  }
};

/**
 * Set NFC scanning state to prevent analytics flush interference
 */
export const setNfcScanningActive = (active: boolean) => {
  isNfcScanningActive = active;
  if (__DEV__)
    console.log(
      `[NFC Analytics] Scanning state: ${active ? 'active' : 'inactive'}`,
    );

  // Flush queued events when scanning completes
  if (!active && eventQueue.length > 0) {
    flushMixpanelEvents().catch(console.warn);
  }
};

export const trackNfcEvent = async (
  name: string,
  properties?: Record<string, unknown>,
) => {
  if (!MIXPANEL_NFC_PROJECT_TOKEN) return;
  if (!mixpanelConfigured) await configureNfcAnalytics();

  if (!isConnected || isNfcScanningActive) {
    eventQueue.push({ name, properties });
    return;
  }

  try {
    if (PassportReader.trackEvent) {
      await Promise.resolve(PassportReader.trackEvent(name, properties));
    }
    eventCount++;
    // Prevent automatic flush during NFC scanning
    if (eventCount >= 5 && !isNfcScanningActive) {
      flushMixpanelEvents().catch(console.warn);
    }
  } catch {
    eventQueue.push({ name, properties });
  }
};
