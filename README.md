# TypeProperties  
  
The TypeProperties is an **experimental** project that should help you create better
TypeScript NodeJS Rest APIs. It enables you to create serializeable models that are JSON type
safe and fully type checked.

The TypeProperties is a solution for "writing type once", this is particularly useful when [Metadata Reflect API](https://www.npmjs.com/package/reflect-metadata)
is not enough, as Reflect is only coerce when types are solely based on `typeof` and `instanceof`.
In all the other cases when you wrap your type into an array or make it nullable with union types, Reflect stops preserving
types.
 
### Example usage  
  
```typescript  
import {  
  Properties,
  Property,
  Factory,
  Descr,
} from '@type-properties/core';

enum UserStatus {
    ACTIVE = 0;
    INACTIVE = 1;
}

@Properties()  
export class UserIdentifierProperties {  
  __typename = Property[0]({  
    type: () => String,  
    default: () => 'User',  
  });  
    
  @Descr('The user object id')  
  _id = Property[1]({  
    type: () => String,  
  });  
}  
  
export class UserIdentifier extends Factory(UserIdentifierProperties) {}  
  
@Properties()  
export class UserProperties extends UserIdentifierProperties {  
    
  @Descr('The user global id')  
  id = Property[2]({
    type: () => String,  
    default: () => UserIdentifier.stringify(this),  
  });  
  
  @Descr(`The user email`)  
  email = Property[5]({  
    type: () => String,  
    nullable: true,  
  });  
    
  @Descr(`The user given name`)  
  givenName = Property[3]({  
    type: () => String,  
  });  
    
  @Descr(`The user family name`)  
  familyName = Property[4]({  
    type: () => String,  
  });  
    
  displayName = Property[6]({  
    type: () => String,  
    default: () => `${this.givenName} ${this.familyName}`,  
    description: 'The user display name',  
  });  
    
  registeredAt = Property[7]({  
    type: () => Date,  
    default: () => new Date(),  
  });  
    
  followers = Property[8]({  
    type: () => [User],
    default: () => [],
  });
  
  status = Property[9]({  
    type: () => UserStatus,  
    default: () => UserStatus.ACTIVE, 
  });

}  
  
export class User extends Factory(UserProperties) {}  
  
const user = new User({  
  id: '1',  
  givenName: 'John',  
  familyName: 'Doe',  
});  
  
const parsedUser = User.fromJSONString(JSON.stringify(user));  
validateSync(parsedUser);
if (
  parsedUser instanceof User
    && parsedUser instanceof UserProperties,
    && parsedUser.registeredAt instanceof Date // witch means it unserializes Date objects
) {  
  // this will be true  
}
```  
  
##### TypeProperties gives you more abstraction to model types

```typescript
// Static members
export interface UserStatic {
  /**
   * The properties class
   */
  Properties: UserProperties;
  /**
   * The properties factory serializer
   */
  Serializer: JSONSerializer;

  /**
   * Get factory property definitions
   */
  getProperties(): ArrayLikePropertyDefinitions;

  /**
   * Get factory property names
   */
  getPropertyNames(): TupleKeys<UserProperties>;

  /**
   * Transform plain object to properties factory
   * @param obj
   */
  fromPlainObject(obj: PlainObject<UserProperties>): User;

  /**
   * Transform json serialized object into properties factory
   * @param json
   */
  fromJSON(json: { [key: string]: any } | any[]): User;

  /**
   * Transform json serialized string into properties factory
   * @param jsonString
   */
  fromJSONString(jsonString: any): User;

  /**
   * Transform property tuple values into properties factory
   * @param values
   */
  fromValues(values: TupleValues<UserProperties>): User;

  /**
   * Transform property tuple values into properties factory with strict values
   * @param values
   */
  fromStrictValues(values: StrictTupleValues<UserProperties>): User;

  /**
   * Encodes properties factory to base64 string
   * @param forge
   * @param encoding
   */
  stringify(forge: Forge<UserProperties>, encoding?: 'hex' | 'base64'): string;

  /**
   * Parse a base64 string into properties factory
   * @param str
   * @param encoding
   */
  parse(str: string, encoding?: 'hex' | 'base64'): User;

  /**
   * Encodes properties factory into array of bytes
   * @param forge
   * @param encoding
   */
  encode(forge: Forge<UserProperties>): Uint8Array;

  /**
   * Decodes array of bytes into properties factory
   * @param bytes
   */
  decode(bytes: Uint8Array): User;
}

// Prototype members
interface User {
  /**
   * Transform properties factory into tuple of property values
   */
  toValues(): TupleValues<UserProperties>;

  /**
   * Return all property keys
   */
  toKeys(): TupleKeys<UserProperties>;

  /**
   * Transform properties factory into plain object
   */
  toPlainObject(): PlainObject<UserProperties>;

  /**
   * Transform properties factory into json ready object
   */
  toJSON(): { [key: string]: any };

  /**
   * Transform properties factory into json ready tuple of values
   */
  toJSONValues(): any[];

  /**
   * Stringify
   * @param encoding
   */
  stringify(encoding?: 'hex' | 'base64'): string;

  /**
   * Transform serializeable factory into bytes
   */
  encode(): Uint8Array;
}
```