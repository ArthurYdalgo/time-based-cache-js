'use strict';

module.exports = class CacheStore {
    constructor(cacheKeyPrefix = null) {
        this.cacheKeyPrefix = cacheKeyPrefix;
    }
    isNumber(value) {
        return !isNaN(parseFloat(value)) && !isNaN(value - 0)
    }
    isDate(value) {
        return value instanceof Date && !isNaN(value.valueOf())
    }
    put(key, value, ttl = null) {
        let createdAt = new Date();
        let expiresAt = null;

        if (this.isNumber(ttl)) {
            let date = new Date();
            date.setSeconds(date.getSeconds() + ttl);
            expiresAt = date.toISOString();
        }

        if (this.isDate(ttl)) {
            expiresAt = ttl.toISOString();
        }

        let cachedData = {
            value, createdAt, expiresAt
        };

        if (this.cacheKeyPrefix) {
            key = this.cacheKeyPrefix + key;
        }

        localStorage.setItem(key, JSON.stringify(cachedData));

        return value;
    }
    delete(key) {
        if (this.cacheKeyPrefix) {
            key = this.cacheKeyPrefix + key;
        }

        return localStorage.removeItem(key);
    }
    remember(key, ttl, callback) {
        if (this.cacheKeyPrefix) {
            key = this.cacheKeyPrefix + key;
        }

        let localStorageItem = localStorage.getItem(key);

        let cachedData = localStorageItem ? JSON.parse(localStorageItem) : undefined;

        // If cached data exists and doesn't expire, or if cached data expires, but still hasn't
        if (cachedData && (!cachedData.expiresAt || (cachedData.expiresAt && cachedData.expiresAt > new Date().toISOString()))) {
            return cachedData.value;
        }

        this.put(key, undefined, ttl);

        let value = callback();

        return this.put(key, value, ttl);
    }
    async rememberAsync(key, ttl, callback) {
        if (this.cacheKeyPrefix) {
            key = this.cacheKeyPrefix + key;
        }

        let localStorageItem = localStorage.getItem(key);

        let cachedData = localStorageItem
            ? JSON.parse(localStorageItem)
            : undefined;

        // If cached data exists and doesn't expire, or if cached data expires, but still hasn't
        if (
            cachedData &&
            (!cachedData.expiresAt ||
                (cachedData.expiresAt &&
                    cachedData.expiresAt > new Date().toISOString()))
        ) {
            return cachedData.value;
        }

        this.put(key, undefined, ttl);

        let value = await callback();
        return this.put(key, value, ttl);
    }
    rememberForever(key, callback) {
        return this.remember(key, null, callback);
    }
    get(key, defaultValue = undefined) {
        if (this.cacheKeyPrefix) {
            key = this.cacheKeyPrefix + key;
        }

        let localStorageItem = localStorage.getItem(key);

        if (!localStorageItem) {
            return defaultValue;
        }

        let cachedData = JSON.parse(localStorageItem);

        if (cachedData.expiresAt && cachedData.expiresAt < new Date().toISOString()) {
            return defaultValue;
        }

        return cachedData.value;
    }
}