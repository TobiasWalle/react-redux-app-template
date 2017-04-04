'use strict';
var path = require('path');
var assert = require('yeoman-assert');
var helpers = require('yeoman-test');

describe('generator-trb:duck', () => {
  beforeAll(() => {
    return helpers.run(path.join(__dirname, '../generators/duck'))
      .withArguments(['hello-world', 'a b c'])
      .withOptions({moduleName: 'test'});
  });

  it('creates files', () => {
    assert.file([
      'hello-world.duck.ts'
    ]);
  });
});
