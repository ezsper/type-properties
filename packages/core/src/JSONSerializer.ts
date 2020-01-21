import { Serializer } from './Serializer';
import { isFactory } from './Factory';

export class JSONSerializer extends Serializer {

  encodeType(type: any, value: any) {
    if (isFactory(type)) {
      return Buffer.from(JSON.stringify(value.toJSONValues()));
    }
    return Buffer.from(JSON.stringify(value));
  }

  decodeType(type: any, bytes: any) {
    const json = JSON.parse(Buffer.from(bytes).toString());
    return this.fromJSON(type, json);
  }

}