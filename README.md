# Time Based Cache Store for Javascript

A [Laravel-like Cache Store](https://laravel.com/docs/8.x/cache) for Javascript. 

# Installation

```
npm i time-based-cache
```

# How it works
This class makes use of the browser's local storage API in order to keep a value until a determined datetime, although a value can be also set to "never" expire. Each key receives a `value`, a `createdAt` timestamp and a `expiresAt` timestamp (which can be `null`). Upon usage, the `expiresAt` at will be evaluated to see wether or not the cached value is still valid.

# Usage

## Creating the Cache Store

```
// Import the class
import CacheStore from 'time-based-cache';

// Create a new cache
let cache_store = new CacheStore();
```

An identifier (cacheKeyPrefix) can (and should) be set, so that you can use multiple store, the these stores can use the same cache key without any conflicts

```
// Create a new cache with a prefix
let cache_store_1 = new CacheStore('store_prefix_1');

let cache_store_2 = new CacheStore('store_prefix_2');
```

## Setting a value

### Everlasting
A value can be set without an expiring date, so as long as the key is still in the local storage, it'll be retrieved. Let's say you need to store a list of plans

```
let plans = [
    {
        id: 1,
        name: 'Plan A'
    },
    {
        id: 2,
        name: 'Plan B'
    }
];

cache_store.put('cached_plans', plans);
```

### For an amount of seconds
A value can be set to last for a defined amount of seconds

```
// Store previously mentioned plans for 5 minutes
cache_store.put('cached_plans', plans, 5 * 60);
```

### Until a certain date

A value can bet set to last until a defined date

```
// Create a date
let future_date = new Date();

// Add days to the date
future_date.setHours(date.getDays() + 15);

// Store previously mentioned plans for 15 days
cache_store.put('cached_plans', plans, future_date);
```

This kind of looks better than (or not, I personally hate working with dates in Javascript)
```
cache_store.put('cached_plans', plans, 15 * 24 * (3600));
```

## Getting a value

Because it wouldn't make sense to put the value if you couldn't get it back.

```
let plans = cache_store.get('cached_plans');
```

Assuming the cache hasn't expired, plans now holds the list of plans, or `undefined`, if it was never set or has expired.

## Deleting a value

Because sometimes there're things we need to forget

```
cache_store.delete('cached_plans');
```

## Remember
You can also send a callback to be remembered, so you don't have to repeat it many times. 

```
let processed_stuff = cache_store.remember('processed_stuff', 5 * 60, () => {
    // costly operations that take a long time

    return processed_stuff;
});
```

⚠️<b>Be aware that, before the callback is executed, an `undefined` value is set to the cache key, so if the remember method is executed with the same key, and the previous call hasn't finished, it will not run again, and an `undefined` value will be returned (assuming the cache lifespan hasn't ended, of course), until the first execution completes</b>⚠️

There's a limitation: async callbacks will return a Promise right away. If you need to do async stuff, do it like this:

Let's say you're rendering a component and you want to retrieve a store's products.

```
import { useState, useEffect } from "react";
import Http from "../../Http";
import CacheStore from 'time-based-cache';

let cache_store = new CacheStore();

const Products = ({store}) => {

    const [products, setProducts] = useState([]);

    useEffect(() => {
		cache_store.remember(`store-${store.id}-products`, 5 * 60, () => {
			Http.get(`/api/store/${store.id}/products`).then((res) => setInvoices(res.data.data));
		});

	}, []);

    ...
}

export default Products;

```

## Remember Forever
This is basically the previous method, but a `null` is sent as the second parameter.

```
let processed_stuff = cache_store.rememberForever('processed_stuff', () => {
    // costly operations that take a long time

    return processed_stuff;
});
```
This may cause some unwanted behaviour if the cache key is left unchecked, so be aware of when to clean it, if necessary.