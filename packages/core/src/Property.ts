/// <reference types="reflect-metadata" />
import {
  PropertyCaller,
  ArrayLikePropertyDefinitions
} from './typings';

let emit = false;
let fields: any;

function setEmit(state: boolean) {
  fields = [];
  emit = state;
}

export class PropertyDefinitionObject {}

export const Property = (() => {
  const PropertyObject = function() {
    throw new Error(`You must use Property[index]`);
  } as any;

  for (let i = 0; i < 100; i++) {
    PropertyObject[i] = function Property(...args: any[]) {
      if (emit) {
        const {
          type,
          nullable = false,
          nullableItem = false,
          default: defaultValue,
          description,
          metadata,
        } = args[0];
        const def = new PropertyDefinitionObject() as any;
        def.id = i;
        def.type = type;
        def.nullable = nullable;
        def.nullableItem = nullableItem;
        def.default = defaultValue != null;
        def.description = description;
        def.metadata = metadata;
        fields[i] = def;
        return def;
      } else {
        let defaultValue = null;
        if ('default' in args[0]) {
          defaultValue = args[0].default;
        }
        return defaultValue;
      }
    };
  }

  return PropertyObject;
})() as any as PropertyCaller;


const map = new WeakMap<Function, any>();

export function getAllProperties(obj: any) {
  const allProps: string[] = [];
  let curr: any = obj;
  do {
    const props = Object.getOwnPropertyNames(curr);
    props.forEach(function(prop){
      if (allProps.indexOf(prop) === -1)
        allProps.push(prop)
    })
  } while(curr = Object.getPrototypeOf(curr));
  return allProps;
}

export function computeProperties(target: () => any): ArrayLikePropertyDefinitions {
  if (map.has(target)) {
    return map.get(target);
  }
  setEmit(true);
  const obj = target();
  if (typeof obj !== 'object' || obj == null) {
    throw new Error(`Expecting target to return an object`);
  }
  const targetFields = fields;
  setEmit(false);
  const properties = { length: 0, keyMap: {} };
  let maxLength = 0;
  for (const key of getAllProperties(obj)) {
    const prop = obj[key];
    if (prop instanceof PropertyDefinitionObject) {
      targetFields[(prop as any).id].key = key;
    }
  }

  for (const property of targetFields) {
    if (!property) {
      continue;
    }
    properties.length++;
    maxLength = Math.max(properties.length, property.id + 1);
    const { type, id, nullable, nullableItem, default: defaultValue, description, key, metadata } = property;
    if (!key) {
      throw new Error(`Could not determinate property ${id}`);
    }
    properties[property.id] = {
      ...metadata,
      id,
      type,
      key,
      nullable,
      nullableItem,
      default: defaultValue,
      description,
    };
    properties.keyMap[key] = property.id;
  }

  for (let i = 0; i < maxLength; i++) {
    if (properties[i] == null) {
      throw new Error(`Missing Property[${i}]`);
    }
  }

  map.set(target, properties);
  return properties;
}

