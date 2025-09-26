// SPDX-FileCopyrightText: 2025 Social Connect Labs, Inc.
// SPDX-License-Identifier: BUSL-1.1
// NOTE: Converts to Apache-2.0 on 2029-06-11 per LICENSE.

import type { DocumentCatalog, PassportData } from '@selfxyz/common/utils/types';

import { defaultConfig } from './config/defaults';
import { mergeConfig } from './config/merge';
import { notImplemented } from './errors';
import { extractMRZInfo as parseMRZInfo } from './processing/mrz';
import { SDKEvent, SDKEventMap } from './types/events';
import type { Adapters, Config, ScanOpts, ScanResult, SelfClient, Unsubscribe } from './types/public';
import { TrackEventParams } from './types/public';
/**
 * Optional adapter implementations used when a consumer does not provide their
 * own. These defaults are intentionally minimal no-ops suitable for tests and
 * non-production environments.
 */
const optionalDefaults: Required<Pick<Adapters, 'clock' | 'logger'>> = {
  clock: {
    now: () => Date.now(),
    sleep: async (ms: number) => {
      await new Promise(r => setTimeout(r, ms));
    },
  },
  logger: {
    log: () => {},
  },
};

const REQUIRED_ADAPTERS = ['auth', 'scanner', 'network', 'crypto', 'documents'] as const;

export const createListenersMap = (): {
  map: Map<SDKEvent, Set<(p: any) => void>>;
  addListener: <E extends SDKEvent>(event: E, cb: (payload: SDKEventMap[E]) => any) => void;
} => {
  const map = new Map<SDKEvent, Set<(p: any) => void>>();

  const addListener = <E extends SDKEvent>(event: E, cb: (payload: SDKEventMap[E]) => void) => {
    const set = map.get(event) ?? new Set();
    set.add(cb as any);
    map.set(event, set);
  };

  return { map, addListener };
};

/**
 * Creates a fully configured {@link SelfClient} instance.
 *
 * The function validates that all required adapters are supplied and merges the
 * provided configuration with sensible defaults. Missing optional adapters are
 * filled with benign no-op implementations.
 */
export function createSelfClient({
  config,
  adapters,
  listeners,
}: {
  config: Config;
  adapters: Adapters;
  listeners: Map<SDKEvent, Set<(p: any) => void>>;
}): SelfClient {
  const cfg = mergeConfig(defaultConfig, config);

  for (const name of REQUIRED_ADAPTERS) {
    if (!(name in adapters) || !adapters[name as keyof Adapters]) throw notImplemented(name);
  }

  const _adapters = { ...optionalDefaults, ...adapters };
  const _listeners = new Map<SDKEvent, Set<(p: any) => void>>();

  function on<E extends SDKEvent>(event: E, cb: (payload: SDKEventMap[E]) => void): Unsubscribe {
    const set = _listeners.get(event) ?? new Set();
    set.add(cb as any);
    _listeners.set(event, set);
    return () => set.delete(cb as any);
  }

  function emit<E extends SDKEvent>(event: E, payload: SDKEventMap[E]): void {
    const set = _listeners.get(event);
    if (!set) return;
    for (const cb of Array.from(set)) {
      try {
        (cb as (p: SDKEventMap[E]) => void)(payload);
      } catch (err) {
        _adapters.logger.log('error', `event-listener error for event '${event}'`, { event, error: err });
      }
    }
  }

  for (const [event, set] of listeners ?? []) {
    for (const cb of Array.from(set)) {
      on(event, cb);
    }
  }

  async function scanDocument(opts: ScanOpts & { signal?: AbortSignal }): Promise<ScanResult> {
    // Apply scanner timeout from config if no signal provided
    if (!opts.signal && cfg.timeouts.scanMs) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), cfg.timeouts.scanMs);
      return _adapters.scanner.scan({ ...opts, signal: controller.signal });
    }

    return _adapters.scanner.scan(opts);
  }

  async function trackEvent(event: string, payload?: TrackEventParams): Promise<void> {
    if (!adapters.analytics) {
      return;
    }
    return adapters.analytics.trackEvent(event, payload);
  }

  /**
   * Retrieves the private key via the auth adapter.
   * With great power comes great responsibility
   */
  async function getPrivateKey(): Promise<string | null> {
    return adapters.auth.getPrivateKey();
  }

  async function hasPrivateKey(): Promise<boolean> {
    if (!adapters.auth) return false;
    try {
      const key = await adapters.auth.getPrivateKey();
      return !!key;
    } catch {
      return false;
    }
  }

  return {
    scanDocument,
    trackEvent,
    getPrivateKey,
    hasPrivateKey,
    extractMRZInfo: parseMRZInfo,
    on,
    emit,

    // TODO: inline for now
    loadDocumentCatalog: async () => {
      return _adapters.documents.loadDocumentCatalog();
    },
    loadDocumentById: async (id: string) => {
      return _adapters.documents.loadDocumentById(id);
    },
    saveDocumentCatalog: async (catalog: DocumentCatalog) => {
      return _adapters.documents.saveDocumentCatalog(catalog);
    },
    deleteDocument: async (id: string) => {
      return _adapters.documents.deleteDocument(id);
    },
    saveDocument: async (id: string, passportData: PassportData) => {
      return _adapters.documents.saveDocument(id, passportData);
    },
  };
}
