/// <reference types="jest" />
import { Properties, getProperties } from './Properties';
import { Property } from './Property';

test('Empty properties class returns empty definitions', () => {
  @Properties()
  class SampleProperties {

  }

  const properties = getProperties(SampleProperties);
  expect(properties).toStrictEqual({ keyMap: {}, length: 0 });
});


test('Empty properties class returns empty definitions', () => {
  @Properties()
  class SampleProperties {
    id = Property[0]({
      type: () => String,
    });
  }

  const properties = getProperties(SampleProperties);
  expect(properties.length).toEqual(1);
  expect(properties[0].default).toEqual(false);
  expect(properties[0].nullable).toEqual(false);
  expect(properties[0].type()).toEqual(String);
});
