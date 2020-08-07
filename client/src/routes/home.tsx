import { useContext, useState, useCallback, FunctionComponent } from 'react'
import { Flex, Button } from 'theme-ui'
import AuthContext from '../util/auth'

const Home: FunctionComponent = () => {
  const { authToken } = useContext(AuthContext)

  const [count, setCount] = useState(0)

  const incCount = useCallback(() => {
    setCount(count => count + 1)
  }, [])

  return (
    <Flex sx={{
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column'
    }}>
      <h3>Your token is</h3>
      <code>{authToken}</code>
      <h3 sx={{ color: 'primary' }}>graphic design is my passion</h3>
      <div>Count: { count }</div>
      <Button onClick={incCount}>Increment</Button>
    </Flex>
  )
}

export default Home
