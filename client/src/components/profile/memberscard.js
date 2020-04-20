import withStyles from '../jss'
import { getMembers, addMember, removeMember } from '../../api/members'
import { updateAccount } from '../../api/profile'
import { useState, useCallback, useEffect } from 'preact/hooks'
import config from '../../../../config/client'

import Form from '../form'
import { withToast } from '../toast'

const MemberRow = ({ id, name, setMembers }) => {
  const handleDelete = useCallback(() => {
    removeMember({ id })
      .then(() => {
        setMembers(members => members.filter(a => a.id !== id))
      })
  }, [id, setMembers])

  return (
    <div class='u-vertical-center' style='width: 100%; display: flex; justify-content: space-between;' key={id}>
      <p class='u-no-margin'>{name}</p>
      <div class='btn-container u-vertical-center'>
        <input onClick={handleDelete} type='submit' class='btn-tiny btn-danger u-no-margin' value='Delete' />
      </div>
    </div>
  )
}

const MembersCard = withStyles({

}, withToast(({ classes, division: originalDivision, toast }) => {
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

    updateAccount({ division })
      .then(() => {
        setDivision(division)
        toast({ body: 'Division successsfully updated' })
      })
  }, [division, toast])

  const [members, setMembers] = useState([])
  const ineligible = members.length === 0

  const handleSubmit = useCallback(e => {
    e.preventDefault()
    setButtonDisabled(true)

    addMember({
      name, email, grade
    })
      .then(({ err, data }) => {
        setButtonDisabled(false)

        if (err) {
          toast({ body: err, type: 'error' })
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
}))

export default MembersCard
