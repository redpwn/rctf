import calculate from '../../../src/leaderboard/calculate'
import { WorkerRequest, WorkerResponse } from '../../../src/leaderboard/types'
import realConfig from '../../../src/config/server'

const config = {
  ...realConfig,
  startTime: 10000,
  endTime: 20000,
  leaderboard: {
    maxLimit: 100,
    maxOffset: 4294967296,
    updateInterval: 100,
    graphMaxTeams: 10,
    graphSampleTime: 1000,
  },
  divisions: {
    div1: 'div1',
    div2: 'div2',
  },
}

beforeEach(() => {
  jest.useFakeTimers('modern')
  jest.setSystemTime(0)
})

describe('E2E snapshots', () => {
  test('empty database', () => {
    const request: WorkerRequest = {
      solves: [],
      users: [],
      graphUpdate: 0,
      challenges: [],
      config,
    }

    jest.setSystemTime(5000)

    const response: WorkerResponse = calculate(request)

    expect(response).toMatchSnapshot('Pre CTF')

    jest.setSystemTime(15000)

    expect(calculate(request)).toMatchSnapshot('Mid CTF')

    jest.setSystemTime(25000)

    expect(calculate(request)).toMatchSnapshot('Post CTF')
  })

  const doCalculate = (
    fullData: WorkerRequest,
    time: number,
    relative = false
  ): WorkerResponse => {
    const dTime = new Date(time)

    const request = {
      ...fullData,
      solves: fullData.solves.filter(s => s.createdat < dTime),
    }

    if (relative) {
      request.graphUpdate = Date.now()
    }

    jest.setSystemTime(time)

    return calculate(request)
  }

  const users: WorkerRequest['users'] = [
    {
      id: '225cd1ef-9ad3-4039-97eb-81a113189b9c',
      name: 'a',
      division: 'div1',
    },
    {
      id: '86583c14-a264-4bc1-8a0d-94f462e0f7d3',
      name: 'b',
      division: 'div2',
    },
  ]
  const challenges: WorkerRequest['challenges'] = [
    {
      id: '3195c55f-377a-4c78-924e-820e48d7674d',
      name: 'chall1',
      description: '',
      category: 'cat1',
      author: '',
      files: [],
      flag: 'flag1',
      tiebreakEligible: true,
      points: {
        min: 100,
        max: 500,
      },
    },
    {
      id: '134785d3-08e7-48c5-99c0-18b966172636',
      name: 'chall2',
      description: '',
      category: 'cat1',
      author: '',
      files: [],
      flag: 'flag2',
      tiebreakEligible: false,
      points: {
        min: 1,
        max: 1,
      },
    },
  ]

  test('coherent data', () => {
    const fullData: WorkerRequest = {
      users,
      challenges,
      solves: [
        {
          id: '2f436f67-f1b5-4802-8a55-c66081055942',
          challengeid: challenges[0].id,
          userid: users[0].id,
          createdat: new Date(14000),
        },
        {
          id: '13975f87-9401-4d98-90e7-492579e5d7dc',
          challengeid: challenges[0].id,
          userid: users[1].id,
          createdat: new Date(16000),
        },
      ],
      graphUpdate: 0,
      config,
    }

    expect(doCalculate(fullData, 5000)).toMatchSnapshot('Pre CTF')
    expect(doCalculate(fullData, 15000)).toMatchSnapshot('Mid CTF')
    expect(doCalculate(fullData, 25000, true)).toMatchSnapshot(
      'Post CTF relative'
    )
    expect(doCalculate(fullData, 25000, false)).toMatchSnapshot(
      'Post CTF backfill'
    )
  })

  test('missing challenge', () => {
    const fullData: WorkerRequest = {
      users,
      challenges,
      solves: [
        {
          id: '61e05487-7d88-4626-b6b5-62edbb3d1e3f',
          challengeid: '00000000-0000-1000-8000-000000000000',
          userid: users[0].id,
          createdat: new Date(14000),
        },
      ],
      graphUpdate: 0,
      config,
    }

    expect(doCalculate(fullData, 25000)).toMatchSnapshot('Post CTF')
  })

  test('ranking tiebreakEligible false no tiebreak', () => {
    const fullData: WorkerRequest = {
      users,
      challenges,
      solves: [
        {
          id: '2f436f67-f1b5-4802-8a55-c66081055942',
          challengeid: challenges[0].id,
          userid: users[0].id,
          createdat: new Date(14000),
        },
        {
          id: '13975f87-9401-4d98-90e7-492579e5d7dc',
          challengeid: challenges[0].id,
          userid: users[1].id,
          createdat: new Date(16000),
        },
        {
          id: '0ba0ffe3-2809-4a9f-be09-6295e9a11a38',
          challengeid: challenges[1].id,
          userid: users[1].id,
          createdat: new Date(18000),
        },
        {
          id: '003033f5-28e1-4013-a7e5-876e6decd0e7',
          challengeid: challenges[1].id,
          userid: users[0].id,
          createdat: new Date(20000),
        },
      ],
      graphUpdate: 0,
      config,
    }

    expect(doCalculate(fullData, 5000)).toMatchSnapshot('Pre CTF')
    expect(doCalculate(fullData, 15000)).toMatchSnapshot('Mid CTF no tie')
    expect(doCalculate(fullData, 17000)).toMatchSnapshot('Mid CTF tie')
    expect(doCalculate(fullData, 19000)).toMatchSnapshot('Mid CTF one tiebreak')
    expect(doCalculate(fullData, 25000, true)).toMatchSnapshot(
      'Post CTF relative'
    )
    expect(doCalculate(fullData, 25000, false)).toMatchSnapshot(
      'Post CTF backfill'
    )
  })

  test('ranking tiebreakEligible false with tiebreak', () => {
    const fullData: WorkerRequest = {
      users,
      challenges,
      solves: [
        {
          id: '2f436f67-f1b5-4802-8a55-c66081055942',
          challengeid: challenges[1].id,
          userid: users[0].id,
          createdat: new Date(14000),
        },
        {
          id: '13975f87-9401-4d98-90e7-492579e5d7dc',
          challengeid: challenges[1].id,
          userid: users[1].id,
          createdat: new Date(16000),
        },
        {
          id: '0ba0ffe3-2809-4a9f-be09-6295e9a11a38',
          challengeid: challenges[0].id,
          userid: users[1].id,
          createdat: new Date(18000),
        },
      ],
      graphUpdate: 0,
      config,
    }

    expect(doCalculate(fullData, 5000)).toMatchSnapshot('Pre CTF')
    expect(doCalculate(fullData, 15000)).toMatchSnapshot('Mid CTF no tie')
    expect(doCalculate(fullData, 17000)).toMatchSnapshot('Mid CTF tie')
    expect(doCalculate(fullData, 25000, true)).toMatchSnapshot(
      'Post CTF relative'
    )
    expect(doCalculate(fullData, 25000, false)).toMatchSnapshot(
      'Post CTF backfill'
    )
  })

  test('ranking tiebreakEligible false only team', () => {
    const fullData: WorkerRequest = {
      users,
      challenges: [
        challenges[0],
        {
          ...challenges[1],
          // force points to match other challenge to cause tiebreak
          // resolution to occur
          points: {
            min: 100,
            max: 500,
          },
        },
      ],
      solves: [
        {
          id: '13975f87-9401-4d98-90e7-492579e5d7dc',
          challengeid: challenges[1].id,
          userid: users[1].id,
          createdat: new Date(14000),
        },
        {
          id: '2f436f67-f1b5-4802-8a55-c66081055942',
          challengeid: challenges[0].id,
          userid: users[0].id,
          createdat: new Date(16000),
        },
      ],
      graphUpdate: 0,
      config,
    }

    expect(doCalculate(fullData, 5000)).toMatchSnapshot('Pre CTF')
    expect(doCalculate(fullData, 15000)).toMatchSnapshot('Mid CTF')
    expect(doCalculate(fullData, 25000, true)).toMatchSnapshot(
      'Post CTF relative'
    )
    expect(doCalculate(fullData, 25000, false)).toMatchSnapshot(
      'Post CTF backfill'
    )
  })
})
