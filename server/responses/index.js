const responseList = {
  goodVerify: {
    status: 200,
    message: 'The email was verified.'
  },
  goodLogin: {
    status: 200,
    message: 'The login was successful.'
  },
  goodVerifySent: {
    status: 200,
    message: 'The account verification email was sent.'
  },
  badEmail: {
    status: 400,
    message: 'The email address is malformed.'
  },
  badUnknownUser: {
    status: 404,
    message: 'The user does not exist.'
  },
  badUnknownEmail: {
    status: 404,
    message: 'The account does not exist.'
  },
  badKnownEmail: {
    status: 409,
    message: 'An account with this email already exists.'
  },
  goodLeaderboard: {
    status: 200,
    message: 'The retrieval of the leaderbard was successful.'
  },
  goodFlag: {
    status: 200,
    message: 'The flag was submitted successfully'
  },
  badFlag: {
    status: 200,
    message: 'The flag was incorrect'
  },
  badChallenge: {
    status: 404,
    message: 'The challenge was not found'
  },
  alreadySolved: {
    status: 200,
    message: 'The flag was already submitted'
  },
  badBody: {
    status: 400,
    message: 'The request body does not meet requirements.'
  },
  badToken: {
    status: 401,
    message: 'The token provided is invalid.'
  },
  badJson: {
    status: 400,
    message: 'The request JSON body is malformed.'
  },
  errorInternal: {
    status: 500,
    message: 'An internal error occurred.'
  }
}

const responses = {}
Object.keys(responseList).forEach((kind) => {
  responses[kind] = kind
})

module.exports = {
  responseList,
  responses
}
