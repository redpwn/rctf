const responseList = {
  goodVerify: {
    status: 200,
    message: 'The email was verified.'
  },
  goodRegister: {
    status: 200,
    message: 'The user was created.'
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
  badKnownName: {
    status: 409,
    message: 'An account with this name already exists.'
  },
  badKnownCtftimeId: {
    status: 409,
    message: 'An account with this CTFtime ID already exists.'
  },
  goodLeaderboard: {
    status: 200,
    message: 'The leaderboard was retrieved.'
  },
  goodCtftimeLeaderboard: {
    status: 200,
    rawContentType: 'application/json'
  },
  goodCtftimeToken: {
    status: 200,
    message: 'The CTFtime token was created.'
  },
  goodCtftimeAuthSet: {
    status: 200,
    message: 'The CTFtime team was set on the user.'
  },
  goodCtftimeRemoved: {
    status: 200,
    message: 'The CTFtime team was removed from the user.'
  },
  goodEmailSet: {
    status: 200,
    message: 'The email was set on the user.'
  },
  goodEmailRemoved: {
    status: 200,
    message: 'The email address was removed from the user.'
  },
  badCtftimeNoExists: {
    status: 404,
    message: 'There is no CTFtime team associated with the user.'
  },
  badZeroAuth: {
    status: 409,
    message: 'At least one authentication method is required.'
  },
  badEmailNoExists: {
    status: 404,
    message: 'There is no email address associated with the user.'
  },
  badCtftimeCode: {
    status: 401,
    message: 'The CTFtime code is invalid.'
  },
  goodFlag: {
    status: 200,
    message: 'The flag is correct.'
  },
  badFlag: {
    status: 400,
    message: 'The flag was incorrect.'
  },
  badChallenge: {
    status: 404,
    message: 'The challenge could not be not found.'
  },
  badAlreadySolvedChallenge: {
    status: 409,
    message: 'The flag was already submitted'
  },
  goodToken: {
    status: 200,
    message: 'The authorization token is valid'
  },
  badBody: {
    status: 400,
    message: 'The request body does not meet requirements.'
  },
  badToken: {
    status: 401,
    message: 'The token provided is invalid.'
  },
  badTokenVerification: {
    status: 401,
    message: 'The token provided is invalid.'
  },
  badCtftimeToken: {
    status: 401,
    message: 'The CTFtime token provided is invalid.'
  },
  badJson: {
    status: 400,
    message: 'The request JSON body is malformed.'
  },
  badEndpoint: {
    status: 404,
    message: 'The request endpoint could not be found.'
  },
  badNotStarted: {
    status: 401,
    message: 'The CTF has not started yet.'
  },
  badEnded: {
    status: 401,
    message: 'The CTF has ended.'
  },
  badRateLimit: {
    status: 429,
    message: 'You are trying this too fast'
  },
  goodChallenges: {
    status: 200,
    message: 'The retrieval of challenges was successful.'
  },
  goodUserData: {
    status: 200,
    message: 'The user data was successfully retrieved.'
  },
  goodUserDelete: {
    status: 200,
    message: 'Your account was successfully deleted'
  },
  goodUserUpdate: {
    status: 200,
    message: 'Your account was successfully updated'
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
