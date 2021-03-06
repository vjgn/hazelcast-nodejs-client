/*
 * Copyright (c) 2008-2020, Hazelcast, Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @ignore *//** */

import * as assert from 'assert';
import * as Long from 'long';
import * as Path from 'path';
import {AddressImpl, UUID} from '../core';

/** @internal */
export function assertNotNull(v: any): void {
    assert.notEqual(v, null, 'Non null value expected.');
}

/** @internal */
export function assertArray(x: any): void {
    assert(Array.isArray(x), 'Should be array.');
}

/** @internal */
export function assertString(v: any): void {
    assert(typeof v === 'string', 'String value expected.');
}

/** @internal */
export function assertNumber(v: any): void {
    assert(typeof v === 'number', 'Number value expected.');
}

/** @internal */
export function assertNonNegativeNumber(v: any): void {
    assert(typeof v === 'number', 'Number value expected.');
    assert(v >= 0, 'Non-negative value expected.');
}

/** @internal */
export function assertPositiveNumber(v: any): void {
    assert(typeof v === 'number', 'Number value expected.');
    assert(v > 0, 'Positive value expected.');
}

/** @internal */
export function shuffleArray<T>(array: T[]): void {
    let randomIndex: number;
    let temp: T;
    for (let i = array.length; i > 1; i--) {
        randomIndex = Math.floor(Math.random() * i);
        temp = array[i - 1];
        array[i - 1] = array[randomIndex];
        array[randomIndex] = temp;
    }
}

/** @internal */
export function getType(obj: any): string {
    assertNotNull(obj);
    if (Long.isLong(obj)) {
        return 'long';
    } if (Buffer.isBuffer(obj)) {
        return 'buffer';
    } if (UUID.isUUID(obj)) {
        return 'uuid';
    } else {
        const t = typeof obj;
        if (t !== 'object') {
            return t;
        } else {
            return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
        }
    }
}

/** @internal */
export function enumFromString<T>(enumType: any, value: string): T {
    return enumType[value];
}

/** @internal */
export function copyObjectShallow<T>(obj: T): T {
    if (obj === undefined || obj === null) {
        return obj;
    }
    if (typeof obj === 'object') {
        const newObj: any = {};
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                newObj[prop] = obj[prop];
            }
        }
        return newObj;
    }
    assert(false, 'Object should be undefined or type of object.');
}

/** @internal */
export function tryGetBoolean(val: any): boolean {
    if (typeof val === 'boolean') {
        return val;
    } else {
        throw new RangeError(val + ' is not a boolean.');
    }
}

/** @internal */
export function tryGetNumber(val: any): number {
    if (typeof val === 'number') {
        return val;
    } else {
        throw new RangeError(val + ' is not a number.');
    }
}

/** @internal */
export function tryGetArray(val: any): any[] {
    if (Array.isArray(val)) {
        return val;
    } else {
        throw new RangeError(val + ' is not an array.');
    }
}

/** @internal */
export function tryGetString(val: any): string {
    if (typeof val === 'string') {
        return val;
    } else {
        throw new RangeError(val + ' is not a string.');
    }
}

/** @internal */
export function getStringOrUndefined(val: any): string {
    try {
        return tryGetString(val);
    } catch (e) {
        return undefined;
    }
}

/** @internal */
export function getBooleanOrUndefined(val: any): boolean {
    try {
        return tryGetBoolean(val);
    } catch (e) {
        return undefined;
    }
}

/** @internal */
export function tryGetEnum<T>(enumClass: any | { [index: string]: number }, str: string): T {
    const result = enumClass[str.toUpperCase()];
    if (result == null) {
        throw new TypeError(str + ' is not a member of the enum ' + enumClass);
    }
    return result;
}

/** @internal */
export function resolvePath(path: string): string {
    const basePath = process.cwd();
    return Path.resolve(basePath, path);
}

/** @internal */
export class AddressHelper {

    private static readonly MAX_PORT_TRIES: number = 3;
    private static readonly INITIAL_FIRST_PORT: number = 5701;

