import { useState, useCallback, FunctionComponent } from 'react'
import { Flex, Button, Spinner } from 'theme-ui'
import useAuth from '../util/auth'
import { useUsersMeAuthCtftimeDelete } from '../api/mutations'

const Home: FunctionComponent = () => {
  const { authToken, setAuthToken } = useAuth()
  const [count, setCount] = useState(0)
  const [pending, setPending] = useState(false)
  const [done, setDone] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const incCount = useCallback(() => {
    setCount(count => count + 1)
  }, [])

  const handleLogout = useCallback(() => {
    setAuthToken(null)
  }, [setAuthToken])

  const usersMeAuthCtftimeDelete = useUsersMeAuthCtftimeDelete()
  const handleRemoveCtftime = async () => {
    setErrorMessage(null)
    setPending(true)
    const deleteResponse = await usersMeAuthCtftimeDelete()
    setPending(false)
    if ('error' in deleteResponse) {
      setErrorMessage(deleteResponse.error.responseMessage)
      return
    }
    setDone(true)
  }

  return (
    <Flex sx={{
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}
    >
      <h3>Your token is</h3>
      <code>{authToken ?? 'none'}</code>
      {authToken !== null && (
        <>
          <Button onClick={handleLogout}>Log out</Button>
          <h3>Remove CTFtime</h3>
          {errorMessage !== null && (
            <h3 sx={{ color: 'accent' }}>{errorMessage}</h3>
          )}
          {done ? (
            <h3>done</h3>
          ) : (
            pending ? (
              <Spinner />
            ) : (
              <Button onClick={handleRemoveCtftime}>dewit</Button>
            )
          )}
        </>
      )}
      <h3 sx={{ color: 'primary' }}>graphic design is my passion</h3>
      <div>Count: {count}</div>
      <Button onClick={incCount}>Increment</Button>
    </Flex>
  )
}

export default Home
