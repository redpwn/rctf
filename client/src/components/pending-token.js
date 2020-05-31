import { Fragment } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import { setAuthToken } from '../api/auth'
import { pendingPrivateProfile } from '../api/profile'

const PendingToken = ({ authToken }) => {
  const [user, setUser] = useState(null)
  useEffect(() => {
    (async () => {
      if (!authToken) {
        return
      }
      const user = await pendingPrivateProfile({ authToken })
      setUser(user)
    })()
  }, [authToken])
  if (!user) {
    return null
  }
  return (
    <Fragment>
      <div class='row u-center'>
        <h3>Welcome to {user.name}</h3>
      </div>
      {user.score > 0 && (
        <div class='row u-center'>
          <h4>{user.score} total points</h4>
        </div>
      )}
      <div class='row u-center'>
        <button class='btn-info' onClick={() => setAuthToken({ authToken })}>Login</button>
      </div>
    </Fragment>
  )
}

export default PendingToken
