import config from '../../config/server'

let acls

const compile = () => {
  acls = []
  // allow everything if no ACLs or if no email verify
  if (!config.divisionACLs || !config.verifyEmail) {
    acls.push({
      check: () => true,
      divisions: Object.keys(config.divisions)
    })
  } else {
    for (const acl of config.divisionACLs) {
      let check
      switch (acl.match) {
        case 'domain':
          check = (email) => email.endsWith('@' + acl.value)
          break
        case 'email':
          check = (email) => email === acl.value
          break
        case 'regex': {
          const regex = new RegExp(acl.value)
          check = (email) => regex.test(email)
          break
        }
        case 'any':
          check = () => true
          break
        default:
          continue
      }
      acls.push({ check, divisions: acl.divisions })
    }
  }
}

compile()

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
