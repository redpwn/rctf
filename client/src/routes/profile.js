import { useState, useCallback, useEffect } from 'preact/hooks'
import { memo } from 'preact/compat'
import config from '../config'
import withStyles from '../components/jss'

import { privateProfile, publicProfile, updateAccount, updateEmail, deleteEmail } from '../api/profile'
import { useToast } from '../components/toast'
import Form from '../components/form'
import MembersCard from '../components/profile/memberscard'
import TokenPreview from '../components/token-preview'
import * as util from '../util'
import Trophy from '../icons/trophy.svg'
import AddressBook from '../icons/address-book.svg'
import UserCircle from '../icons/user-circle.svg'
import EnvelopeOpen from '../icons/envelope-open.svg'
import Rank from '../icons/rank.svg'
import Ctftime from '../icons/ctftime.svg'

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

const SummaryCard = memo(withStyles({
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      height: '1.25em',
      fill: '#333'
    },
    marginRight: '1.5em'
  },
  header: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    margin: '0 !important'
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    paddingBottom: '5px'
  }
}, ({ name, score, division, divisionPlace, globalPlace, ctftimeId, classes }) =>
  <div class='card u-flex u-flex-column'>
    <div class='content'>
      <div class={classes.wrapper}>
        <h5 class={`title ${classes.header}`} title={name}>{name}</h5>
        {
          ctftimeId &&
              <a href={`https://ctftime.org/team/${ctftimeId}`} target='_blank' rel='noopener noreferrer'>
                <Ctftime style='height: 20px;' />
              </a>
        }
      </div>
      <div class='action-bar'>
        <p>
          <span class={`icon ${classes.icon}`}>
            <Trophy />
          </span>
          {
            score === 0
              ? ('No points earned')
              : (`${score} total points`)
          }
        </p>
        <p>
          <span class={`icon ${classes.icon}`}>
            <Rank />
          </span>
          {
            score === 0 ? 'Unranked' : `${divisionPlace} in the ${division} division`
          }
        </p>
        <p>
          <span class={`icon ${classes.icon}`}>
            <Rank />
          </span>
          {
            score === 0 ? 'Unranked' : `${globalPlace} across all teams`
          }
        </p>
        <p>
          <span class={`icon ${classes.icon}`}>
            <AddressBook />
          </span>
          {division} division
        </p>
      </div>
    </div>
  </div>
))

