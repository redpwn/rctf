import { useCallback, useState, useEffect, useMemo } from 'preact/hooks'

import config from '../config'
import withStyles from '../components/jss'
import Problem from '../components/problem'
import { useToast } from '../components/toast'

import { getChallenges, getPrivateSolves } from '../api/challenges'

const Challenges = ({ classes }) => {
  const [problems, setProblems] = useState([])
  const [categories, setCategories] = useState({})
  const [showSolved, setShowSolved] = useState(false)
  const [solveIDs, setSolveIDs] = useState([])
  const { toast } = useToast()

  const setSolved = useCallback(id => {
    setSolveIDs(solveIDs => {
      if (!solveIDs.includes(id)) {
        return [...solveIDs, id]
      }
      return solveIDs
    })
  }, [])

  const handleShowSolvedChange = useCallback(e => {
    setShowSolved(e.target.checked)
  }, [])

  const handleCategoryCheckedChange = useCallback(e => {
    setCategories(categories => ({
      ...categories,
      [e.target.id]: e.target.checked
    }))
  }, [])

  useEffect(() => {
    document.title = `Challenges${config.ctfTitle}`
  }, [])

  useEffect(() => {
    const action = async () => {
      const { data, error } = await getChallenges()
      if (error) {
        toast({ body: error, type: 'error' })
        return
      }

      const problems = data
      const categories = {}
      problems.forEach(problem => {
        if (categories[problem.category] === undefined) {
          categories[problem.category] = false
        }
      })

      setProblems(problems)
      setCategories(categories)
    }
    action()
  }, [])

  useEffect(() => {
    const action = async () => {
      const { data, error } = await getPrivateSolves()
      if (error) {
        toast({ body: error, type: 'error' })
        return
      }

      setSolveIDs(data.map(solve => solve.id))
    }
    action()
  }, [])

  const problemsToDisplay = useMemo(() => {
    let filtered = problems
    if (!showSolved) {
      filtered = filtered.filter(problem => !solveIDs.includes(problem.id))
    }
    let filterCategories = false
    Object.values(categories).forEach(displayCategory => {
      if (displayCategory) filterCategories = true
    })
    if (filterCategories) {
      Object.keys(categories).forEach(category => {
        if (categories[category] === false) {
          // Do not display this category
          filtered = filtered.filter(problem => problem.category !== category)
        }
      })
    }
    return filtered
  }, [problems, categories, showSolved, solveIDs])

  return (
    <div class={`row ${classes.row}`}>
      <div class='col-3'>
        <div class={`frame ${classes.frame}`}>
          <div class='frame__body'>
            <div class='frame__title title'>Filters</div>
            <div class={classes.showSolved}>
              <div class='form-ext-control form-ext-checkbox'>
                <input id='check1' class='form-ext-input' type='checkbox' checked={showSolved} onChange={handleShowSolvedChange} />
                <label class='form-ext-label' for='check1'>Show Solved</label>
              </div>
            </div>
          </div>
        </div>
        <div class={`frame ${classes.frame}`}>
          <div class='frame__body'>
            <div class='frame__title title'>Categories</div>
            {
              Object.entries(categories).map(([category, checked]) => {
                return (
                  <div key={category} class='form-ext-control form-ext-checkbox'>
                    <input id={category} class='form-ext-input' type='checkbox' checked={checked} onChange={handleCategoryCheckedChange} />
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
              <Problem
                key={problem.id}
                problem={problem}
                solved={solveIDs.includes(problem.id)}
                setSolved={setSolved}
              />
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
  },
  row: {
    justifyContent: 'center'
  }
}, Challenges)
