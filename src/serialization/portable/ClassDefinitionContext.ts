/*
 * Copyright (c) 2008-2018, Hazelcast, Inc. All Rights Reserved.
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

import {ClassDefinition} from './ClassDefinition';

export class ClassDefinitionContext {
    private factoryId: number;

    private classDefs: {[classId: string]: ClassDefinition};

    constructor(factoryId: number, portableVersion: number) {
        this.factoryId = factoryId;
        this.classDefs = {};
    }

    private static encodeVersionedClassId(classId: number, version: number): string {
        return classId + 'v' + version;
    }

    private static decodeVersionedClassId(encoded: string): [number, number] {
        var re = /(\d+)v(\d+)/;
        var extracted = re.exec(encoded);
        return [Number.parseInt(extracted[1]), Number.parseInt(extracted[2])];
    }

    lookup(classId: number, version: number) {
        var encoded = ClassDefinitionContext.encodeVersionedClassId(classId, version);
        return this.classDefs[encoded];
    }

    register(classDefinition: ClassDefinition): ClassDefinition {
        if (classDefinition === null) {
            return null;
        }
        if (classDefinition.getFactoryId() !== this.factoryId) {
            throw new RangeError(`This factory's number is ${this.factoryId}. 
            Intended factory id is ${classDefinition.getFactoryId()}`);
        }
        var cdKey = ClassDefinitionContext.encodeVersionedClassId(classDefinition.getClassId(), classDefinition.getVersion());
        var current = this.classDefs[cdKey];
        if (current == null) {
            this.classDefs[cdKey] = classDefinition;
            return classDefinition;
        }
        if (current instanceof ClassDefinition && !current.equals(classDefinition)) {
            throw new RangeError(`Incompatible class definition with same class id: ${classDefinition.getClassId()}`);
        }
        return classDefinition;
    }
}