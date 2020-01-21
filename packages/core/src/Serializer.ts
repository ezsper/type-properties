import { isEnum } from './utils';

export abstract class Serializer {
  abstract encodeType(type: any, value: any): Uint8Array;
  abstract decodeType(type: any, bytes: Uint8Array): any;

  toJSON(type: any, value: any) {
    if (isEnum(type)) {
      return type[value];
    }
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return value;
    }
    return 'toJSON' in value
        ? value.toJSON()
        : 'toString' in value
          ? value.toString()
          : 'toNumber' in value
            ? value.toNumber()
            : 'toBoolean' in value
              ? value.toBoolean()
              : value;
  }

  fromJSON(type: any, value: any) {
    return 'fromJSON' in type
      ? type.fromJSON(value)
      : typeof value === 'string' && 'fromString' in type
        ? type.fromString(value)
        : typeof value === 'number' && 'fromNumber' in type
          ? type.fromNumber(value)
          : typeof value === 'boolean' && 'fromBoolean' in type
            ? type.fromBoolean(value)
            : typeof type === 'function' && type !== String && type !== Number && type !== Boolean
              ? new type(value)
              : isEnum(type)
                ? type[value]
                : value;
  }
}