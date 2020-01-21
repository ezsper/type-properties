/// <reference types="reflect-metadata" />
import {
  TupleValues,
  PlainObject,
  PropertiesClass,
  Forge,
  TupleKeys, AnyPropertyDefinitionOutput, StrictTupleValues, OptionalKeys, PropertyKeys,
} from './typings';
import { getProperties, isProperties } from './Properties';
import { Serializer } from './Serializer';
import { JSONSerializer} from './JSONSerializer';

export const jsonSerializer = new JSONSerializer();

export interface FactoryMember<T> {
  toValues(): TupleValues<T>;
  toKeys(): TupleKeys<T>;
  toPlainObject(): PlainObject<T>;
  toJSON(): { [key: string]: any };
  toJSONValues(): any[];
  stringify(encoding?: 'hex' | 'base64'): string;
  encode(): Uint8Array;
}

export interface FactoryStaticMembers<T extends PropertiesClass> {
  Properties: T;
  Serializer: Serializer;
  getProperties<This extends FactoryClass<T>>(this: This): ArrayLike<AnyPropertyDefinitionOutput>;
  getPropertyNames<This extends FactoryClass<T>>(this: This): TupleKeys<T['prototype']>;
  fromPlainObject<This extends FactoryClass<T>>(obj: PlainObject<T['prototype']>): This['prototype'];
  fromJSON<This extends FactoryClass<T>>(json: { [key: string]: any } | any[]): This['prototype'];
  fromJSONString<This extends FactoryClass<T>>(jsonString: any): This['prototype'];
  fromValues<This extends FactoryClass<T>>(values: TupleValues<T['prototype']>): This['prototype'];
  fromStrictValues<This extends FactoryClass<T>>(values: StrictTupleValues<T['prototype']>): This['prototype'];
  stringify<This extends FactoryClass<T>>(forge: Forge<T['prototype']>, encoding?: 'hex' | 'base64'): string;
  parse<This extends FactoryClass<T>>(str: string, encoding?: 'hex' | 'base64'): This['prototype'];
  encode<This extends FactoryClass<T>>(forge: Forge<T['prototype']>): Uint8Array;
  decode<This extends FactoryClass<T>>(bytes: Uint8Array): This['prototype'];
}

export type FactoryPrototype<T extends PropertiesClass> = MixinMembers<T['prototype'], { [K in keyof T['prototype']]: K extends keyof PlainObject<T['prototype']> ? PlainObject<T['prototype']>[K] : T[K] } & FactoryMember<T['prototype']>>;

export interface FactoryClass<T extends PropertiesClass = PropertiesClass> {
  Properties: T;
  prototype: any;
  new(forge: any, ...args: any[]): any;
}

export type FactoryExtendPrototype<This extends FactoryClass, T extends This['Properties']> = MixinMembers<This['prototype'], FactoryPrototype<T>>;

export interface FactoryStatic<T extends PropertiesClass> extends FactoryStaticMembers<T> {
  prototype: FactoryPrototype<T>;
  new (forge: Forge<T['prototype']>): this['prototype'];
}

export type ForgeInput<This extends FactoryClass> = This extends new (forge?: infer Input, ...args: any[]) => any
  ? Input
  : This extends new (forge: infer Input, ...args: any[]) => any ? Input : never;
export type ForgeArgs<This extends FactoryClass> = This extends new (forge: any, ...args: infer Args) => any ? Args : never[];


export type ForgeMixin<This extends FactoryClass, T> = (ForgeInput<This> & OptionalKeys<Forge<T>, PropertyKeys<This['Properties']['prototype']>>) extends infer U
    ? { [K in keyof U]: U[K] }
    : never;

export interface FactoryExtendStatic<This extends FactoryClass, T extends This['Properties']> extends FactoryStaticMembers<T> {
  FactoryMixin: This;
  prototype: FactoryExtendPrototype<This, T>;
  new (forge: ForgeMixin<This, T['prototype']>, ...args: ForgeArgs<This>): this['prototype'];
}

// export type MixinMembers<T, U> = { [K in Exclude<keyof T, keyof U>]: T[K] } & U;
export type MixinMembers<T, U> = Omit<T, keyof U> & U;

export interface FactoryConstructor {
  <Props extends PropertiesClass>(Properties: Props): FactoryStatic<Props>;
  <This extends FactoryClass, T extends This['Properties']>(target: This, Properties: T): MixinMembers<This, FactoryExtendStatic<This, T>>;
}

abstract class AbstractFactory {

  static getProperties(this: any) {
    return getProperties(this.Properties);
  }

  static getPropertyNames(this: any) {
    return Array.from(getProperties(this.Properties)).map(property => property.key);
  }

  static stringify(this: any, forge: any, encoding?: 'base64') {
    return (new this(forge)).stringify(encoding);
  }

  static encode(this: any, forge: any) {
    return (new this(forge)).encode();
  }

  static parse(this: any, str: any, encoding: 'hex' | 'base64' = "base64") {
    return this.fromJSONString(Buffer.from(str, encoding).toString());
  }

  static decode(this: any, bytes: any) {
    return this.Serializer.decodeType(this, bytes);
  }

  static fromPlainObject(this: any, obj: any) {
    return new this(obj);
  }

