import { MergeExclusive } from 'type-fest'

interface BaseResponseType {
  status: number
}

interface NormalResponseType extends BaseResponseType {
  message: string
}

interface RawResponseType extends BaseResponseType {
  rawContentType: string
}

export type ResponseType = MergeExclusive<NormalResponseType, RawResponseType>

export const responseList = {
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
  badCompetitionNotAllowed: {
    status: 403,
    message: 'You are not allowed to join this CTF.'
  },
  badDivisionNotAllowed: {
    status: 403,
    message: 'You are not allowed to join this division.'
  },
  badEmailChangeDivision: {
    status: 403,
    message: 'You are not allowed to stay in your division with this email.'
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
  badName: {
    status: 400,
    message: 'The name should only use english letters, numbers, and symbols.'
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
    message: 'The CTFtime team was successfully updated.'
  },
  goodCtftimeRemoved: {
    status: 200,
    message: 'The CTFtime team was removed from the user.'
  },
  goodEmailSet: {
    status: 200,
    message: 'The email was successfully updated.'
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
  goodFilesUpload: {
    status: 200,
    message: 'The files were successfully uploaded'
  },
  goodUploadsQuery: {
    status: 200,
    message: 'The status of uploads was successfully queried'
  },
  badFilesUpload: {
    status: 500,
    message: 'The upload of files failed'
  },
  badDataUri: {
    status: 400,
    message: 'A data URI provided was malformed'
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
  goodChallengeSolves: {
    status: 200,
    message: 'The challenges solves have been retreived.'
  },
  goodChallengeUpdate: {
    status: 200,
    message: 'Challenge successfully updated'
  },
  goodChallengeDelete: {
    status: 200,
    message: 'Challenge successfully deleted'
  },
  goodUserData: {
    status: 200,
    message: 'The user data was successfully retrieved.'
  },
  goodUserUpdate: {
    status: 200,
    message: 'Your account was successfully updated'
  },
  goodMemberCreate: {
    status: 200,
    message: 'Team member successfully created'
  },
  goodMemberDelete: {
    status: 200,
    message: 'Team member successfully deleted'
  },
  goodMemberData: {
    status: 200,
    message: 'The team member data was successfully retrieved'
  },
  badPerms: {
    status: 403,
    message: 'The user does not have required permissions.'
  },
  goodClientConfig: {
    status: 200,
    message: 'The client config was retrieved.'
  },
  badRecaptchaCode: {
    status: 401,
    message: 'The recaptcha code is invalid.'
  },
  errorInternal: {
    status: 500,
    message: 'An internal error occurred.'
  }
}

const responses = <{ [K in keyof typeof responseList]: K }>{}
Object.keys(responseList).forEach((kind) => {
  responses[kind as keyof typeof responseList] = kind as never
})

export { responses }
