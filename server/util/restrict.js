import config from '../../config/server'

const restrictionChecks = {
  domain: (email, value) => email.endsWith('@' + value),
  email: (email, value) => email === value,
  regex: (email, value) => (new RegExp(value)).test(email),
  any: () => true
}

export const allowedDivisions = (email) => {
  if (!config.assignDivisions) {
    return Object.keys(config.divisions)
  }
  for (const acl of config.assignDivisions) {
    if (restrictionChecks[acl.match](email, acl.value)) {
      return acl.divisions
    }
  }
  return []
}

export const divisionAllowed = (email, division) => {
  return allowedDivisions(email).includes(division)
}
