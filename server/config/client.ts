import server, { ServerConfig } from './server'

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
  ctftime: {
    clientId: ServerConfig['ctftime']['clientId']
  }
}

const config: ClientConfig = {
  meta: server.meta,
  homeContent: server.homeContent,
  sponsors: server.sponsors,
  globalSiteTag: server.globalSiteTag,
  ctfName: server.ctfName,
  divisions: server.divisions,
  defaultDivision: server.defaultDivision,
  origin: server.origin,
  startTime: server.startTime,
  endTime: server.endTime,
  emailEnabled: server.email != null,
  userMembers: server.userMembers,
  ctftime: server.ctftime == null ? null : {
    clientId: server.ctftime.clientId
  }
}

export default config
