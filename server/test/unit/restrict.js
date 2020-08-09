const { default: config } = require('../../src/config/server')
const restrict = require('../../src/util/restrict')

let old

beforeAll(() => {
  old = { divisionACLs: config.divisionACLs, email: config.email }
  config.email = {}
})

afterAll(() => {
  config.divisionACLs = old.divisionACLs
  config.email = old.email
  restrict.compileACLs()
})

test('matches domains', () => {
  config.divisionACLs = [{
    match: 'domain',
    value: 'good-domain.com',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  expect(restrict.divisionAllowed('anything@good-domain.com', 'allowed')).toBe(true)
  expect(restrict.divisionAllowed('anything@bad-domain.com', 'allowed')).toBe(false)
})

test('matches emails', () => {
  config.divisionACLs = [{
    match: 'email',
    value: 'good-email@test.com',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  expect(restrict.divisionAllowed('good-email@test.com', 'allowed')).toBe(true)
  expect(restrict.divisionAllowed('bad-email@test.com', 'allowed')).toBe(false)
})

test('matches regex', () => {
  config.divisionACLs = [{
    match: 'regex',
    value: '^regex-email(-[a-z]+)?@test.com$',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  expect(restrict.divisionAllowed('regex-email@test.com', 'allowed')).toBe(true)
  expect(restrict.divisionAllowed('regex-email-abcd@test.com', 'allowed')).toBe(true)
  expect(restrict.divisionAllowed('regex-email@bad.com', 'allowed')).toBe(false)
  expect(restrict.divisionAllowed('regex-emailaaa@test.com', 'allowed')).toBe(false)
  expect(restrict.divisionAllowed('regex-email-1234@test.com', 'allowed')).toBe(false)
})

test('allows any', () => {
  config.divisionACLs = [{
    match: 'any',
    value: '',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  expect(restrict.divisionAllowed('anything@test.com', 'allowed')).toBe(true)
})

test('allows no divisions if no ACL matches', () => {
  config.divisionACLs = [{
    match: 'email',
    value: 'allowed@test.com',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  expect(restrict.allowedDivisions('not-allowed@test.com')).toEqual([])
})

test('throws error on invalid matcher', () => {
  config.divisionACLs = [{
    match: 'bad'
  }]
  expect(restrict.compileACLs).toThrowErrorMatchingSnapshot('"bad"')

  config.divisionACLs = [{
    match: '__proto__'
  }]
  expect(restrict.compileACLs).toThrowErrorMatchingSnapshot('"__proto__"')
})

test('denies no email with all matchers except any', () => {
  config.divisionACLs = [{
    match: 'domain',
    value: 'good-domain.com',
    divisions: ['domain']
  }, {
    match: 'email',
    value: 'allowed@test.com',
    divisions: ['email']
  }, {
    match: 'regex',
    value: '^regex-email(-[a-z]+)?@test.com$',
    divisions: ['regex']
  }, {
    match: 'any',
    value: '',
    divisions: ['any']
  }]
  restrict.compileACLs()
  expect(restrict.divisionAllowed(undefined, 'domain')).toBe(false)
  expect(restrict.divisionAllowed(undefined, 'email')).toBe(false)
  expect(restrict.divisionAllowed(undefined, 'regex')).toBe(false)
  expect(restrict.divisionAllowed(undefined, 'any')).toBe(true)
})
