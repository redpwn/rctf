import { FunctionComponent, useCallback } from 'react'
import { Link, Heading } from 'theme-ui'
import TextInput from './textinput'
import Button from './button'
import Card from './card'
import useInput from '../util/useInput'

export interface LoginCardProps {
  onTokenLogin: (token: string) => void,
  onCtftimeLogin: () => void
}

export const LoginCard: FunctionComponent<LoginCardProps> = ({
  onTokenLogin: _onTokenLogin,
  onCtftimeLogin,
  ...props
}) => {
  const [teamToken, handleTeamTokenChange] = useInput('')

  const onTokenLogin = useCallback(() => {
    _onTokenLogin(teamToken)
  }, [teamToken, _onTokenLogin])

  return (
    <Card {...props}>
      <Heading mx={4}>Log in to redpwnCTF 2020</Heading>
      <TextInput value={teamToken} onChange={handleTeamTokenChange} label='Team Code or Link'/>
      <p>
        <Link href='/recover'>Lost your team token?</Link>
      </p>
      <Button sx={{ width: '100%' }} onClick={onTokenLogin}>Log In</Button>
      <h3 sx={{ textAlign: 'center' }}>or</h3>
      <Button
        sx={{
          width: '100%',
          bg: '#e3000b'
        }}
        onClick={onCtftimeLogin}
      >
        Log In with CTFtime
      </Button>
    </Card>
  )
}

export default LoginCard