const SolvesCard = memo(({ solves }) => {
  if (solves === undefined || solves.length === 0) return null
  return (
    <div class='card u-flex u-flex-column'>
      <div class='content'>
        <h5 class='title u-text-center'>Solves</h5>
        <table class='table borderless'>
          <thead>
            <tr>
              <th>Category</th>
              <th>Name</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            { solves.map(solve =>
              <tr key={solve.name}>
                <td>{solve.category}</td>
                <td>{solve.name}</td>
                <td>{solve.points}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
})

const TeamCodeCard = memo(({ teamToken }) => {
  return (
    <div class='card u-flex u-flex-column'>
      <div class='content'>
        <p>Team Invite</p>
        <p class='font-thin'>Send this team invite URL to your teammates so they can login.</p>
        <TokenPreview token={`${location.origin}/login?token=${encodeURIComponent(teamToken)}`} />
      </div>
    </div>
  )
})

const UpdateCard = withStyles({
  form: {
    '& button': {
      margin: 0,
      marginBottom: '0.4em',
      float: 'right'
    },
    padding: '0 !important'
  },
  divisionSelect: {
    paddingLeft: '2.75rem'
  }
}, ({ name: oldName, email: oldEmail, divisionId: oldDivision, onUpdate, classes }) => {
  const { toast } = useToast()

  const [name, setName] = useState(oldName)
  const handleSetName = useCallback((e) => setName(e.target.value), [])

  const [email, setEmail] = useState(oldEmail)
  const handleSetEmail = useCallback(e => setEmail(e.target.value), [])

  const [division, setDivision] = useState(oldDivision)
  const handleSetDivision = useCallback(e => setDivision(e.target.value), [])

  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const doUpdate = useCallback((e) => {
    e.preventDefault()

    let updated = false

    if (name !== oldName || division !== oldDivision) {
      updated = true

      setIsButtonDisabled(true)
      updateAccount({
        name,
        division
      })
        .then(({ error, data }) => {
          setIsButtonDisabled(false)

          if (error !== undefined) {
            toast({ body: error, type: 'error' })
            return
          }

          toast({ body: 'Profile updated' })

          onUpdate({
            name: data.user.name,
            divisionId: Number.parseInt(data.user.division)
          })
        })
    }

    if (email !== oldEmail) {
      updated = true

      setIsButtonDisabled(true)

      const handleResponse = ({ error, data }) => {
        setIsButtonDisabled(false)

        if (error !== undefined) {
          toast({ body: error, type: 'error' })
          return
        }

        toast({ body: data })
        onUpdate({ email })
      }

      if (email === '') {
        deleteEmail()
          .then(handleResponse)
      } else {
        updateEmail({
          email
        })
          .then(handleResponse)
      }
    }

    if (!updated) {
      toast({ body: 'Nothing to update!' })
    }
  }, [name, email, division, oldName, oldEmail, oldDivision, onUpdate, toast])

  return (
    <div class='card u-flex u-flex-column'>
      <div class='content'>
        <p>Update Information</p>
        <p class='font-thin u-no-margin'>This will change how your team appears on the scoreboard. Note that you may only change your team's name once every 10 minutes.</p>
        <div class='row u-center'>
          <Form class={`col-12 ${classes.form}`} onSubmit={doUpdate} disabled={isButtonDisabled} buttonText='Update'>
            <input required icon={<UserCircle />} name='name' placeholder='Team Name' type='text' value={name} onChange={handleSetName} />
            <input icon={<EnvelopeOpen />} name='email' placeholder='Email' type='email' value={email} onChange={handleSetEmail} />
            <select icon={<AddressBook />} class={`select ${classes.divisionSelect}`} name='division' value={division} onChange={handleSetDivision}>
              <option value='' disabled>Division</option>
              {
                Object.entries(config.divisions).map(([name, code]) => {
                  return <option key={code} value={code}>{name}</option>
                })
              }
            </select>
          </Form>
        </div>
      </div>
    </div>
  )
})

const LoggedInRail = memo(({ name, email, teamToken, divisionId, onUpdate }) =>
  <div class='col-4'>
    <TeamCodeCard {...{ teamToken }} />
    <UpdateCard {...{ name, email, divisionId, onUpdate }} />
  </div>
)

const Profile = ({ uuid, classes }) => {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({})
  const { toast } = useToast()

  const {
    name,
    email,
    division: divisionId,
    score,
    solves,
    teamToken,
    ctftimeId
  } = data
  const division = divisionMap.get(data.division)
  const divisionPlace = util.strings.placementString(data.divisionPlace)
  const globalPlace = util.strings.placementString(data.globalPlace)

  const isPrivate = uuid === undefined || uuid === 'me'

  useEffect(() => {
    setLoaded(false)
    if (isPrivate) {
      privateProfile()
        .then(({ data, error }) => {
          if (error) {
            toast({ body: error, type: 'error' })
          } else {
            setData(data)
          }
          setLoaded(true)
        })
    } else {
      publicProfile(uuid)
        .then(({ data, error }) => {
          if (error) {
            setError('Profile not found')
          } else {
            setData(data)
          }
          setLoaded(true)
        })
    }
  }, [uuid, isPrivate, toast])

  const onProfileUpdate = useCallback(({ name, email, divisionId }) => {
    setData(data => ({
      ...data,
      name: name || data.name,
      email: email || data.email,
      division: divisionId || data.division
    }))
  }, [])

  useEffect(() => { document.title = `Profile${config.ctfTitle}` }, [])

  if (!loaded) return null

  if (error !== null) {
    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-4'>
          <div class='card u-flex u-flex-column'>
            <div class='content'>
              <p class='title'>There was an error</p>
              <p class='font-thin'>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div class={`row u-center ${classes.root}`} style='align-items: initial !important'>
      { isPrivate && <LoggedInRail {...{ name, email, teamToken, divisionId }} onUpdate={onProfileUpdate} /> }
      <div class='col-6'>
        { isPrivate && <MembersCard division={config.divisions[division]} /> }
        <SummaryCard {...{ name, score, division, divisionPlace, globalPlace, ctftimeId }} />
        <SolvesCard solves={solves} />
      </div>
    </div>
  )
}

export default withStyles({
  root: {
    '& .card': {
      background: '#111'
    },
    '& input, & select, & option': {
      background: '#000',
      color: '#fff !important'
    }
  }
}, Profile)
