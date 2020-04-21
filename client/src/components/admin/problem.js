import { Fragment } from 'preact'
import withStyles from '../../components/jss'
import { useState, useCallback } from 'preact/hooks'
import Modal from '../../components/modal'

import { updateChallenge, deleteChallenge } from '../../api/admin/challs'
import { useToast } from '../../components/toast'

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
}, ({ open, onClose, onDelete, classes }) => {
  const wrappedOnClose = useCallback((e) => {
    e.preventDefault()
    onClose()
  }, [onClose])
  const wrappedOnDelete = useCallback((e) => {
    e.preventDefault()
    onDelete()
  }, [onDelete])

  return (
    <Modal {...{ open, onClose }}>
      <div class='modal-header'>
        <div class='modal-title'>Delete Challenge?</div>
      </div>
      <div class={`modal-body ${classes.modalBody}`}>
        This is an irreversible action that permanently deletes the challenge and revokes all solves.
        <div class={`${classes.controls}`}>
          <div class='btn-container u-inline-block'>
            <button type='button' class='btn-small' onClick={wrappedOnClose}>Cancel</button>
          </div>
          <div class='btn-container u-inline-block'>
            <button type='submit' class='btn-small btn-danger' onClick={wrappedOnDelete}>Delete Challenge</button>
          </div>
        </div>
      </div>
    </Modal>
  )
})

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

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const openDeleteModal = useCallback(e => {
    e.preventDefault()
    setIsDeleteModalOpen(true)
  }, [])
  const closeDeleteModal = useCallback(() => {
    setIsDeleteModalOpen(false)
  }, [])
  const handleDelete = useCallback(() => {
    const action = async () => {
      await deleteChallenge({
        id: problem.id
      })
      toast({
        body: `${problem.name} successfully deleted`,
        type: 'success'
      })
      closeDeleteModal()
    }
    action()
  }, [problem, toast, closeDeleteModal])

  return (
    <Fragment>
      <div class={`frame ${classes.frame}`}>
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
              <button class='btn-small btn-danger' onClick={openDeleteModal} type='button' >Delete</button>
            </div>
          </form>
        </div>
      </div>
      <DeleteModal open={isDeleteModalOpen} onClose={closeDeleteModal} onDelete={handleDelete} />
    </Fragment>
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