  static fromValues(this: any, values: any[]) {
    const obj = {};
    for (const property of Array.from(getProperties(this.Properties))) {
      obj[property.key] = values[property.id];
    }
    return new this(obj);
  }

  static fromStrictValues(this: any, values: any[]) {
    return this.fromValues(values);
  }

  static fromJSON(this: any, json: any) {
    const properties = Array.from(getProperties(this.Properties));
    const obj = {};
    for (const property of properties) {
      let type = property.type();
      const isList = Array.isArray(type);
      if (isList) {
        type = type[0];
      }
      const item = json[Array.isArray(json) ? property.id : property.key];
      obj[property.key] = item != null
        ? isList
          ? item.map((value: any) => value != null ? this.Serializer.fromJSON(type, value) : null)
          : this.Serializer.fromJSON(type, item)
        : null;
    }
    return new this(obj);
  }

  static fromJSONString(this: any, jsonString: string) {
    return this.fromJSON(JSON.parse(jsonString));
  }

  toPlainObject() {
    const obj = {};
    for (const property of Array.from(getProperties((this.constructor as any).Properties))) {
      obj[property.key] = this[property.key];
    }
    return obj;
  }

  toValues() {
    const values = [];
    for (const property of Array.from(getProperties((this.constructor as any).Properties))) {
      values.push(this[property.key]);
    }
    return values;
  }

  toJSON() {
    const { Properties, Serializer } = (this.constructor as any);
    const properties = Array.from(getProperties(Properties));
    const obj = {};
    for (const property of properties) {
      let type = property.type();
      const isList = Array.isArray(type);
      if (isList) {
        type = type[0];
      }
      const value = this[property.key];
      obj[property.key] = value != null
        ? isList
          ? value.map((value: any) => value != null ? Serializer.toJSON(type, value) : null)
          : Serializer.toJSON(type, value)
        : null;
    }
    return obj;
  }

  toJSONValues() {
    const { Properties, Serializer } = (this.constructor as any);
    const properties = Array.from(getProperties(Properties));
    const values: any[] = [];
    for (const property of properties) {
      let type = property.type();
      const isList = Array.isArray(type);
      if (isList) {
        type = type[0];
      }
      const value = this[property.key];
      values[property.id] = value != null
        ? isList
          ? value.map((value: any) => value != null ? Serializer.toJSON(type, value) : null)
          : Serializer.toJSON(type, value)
        : null;
    }
    return values;
  }

  encode() {
    return (this.constructor as any).Serializer.encodeType(this.constructor, this);
  }

  stringify(encoding = 'base64') {
    return this.encode().toString('base64');
  }

}

export const Factory = (() => {
  return function(...args: any[]) {
    let Mixin: any;
    let Properties: any;
    if (args.length <= 1) {
      ([Properties] = args);
    } else {
      ([Mixin, Properties] = args);
    }

    const forgeableClass = Mixin
        ? class extends Mixin {
          constructor(forge: any, ...args: any[]) {
            const properties = new Properties();
            const forgeMerge = Object.assign({}, properties);
            for (const property in properties) {
              if (forge[property] != null) {
                forgeMerge[property] = forge[property];
              }
            }
            for (const property in properties) {
              if (forge[property] == null && typeof properties[property] === 'function') {
                forgeMerge[property] = forgeMerge[property]();
              }
            }
            super(forgeMerge, ...args);
          }
        }
        : class extends Properties {
          constructor(forge: any) {
            super();
            const properties = Array.from(getProperties((this.constructor as any).Properties));
            for (const property of properties) {
              if (forge[property.key] != null) {
                this[property.key] = forge[property.key];
              }
            }
            for (const property of properties) {
              if (forge[property.key] == null && typeof this[property.key] === 'function') {
                this[property.key] = this[property.key]();
              }
            }
          }
      };

    if (Mixin) {
      Object.defineProperty(forgeableClass, 'name', {
        value: `Mixin(${forgeableClass.name})`,
      });
      Object.setPrototypeOf(forgeableClass.prototype, Properties.prototype);
    } else {
      Object.defineProperty(forgeableClass, 'name', {
        configurable: true,
        value: `Factory(${Properties.name})`,
      });
    }

    (forgeableClass as any).Properties = Properties;
    (forgeableClass as any).Serializer = jsonSerializer;

    const ownStaticProperties = Object.getOwnPropertyNames(forgeableClass);
    const ownMemberProperties = Object.getOwnPropertyNames(forgeableClass.prototype);

    for (const extendClass of (Mixin ? [Mixin, AbstractFactory] : [AbstractFactory])) {
      Object.getOwnPropertyNames(extendClass).forEach(name => {
        if (!ownStaticProperties.includes(name)) {
          Object.defineProperty(forgeableClass, name, Object.getOwnPropertyDescriptor(extendClass, name) as any);
        }
      });

      Object.getOwnPropertyNames(extendClass.prototype).forEach(name => {
        if (!ownMemberProperties.includes(name)) {
          Object.defineProperty(forgeableClass.prototype, name, Object.getOwnPropertyDescriptor(extendClass.prototype, name) as any);
        }
      });
    }

    return forgeableClass;
  };

})() as any as FactoryConstructor;

export function isFactory(type: any): type is FactoryClass {
  return type instanceof Function
    && 'Properties' in type
    && type.prototype instanceof type.Properties
    && isProperties(type.Properties);
}