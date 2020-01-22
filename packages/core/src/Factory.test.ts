/// <reference types="jest" />
import { Properties } from './Properties';
import { Property } from './Property';
import { Factory } from './Factory';
import { Forge } from './typings';

describe('Factory', () => {
  enum UserStatus {
    ACTIVE = 1,
    INACTIVE = 2
  }

  @Properties()
  class UserProperties {

    id = Property[0]({
      type: () => String,
    });

    email = Property[4]({
      type: () => String,
    });

    givenName = Property[1]({
      type: () => String,
    });

    familyName = Property[2]({
      type: () => String,
    });

    displayName = Property[3]({
      type: () => String,
      default: () => `${this.givenName} ${this.familyName}`,
    });

    registeredAt = Property[5]({
      type: () => Date,
      default: () => new Date(),
    });

    status = Property[6]({
      type: () => UserStatus,
      default: () => UserStatus.ACTIVE,
    });

    followers = Property[7]({
      type: () => [User],
      default: () => [],
    });
  }


  class User extends Factory(UserProperties) {}

  test('Forgebale must be instanceof Properties', () => {
    expect(User.Properties).toBe(UserProperties);
    expect(User.prototype instanceof UserProperties).toBe(true);
  });

  test('getPropertyNames must return in order', () => {
    expect(
      User.getPropertyNames(),
    ).toStrictEqual([
      'id',
      'givenName',
      'familyName',
      'displayName',
      'email',
      'registeredAt',
      'status',
      'followers',
    ]);
  });

  test('getProperties must be callable', () => {
    const properties = User.getProperties();
    expect(properties[4].key).toBe('email');
  });

  test('forge with defaults', () => {
    const user = new User({
      id: '1',
      email: 'example@example',
      givenName: 'John',
      familyName: 'Doe',
    });
    expect(user.displayName).toBe('John Doe');
  });

  test('forge without defaults', () => {
    const registeredAt = new Date();
    const user = new User({
      id: '1',
      email: 'example@example',
      givenName: 'John',
      familyName: 'Doe',
      displayName: 'Doe, John',
      registeredAt,
      status: UserStatus.INACTIVE,
      followers: [
        new User({
          id: '2',
          email: 'another@another',
          givenName: 'Anna',
          familyName: 'Doe',
        }),
      ],
    });
    expect(user.displayName).toBe('Doe, John');
    expect(user.registeredAt).toBe(registeredAt);
    expect(user.status).toBe(UserStatus.INACTIVE);
  });

  test('from values', () => {
    const registeredAt = new Date();
    const user = User.fromValues([
      '1',
      'John',
      'Doe',
      'Doe, John',
      'example@example',
      registeredAt,
      UserStatus.INACTIVE,
      [],
    ]);
    expect(user.displayName).toBe('Doe, John');
    expect(user.registeredAt).toBe(registeredAt);
    expect(user.status).toBe(UserStatus.INACTIVE);
  });

  test('from plain object', () => {
    const registeredAt = new Date();
    const user = User.fromPlainObject({
      id: '1',
      email: 'example@example',
      givenName: 'John',
      familyName: 'Doe',
      displayName: 'Doe, John',
      registeredAt,
      status: UserStatus.INACTIVE,
      followers: [],
    });
    expect(user.displayName).toBe('Doe, John');
    expect(user.registeredAt).toBe(registeredAt);
    expect(user.status).toBe(UserStatus.INACTIVE);
  });


  test('from JSON', () => {
    const registeredAt = new Date();
    const user = new User({
      id: '1',
      email: 'example@example',
      givenName: 'John',
      familyName: 'Doe',
      displayName: 'Doe, John',
      registeredAt,
    });

    const parsedUser = User.fromJSONString(
      JSON.stringify(user),
    );
    expect(parsedUser.displayName).toBe('Doe, John');
    expect(parsedUser.registeredAt === registeredAt).toBe(false);
    expect(parsedUser.registeredAt).toStrictEqual(registeredAt);
    expect(parsedUser.status).toEqual(UserStatus.ACTIVE);
  });

  test('stringify', () => {
    const registeredAt = new Date('2020-01-21T02:48:39.918Z');
    const user = new User({
      id: '1',
      email: 'example@example',
      givenName: 'John',
      familyName: 'Doe',
      displayName: 'Doe, John',
      registeredAt,
    });

    const stringified = user.stringify();
    const parsedUser = User.parse(stringified);
    expect(
      Buffer.from(stringified, 'base64').toString(),
    ).toBe('["1","John","Doe","Doe, John","example@example","2020-01-21T02:48:39.918Z","ACTIVE",[]]');
    expect(parsedUser.displayName).toBe('Doe, John');
    expect(parsedUser.registeredAt === registeredAt).toBe(false);
    expect(parsedUser.registeredAt).toStrictEqual(registeredAt);
    expect(parsedUser.status).toBe(UserStatus.ACTIVE);
  });
});


describe('FactoryMixin', () => {
  let calledMixin = false;

  @Properties()
  class NodeProperties {

    id = Property[0]({
      type: () => String,
    });

  }

  class Node extends Factory(NodeProperties) {
    static myStaticProperty() {}

    constructor(forge: Forge<NodeProperties>) {
      super(forge);
      calledMixin = true;
    }

    myMemberProperty() {}
  }

  @Properties()
  class UserProperties extends NodeProperties {

    displayName = Property[1]({
      type: () => String,
    });

    registeredAt = Property[2]({
      type: () => Date,
      default: () => new Date('2020-01-21T02:48:39.918Z'),
    });

  }

  class User extends Factory(Node, UserProperties) {}

  test('Forgebale must be instanceof Properties', () => {
    expect(User.Properties).toBe(UserProperties);
    expect(User.prototype instanceof UserProperties).toBe(true);
    expect(User.myStaticProperty).toBe(Node.myStaticProperty);
    expect(User.prototype.myMemberProperty).toBe(Node.prototype.myMemberProperty);
  });

  test('Called mixin', () => {
    const user = new User({ id: '1', displayName: 'John' });
    expect(calledMixin).toBe(true);
    expect(user.myMemberProperty).toBe(Node.prototype.myMemberProperty);
    expect(user.toValues()).toStrictEqual(['1', 'John', new Date('2020-01-21T02:48:39.918Z')]);
  });
});