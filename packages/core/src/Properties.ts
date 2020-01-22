import {
  AbstractProperties,
  FindRepeatedIndex,
  IsAbstractClass,
  MakeTupleKey,
  MakeTupleKeySingle,
  PropertiesClass,
  AnyPropertyDefinitionOutput,
  ArrayLikePropertyDefinitions,
} from './typings';
import { computeProperties } from './Property';

const $properties$ = Symbol.for('properties');

const ignoreProperty = ` ${[
  'id',
  'key',
  'nullable',
  'nullableItem',
  'default',
  'type',
].join(' ')} `;

export const __validateMetadata = {
  validate(Properties: PropertiesClass, property: AnyPropertyDefinitionOutput, name: string, key: string, value: any) {
    if (key === 'description' && typeof value !== 'string') {
      throw new Error(`The value for description must be a string`);
    }
  }
};

export function definePropertyMetadata<T extends PropertiesClass>(Properties: T, name: string, key: string, value: any) {
  if (ignoreProperty.indexOf(` ${key} `) >= 0) {
    throw new Error(`Cannot replace Key ${key}`);
  }
  const properties = getProperties(Properties);
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (property.key === name) {
      __validateMetadata.validate(Properties, property, name, key, value);
      property[key] = value;
      return;
    }
  }

  throw new Error(`Property key ${name} was not found`);
}

export function getPropertyMetadata<T extends PropertiesClass>(Properties: T, name: string, key: string) {
  const properties = getProperties(Properties);
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (property.key === name) {
      if (property.hasOwnProperty(key)) {
        return property[key];
      }
      break;
    }
  }

  throw new Error(`Property key ${name} was not found`);
}

export function hasPropertyMetadata<T extends PropertiesClass>(Properties: T, name: string, key: string) {
  const properties = getProperties(Properties);
  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];
    if (property.key === name) {
      if (property.hasOwnProperty(key)) {
        return true;
      }
      break;
    }
  }

  return false;
}

export function getProperties<C extends PropertiesClass>(target: C): ArrayLikePropertyDefinitions {
  if (target == null || target[$properties$] == null) {
    throw new Error(`Not decorated by Properties`);
  }
  return target[$properties$];
}

export function getProperty<C extends PropertiesClass>(target: C, propertyKey: string): AnyPropertyDefinitionOutput {
  const properties = getProperties(target);
  if (!properties.keyMap.hasOwnProperty(propertyKey)) {
    throw new Error(`Property ${propertyKey} is not a property like`);
  }
  return properties[properties.keyMap[propertyKey]];
}

export function hasProperty<C extends PropertiesClass>(target: C, propertyKey: string): boolean {
  const properties = getProperties(target);
  return properties.keyMap.hasOwnProperty(propertyKey);
}

export type PropertiesMustNotHaveArgs = { __ItMustNotHaveArgs?: undefined };
export type PropertiesMustNotBeAbstractClass = { __ItMustNotBeAnAbstractClass?: undefined };
export type PropertiesMustNotRepeatIndex<Index> = { __ItMustNotRepeatIndexes?: undefined };
export type EnsureProperties<T extends PropertiesClass> = IsAbstractClass<T> extends true
  ? PropertiesMustNotBeAbstractClass
  : MakeTupleKey<T['prototype']> extends MakeTupleKeySingle<T['prototype']>
    ? T extends new (...args: infer U) => T['prototype']
      ? U extends { length: 0 } ? T : PropertiesMustNotHaveArgs
      : T
    : PropertiesMustNotRepeatIndex<FindRepeatedIndex<T['prototype']>>;

/**
 * Decorator for testing and closing properties
 * @constructor
 */
export function Properties() {
  return <T extends Function & { prototype: AbstractProperties<T['prototype']> }>(target: EnsureProperties<T>): T => {
    const properties = computeProperties(() => new (target as any)());
    try {
      require('reflect-metadata');
    } catch(err) {}

    if (typeof Reflect !== 'undefined' && typeof Reflect.defineMetadata !== 'undefined') {
      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];
        try {
          Reflect.defineMetadata('design:type', property.type(), (target as any).prototype, property.key);
        } catch (error) {}
        try {
          Reflect.defineMetadata('@type-properties', property, (target as any).prototype, property.key);
        } catch (error) {}
      }
    }

    Object.defineProperty(target, $properties$, {
      enumerable: false,
      value: properties,
    });

    return target as any;
  };
}

/**
 * Check if value is a properties class
 * @param value
 */
export function isProperties(value: any): value is PropertiesClass {
  return value != null && value[$properties$] != null;
}