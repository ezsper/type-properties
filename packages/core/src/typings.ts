import { NormalizeTuple, TupleIndexes } from './normalize-tuple';

export interface ClassType<T = any> {
  new(...args: any[]): T;
}

export type Any = string | number | boolean | symbol | { [K in string | number | symbol]: any };

type ResolveInnerType<T> = Any extends T
  ? Any
  : T extends typeof String | StringConstructor
    ? string
    : T extends typeof Number | NumberConstructor
      ? number
      : T extends Boolean
        ? boolean
        : T extends Function & { prototype: infer U }
          ? U
          : T extends { [x: number]: string }
            ? T[keyof T]
            : T;

export type ResolveType<T> = ResolveInnerType<OmitDefinition<T>>;

export type DefinitionPropertyRequired<N extends TupleIndexes = TupleIndexes, T = any> = { $property$?: { id: N, type: T, required: true } };
export type DefinitionPropertyOptional<N extends TupleIndexes = TupleIndexes, T = any> = { $property$?: { id: N, type: T, optional?: true } };
export type DefinitionPropertyNullable<N extends TupleIndexes = TupleIndexes, T = any> = { $property$?: { id: N, type: T, nullable?: true } };

export type RequiredProperty<N extends TupleIndexes, T> = T & DefinitionPropertyRequired<N, T>;
export type OptionalProperty<N extends TupleIndexes, T> = T & DefinitionPropertyOptional<N, T>;
export type NullableProperty<N extends TupleIndexes, T> = (T & DefinitionPropertyNullable<N, T>) | null;

export type OmitDefinition<T> = T extends { $property$?: { type: infer U } }
  ? U
  : T;

export type IsProperty<T> = Exclude<T, null> extends never
  ? false
  : Exclude<T, null> extends { $property$?: {} }
    ? true
    : false;

export type PropertyKeys<T> = Exclude<{ [K in keyof T]: IsProperty<T[K]> extends true ? K : null }[keyof T], null>;


export type TupleValues<T> = NormalizeTuple<MakeTupleValue<T>>;
export type StrictTupleValues<T> = NormalizeTuple<MakeTupleValueStrict<T>>;

export type TupleKeys<T> = NormalizeTuple<MakeTupleKey<T>>;

export type PropertyLength<T> = TupleValues<T> extends { length: infer U }
  ? U extends number ? U : never
  : never;

export type PropertyObject<T> = { [K in PropertyKeys<T>]: OmitDefinition<T[K]> };

export type PropertyDefinitions<T> = { [K in PropertyKeys<T>]: Exclude<T[K], null> extends { $property$?: infer U }
  ? U
  : DefinitionPropertyOptional | DefinitionPropertyNullable | DefinitionPropertyRequired };

export interface ArrayLikePropertyDefinitions extends ArrayLike<AnyPropertyDefinitionOutput> {
  keyMap: { [key: string]: number };
}

type Merge<T> = { [K in keyof T]: { (args: T[K]): void } }[keyof T] extends { (args: infer U): void }
  ? { [K in keyof U]: U[K] }
  : {};

type MergeDeep<T> = { [K in keyof T]: { (args: T[K]): void } }[keyof T] extends { (args: infer U): void }
  ? { [K in keyof U]: keyof U[K] }
  : {};

type MergeAnother<T> = { [K in keyof T]: { (args: T[K]): void } }[keyof T] extends { (args: infer U): void }
  ? { [K in keyof U]: U[K] extends (infer F)[] ? F : never }
  : {};

export type TupleItemValue<T> = T extends { id: TupleIndexes, type: any }
  ? {
    [K2 in T['id']]: T extends { nullable: true }
      ? (T['type'] | null | undefined)
      : T extends { optional?: true }
        ? T['type'] | undefined
        : T['type']
  }
  : {};

export type TupleItemValueStrict<T> = T extends { id: TupleIndexes, type: any }
  ? { [K2 in T['id']]: T extends { nullable: true } ? (T['type'] | null) : T['type'] }
  : {};

