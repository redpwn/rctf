import { useState, useCallback, useEffect } from 'preact/hooks'
import { memo } from 'preact/compat'
import config from '../config'
import withStyles from '../components/jss'

import { privateProfile, publicProfile, updateAccount, updateEmail, deleteEmail } from '../api/profile'
import { useToast } from '../components/toast'
import Form from '../components/form'
import MembersCard from '../components/profile/members-card'
import CtftimeCard from '../components/profile/ctftime-card'
import { PublicSolvesCard, PrivateSolvesCard } from '../components/profile/solves-card'
import TokenPreview from '../components/token-preview'
import * as util from '../util'
import Trophy from '../icons/trophy.svg'
import AddressBook from '../icons/address-book.svg'
import UserCircle from '../icons/user-circle.svg'
import EnvelopeOpen from '../icons/envelope-open.svg'
import Rank from '../icons/rank.svg'
import Ctftime from '../icons/ctftime.svg'
import useRecaptcha, { RecaptchaLegalNotice } from '../components/recaptcha'

const SummaryCard = memo(withStyles({
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      height: '1.25em',
      fill: '#333'
    },
    marginRight: '1.5em'
  },
  publicHeader: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    margin: '0 !important',
    maxWidth: '75vw'
  },
  privateHeader: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    margin: '0 !important',
    maxWidth: '30vw'
  },
  '@media (max-width: 804px)': {
    privateHeader: {
      maxWidth: '75vw'
    }
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '15px',
    paddingBottom: '5px'
  }
}, ({ name, score, division, divisionPlace, globalPlace, ctftimeId, classes, isPrivate }) =>
  <div class='card'>
    <div class='content'>
      <div class={classes.wrapper}>
        <h5
          class={`title ${isPrivate ? classes.privateHeader : classes.publicHeader}`}
          title={name}>
          {name}
        </h5>
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

