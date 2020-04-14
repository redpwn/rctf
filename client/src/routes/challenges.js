import { Component } from 'preact'
import { useCallback } from 'preact/hooks'
import snarkdown from 'snarkdown'
import Markup from 'preact-markup'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { getChallenges, submitFlag, getPrivateSolves } from '../api/challenges'
import { withToast } from '../components/toast'

export default withStyles({
  frame: {
    marginBottom: '1em',
    paddingBottom: '0.625em'
  },
  divider: {
    margin: '0.625em',
    width: '80%'
  },
  showSolved: {
    marginBottom: '0.625em'
  },
  description: {
    '& a': {
      display: 'inline',
      padding: 0
    }
  }
}, withToast(class Challenges extends Component {
  state = {
    problems: [],
    categories: {}, // Dict with {string name, bool filter}
    values: {},
    errors: {},
    showSolved: false,
    solveIDs: []
  }

  componentDidMount () {
    document.title = `Challenges${config.ctfTitle}`

    getChallenges()
      .then(problems => {
        const categories = {}
        problems.forEach(problem => {
          if (categories[problem.category] === undefined) {
            categories[problem.category] = false
          }
        })
        this.setState({
          problems,
          categories
        })
      })

    getPrivateSolves()
      .then(data => {
        const solveIDs = []
        data.map(solve => solveIDs.push(solve.id))
        this.setState({
          solveIDs
        })
      })
  }

  submitFlag = id => e => {
    e.preventDefault()

    submitFlag(id, this.state.values[id])
      .then(({ error }) => {
        if (error === undefined) {
          // Flag was submitted successfully
          this.props.toast({ body: 'Flag successfully submitted!', type: 'success' })
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

  handleInvertShowSolved = () => {
    this.setState(prevState => ({
      showSolved: !prevState.showSolved
    }))
  }

  handleInvertCategoryState = (propertyName) => {
    this.setState(prevState => ({
      categories: {
        ...prevState.categories,
        [propertyName]: !prevState.categories[propertyName]
      }
    }))
  }

  renderProblem = (classes, problem, values, errors) => {
    const hasDownloads = problem.files.length !== 0

    const error = errors[problem.id]
    const hasError = error !== undefined
    console.log(snarkdown(problem.description))
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

          <div class={`${classes.description} frame__subtitle`}>
            <Markup type='html' trim={false} markup={snarkdown(problem.description)} />
          </div>
          <form class='form-section' onSubmit={this.submitFlag(problem.id)}>

            {
              hasError &&
                <label class='text-danger info font-light'>{error}</label>
            }
            <div class='form-group'>
              <input class={`form-group-input input-small ${hasError ? 'input-error' : ''}`} placeholder='Flag' value={values[problem.id]} onChange={this.linkState(`values.${problem.id}`)} />
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
                          <a native href={`${config.staticEndpoint}/${file.path}`}>
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

  render ({ classes }, { problems, categories, values, errors, showSolved, solveIDs }) {
    let problemsToDisplay = problems
    if (!showSolved) {
      problemsToDisplay = problemsToDisplay.filter(problem => !solveIDs.includes(problem.id))
    }
    let filterCategories = false
    Object.values(categories).forEach(displayCategory => {
      if (displayCategory) filterCategories = true
    })
    if (filterCategories) {
      Object.keys(categories).forEach(category => {
        if (categories[category] === false) {
          // Do not display this category
          problemsToDisplay = problemsToDisplay.filter(problem => problem.category !== category)
        }
      })
    }

    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-3'>
          <div class={`frame ${classes.frame}`}>
            <div class='frame__body'>
              <div class='frame__title title'>Filters</div>
              <div class={classes.showSolved}>
                <div class='form-ext-control form-ext-checkbox'>
                  <input id='check1' class='form-ext-input' type='checkbox' checked={showSolved} onClick={this.handleInvertShowSolved} />
                  <label class='form-ext-label' for='check1'>Show Solved</label>
                </div>
              </div>
            </div>
          </div>
          <div class={`frame ${classes.frame}`}>
            <div class='frame__body'>
              <div class='frame__title title'>Categories</div>
              {
                Object.keys(categories).map(category => {
                  const clickHander = useCallback(
                    () => this.handleInvertCategoryState(category),
                    [category]
                  )
                  return (
                    <div key={category} class='form-ext-control form-ext-checkbox'>
                      <input id={category} class='form-ext-input' type='checkbox' checked={categories[category]} onClick={clickHander} />
                      <label class='form-ext-label' for={category}>{category}</label>
                    </div>
                  )
                })
              }
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
}))
