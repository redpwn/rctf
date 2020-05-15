import withStyles from '../jss'
import { getMembers, addMember, removeMember } from '../../api/members'
import { updateAccount } from '../../api/profile'
import { useState, useCallback, useEffect } from 'preact/hooks'
import config from '../../config'

import Form from '../form'
import { useToast } from '../toast'

const MemberRow = withStyles({
  root: {
    alignItems: 'center',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  }
}, ({ classes, id, name, setMembers }) => {
  const { toast } = useToast()

  const handleDelete = useCallback(() => {
    removeMember({ id })
      .then(() => {
        setMembers(members => members.filter(a => a.id !== id))

        toast({ body: 'Team member successfully deleted' })
      })
  }, [id, setMembers, toast])

  return (
    <div class={classes.root} key={id}>
      <p class='u-no-margin'>{name}</p>
      <div class='btn-container u-vertical-center'>
        <input onClick={handleDelete} type='submit' class='btn-tiny btn-danger u-no-margin' value='Delete' />
      </div>
    </div>
  )
})

const MembersCard = withStyles({

}, ({ classes, division: originalDivision }) => {
  const { toast } = useToast()

  const [name, setName] = useState('')
  const handleNameChange = useCallback(e => setName(e.target.value), [])

  const [email, setEmail] = useState('')
  const handleEmailChange = useCallback(e => setEmail(e.target.value), [])

  const [grade, setGrade] = useState('')
  const handleGradeChange = useCallback(e => setGrade(e.target.value), [])

  const [buttonDisabled, setButtonDisabled] = useState(false)

  const [division, setDivision] = useState(originalDivision)
  const handleDivisionChange = useCallback(e => {
    e.preventDefault()

    const division = e.target.value

    updateAccount({ division })
      .then(({ error, data }) => {
        if (error) {
          toast({ body: error, type: 'error' })
        } else {
          setDivision(data.division)
          toast({ body: 'Division successsfully updated' })
        }
      })
  }, [toast])

  const [members, setMembers] = useState([])
  const ineligible = members.length === 0

  const handleSubmit = useCallback(e => {
    e.preventDefault()
    setButtonDisabled(true)

    addMember({
      name, email, grade
    })
      .then(({ error, data }) => {
        setButtonDisabled(false)

        if (error) {
          toast({ body: error, type: 'error' })
        } else {
          toast({ body: 'Team member successfully added' })
          setMembers(members => [...members, data])
        }
      })
  }, [name, email, grade, toast])

  useEffect(() => {
    getMembers()
      .then(data => setMembers(data))
  }, [])

  return (
    <div class='card u-flex u-flex-column'>
      <div class='content'>
        <p>Team Information</p>
        <p class='font-thin u-no-margin'>There is no limit on team members. This data is collected for informational purposes only. Please ensure that this section is up to date in order to remain prize eligible. </p>
        <div class='row u-center'>
          <Form class={`col-12 ${classes.form}`} onSubmit={handleSubmit} disabled={buttonDisabled} buttonText='Add Member'>
            <input required name='name' placeholder='Full Name' type='text' value={name} onChange={handleNameChange} />
            <input required name='email' placeholder='Email' type='email' value={email} onChange={handleEmailChange} />
            <input required name='grade' placeholder='Grade' type='text' value={grade} onChange={handleGradeChange} />
          </Form>
          {
            members.length !== 0 &&
              <div class='row'>
                {
                  members.map(data => <MemberRow setMembers={setMembers} { ...data } />)
                }
              </div>
          }
          {
            ineligible &&
              <p>
                <mark class='font-thin'>
                  Please fill out this section to mark yourself as prize eligible
                </mark>
              </p>
          }
          <select disabled={ineligible} class='select' name='division' value={division} onChange={handleDivisionChange}>
            <option value='' disabled>Division</option>
            {
              Object.entries(config.divisions).map(([name, code]) => {
                return <option key={code} value={code}>{name}</option>
              })
            }
          </select>
        </div>
      </div>
    </div>
  )
})

export default MembersCard