const TeamCodeCard = withStyles({
  btn: {
    marginRight: '10px'
  }
}, ({ teamToken, classes }) => {
  const { toast } = useToast()

  const tokenUrl = `${location.origin}/login?token=${encodeURIComponent(teamToken)}`

  const [reveal, setReveal] = useState(false)
  const toggleReveal = useCallback(
    () => setReveal(!reveal),
    [reveal]
  )

  const onCopyClick = useCallback(() => {
    if (navigator.clipboard) {
      try {
        navigator.clipboard.writeText(tokenUrl).then(() => {
          toast({ body: 'Copied team invite URL to clipboard' })
        })
      } catch {}
    }
  }, [toast, tokenUrl])

  return (
    <div class='card'>
      <div class='content'>
        <p>Team Invite</p>
        <p class='font-thin'>Send this team invite URL to your teammates so they can login.</p>

        <button onClick={onCopyClick} class={`${classes.btn} btn-info u-center`} name='btn' value='submit' type='submit'>Copy</button>

        <button onClick={toggleReveal} class='btn-info u-center' name='btn' value='submit' type='submit'>{reveal ? 'Hide' : 'Reveal'}</button>

        {
          reveal &&
            <TokenPreview token={tokenUrl} />
        }
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
  },
  recaptchaLegalNotice: {
    marginTop: '20px'
  }
}, ({ name: oldName, email: oldEmail, divisionId: oldDivision, allowedDivisions, onUpdate, classes }) => {
  const { toast } = useToast()
  const requestRecaptchaCode = useRecaptcha('setEmail')

  const [name, setName] = useState(oldName)
  const handleSetName = useCallback((e) => setName(e.target.value), [])

  const [email, setEmail] = useState(oldEmail)
  const handleSetEmail = useCallback(e => setEmail(e.target.value), [])

  const [division, setDivision] = useState(oldDivision)
  const handleSetDivision = useCallback(e => setDivision(e.target.value), [])

  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const doUpdate = useCallback(async (e) => {
    e.preventDefault()

    let updated = false

    if (name !== oldName || division !== oldDivision) {
      updated = true

      setIsButtonDisabled(true)
      const { error, data } = await updateAccount({
        name: oldName === name ? undefined : name,
        division: oldDivision === division ? undefined : division
      })
      setIsButtonDisabled(false)

      if (error !== undefined) {
        toast({ body: error, type: 'error' })
        return
      }

      toast({ body: 'Profile updated' })

      onUpdate({
        name: data.user.name,
        divisionId: data.user.division
      })
    }

    if (email !== oldEmail) {
      updated = true

      let error, data
      if (email === '') {
        setIsButtonDisabled(true)
        ;({ error, data } = await deleteEmail())
      } else {
        const recaptchaCode = await requestRecaptchaCode?.()
        setIsButtonDisabled(true)
        ;({ error, data } = await updateEmail({
          email,
          recaptchaCode
        }))
      }

      setIsButtonDisabled(false)

      if (error !== undefined) {
        toast({ body: error, type: 'error' })
        return
      }

      toast({ body: data })
      onUpdate({ email })
    }

    if (!updated) {
      toast({ body: 'Nothing to update!' })
    }
  }, [name, email, division, oldName, oldEmail, oldDivision, onUpdate, toast, requestRecaptchaCode])

  return (
    <div class='card'>
      <div class='content'>
        <p>Update Information</p>
        <p class='font-thin u-no-margin'>This will change how your team appears on the scoreboard. You may only change your team's name once every 10 minutes.</p>
        <div class='row u-center'>
          <Form class={`col-12 ${classes.form}`} onSubmit={doUpdate} disabled={isButtonDisabled} buttonText='Update'>
            <input
              required
              autocomplete='username'
              autocorrect='off'
              maxLength='64'
              minLength='2'
              icon={<UserCircle />}
              name='name'
              placeholder='Team Name'
              type='text'
              value={name}
              onChange={handleSetName}
            />
            <input
              autocomplete='email'
              autocorrect='off'
              icon={<EnvelopeOpen />}
              name='email'
              placeholder='Email'
              type='email'
              value={email}
              onChange={handleSetEmail}
            />
            <select icon={<AddressBook />} class={`select ${classes.divisionSelect}`} name='division' value={division} onChange={handleSetDivision}>
              <option value='' disabled>Division</option>
              {
                allowedDivisions.map(code => {
                  return <option key={code} value={code}>{config.divisions[code]}</option>
                })
              }
            </select>
          </Form>
          {requestRecaptchaCode && (
            <div class={classes.recaptchaLegalNotice}>
              <RecaptchaLegalNotice />
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

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
    ctftimeId,
    allowedDivisions
  } = data
  const division = config.divisions[data.division]
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

  const onProfileUpdate = useCallback(({ name, email, divisionId, ctftimeId }) => {
    setData(data => ({
      ...data,
      name: name === undefined ? data.name : name,
      email: email === undefined ? data.email : email,
      division: divisionId === undefined ? data.division : divisionId,
      ctftimeId: ctftimeId === undefined ? data.ctftimeId : ctftimeId
    }))
  }, [])

  useEffect(() => { document.title = `Profile | ${config.ctfName}` }, [])

  if (!loaded) return null

  if (error !== null) {
    return (
      <div class='row u-center'>
        <div class='col-4'>
          <div class={`card ${classes.errorCard}`}>
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
    <div class={classes.root}>
      {isPrivate && (
        <div class={classes.privateCol}>
          <TeamCodeCard {...{ teamToken }} />
          <UpdateCard {...{ name, email, divisionId, allowedDivisions, onUpdate: onProfileUpdate }} />
          {config.ctftime && (
            <CtftimeCard {...{ ctftimeId, onUpdate: onProfileUpdate }} />
          )}
        </div>
      )}
      <div class={classes.col}>
        <SummaryCard {...{ name, score, division, divisionPlace, globalPlace, ctftimeId, isPrivate }} />
        {isPrivate && config.userMembers && (
          <MembersCard />
        )}
        {isPrivate ? (
          <PrivateSolvesCard solves={solves} />
        ) : (
          <PublicSolvesCard solves={solves} />
        )}
      </div>
    </div>
  )
}

export default withStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(384px, 1fr))',
    width: '100%',
    maxWidth: '1500px',
    margin: 'auto',
    '& .card': {
      background: '#222',
      marginBottom: '20px'
    },
    '& input, & select, & option': {
      background: '#111',
      color: '#fff !important'
    }
  },
  col: {
    margin: '0 auto',
    width: 'calc(100% - 20px)',
    marginLeft: '10px'
  },
  privateCol: {
    width: 'calc(100% - 20px)',
    marginLeft: '10px'
  },
  errorCard: {
    background: '#222'
  }
}, Profile)
