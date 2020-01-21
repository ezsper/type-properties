# TypeProperties with GraphQL

> **This project is not yet available and is currently under development**

##### Without TypeProperties
```
import { Message, Field } from 'protobufjs';

enum UserStatus {
   ACTIVE = 0;
   INACTIVE = 1;
}

class User extends Message<User> {

  @Field.d(1, 'string', 'required')
  id!: string;
  
  @Field.d(2, 'string', 'optional')
  email!: string;
  
  @Field.d(3, 'string', 'optional')
  displayName!: string | null = null;
  
  @Field.d(4, UserStatus, 'required')
  status = UserStatus.ACTIVE;
 
  @Field.d(5, User, 'repeated')
  followers: User[] = [];
  
  password!: string;
  
}

const user = User.create({ id: '1', email: 'example@example' });
const bytes = User.encode(user).finish();
```

##### With TypeProperties
```
import {
  Properties,
  Property,
  Factory,
} from '@type-properties/core';
import {
  ProtobufSerializer,
  ProtobufField,
} from '@type-properties/protobufjs';

enum UserStatus {
   ACTIVE = 0;
   INACTIVE = 1;
}

@Properties()
class UserProperties {
  
  id = Property[0]({
    type: () => String,
  });
  
  @ProtobufField.Nullable() // nullable only in graphql and required in typescript
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
  
  @ProtobufField.Ignore()
  password = Property[4]({
    type: () => String,
  });
  
}

@ProtobufSerializer()
export class User extends Factory(UserProperties) {}

const user = new User({
  id: '1',
  email: 'example@example',
});

const bytes = user.encode();
```