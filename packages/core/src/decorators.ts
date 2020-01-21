import { PropertyLikely } from './typings';
import { definePropertyMetadata } from './Properties';

/**
 * Decorator for defining property metadata
 * @param key Metadata key
 * @param value Metadata value
 * @constructor
 */
export function PropertyMetadata(key: string, value: any) {
  return <Key extends string, T extends { [K in Key]: PropertyLikely<T[K]> }>(target: T, propertyKey: Key) => {
    definePropertyMetadata(target.constructor, propertyKey, key, value);
  };
}

/**
 * Description decorator for properties
 * @param comment
 * @constructor
 */
export function Descr(comment: string) {
  return PropertyMetadata('description', comment);
}