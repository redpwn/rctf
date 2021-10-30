import { useState, ComponentProps, FunctionComponent } from 'react'
import { Box, Divider, Flex, Link, Text } from 'theme-ui'
import Card from './card'
import Button from './button'
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
        <Text
          sx={{
            flex: 3,
            fontWeight: 'bold',
          }}
        >
          {challenge.name}
        </Text>
        {/* FIXME: probably a different component for these 'links' */}
        <Link href='' sx={{ textDecoration: 'none' }}>
          {challenge.solves} {challenge.solves === 1 ? 'solve' : 'solves'}
          {' / '}
          {challenge.points} {challenge.points === 1 ? 'point' : 'points'}
        </Link>
      </Flex>
      <Text>{challenge.author}</Text>
      <Divider />
      <Box py={2} dangerouslySetInnerHTML={{ __html: challenge.description }} />
      {challenge.files.length > 0 ? (
        <>
          <Divider />
          <Box>
            Downloads:
            <Flex sx={{ columnGap: 2 }}>
              {challenge.files.map(file => (
                <Box key={file.name}>
                  <Link href={file.url}>{file.name}</Link>
                </Box>
              ))}
            </Flex>
          </Box>
        </>
      ) : (
        <></>
      )}
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
          <Button outline sx={{ alignSelf: 'flex-end' }} type='submit'>
            Submit
          </Button>
        </Flex>
      </Flex>
    </Card>
  )
}

export default ChallengeCard
