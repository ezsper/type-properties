import {
  Properties,
  Property,
  Factory,
} from '.';

@Properties()
export class UserIdentifierProperties {
  /**
   * Typename
   */
  __typename = Property[0]({
    type: () => String,
    default: () => 'User',
  });

  /**
   * _id
   */
  _id = Property[1]({
    type: () => [String],
  });

}


export class UserIdentifier extends Factory(UserIdentifierProperties) {}

@Properties()
export class UserProperties extends UserIdentifierProperties {

  /**
   * id
   */
  id = Property[2]({
    type: () => String,
    default: () => UserIdentifier.stringify(this),
  });

  emails = Property[3]({
    type: () => [String],
    nullable: true,
  });

  another = Property[4]({
    type: () => String,
    default: () => this.id,
  });

  itSelf = Property[5]({
    type: () => [User],
    nullable: true,
  });

  createdAt = Property[6]({
    type: () => Date,
  });

}


export class User extends Factory(UserProperties) {

  static myUser() {}

}

@Properties()
class AnotherProperties extends UserProperties {

  base = Property[7]({
    type: () => Date,
  });

  extra = Property[8]({
    type: () => String,
  });

}

export class Another extends Factory(User, AnotherProperties) {}

