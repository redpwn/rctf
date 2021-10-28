import { Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'

import ChallengeCard, { ChallengeCardProps } from './challenge-card'

export default {
  title: 'Challenge Card',
  component: ChallengeCard,
}

export const Default: Story<ChallengeCardProps> = props => (
  <ChallengeCard
    sx={{
      width: '30rem',
    }}
    {...props}
  />
)

Default.args = {
  challenge: {
    id: '1',
    name: 'Problem 1',
    category: ['category 1'],
    author: 'author 1',
    description: 'description 1',
    files: [],
    points: 1,
    solves: 1,
  },
  solved: false,
  onFlagSubmit: action('onFlagSubmit'),
}

export const WithDownloads: Story<ChallengeCardProps> = props => (
  <ChallengeCard
    sx={{
      width: '30rem',
    }}
    {...props}
  />
)

WithDownloads.args = {
  challenge: {
    id: '1',
    name: 'Problem 1',
    category: ['category 1'],
    author: 'author 1',
    description: 'description 1',
    files: [
      {
        name: 'file 1',
        url: 'https://placeholder.com',
      },
      {
        name: 'file 2',
        url: 'https://placeholder.com',
      },
    ],
    points: 1,
    solves: 1,
  },
  solved: false,
  onFlagSubmit: action('onFlagSubmit'),
}

export const WithHTML: Story<ChallengeCardProps> = props => (
  <ChallengeCard
    sx={{
      width: '30rem',
    }}
    {...props}
  />
)

WithHTML.args = {
  challenge: {
    id: '1',
    name: 'Problem 1',
    category: ['category 1'],
    author: 'author 1',
    description: '<b>wow html</b>',
    files: [
      {
        name: 'file 1',
        url: 'https://placeholder.com',
      },
      {
        name: 'file 2',
        url: 'https://placeholder.com',
      },
    ],
    points: 1,
    solves: 1,
  },
  solved: false,
  onFlagSubmit: action('onFlagSubmit'),
}
