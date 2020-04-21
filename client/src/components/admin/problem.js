import withStyles from '../../components/jss'
import { useState, useCallback } from 'preact/hooks'

import { updateChallenge, deleteChallenge } from '../../api/admin/challs'
import { useToast } from '../../components/toast'

const Problem = ({ classes, problem }) => {
  const { toast } = useToast()

  const [flag, setFlag] = useState(problem.flag)
  const handleFlagChange = useCallback(e => setFlag(e.target.value), [])

  const [description, setDescription] = useState(problem.description)
  const handleDescriptionChange = useCallback(e => setDescription(e.target.value), [])

  const [category, setCategory] = useState(problem.category)
  const handleCategoryChange = useCallback(e => setCategory(e.target.value), [])

  const [author, setAuthor] = useState(problem.author)
  const handleAuthorChange = useCallback(e => setAuthor(e.target.value), [])

  const [name, setName] = useState(problem.name)
  const handleNameChange = useCallback(e => setName(e.target.value), [])

  const handleUpdate = useCallback(e => {
    e.preventDefault()

    updateChallenge({
      id: problem.id,
      data: {
        flag,
        description,
        category,
        author,
        name
      }
    })
  }, [problem, flag, description, category, author, name])

  const handleDelete = useCallback(e => {
    e.preventDefault()

    deleteChallenge({
      id: problem.id
    })
      .then(() => toast({
        body: `${problem.name} successfully deleted`,
        type: 'success'
      }))
  }, [toast, problem])

  return (
    <div class={`frame ${classes.frame}`} key={problem.id}>
      <div class='frame__body'>
        <form onSubmit={handleUpdate}>
          <div class='row u-no-padding'>
            <div class={`col-6 ${classes.header}`}>
              <input class='form-group-input input-small' placeholder='Category' value={category} onChange={handleCategoryChange} />
              <input class='form-group-input input-small' placeholder='Problem Name' value={name} onChange={handleNameChange} />
            </div>
            <div class={`col-6 ${classes.header}`}>
              <input class='form-group-input input-small' placeholder='Author' value={author} onChange={handleAuthorChange} />
            </div>
          </div>

          <div class='content-no-padding u-center'><div class={`divider ${classes.divider}`} /></div>

          <textarea placeholder='Description' value={description} onChange={handleDescriptionChange} />
          <div class='input-control'>
            <input class='form-group-input input-small' placeholder='Flag' value={flag} onChange={handleFlagChange} />
          </div>

          <div class={`form-section ${classes.controls}`}>
            <button class='btn-small btn-info'>Update</button>
            <button class='btn-small btn-danger' onClick={handleDelete} type='button' >Delete</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default withStyles({
  frame: {
    marginBottom: '1em',
    paddingBottom: '0.625em'
  },
  description: {
    '& a': {
      display: 'inline',
      padding: 0
    }
  },
  divider: {
    margin: '0.625em !important',
    width: '80% !important'
  },
  header: {
    marginTop: '15px',
    '& input': {
      margin: '5px 0'
    }
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}, Problem)