    static getSocketAddresses(address: string): AddressImpl[] {
        const addressHolder = this.createAddressFromString(address, -1);
        let possiblePort = addressHolder.port;
        let maxPortTryCount = 1;
        if (possiblePort === -1) {
            maxPortTryCount = AddressHelper.MAX_PORT_TRIES;
            possiblePort = AddressHelper.INITIAL_FIRST_PORT;
        }

        const addresses: AddressImpl[] = [];

        for (let i = 0; i < maxPortTryCount; i++) {
            addresses.push(new AddressImpl(addressHolder.host, possiblePort + i));
        }

        return addresses;
    }

    static createAddressFromString(address: string, defaultPort?: number): AddressImpl {
        const indexBracketStart = address.indexOf('[');
        const indexBracketEnd = address.indexOf(']', indexBracketStart);
        const indexColon = address.indexOf(':');
        const lastIndexColon = address.lastIndexOf(':');
        let host: string;
        let port = defaultPort;
        if (indexColon > -1 && lastIndexColon > indexColon) {
            // IPv6
            if (indexBracketStart === 0 && indexBracketEnd > indexBracketStart) {
                host = address.substring(indexBracketStart + 1, indexBracketEnd);
                if (lastIndexColon === indexBracketEnd + 1) {
                    port = Number.parseInt(address.substring(lastIndexColon + 1));
                }
            } else {
                host = address;
            }
        } else if (indexColon > 0 && indexColon === lastIndexColon) {
            host = address.substring(0, indexColon);
            port = Number.parseInt(address.substring(indexColon + 1));
        } else {
            host = address;
        }
        return new AddressImpl(host, port);
    }

}

/**
 * Returns a random integer between 0(inclusive) and `upperBound`(exclusive)
 * Upper bound should be an integer.
 * @param upperBound
 * @returns A random integer between [0-upperBound)
 * @internal
 */
export function randomInt(upperBound: number): number {
    return Math.floor(Math.random() * upperBound);
}

/** @internal */
export class Task {
    timeoutId: NodeJS.Timer;
    intervalId: NodeJS.Timer;
}

/** @internal */
export function scheduleWithRepetition(callback: () => void,
                                       initialDelayMs: number,
                                       periodMs: number): Task {
    const task = new Task();
    task.timeoutId = setTimeout(() => {
        callback();
        task.intervalId = setInterval(callback, periodMs);
    }, initialDelayMs);
    return task;
}

/** @internal */
export function cancelRepetitionTask(task: Task): void {
    if (task.intervalId !== undefined) {
        clearInterval(task.intervalId);
    } else if (task.timeoutId !== undefined) {
        clearTimeout(task.timeoutId);
    }
}

/** @internal */
export interface DeferredPromise<T> {
    promise: Promise<T>;
    resolve: (result: T) => void;
    reject: (err: Error) => void;
}

/**
 * Returns a deferred promise.
 * @internal
 */
export function deferredPromise<T>(): DeferredPromise<T> {
    let resolve: any;
    let reject: any;
    const promise = new Promise<T>(function (): void {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve,
        reject,
        promise
    };
}

/**
 * Returns a promise that is resolved after the specified timeout.
 * @param timeout timeout in milliseconds.
 * @internal
 */
export function delayedPromise(timeout: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, timeout));
}

/**
 * Returns a Promise that will be fulfilled with the wrapped promise's
 * resolve value or rejection reason. However, if the wrapped promise is
 * not resolved or rejected within the given timeout, the returned
 * promise is rejected with an `Error` or the given error.
 *
 * @param wrapped wrapped promise
 * @param timeout timeout in millisecond
 * @param err optional error for the timeout case
 * @internal
 */
export function timedPromise<T>(wrapped: Promise<T>, timeout: number, err?: Error): Promise<T> {
    const deferred = deferredPromise<T>();
    let timed = false;

    const timer = setTimeout(() => {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.reject(new Error('Operation did not finish within timeout: ' + timeout));
        }
        timed = true;
    }, timeout);

    wrapped.then((result) => {
        if (!timed) {
            deferred.resolve(result);
            clearTimeout(timer);
        }
    }).catch((err) => {
        if (!timed) {
            deferred.reject(err);
            clearTimeout(timer);
        }
    });

    return deferred.promise;
}
