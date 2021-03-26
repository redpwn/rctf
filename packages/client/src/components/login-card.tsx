import {
  FunctionComponent,
  useCallback,
  FormEventHandler,
  ComponentProps,
} from 'react'
import { Link, Heading, Box, Grid } from 'theme-ui'
import TextInput from './text-input'
import Button from './button'
import Card from './card'
import useInput from '../util/use-input'

export interface LoginCardProps extends ComponentProps<typeof Card> {
  ctfName: string
  onTokenLogin: (token: string) => void
  onCtftimeLogin: () => void
}

export const LoginCard: FunctionComponent<LoginCardProps> = ({
  ctfName,
  onTokenLogin: _onTokenLogin,
  onCtftimeLogin,
  ...props
}) => {
  const [teamToken, handleTeamTokenChange] = useInput('')

  const onTokenLogin = useCallback<FormEventHandler<HTMLFormElement>>(
    e => {
      _onTokenLogin(teamToken)
      e.preventDefault()
    },
    [teamToken, _onTokenLogin]
  )

  return (
    <Card
      sx={{
        display: 'grid',
        gridGap: 3,
      }}
      {...props}
    >
      <Heading mx={4}>Log in to {ctfName}</Heading>
      <Grid gap={3}>
        <form
          sx={{
            display: 'grid',
            gridGap: 3,
          }}
          onSubmit={onTokenLogin}
        >
          <Box>
            <TextInput
              value={teamToken}
              onChange={handleTeamTokenChange}
              label='Team Code or Link'
            />
            <Box mt={1}>
              <Link href='/recover'>Lost your team token?</Link>
            </Box>
          </Box>
          <Button sx={{ width: '100%' }} type='submit' disabled={!teamToken}>
            Log In
          </Button>
        </form>
        <Box
          sx={{
            fontFamily: 'heading',
            fontWeight: 'heading',
            textAlign: 'center',
          }}
        >
          or
        </Box>
        <Button
          sx={{
            width: '100%',
            bg: '#e3000b',
          }}
          type='button'
          onClick={onCtftimeLogin}
        >
          Log In with CTFtime
        </Button>
      </Grid>
    </Card>
  )
}

export default LoginCard
