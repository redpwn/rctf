const test = require('ava')

const config = require('../../dist/config/server')
const restrict = require('../../dist/server/util/restrict')

let old

test.serial.before('save old ACLs', t => {
  old = { divisionACLs: config.divisionACLs, verifyEmail: config.verifyEmail }
  config.verifyEmail = true
})

test.serial.after('restore old ACLs', t => {
  config.divisionACLs = old.divisionACLs
  config.verifyEmail = old.verifyEmail
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
