import withStyles from '../jss'
import { getMembers, addMember, removeMember } from '../../api/members'
import { useState, useCallback, useEffect } from 'preact/hooks'
import Form from '../form'
import EnvelopeOpen from '../../icons/envelope-open.svg'
import { useToast } from '../toast'

const MemberRow = withStyles({
  root: {
    alignItems: 'center',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  }
}, ({ classes, id, email, setMembers }) => {
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
      <p class='u-no-margin'>{email}</p>
      <div class='btn-container u-vertical-center'>
        <input onClick={handleDelete} type='submit' class='btn-tiny btn-danger u-no-margin' value='Delete' />
      </div>
    </div>
  )
})

const MembersCard = withStyles({
  form: {
    '& button': {
      display: 'block',
      marginLeft: 'auto',
      marginRight: '0',
      marginTop: '10px'
    }
  }
}, ({ classes, division: originalDivision }) => {
  const { toast } = useToast()

  const [email, setEmail] = useState('')
  const handleEmailChange = useCallback(e => setEmail(e.target.value), [])

  const [buttonDisabled, setButtonDisabled] = useState(false)

  const [members, setMembers] = useState([])

  const handleSubmit = useCallback(e => {
    e.preventDefault()
    setButtonDisabled(true)

    addMember({ email })
      .then(({ error, data }) => {
        setButtonDisabled(false)

        if (error) {
          toast({ body: error, type: 'error' })
        } else {
          toast({ body: 'Team member successfully added' })
          setMembers(members => [...members, data])
        }
      })
  }, [email, toast])

  useEffect(() => {
    getMembers()
      .then(data => setMembers(data))
  }, [])

  return (
    <div class='card u-flex u-flex-column'>
      <div class='content'>
        <p>Team Information</p>
        <p class='font-thin u-no-margin'>There is no limit on team members. This data is collected for informational purposes only. Please ensure that this section is up to date in order to remain prize eligible.</p>
        <div class='row u-center'>
          <Form class={`col-12 ${classes.form}`} onSubmit={handleSubmit} disabled={buttonDisabled} buttonText='Add Member'>
            <input required icon={<EnvelopeOpen />} name='email' placeholder='Email' type='email' value={email} onChange={handleEmailChange} />
          </Form>
          {
            members.length !== 0 &&
              <div class='row'>
                {
                  members.map(data => <MemberRow setMembers={setMembers} { ...data } />)
                }
              </div>
          }
        </div>
      </div>
    </div>
  )
})

export default MembersCard
