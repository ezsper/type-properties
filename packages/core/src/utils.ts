enum EnumCheck {}
const enumPrototype = Object.getPrototypeOf(EnumCheck);
export function isEnum(value: any): value is { [K in string | number]: string | number } {
  if (typeof value !== 'object'
    || value == null
    || Object.getPrototypeOf(value) !== enumPrototype) {
    return false;
  }
  for (const key in value) {
    if (value.hasOwnProperty(key) && value[value[key]] != key) {
      return false;
    }
  }
  return true;
}