import { useState, ComponentProps, FunctionComponent } from 'react'
import { Box, Divider, Flex, Input } from 'theme-ui'
import Card from './card'
import TextInput from './text-input'

export interface ChallengeCardProps extends ComponentProps<typeof Card> {
  challenge: ChallengeData
  solved: boolean
  onFlagSubmit: (flag: string) => void
}

export interface ChallengeData {
  id: string
  name: string
  category: string[]
  author: string
  description: string
  files: ChallengeFile[]
  points: number
  solves: number
}

export interface ChallengeFile {
  name: string
  url: string
}

export const ChallengeCard: FunctionComponent<ChallengeCardProps> = ({
  challenge,
  solved,
  onFlagSubmit,
  ...props
}) => {
  const [flagValue, setFlagValue] = useState('')

  return (
    <Card
      sx={{
        display: 'grid',
        gridGap: 1,
      }}
      {...props}
    >
      <Flex sx={{ columnGap: 1 }}>
        <Box
          sx={{
            flex: 3,
          }}
        >
          {challenge.name}
        </Box>
        <Box>
          {challenge.solves} {challenge.solves === 1 ? 'solve' : 'solves'}
          {' / '}
          {challenge.points} {challenge.points === 1 ? 'point' : 'points'}
        </Box>
      </Flex>
      <Box>{challenge.author}</Box>
      <Divider />
      <Box py={2}>{challenge.description}</Box>
      <Flex
        as='form'
        sx={{ columnGap: 3 }}
        onSubmit={e => {
          e.preventDefault()
          onFlagSubmit(flagValue)
          setFlagValue('')
        }}
      >
        <Box
          sx={{
            flex: 1,
          }}
        >
          <TextInput
            label='Flag'
            value={flagValue}
            onChange={e => {
              setFlagValue(e.target.value)
            }}
          />
        </Box>
        <Flex>
          <Input sx={{ alignSelf: 'flex-end' }} type='submit' value='Submit' />
        </Flex>
      </Flex>
    </Card>
  )
}

export default ChallengeCard
