import config, { ServerConfig } from '../config/server'

type ACLCheck = (email: string | undefined) => boolean

export interface ACL {
  match: string;
  value: string;
  divisions: (keyof ServerConfig['divisions'])[];
}

interface CompiledACL {
  check: ACLCheck;
  divisions: (keyof ServerConfig['divisions'])[];
}

let acls: CompiledACL[]

const restrictionChecks: { [checkType: string]: (value: string) => ACLCheck } = {
  domain: value => email => email?.endsWith('@' + value) ?? false,
  email: value => email => email === value,
  regex: value => {
    const re = new RegExp(value)
    return email => email === undefined ? false : re.test(email)
  },
  any: value => email => true // eslint-disable-line @typescript-eslint/no-unused-vars
}

export const compileACLs = (): void => {
  let divisionACLs = config.divisionACLs
  // allow everything if no ACLs or if no email verify
  if (!divisionACLs || divisionACLs.length === 0 || !config.email) {
    divisionACLs = [{
      match: 'any',
      value: '',
      divisions: Object.keys(config.divisions)
    }]
  }
  acls = divisionACLs.map(({ match, value, divisions }) => {
    if (!Object.prototype.hasOwnProperty.call(restrictionChecks, match)) {
      throw new Error(`Unrecognized ACL matcher "${match}"`)
    }
    return { check: restrictionChecks[match](value), divisions }
  })
}

compileACLs()

export const allowedDivisions = (email: string | undefined): string[] => {
  for (const acl of acls) {
    if (acl.check(email)) {
      return acl.divisions
    }
  }
  return []
}

export const divisionAllowed = (email: string | undefined, division: string): boolean => {
  return allowedDivisions(email).includes(division)
}
