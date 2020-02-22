import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { getChallenges, submitFlag } from '../api/challenges'

export default withStyles({
  frame: {
    marginBottom: '15px',
    paddingBottom: '10px'
  },
  divider: {
    margin: '10px',
    width: '80%'
  }
}, class Challenges extends Component {
  state = {
    problems: [],
    values: {},
    errors: {}
  }

  componentDidMount () {
    document.title = 'Challenges' + config.ctfTitle

    getChallenges()
      .then(problems => {
        this.setState({
          problems
        })
      })
  }

  submitFlag = id => e => {
    e.preventDefault()

    submitFlag(id, this.state.values[id])
      .then(({ error }) => {
        const nxt = this.state.errors
        nxt[id] = error

        this.setState({
          errors: nxt
        })
      })
  }

  render ({ classes }, { problems, values, errors }) {
    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-3'>
          <div class={`frame ${classes.frame}`}>
            <div class='frame__body'>
              <div class='frame__title title'>Config</div>
              <div class='form-ext-control form-ext-checkbox'>
                <input id='check1' class='form-ext-input' type='checkbox' />
                <label class='form-ext-label' for='check1'>Show Solved</label>
              </div>
            </div>
          </div>
        </div>
        <div class='col-6'>
          {
            problems.map(problem => {
              const hasDownloads = problem.files.length !== 0

              const error = errors[problem.id]
              const hasError = error !== undefined

              return (
                <div class={`frame ${classes.frame}`} key={problem.id}>
                  <div class='frame__body'>
                    <div class='row u-no-padding'>
                      <div class='col-6 u-no-padding'>
                        <div class='frame__title title'>{problem.category}/{problem.name}</div>
                        <div class='frame__subtitle u-no-margin'>{problem.author}</div>
                      </div>
                      <div class='col-6 u-no-padding u-text-right'>
                        <div class='frame__subtitle faded' style='margin-top: .75rem; margin-bottom: 0'>{problem.points.max} pts</div>
                      </div>
                    </div>

                    <div class='content-no-padding u-center'><div class={`divider ${classes.divider}`} /></div>
                    <div class='frame__subtitle'>{problem.description}</div>
                    <form class='form-section' onSubmit={this.submitFlag(problem.id)}>

                      {
                        hasError &&
                          <label class='text-danger info font-light'>{error}</label>
                      }
                      <div class='form-group'>
                        <input class={`form-group-input input-small ${hasError ? 'input-error' : ''}`} placeholder='Flag' value={values[problem.id]} onChange={this.linkState('values.' + problem.id)} />
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
                                    <a href={config.staticEndpoint + '/' + file.path}>
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
            })
          }
        </div>

      </div>
    )
  }
})
