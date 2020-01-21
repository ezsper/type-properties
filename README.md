# TypeProperties  
  
The type properties is an **experimental** project that should help you create better
TypeScript NodeJS Rest APIs, by enabling you to create serializeable models that are JSON type
safe and fully type checked.

It aims to work along side with 3rd party libs like:
* [TypeORM](https://www.npmjs.com/package/typeorm)
* [TypeGraphQL](https://www.npmjs.com/package/type-graphql)
* [ClassValidator](https://www.npmjs.com/package/class-validator)
* [ProtobufJS](https://www.npmjs.com/package/protobufjs)

> Although these libraries have no understanding of TypeProperties their decorators could very easily be
implemented to support it

The TypeProperties goes beyond [Metadata Reflection API](https://www.npmjs.com/package/reflect-metadata) as enforces
you to declare at runtime your property types, that can once be read by decorators giving information like:

* `type`

    > proper type, not just `typeof` and `instanceof` like covered by Metadata Reflection API)
* `default` 

    > If property has default value
    
* `nullable` 

    > If property is nullable
    
* `id` 

    > Implicit property index
    
The TypeProperties uses advanced *type checking* rules to give you a proper TypeScript experience with it,
make sure you check the example usage below 
 
### Example usage  
  
```typescript  
import {  
  Properties,  
  Property,  
  Factory,  
  Descr,  
} from '@type-properties/core';  
// it works with class validator, typeorm and type-graphql  
import { IsEmail, validateSync } from 'class-validator';

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
    
  @IsEmail()  
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
    nullable: true,  
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
interface UserStatic {
	new (forge: Forge<UserProperties>): User;
	getProperties(): ArrayLike<PropertyDefinitionOutput>;
	fromPlainObject(obj: PlainObject<UserProperties>): User;  
	fromValues(values: TupleValues<UserProperties>): User;  
	stringify(obj: Forge<UserProperties>, encoding?: string): string;  
	parse(str: string, encoding?: string): User;  
	encode(forge: Forge<UserProperties>): Uint8Array;  
	decode(bytes: Uint8Array): User;  
	fromJSON(json: { [key: string]: any } | any[]): User;  
	fromJSONString(jsonString: string): User;  
}

// Prototype members
interface UserPrototype {
	toValues(): TupleValues<UserProperties>;  
	toPlainObject(): PlainObject<UserProperties>;  
	encode(): Uint8Array;  
	stringify(encoding?: string): string;  
	toJSON(): { [key: string]: any };  
	toJSONValues(): any[]; 
} 
```  

  