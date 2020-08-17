import config from '../../src/config/server'
import { divisionAllowed, allowedDivisions, compileACLs } from '../../src/util/restrict'

let old

beforeAll(() => {
  old = { divisionACLs: config.divisionACLs, email: config.email }
  config.email = {}
})

afterAll(() => {
  config.divisionACLs = old.divisionACLs
  config.email = old.email
  compileACLs()
})

test('matches domains', () => {
  config.divisionACLs = [{
    match: 'domain',
    value: 'good-domain.com',
    divisions: ['allowed']
  }]
  compileACLs()
  expect(divisionAllowed('anything@good-domain.com', 'allowed')).toBe(true)
  expect(divisionAllowed('anything@bad-domain.com', 'allowed')).toBe(false)
})

test('matches emails', () => {
  config.divisionACLs = [{
    match: 'email',
    value: 'good-email@test.com',
    divisions: ['allowed']
  }]
  compileACLs()
  expect(divisionAllowed('good-email@test.com', 'allowed')).toBe(true)
  expect(divisionAllowed('bad-email@test.com', 'allowed')).toBe(false)
})

test('matches regex', () => {
  config.divisionACLs = [{
    match: 'regex',
    value: '^regex-email(-[a-z]+)?@test.com$',
    divisions: ['allowed']
  }]
  compileACLs()
  expect(divisionAllowed('regex-email@test.com', 'allowed')).toBe(true)
  expect(divisionAllowed('regex-email-abcd@test.com', 'allowed')).toBe(true)
  expect(divisionAllowed('regex-email@bad.com', 'allowed')).toBe(false)
  expect(divisionAllowed('regex-emailaaa@test.com', 'allowed')).toBe(false)
  expect(divisionAllowed('regex-email-1234@test.com', 'allowed')).toBe(false)
})

test('allows any', () => {
  config.divisionACLs = [{
    match: 'any',
    value: '',
    divisions: ['allowed']
  }]
  compileACLs()
  expect(divisionAllowed('anything@test.com', 'allowed')).toBe(true)
})

test('allows no divisions if no ACL matches', () => {
  config.divisionACLs = [{
    match: 'email',
    value: 'allowed@test.com',
    divisions: ['allowed']
  }]
  compileACLs()
  expect(allowedDivisions('not-allowed@test.com')).toEqual([])
})

test('throws error on invalid matcher', () => {
  config.divisionACLs = [{
    match: 'bad'
  }]
  expect(compileACLs).toThrowErrorMatchingSnapshot('"bad"')

  config.divisionACLs = [{
    match: '__proto__'
  }]
  expect(compileACLs).toThrowErrorMatchingSnapshot('"__proto__"')
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
  compileACLs()
  expect(divisionAllowed(undefined, 'domain')).toBe(false)
  expect(divisionAllowed(undefined, 'email')).toBe(false)
  expect(divisionAllowed(undefined, 'regex')).toBe(false)
  expect(divisionAllowed(undefined, 'any')).toBe(true)
})
