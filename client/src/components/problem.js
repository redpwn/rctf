import withStyles from '../components/jss'
import { useState, useCallback } from 'preact/hooks'
import snarkdown from 'snarkdown'
import Markup from 'preact-markup'
import config from '../../../config/client'

import { submitFlag } from '../api/challenges'
import { useToast } from '../components/toast'

const Problem = ({ classes, problem, solved, setSolved }) => {
  const { toast } = useToast()

  const hasDownloads = problem.files.length !== 0

  const [error, setError] = useState(undefined)
  const hasError = error !== undefined

  const [value, setValue] = useState('')
  const handleInputChange = useCallback(e => setValue(e.target.value), [])

  const handleSubmit = useCallback(e => {
    e.preventDefault()

    submitFlag(problem.id, value)
      .then(({ error }) => {
        if (error === undefined) {
          toast({ body: 'Flag successfully submitted!', type: 'success' })

          setSolved(problem.id)
        } else {
          toast({ body: error, type: 'error' })
          setError(error)
        }
      })
  }, [toast, setSolved, problem, value])

  return (
    <div class={`frame ${classes.frame}`} key={problem.id}>
      <div class='frame__body'>
        <div class='row u-no-padding'>
          <div class='col-6 u-no-padding'>
            <div class='frame__title title'>{problem.category}/{problem.name}</div>
            <div class='frame__subtitle u-no-margin'>{problem.author}</div>
          </div>
          <div class='col-6 u-no-padding u-text-right'>
            <div class={`frame__subtitle faded ${classes.points}`}>{problem.points.max} pts</div>
          </div>
        </div>

        <div class='content-no-padding u-center'><div class={`divider ${classes.divider}`} /></div>

        <div class={`${classes.description} frame__subtitle`}>
          <Markup type='html' trim={false} markup={snarkdown(problem.description)} />
        </div>
        <form class='form-section' onSubmit={handleSubmit}>
          <div class='form-group'>
            <input
              class={`form-group-input input-small ${hasError ? 'input-error' : ''} ${solved ? 'input-success' : ''}`}
              placeholder={`Flag${solved ? ' (solved)' : ''}`}
              value={value}
              onChange={handleInputChange}
            />
            <button class='form-group-btn btn-small'>Submit</button>
          </div>
        </form>

        {
          hasDownloads &&
            <div>
              <p class='faded frame__subtitle u-no-margin'>Downloads</p>
              <div class='tag-container'>
                {
                  problem.files.map(file => {
                    return (
                      <div class='tag' key={file.path}>
                        <a native download href={`${config.staticEndpoint}/${file.path}`}>
                          {file.name}
                        </a>
                      </div>
                    )
                  })
                }

              </div>
            </div>
        }
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
    margin: '0.625em',
    width: '80%'
  },
  points: {
    marginTop: '0.75rem !important',
    marginBottom: '0 !important'
  }
}, Problem)
