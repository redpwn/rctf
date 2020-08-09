import { ACL } from '../util/restrict'

export type ProviderConfig = {
  name: string;
  options: unknown;
}

export type Sponsor = {
  name: string;
  icon: string;
  description: string;
  small?: boolean;
}

export type ServerConfig = {
  database: {
    sql: string | {
      host: string;
      port: number;
      user: string;
      password: string;
      database: string;
    }
    redis: string | {
      host: string;
      port: number;
      password: string;
      database: number;
    }
    migrate: string;
  }
  instanceType: string;
  tokenKey: string;
  origin: string;

  // TODO: enforce `trust` is false when `cloudflare` is true
  proxy: {
    cloudflare: boolean
    trust: boolean | string | string[] | number
  }

  ctftime?: {
    clientId: string;
    clientSecret: string;
  }

  userMembers: boolean;
  sponsors: Sponsor[];
  homeContent: string;
  ctfName: string;
  meta: {
    description: string;
    imageUrl: string;
  }
  logoUrl?: string;
  globalSiteTag?: string;

  challengeProvider: ProviderConfig;
  uploadProvider: ProviderConfig;

  email?: {
    provider: ProviderConfig;
    from: string;
  }

  divisions: Record<string, string>;
  defaultDivision?: string;
  divisionACLs?: ACL[];

  startTime: number;
  endTime: number;

  leaderboard: {
    maxLimit: number;
    maxOffset: number;
    updateInterval: number;
    graphMaxTeams: number;
    graphSampleTime: number;
  }
  loginTimeout: number;
}

export type ClientConfig = Pick<ServerConfig,
  'meta' |
  'homeContent' |
  'sponsors' |
  'globalSiteTag' |
  'ctfName' |
  'divisions' |
  'defaultDivision' |
  'origin' |
  'startTime' |
  'endTime' |
  'userMembers'
> & {
  emailEnabled: boolean;
  ctftime?: Pick<NonNullable<ServerConfig['ctftime']>, 'clientId'>
}
