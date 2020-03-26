import { Component } from 'preact'
import { useState, useCallback, useEffect } from 'preact/hooks'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { privateProfile, publicProfile, deleteAccount, updateAccount } from '../api/profile'
import { withToast } from '../components/toast'
import Form from '../components/form'
import Modal from '../components/modal'
import util from '../util'
import Trophy from '../../static/icons/trophy.svg'
import AddressBook from '../../static/icons/address-book.svg'
import UserCircle from '../../static/icons/user-circle.svg'
import Rank from '../../static/icons/rank.svg'

const divisionMap = new Map()

for (const division of Object.entries(config.divisions)) {
  divisionMap.set(division[1], division[0])
}

const DeleteModal = withStyles({
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
        <div class='modal-title'>Delete account</div>
        <form class='modal-body' onSubmit={verifyName}>
          <p>Are you sure you want to delete your team?</p>
          <div class='form-section'>
            <label>Type your team name:</label>
            <input placeholder={teamName} value={inputName} onChange={handleInputNameChange} />
          </div>
          <div class={`form-section ${classes.controls}`}>
            <div class='btn-container u-inline-block'>
              <button class='btn-small' onClick={wrappedOnClose}>Cancel</button>
            </div>
            <div class='btn-container u-inline-block'>
              <input type='submit' class='btn-small btn-danger outline' disabled={!isNameValid} value='Confirm' />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  )
})

class Profile extends Component {
  state = {
    loaded: false,
    name: '',
    division: '',
    divisionPlace: '',
    globalPlace: '',
    score: 0,
    teamToken: '',
    solves: [],
    uuid: '',
    error: undefined,
    updateName: '',
    updateDivision: 0,
    disabledButton: false,
    deleteModalVisible: false
  }

  processGeneric ({ name, division, score, divisionPlace, globalPlace, solves }) {
    this.setState({
      name,
      updateName: name,
      division: divisionMap.get(division),
      updateDivision: division,
      divisionPlace: util.strings.placementString(divisionPlace),
      globalPlace: util.strings.placementString(globalPlace),
      score,
      solves,
      loaded: true
    })
  }

  componentDidMount () {
    document.title = `Profile${config.ctfTitle}`
  }

  isPrivate () {
    const { uuid } = this.props

    return uuid === undefined || uuid === 'me'
  }

  static getDerivedStateFromProps (props, state) {
    if (props.uuid !== state.uuid) {
      return {
        uuid: props.uuid,
        error: undefined,
        loaded: false
      }
    }
    return null
  }

  componentDidUpdate () {
    if (!this.state.loaded) {
      const { uuid } = this.state

      if (this.isPrivate()) {
        privateProfile()
          .then(data => {
            this.processGeneric(data)
            this.setState({
              teamToken: data.teamToken
            })
          })
      } else {
        publicProfile(uuid)
          .then(data => {
            if (data === null) {
              this.setState({
                error: 'Profile not found',
                loaded: true
              })
            } else {
              this.processGeneric(data)
            }
          })
      }
    }
  }

  handleUpdate = e => {
    e.preventDefault()

    this.setState({
      disabledButton: true
    })

    updateAccount(this.state.updateName, this.state.updateDivision)
      .then(({error, data}) => {
        this.setState({
          disabledButton: false
        })

        if (error !== undefined) {
          this.props.toast({ body: error, type: 'error' })
          return
        }

        this.props.toast({ body: 'Profile updated' })

        this.setState({
          name: data.user.name,
          division: divisionMap.get(Number.parseInt(data.user.division))
        })
      })
  }

  handleDelete = () => {
    this.setState({
      deleteModalVisible: true
    })
  }

  dismissDeleteModal = () => {
    this.setState({
      deleteModalVisible: false
    })
  }

  render ({ classes }, { name, division, divisionPlace, globalPlace, score, teamToken, solves, error, loaded, updateName, updateDivision, disabledButton, deleteModalVisible }) {
    const priv = this.isPrivate()
    const hasError = error !== undefined

    if (!loaded) return null

    if (hasError) {
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
        {
          priv &&
            <div class='col-4'>
              <div class='card u-flex u-flex-column'>
                <div class='content'>
                  <p>Team Code</p>
                  <blockquote class={classes.quote}>
                    {teamToken}
                  </blockquote>
                  <p class='font-thin'>Share this with your teammates to use at <a href='/login'>/login</a>!</p>
                </div>
              </div>
              <div class='card u-flex u-flex-column'>
                <div class='content'>
                  <p style='margin-bottom: 0'>Update Information</p>
                  <p class='font-thin u-no-margin'>Warning: You can only do this once per 10 minutes</p>
                  <div class='row u-center'>
                    <Form class={`col-12 ${classes.form}`} onSubmit={this.handleUpdate} disabled={disabledButton} buttonText='Update'>
                      <input autofocus required icon={<UserCircle />} name='name' placeholder='Team Name' type='text' value={updateName} onChange={this.linkState('updateName')} />
                      <select required class='select' name='division' value={updateDivision} onChange={this.linkState('updateDivision')}>
                        <option value='' disabled selected>Division</option>
                        {
                          Object.entries(config.divisions).map(([name, code]) => {
                            return <option key={code} value={code}>{name}</option>
                          })
                        }
                      </select>
                    </Form>
                  </div>
                  <div class='u-center action-bar' style='margin: 0.5rem; padding: 1rem'>
                    <button class='btn-small btn-danger outline' style='border-color: var(--btn-color)' onClick={this.handleDelete}>Delete Account</button>
                    <DeleteModal open={deleteModalVisible} onClose={this.dismissDeleteModal} onSuccess={deleteAccount} teamName={name} />
                  </div>
                </div>
              </div>
            </div>
        }
        <div class='col-6'>
          <div class='card u-flex u-flex-column'>
            <div class='content'>
              <h5 class='title' style='text-overflow: ellipsis; overflow: hidden;'>{name}</h5>
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

          {
            solves.length !== 0 &&
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
                      {solves.map(solve => <tr key={solve.name}><td>{solve.category}</td><td>{solve.name}</td><td>{solve.points}</td></tr>)}
                    </tbody>
                  </table>
                </div>
              </div>
          }

        </div>
      </div>
    )
  }
}

export default withStyles({
  quote: {
    fontSize: 'small',
    overflowWrap: 'break-word'
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      height: '20px',
      fill: '#333'
    },
    marginRight: '25px'
  },
  form: {
    '& button': {
      margin: 0,
      lineHeight: '20px',
      padding: '10px',
      float: 'right'
    },
    padding: '0 !important'
  }
}, withToast(Profile))
