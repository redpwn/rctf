import { ClientConfig } from './types'
import server from './server'

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
  ctftime: server.ctftime == null ? undefined : {
    clientId: server.ctftime.clientId
  }
}

export default config
