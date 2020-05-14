import { useState, useCallback, useEffect } from 'preact/hooks'
import { memo } from 'preact/compat'
import config from '../config'
import withStyles from '../components/jss'

import { privateProfile, publicProfile, deleteAccount, updateAccount, updateEmail, deleteEmail } from '../api/profile'
import { useToast } from '../components/toast'
import Form from '../components/form'
import Modal from '../components/modal'
import MembersCard from '../components/profile/memberscard'
import TokenPreview from '../components/tokenPreview'
import util from '../util'
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

const DeleteModal = withStyles({
  modalBody: {
    paddingTop: '0em !important' // reduce space between header and body
  },
  controls: {
    display: 'flex',
    justifyContent: 'center',
    '& :first-child': {
      marginLeft: '0em'
    },
    '& :last-child': {
      marginRight: '0em'
    }
  }
}, ({ open, onClose, onSuccess, teamName, classes }) => {
  const [inputName, setInputName] = useState('')
  const handleInputNameChange = useCallback((e) => setInputName(e.target.value), [])
  const isNameValid = inputName === teamName
  const verifyName = useCallback((e) => {
    e.preventDefault()
    if (isNameValid) {
      onSuccess()
    }
  }, [isNameValid, onSuccess])
  const wrappedOnClose = useCallback((e) => {
    e.preventDefault()
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) {
      setInputName('')
    }
  }, [open])

  return (
    <Modal {...{ open, onClose }}>
      <div class='modal-header'>
        <div class='modal-title'>Delete Account</div>
      </div>
      {/* Put buttons in the body because otherwise there is too much padding */}
      <form class={`modal-body ${classes.modalBody}`} onSubmit={verifyName}>
        <div>Are you sure you want to delete your team? This action is permanent.</div>
        <div class='form-section'>
          <label>Type your team name to confirm:</label>
          <input placeholder={teamName} value={inputName} onInput={handleInputNameChange} />
        </div>
        <div class={`${classes.controls}`}>
          <div class='btn-container u-inline-block'>
            <button class='btn-small' onClick={wrappedOnClose}>Cancel</button>
          </div>
          <div class='btn-container u-inline-block'>
            <input type='submit' class='btn-small btn-danger outline' disabled={!isNameValid} value='Delete Team' />
          </div>
        </div>
      </form>
    </Modal>
  )
})

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
  if (solves.length === 0) return null
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
        <p>Team Code</p>
        <p class='font-thin'>Copy this code and store it in a safe place as it is required to login. Then, share it with your teammates so that they can <a href='/login'>login</a> too!</p>
        <TokenPreview token={teamToken} />
      </div>
    </div>
  )
})

const UpdateCard = withStyles({
  form: {
    '& button': {
      margin: 0,
      marginBottom: '0.4em',
      lineHeight: '1.25em',
      padding: '0.65em',
      float: 'right'
    },
    padding: '0 !important'
  }
}, ({ name: oldName, email: oldEmail, onUpdate, classes }) => {
  const { toast } = useToast()

  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const dismissDeleteModal = useCallback(() => setDeleteModalVisible(false), [])
  const handleDelete = useCallback(() => setDeleteModalVisible(true), [])

  const [name, setName] = useState(oldName)
  const handleSetName = useCallback((e) => setName(e.target.value), [])

  const [email, setEmail] = useState(oldEmail)
  const handleSetEmail = useCallback(e => setEmail(e.target.value), [])

  const [isButtonDisabled, setIsButtonDisabled] = useState(false)

  const doUpdate = useCallback((e) => {
    e.preventDefault()

    if (name !== oldName) {
      setIsButtonDisabled(true)
      updateAccount({
        name
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
  }, [name, email, oldName, oldEmail, onUpdate, toast])

  return (
    <div class='card u-flex u-flex-column'>
      <div class='content'>
        <p>Update Information</p>
        <p class='font-thin u-no-margin'>This will change how your team appears on the scoreboard. Note that you may only change your team's name once every 10 minutes.</p>
        <div class='row u-center'>
          <Form class={`col-12 ${classes.form}`} onSubmit={doUpdate} disabled={isButtonDisabled} buttonText='Update'>
            <input required icon={<UserCircle />} name='name' placeholder='Team Name' type='text' value={name} onChange={handleSetName} />
            <input required icon={<EnvelopeOpen />} name='email' placeholder='Email' type='email' value={email} onChange={handleSetEmail} />
          </Form>
        </div>
        <div class='u-center action-bar' style='margin: 0.5rem; padding: 1rem'>
          <button class='btn-small btn-danger outline' style='border-color: var(--btn-color)' onClick={handleDelete}>Delete Account</button>
          <DeleteModal open={deleteModalVisible} onClose={dismissDeleteModal} onSuccess={deleteAccount} teamName={name} />
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

function Profile ({ uuid }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState({})
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
        .then(data => {
          setData(data)
          setLoaded(true)
        })
    } else {
      publicProfile(uuid)
        .then(data => {
          if (data === null) {
            setError('Profile not found')
            setLoaded(true)
          } else {
            setData(data)
            setLoaded(true)
          }
        })
    }
  }, [uuid, isPrivate])

  const onProfileUpdate = useCallback(({ name, email, divisionId }) => {
    setData(data => ({
      ...data,
      name,
      email,
      division: divisionId
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
    <div class='row u-center' style='align-items: initial !important'>
      { isPrivate && <LoggedInRail {...{ name, email, teamToken, divisionId }} onUpdate={onProfileUpdate} /> }
      <div class='col-6'>
        { isPrivate && <MembersCard division={config.divisions[division]} /> }
        <SummaryCard {...{ name, score, division, divisionPlace, globalPlace, ctftimeId }} />
        <SolvesCard solves={solves} />
      </div>
    </div>
  )
}

export default Profile
