import { useCallback, useState, useEffect } from 'preact/hooks'

import config from '../../../config/client'
import withStyles from '../components/jss'
import Problem from '../components/problem'

import { getChallenges, getPrivateSolves } from '../api/challenges'

const Challenges = ({ classes }) => {
  const [problems, setProblems] = useState([])
  const [categories, setCategories] = useState({})
  const [showSolved, setShowSolved] = useState(false)
  const [solveIDs, setSolveIDs] = useState([])

  const setSolvedFn = useCallback(id => () => {
    if (!solveIDs.includes(id)) {
      setSolveIDs([...solveIDs, id])
    }
  }, [solveIDs])

  const handleInvertShowSolved = useCallback(() => {
    setShowSolved(!showSolved)
  }, [showSolved])

  const handleInvertCategoryStateFn = prop => () => {
    setCategories({
      ...categories,
      [prop]: !categories[prop]
    })
  }

  useEffect(() => {
    document.title = `Challenges${config.ctfTitle}`

    getChallenges()
      .then(problems => {
        const categories = {}
        problems.forEach(problem => {
          if (categories[problem.category] === undefined) {
            categories[problem.category] = false
          }
        })

        setProblems(problems)
        setCategories(categories)
      })

    getPrivateSolves()
      .then(data => {
        const solveIDs = []
        data.map(solve => solveIDs.push(solve.id))

        setSolveIDs(solveIDs)
      })
  }, [])

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
                <input id='check1' class='form-ext-input' type='checkbox' checked={showSolved} onClick={handleInvertShowSolved} />
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
                return (
                  <div key={category} class='form-ext-control form-ext-checkbox'>
                    <input id={category} class='form-ext-input' type='checkbox' checked={categories[category]} onClick={handleInvertCategoryStateFn(category)} />
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
            return (
              <Problem key={problem.id} problem={problem} setSolved={setSolvedFn(problem.id)} />
            )
          })
        }
      </div>

    </div>
  )
}

export default withStyles({
  showSolved: {
    marginBottom: '0.625em'
  },
  frame: {
    marginBottom: '1em',
    paddingBottom: '0.625em'
  }
}, Challenges)
