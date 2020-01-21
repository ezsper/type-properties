/// <reference types="jest" />
import { Property, computeProperties } from './Property';

test('Property nullable returns null', () => {
  expect(
    Property[0]({
      type: () => String,
      nullable: false,
    }),
  ).toBe(null);
});

test('Property optional returns callable default value', () => {
  expect(
    (Property[0]({
      type: () => String,
      default: () => 'DefaultValue',
    }) as any as () => string)(),
  ).toBe('DefaultValue');
});

test('Property required returns null', () => {
  expect(
    Property[0]({
      type: () => String,
    }),
  ).toBe(null);
});

test('Property required returns null', () => {
  const createProperties = () => {
    return {
      id: Property[0]({
        type: () => String,
      }),
    };
  };

  const properties = computeProperties(createProperties);

  expect(properties.length).toBe(1);
});