export type MakeTupleValueStrict<T> = Merge<{ [K in keyof PropertyDefinitions<T>]: TupleItemValueStrict<PropertyDefinitions<T>[K]> }>;
export type MakeTupleValue<T> = Merge<{ [K in keyof PropertyDefinitions<T>]: TupleItemValue<PropertyDefinitions<T>[K]> }>;

export type TupleItemKey<T, K> = T extends { id: TupleIndexes }
  ? K extends string ? { [K2 in T['id']]: {[K2 in K]: null }  } : {}
  : {};

export type TupleItemKeySingle<T, K> = T extends { id: TupleIndexes }
  ? K extends string ? { [K2 in T['id']]: K[]  } : {}
  : {};

export type MakeTupleKey<T> = MergeDeep<{ [K in keyof PropertyDefinitions<T>]: TupleItemKey<PropertyDefinitions<T>[K], K> }>;
export type MakeTupleKeySingle<T> = MergeAnother<{ [K in keyof PropertyDefinitions<T>]: TupleItemKeySingle<PropertyDefinitions<T>[K], K> }>;

export type IsPropertyOptional<T> = T extends { $property$?: infer U }
  ? (Required<U> extends { optional: true } ? true : false)
  : false;
export type IsPropertyNullable<T> = T extends { $property$?: infer U }
  ? (Required<U> extends { nullable: true } ? true : false)
  : false;
export type OptionalPropertyKeys<T> = Exclude<{ [K in PropertyKeys<T>]: IsPropertyOptional<T[K]> extends true ? K : null }[PropertyKeys<T>], null>;
export type NullablePropertyKeys<T> = Exclude<{ [K in PropertyKeys<T>]: IsPropertyNullable<Exclude<T[K], null>> extends true ? K : null }[PropertyKeys<T>], null>;

export type Forge<T> = { [K in OptionalPropertyKeys<T> | NullablePropertyKeys<T>]?: Exclude<OmitDefinition<T[K]>, undefined> | null } & { [K in Exclude<keyof PropertyObject<T>, OptionalPropertyKeys<T> | NullablePropertyKeys<T>>]: OmitDefinition<T[K]> };
export type OptionalKeys<T, P extends string | number | symbol> = { [K in Exclude<keyof T, Exclude<keyof T, P>>]?: T[K] } & Omit<{ [K in keyof T]: T[K] }, P>;
export type ForgeWithOptional<T, P extends keyof Forge<T>> = OptionalKeys<Forge<T>, P>;
export type PlainObject<T> = { [K in OptionalPropertyKeys<T>]-?: Exclude<OmitDefinition<T[K]>, undefined | null> } & Omit<PropertyObject<T>, OptionalPropertyKeys<T>>;



export type PropertyLikely<T> = IsProperty<T> extends true ? any : PropertyDefinition;

export type Optionals<T> = { [K in OptionalPropertyKeys<T>]: PlainObject<T>[K] };

export type PropertyDefinition = { $property$: {} };
export type AbstractProperties<T> = { [K in Exclude<keyof T, '__propertyKeys'>]: PropertyLikely<T[K]> };
export type PropertiesClass<T = {}> = Function & { prototype: AbstractProperties<T> }

export type IsAbstractClass<T extends { prototype: any }> = T extends { new(...args: any[]): any }
  ? false
  : true;

export type FindRepeatedIndex<T> = Exclude<{ [K in keyof MakeTupleKey<T>]: K extends keyof MakeTupleKeySingle<T> ? MakeTupleKey<T>[K] extends MakeTupleKeySingle<T>[K] ? null : [K, MakeTupleKeySingle<T>[K], Exclude<MakeTupleKey<T>[K], MakeTupleKeySingle<T>[K]>] : null }[keyof MakeTupleKey<T>], null>;

export interface PropertyMetadataInput {
  [key: string]: any;
}


