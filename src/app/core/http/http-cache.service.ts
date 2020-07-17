import { Injectable } from '@angular/core';
import { each } from 'lodash';

import { Logger } from '../logger.service';
import { HttpResponse } from '@angular/common/http';

const log = new Logger('HttpCacheService');
const cachePersistenceKey = 'httpCache';

export interface HttpCacheEntry {
  lastUpdated: Date;
  response: HttpResponse<any>
}

/**
 * Provides a cache facility for HTTP requests with configurable persistence policy.
 */
@Injectable()
export class HttpCacheService {

  private cachedData: { [key: string]: HttpCacheEntry; } = {};
  private storage: Storage = null;

  constructor() {
    this.loadCacheData();
  }

  /**
   * Sets the cache data for the specified request.
   * @param {!string} urlWithParams The cached request url with params 
   * @param {HttpResponse<any>} response the response to store
   * @param {Date=} lastUpdated Option to force the last updated date. If null will be new DAte()
   */
  setCacheData(urlWithParams : string, response: HttpResponse<any>, lastUpdated? : Date): void {
    this.cachedData[urlWithParams] = {
      lastUpdated:  lastUpdated ? lastUpdated : new Date(),
      response: response
    };
    log.debug('Cache set for key: "' + urlWithParams + '"');
    this.saveCacheData();
  }

  /**
   * Gets the cached data for the specified request.
   * @param {!string} urlWithParams The request URL with params.
   * @return {?ResponseOptions} The cached data or null if no cached data exists for this request.
   */
  getCacheData(urlWithParams : string): HttpResponse<any> {
    const cacheEntry = this.cachedData[urlWithParams];

    if (cacheEntry) {
      log.debug('Cache hit for key: "' + urlWithParams + '"');
      return cacheEntry.response;
    }

    return null;
  }

  /**
   * Gets the cached entry for the specified request.
   * @param {!string} urlWithParams The request URL with params.
   * @return {?HttpCacheEntry} The cache entry or null if no cache entry exists for this request.
   */
  getHttpCacheEntry(urlWithParams: string): HttpCacheEntry {
    return this.cachedData[urlWithParams] || null;
  }

  /**
   * Clears the cached entry (if exists) for the specified request.
   * @param {!string} urlWithParams The request URL with params.
   */
  clearCache(urlWithParams: string): void {
    this.cachedData[urlWithParams] = undefined;
    log.debug('Cache cleared for key: "' + urlWithParams + '"');
    this.saveCacheData();
  }

  /**
   * Cleans cache entries older than the specified date.
   * @param {date=} expirationDate The cache expiration date. If no date is specified, all cache is cleared.
   */
  cleanCache(expirationDate?: Date) {
    if (expirationDate) {
      each(this.cachedData, (value: HttpCacheEntry, key: string) => {
        if (expirationDate >= value.lastUpdated) {
          delete this.cachedData[key];
        }
      });
    } else {
      this.cachedData = {};
    }
    this.saveCacheData();
  }

  /**
   * Sets the cache persistence policy.
   * Note that changing the cache persistence will also clear the cache from its previous storage.
   * @param {'local'|'session'=} persistence How the cache should be persisted, it can be either local or session
   *   storage, or if no value is provided it will be only in-memory (default).
   */
  setPersistence(persistence?: 'local'|'session') {
    this.cleanCache();
    this.storage = persistence === 'local' || persistence === 'session' ? window[persistence + 'Storage'] : null;
    this.loadCacheData();
  };

  private saveCacheData() {
    if (this.storage) {
      this.storage[cachePersistenceKey] = JSON.stringify(this.cachedData);
    }
  }

  private loadCacheData() {
    const data = this.storage ? this.storage[cachePersistenceKey] : null;
    this.cachedData = data ? JSON.parse(data) : {};
  }

}
