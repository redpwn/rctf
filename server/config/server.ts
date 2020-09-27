import path from 'path'
import fs from 'fs'
import yaml from 'yaml'
import deepMerge from 'deepmerge'
import { PartialDeep } from 'type-fest'
import { nullsafeParseInt, nullsafeParseBoolEnv, removeUndefined } from './util'
import { ACL } from '../util/restrict'
import { RecaptchaProtectedActions } from '../util/recaptcha'

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
  faviconUrl?: string;
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

  recaptcha?: {
    siteKey: string;
    secretKey: string;
    protectedActions: RecaptchaProtectedActions[];
  }

  leaderboard: {
    maxLimit: number;
    maxOffset: number;
    updateInterval: number;
    graphMaxTeams: number;
    graphSampleTime: number;
  }
  loginTimeout: number;
}

const jsonLoader = (file: string) => JSON.parse(file) as PartialDeep<ServerConfig>
const yamlLoader = (file: string) => yaml.parse(file) as PartialDeep<ServerConfig>

const fileConfigLoaders: Map<string, (file: string) => PartialDeep<ServerConfig>> = new Map([
  ['json', jsonLoader],
  ['yaml', yamlLoader],
  ['yml', yamlLoader]
])

const configPath = process.env.RCTF_CONF_PATH ?? path.join(__dirname, '../../../conf.d')
const fileConfigs: PartialDeep<ServerConfig>[] = []
fs.readdirSync(configPath).sort().forEach((name) => {
  const matched = /\.(.+)$/.exec(name)
  if (matched === null) {
    return
  }
  const loader = fileConfigLoaders.get(matched[1])
  if (loader === undefined) {
    return
  }
  const config = loader(fs.readFileSync(path.join(configPath, name)).toString())
  fileConfigs.push(config)
})

const envConfig: PartialDeep<ServerConfig> = {
  database: {
    sql: process.env.RCTF_DATABASE_URL ?? {
      host: process.env.RCTF_DATABASE_HOST,
      port: nullsafeParseInt(process.env.RCTF_DATABASE_PORT),
      user: process.env.RCTF_DATABASE_USERNAME,
      password: process.env.RCTF_DATABASE_PASSWORD,
      database: process.env.RCTF_DATABASE_DATABASE
    },
    redis: process.env.RCTF_REDIS_URL ?? {
      host: process.env.RCTF_REDIS_HOST,
      port: nullsafeParseInt(process.env.RCTF_REDIS_PORT),
      password: process.env.RCTF_REDIS_PASSWORD,
      database: nullsafeParseInt(process.env.RCTF_REDIS_DATABASE)
    },
    migrate: process.env.RCTF_DATABASE_MIGRATE
  },
  instanceType: process.env.RCTF_INSTANCE_TYPE,
  tokenKey: process.env.RCTF_TOKEN_KEY,
  origin: process.env.RCTF_ORIGIN,
  ctftime: {
    clientId: process.env.RCTF_CTFTIME_CLIENT_ID,
    clientSecret: process.env.RCTF_CTFTIME_CLIENT_SECRET
  },
  userMembers: nullsafeParseBoolEnv(process.env.RCTF_USER_MEMBERS),
  homeContent: process.env.RCTF_HOME_CONTENT,
  ctfName: process.env.RCTF_NAME,
  meta: {
    description: process.env.RCTF_META_DESCRIPTION,
    imageUrl: process.env.RCTF_IMAGE_URL
  },
  faviconUrl: process.env.RCTF_FAVICON_URL,
  logoUrl: process.env.RCTF_LOGO_URL,
  globalSiteTag: process.env.RCTF_GLOBAL_SITE_TAG,
  email: {
    from: process.env.RCTF_EMAIL_FROM
  },
  startTime: nullsafeParseInt(process.env.RCTF_START_TIME),
  endTime: nullsafeParseInt(process.env.RCTF_END_TIME),
  recaptcha: {
    siteKey: process.env.RCTF_RECAPTCHA_SITE_KEY,
    secretKey: process.env.RCTF_RECAPTCHA_SECRET_KEY
  },
  leaderboard: {
    maxLimit: nullsafeParseInt(process.env.RCTF_LEADERBOARD_MAX_LIMIT),
    maxOffset: nullsafeParseInt(process.env.RCTF_LEADERBOARD_MAX_OFFSET),
    updateInterval: nullsafeParseInt(process.env.RCTF_LEADERBOARD_UPDATE_INTERVAL),
    graphMaxTeams: nullsafeParseInt(process.env.RCTF_LEADERBOARD_GRAPH_MAX_TEAMS),
    graphSampleTime: nullsafeParseInt(process.env.RCTF_LEADERBOARD_GRAPH_SAMPLE_TIME)
  },
  loginTimeout: nullsafeParseInt(process.env.RCTF_LOGIN_TIMEOUT)
}

const defaultConfig: PartialDeep<ServerConfig> = {
  database: {
    migrate: 'never'
  },
  instanceType: 'all',
  userMembers: true,
  sponsors: [],
  homeContent: '',
  faviconUrl: 'https://redpwn.storage.googleapis.com/branding/rctf-favicon.ico',
  challengeProvider: {
    name: 'challenges/database'
  },
  uploadProvider: {
    name: 'uploads/local'
  },
  proxy: {
    cloudflare: false,
    trust: false
  },
  meta: {
    description: '',
    imageUrl: ''
  },
  leaderboard: {
    maxLimit: 100,
    maxOffset: 4294967296,
    updateInterval: 10000,
    graphMaxTeams: 10,
    graphSampleTime: 1800000
  },
  loginTimeout: 3600000
}

const config = deepMerge.all([defaultConfig, ...fileConfigs, removeUndefined(envConfig)]) as ServerConfig

export default config
