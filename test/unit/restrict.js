const test = require('ava')

const { default: config } = require('../../dist/server/config/server')
const restrict = require('../../dist/server/util/restrict')

let old

test.serial.before('save old ACLs', t => {
  old = { divisionACLs: config.divisionACLs, email: config.email }
  config.email = {}
})

test.serial.after('restore old ACLs', t => {
  config.divisionACLs = old.divisionACLs
  config.email = old.email
  restrict.compileACLs()
})

test.serial('matches domains', t => {
  config.divisionACLs = [{
    match: 'domain',
    value: 'good-domain.com',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  t.true(restrict.divisionAllowed('anything@good-domain.com', 'allowed'))
  t.false(restrict.divisionAllowed('anything@bad-domain.com', 'allowed'))
})

test.serial('matches emails', t => {
  config.divisionACLs = [{
    match: 'email',
    value: 'good-email@test.com',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  t.true(restrict.divisionAllowed('good-email@test.com', 'allowed'))
  t.false(restrict.divisionAllowed('bad-email@test.com', 'allowed'))
})

test.serial('matches regex', t => {
  config.divisionACLs = [{
    match: 'regex',
    value: '^regex-email(-[a-z]+)?@test.com$',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  t.true(restrict.divisionAllowed('regex-email@test.com', 'allowed'))
  t.true(restrict.divisionAllowed('regex-email-abcd@test.com', 'allowed'))
  t.false(restrict.divisionAllowed('regex-email@bad.com', 'allowed'))
  t.false(restrict.divisionAllowed('regex-emailaaa@test.com', 'allowed'))
  t.false(restrict.divisionAllowed('regex-email-1234@test.com', 'allowed'))
})

test.serial('allows any', t => {
  config.divisionACLs = [{
    match: 'any',
    value: '',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  t.true(restrict.divisionAllowed('anything@test.com', 'allowed'))
})

test.serial('allows no divisions if no ACL matches', t => {
  config.divisionACLs = [{
    match: 'email',
    value: 'allowed@test.com',
    divisions: ['allowed']
  }]
  restrict.compileACLs()
  t.deepEqual(restrict.allowedDivisions('not-allowed@test.com'), [])
})

test.serial('throws error on invalid matcher', t => {
  config.divisionACLs = [{
    match: 'bad'
  }]
  let error = t.throws(restrict.compileACLs)
  t.is(error.message, 'Unrecognized ACL matcher "bad"')

  config.divisionACLs = [{
    match: '__proto__'
  }]
  error = t.throws(restrict.compileACLs)
  t.is(error.message, 'Unrecognized ACL matcher "__proto__"')
})

test.serial('denies no email with all matchers except any', t => {
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
  t.false(restrict.divisionAllowed(undefined, 'domain'))
  t.false(restrict.divisionAllowed(undefined, 'email'))
  t.false(restrict.divisionAllowed(undefined, 'regex'))
  t.true(restrict.divisionAllowed(undefined, 'any'))
})