export interface PropertyExtra {
  description?: string;
  metadata?: PropertyMetadataInput;
}
export interface PropertyDefine<N extends TupleIndexes> {
  <U extends ClassType>(def: { type: () => [U], nullable?: false, default?: false, nullableItem?: false } & PropertyExtra): RequiredProperty<N, ResolveType<U>[]>;
  <U extends ClassType>(def: { type: () => [U], nullable?: false, default?: false, nullableItem: true } & PropertyExtra): RequiredProperty<N, (ResolveType<U> | null)[]>;
  <U extends ClassType>(def: { type: () => [U], default: () => ResolveType<U>[], nullable?: false, nullableItem?: false } & PropertyExtra): OptionalProperty<N, ResolveType<U>[]>;
  <U extends ClassType>(def: { type: () => [U], default: () => (ResolveType<U> | null)[], nullable?: false, nullableItem: true } & PropertyExtra): OptionalProperty<N, (ResolveType<U> | null)[]>;
  <U extends ClassType>(def: { type: () => [U], nullable: true, default?: false, nullableItem?: false } & PropertyExtra): NullableProperty<N, ResolveType<U>[]>;
  <U extends ClassType>(def: { type: () => [U], nullable: true, default?: false, nullableItem: true } & PropertyExtra): NullableProperty<N, (ResolveType<U>[] | null)>;
  <U>(def: { type: () => [U], nullable?: false, default?: false, nullableItem?: false } & PropertyExtra): RequiredProperty<N, ResolveType<U>[]>;
  <U>(def: { type: () => [U], nullable?: false, default?: false, nullableItem: true } & PropertyExtra): RequiredProperty<N, (ResolveType<U> | null)[]>;
  <U>(def: { type: () => [U], default: () => ResolveType<U>[], nullable?: false, nullableItem?: false } & PropertyExtra): OptionalProperty<N, ResolveType<U>[]>;
  <U>(def: { type: () => [U], default: () => (ResolveType<U> | null)[], nullable?: false, nullableItem: true } & PropertyExtra): OptionalProperty<N, (ResolveType<U> | null)[]>;
  <U>(def: { type: () => [U], nullable: true, default?: false, nullableItem?: false } & PropertyExtra): NullableProperty<N, ResolveType<U>[]>;
  <U>(def: { type: () => [U], nullable: true, default?: false, nullableItem: true } & PropertyExtra): NullableProperty<N, (ResolveType<U>[] | null)>;
  <U extends ClassType>(def: { type: () => U, nullable?: false, default?: false } & PropertyExtra): RequiredProperty<N, ResolveType<U>>;
  <U extends ClassType>(def: { type: () => U, nullable: true, default?: false } & PropertyExtra): NullableProperty<N, ResolveType<U>>;
  <U extends ClassType>(def: { type: () => U, default: () => ResolveType<U>, nullable?: false } & PropertyExtra): OptionalProperty<N, ResolveType<U>>;
  <U>(def: { type: () => Exclude<U, ReadonlyArray<any>>, nullable?: false, default?: false } & PropertyExtra): RequiredProperty<N, ResolveType<U>>;
  <U>(def: { type: () => Exclude<U, ReadonlyArray<any>>, nullable: true, default?: false } & PropertyExtra): NullableProperty<N, ResolveType<U>>;
  <U>(def: { type: () => Exclude<U, ReadonlyArray<any>>, default: () => ResolveType<U>, nullable?: false } & PropertyExtra): OptionalProperty<N, ResolveType<U>>;
}

export type PropertyOutOfBound = {
  start: 0;
  end: 99;
};

export type PropertyCaller = { [K in TupleIndexes]: PropertyDefine<K> } & {
  [key: number]: PropertyOutOfBound;
};

export interface PropertyDefinitionOutput {
  key: string;
  type: () => any;
  id: number;
  nullableItem: boolean;
  nullable: boolean;
  default: boolean;
  description?: string;
}
export interface AnyPropertyDefinitionOutput extends PropertyDefinitionOutput {
  [key: string]: any;
}