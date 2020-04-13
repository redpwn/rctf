const { Permissions } = require('./util')

const endpoints = [
  require('./chall-get'),
  require('./chall-put'),
  require('./challs')
]

endpoints.forEach(endpoint => {
  endpoint.path = '/admin/challs' + endpoint.path
  endpoint.requireAuth = true

  const oldHandler = endpoint.handler
  endpoint.handler = async ({ req, user }) => {
    if (endpoint.perms.includes(Permissions.WRITE)) {

    }

    if (endpoint.perms.includes(Permissions.READ)) {

    }

    return await oldHandler({ req, user })
  }
})
