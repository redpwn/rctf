import { Fragment } from 'preact'
import withStyles from '../../components/jss'
import { useState, useCallback } from 'preact/hooks'
import Modal from '../../components/modal'

import { updateChallenge, deleteChallenge, uploadFiles } from '../../api/admin/challs'
import { useToast } from '../../components/toast'
import { encodeFile } from '../../util'

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
    <Modal open={open} onClose={onClose}>
      <div class='modal-header'>
        <div class='modal-title'>Delete Challenge?</div>
      </div>
      <div class={`modal-body ${classes.modalBody}`}>
        This is an irreversible action that permanently deletes the challenge and revokes all solves.
        <div class={classes.controls}>
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

const Problem = ({ classes, problem, update: updateClient }) => {
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

  const [minPoints, setMinPoints] = useState(problem.points.min)
  const handleMinPointsChange = useCallback(e => setMinPoints(Number.parseInt(e.target.value)), [])

  const [maxPoints, setMaxPoints] = useState(problem.points.max)
  const handleMaxPointsChange = useCallback(e => setMaxPoints(Number.parseInt(e.target.value)), [])

  const [tiebreakEligible, setTiebreakEligible] = useState(problem.tiebreakEligible !== false)
  const handleTiebreakEligibleChange = useCallback(e => setTiebreakEligible(e.target.checked), [])

  const handleFileUpload = useCallback(async e => {
    e.preventDefault()

    const fileData = await Promise.all(
      Array.from(e.target.files)
        .map(async file => {
          const data = await encodeFile(file)

          return {
            data,
            name: file.name
          }
        })
    )

    const fileUpload = await uploadFiles({
      files: fileData
    })

    if (fileUpload.error) {
      toast({ body: fileUpload.error, type: 'error' })
      return
    }

    const data = await updateChallenge({
      id: problem.id,
      data: {
        files: fileUpload.data.concat(problem.files)
      }
    })

    e.target.value = null

    updateClient({
      problem: data
    })

    toast({ body: 'Problem successfully updated' })
  }, [problem.id, problem.files, updateClient, toast])

  const handleRemoveFile = file => async () => {
    const newFiles = problem.files.filter(f => f !== file)

    const data = await updateChallenge({
      id: problem.id,
      data: {
        files: newFiles
      }
    })

    updateClient({
      problem: data
    })

    toast({ body: 'Problem successfully updated' })
  }

  const handleUpdate = async e => {
    e.preventDefault()

    const data = await updateChallenge({
      id: problem.id,
      data: {
        flag,
        description,
        category,
        author,
        name,
        tiebreakEligible,
        points: {
          min: minPoints,
          max: maxPoints
        }
      }
    })

    updateClient({
      problem: data
    })

    toast({ body: 'Problem successfully updated' })
  }

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
                <input
                  autocomplete='off'
                  autocorrect='off'
                  required
                  class='form-group-input input-small'
                  placeholder='Category'
                  value={category}
                  onChange={handleCategoryChange}
                />
                <input
                  autocomplete='off'
                  autocorrect='off'
                  required
                  class='form-group-input input-small'
                  placeholder='Problem Name'
                  value={name}
                  onChange={handleNameChange}
                />
                <div class='form-ext-control form-ext-checkbox'>
                  <input
                    id={`chall-${problem.id}-tiebreak-eligible`}
                    type='checkbox'
                    class='form-ext-input'
                    checked={tiebreakEligible}
                    onChange={handleTiebreakEligibleChange}
                  />
                  <label for={`chall-${problem.id}-tiebreak-eligible`} class='form-ext-label'>Eligible for tiebreaks?</label>
                </div>
              </div>
              <div class={`col-6 ${classes.header}`}>
                <input
                  autocomplete='off'
                  autocorrect='off'
                  required
                  class='form-group-input input-small'
                  placeholder='Author'
                  value={author}
                  onChange={handleAuthorChange}
                />
                <input
                  class='form-group-input input-small'
                  type='number'
                  required
                  value={minPoints}
                  onChange={handleMinPointsChange}
                />
                <input
                  class='form-group-input input-small'
                  type='number'
                  required
                  value={maxPoints}
                  onChange={handleMaxPointsChange}
                />
              </div>
            </div>

            <div class='content-no-padding u-center'><div class={`divider ${classes.divider}`} /></div>

            <textarea
              autocomplete='off'
              autocorrect='off'
              placeholder='Description'
              value={description}
              onChange={handleDescriptionChange}
            />
            <div class='input-control'>
              <input
                autocomplete='off'
                autocorrect='off'
                required
                class='form-group-input input-small'
                placeholder='Flag'
                value={flag}
                onChange={handleFlagChange}
              />
            </div>

            {
              problem.files.length !== 0 &&
                <div>
                  <p class={`frame__subtitle u-no-margin ${classes.downloadsHeader}`}>Downloads</p>
                  <div class='tag-container'>
                    {
                      problem.files.map(file => {
                        return (
                          <div class={`tag ${classes.tag}`} key={file.url}>
                            <a native download href={file.url}>
                              {file.name}
                            </a>
                            <div class='tag tag--delete' style='margin: 0; margin-left: 3px' onClick={handleRemoveFile(file)} />
                          </div>
                        )
                      })
                    }

                  </div>
                </div>
            }

            <div class='input-control'>
              <input class='form-group-input input-small' type='file' multiple onChange={handleFileUpload} />
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
    paddingBottom: '0.625em',
    background: '#222',
    '& input, & textarea': {
      color: '#fff !important',
      background: '#111'
    }
  },
  downloadsHeader: {
    color: '#fff !important'
  },
  description: {
    '& a': {
      display: 'inline',
      padding: 0
    }
  },
  tag: {
    background: '#111'
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
  },
  tiebreak: {
    margin: 'auto'
  }
}, Problem)
