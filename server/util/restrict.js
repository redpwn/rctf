import config from '../../config/server'

let acls

const restrictionChecks = {
  domain: value => email => email.endsWith('@' + value),
  email: value => email => email === value,
  regex: value => {
    const re = new RegExp(value)
    return email => re.test(email)
  },
  any: value => email => true
}

export const compileACLs = () => {
  let divisionACLs = config.divisionACLs
  // allow everything if no ACLs or if no email verify
  if (!divisionACLs || divisionACLs.length === 0 || !config.verifyEmail) {
    divisionACLs = [{
      match: 'any',
      divisions: Object.keys(config.divisions)
    }]
  }
  acls = divisionACLs.map(({ match, value, divisions }) => {
    const makeCheck = restrictionChecks[match]
    if (makeCheck === undefined) {
      throw new Error(`Unrecognized ACL matcher "${match}"`)
    }
    return { check: makeCheck(value), divisions }
  })
}

compileACLs()

export const allowedDivisions = (email) => {
  for (const acl of acls) {
    if (acl.check(email)) {
      return acl.divisions
    }
  }
  return []
}

export const divisionAllowed = (email, division) => {
  return allowedDivisions(email).includes(division)
}
