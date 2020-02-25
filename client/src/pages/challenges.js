import { Component } from 'preact'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { getChallenges, submitFlag, getPrivateSolves } from '../api/challenges'
import util from '../util'

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
    errors: {},
    showSolved: false,
    solveIDs: []
  }

  componentDidMount () {
    document.title = 'Challenges' + config.ctfTitle

    getChallenges()
      .then(problems => {
        this.setState({
          problems
        })
      })

    getPrivateSolves()
      .then(data => {
        const solveIDs = []
        data.map(solve => solveIDs.push(solve.id))
        this.setState({
          solveIDs: solveIDs
        })
      })
  }

  submitFlag = id => e => {
    e.preventDefault()

    submitFlag(id, this.state.values[id])
      .then(({ error }) => {
        if (error === undefined) {
          // Flag was submitted successfully
          util.toasts.useToast().add('Flag successfully submitted!')
          this.setState(prevState => ({
            solveIDs: [...prevState.solveIDs, id]
          }))
        } else {
          const nxt = this.state.errors
          nxt[id] = error

          this.setState({
            errors: nxt
          })
        }
      })
  }

  handleShowSolvesCheckbox = () => {
    this.setState(prevState => ({
      showSolved: !prevState.showSolved
    }))
  }

  renderProblem = (classes, problem, values, errors) => {
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
                          <a native href={config.staticEndpoint + '/' + file.path}>
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

  render ({ classes }, { problems, values, errors, showSolved, solveIDs }) {
    let problemsToDisplay = problems
    if (!showSolved) {
      problemsToDisplay = problems.filter(problem => !solveIDs.includes(problem.id))
    }

    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-3'>
          <div class={`frame ${classes.frame}`}>
            <div class='frame__body'>
              <div class='frame__title title'>Config</div>
              <div class='form-ext-control form-ext-checkbox'>
                <input id='check1' class='form-ext-input' type='checkbox' checked={showSolved} onClick={() => { this.handleShowSolvesCheckbox() }} />
                <label class='form-ext-label' for='check1'>Show Solved</label>
              </div>
            </div>
          </div>
        </div>
        <div class='col-6'>
          {
            problemsToDisplay.map(problem => {
              return this.renderProblem(classes, problem, values, errors)
            })
          }
        </div>

      </div>
    )
  }
})
