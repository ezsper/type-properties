# TypeProperties with GraphQL

> **This project is not yet available and is currently under development**

##### Without TypeProperties
```
import { ObjectType, GraphQLField } from 'type-graphql';

enum UserStatus {
   ACTIVE = 0;
   INACTIVE = 1;
}

@ObjectType()
class User {

  @GraphQLField()
  id!: string;
  
  @GraphQLField({ nullable: true })
  email!: string;
  
  @GraphQLField(() => String, { nullable: true }) // must repeat types
  displayName!: string | null = null;
  
  @GraphQLField(type => UserStatus)
  status = UserStatus.ACTIVE;
 
  @GraphQLField(type => [User])
  followers: User[] = [];
  
  password!: string;
  
}

const user = new User(); // no fillable type checking 
user.id = '1';
user.email = 'example@example';
```

##### With TypeProperties
```
import {
  Properties,
  Property,
  Factory,
} from '@type-properties/core';
import {
  GraphQLType,
  GraphqLField,
} from '@type-properties/graphql';

enum UserStatus {
   ACTIVE = 0;
   INACTIVE = 1;
}

@Properties()
class UserProperties {
  
  id = Property[0]({
    type: () => String,
  });
  
  @GraphqLField.Nullable() // nullable only in graphql and required in typescript
  email = Property[1]({
    type: () => String,
  });
  
  status = Property[2]({
    type: () => UserStatus,
    default: () => UserStatus.ACTIVE,
  });
  
  followers = Property[3]({
    type: () => [User],
    default: () => [],
  });
  
  @GraphQLField.Ignore()
  password = Property[4]({
    type: () => String,
  });
  
}

@GraphQLType()
export class User extends Factory(UserProperties) {}

const user = new User({
  id: '1',
  email: 'example@example',
});
```