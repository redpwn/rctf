import { useCallback, useState, useEffect, useMemo } from 'preact/hooks'

import config from '../config'
import withStyles from '../components/jss'
import Problem from '../components/problem'
import NotStarted from '../components/not-started'
import { useToast } from '../components/toast'

import { getChallenges, getPrivateSolves } from '../api/challenges'

const loadStates = {
  pending: 0,
  notStarted: 1,
  loaded: 2
}

const Challenges = ({ classes }) => {
  const [problems, setProblems] = useState([])
  const [categories, setCategories] = useState({})
  const [showSolved, setShowSolved] = useState(false)
  const [solveIDs, setSolveIDs] = useState([])
  const [loadState, setLoadState] = useState(loadStates.pending)
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
      [e.target.dataset.category]: e.target.checked
    }))
  }, [])

  useEffect(() => {
    document.title = `Challenges${config.ctfTitle}`
  }, [])

  useEffect(() => {
    const action = async () => {
      const { data, error, notStarted } = await getChallenges()
      if (error) {
        toast({ body: error, type: 'error' })
        return
      }

      setLoadState(notStarted ? loadStates.notStarted : loadStates.loaded)
      if (notStarted) {
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
  }, [toast])

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
  }, [toast])

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

    filtered.sort((a, b) => {
      if (a.points === b.points) {
        if (a.solves === b.solves) {
          const aWeight = a.sortWeight || 0
          const bWeight = b.sortWeight || 0

          return bWeight - aWeight
        }
        return b.solves - a.solves
      }
      return a.points - b.points
    })

    return filtered
  }, [problems, categories, showSolved, solveIDs])

  const { categoryCounts, solvedCount } = useMemo(() => {
    const categoryCounts = new Map()
    let solvedCount = 0
    for (const problem of problems) {
      const solved = solveIDs.includes(problem.id)
      if (!categoryCounts.has(problem.category)) {
        categoryCounts.set(problem.category, {
          total: 1,
          solved: solved ? 1 : 0
        })
      } else {
        categoryCounts.get(problem.category).total += 1
        if (solved) {
          categoryCounts.get(problem.category).solved += 1
        }
      }
      if (solved) {
        solvedCount += 1
      }
    }
    return { categoryCounts, solvedCount }
  }, [problems, solveIDs])

  if (loadState === loadStates.pending) {
    return null
  }

  if (loadState === loadStates.notStarted) {
    return <NotStarted />
  }

  return (
    <div class={`row ${classes.row}`}>
      <div class='col-3'>
        <div class={`frame ${classes.frame}`}>
          <div class='frame__body'>
            <div class='frame__title title'>Filters</div>
            <div class={classes.showSolved}>
              <div class='form-ext-control form-ext-checkbox'>
                <input id='show-solved' class='form-ext-input' type='checkbox' checked={showSolved} onChange={handleShowSolvedChange} />
                <label for='show-solved' class='form-ext-label'>Show Solved ({solvedCount}/{problems.length} solved)</label>
              </div>
            </div>
          </div>
        </div>
        <div class={`frame ${classes.frame}`}>
          <div class='frame__body'>
            <div class='frame__title title'>Categories</div>
            {
              Object.entries(categories).sort((a, b) => a[0].localeCompare(b[0])).map(([category, checked]) => {
                return (
                  <div key={category} class='form-ext-control form-ext-checkbox'>
                    <input id={`category-${category}`} data-category={category} class='form-ext-input' type='checkbox' checked={checked} onChange={handleCategoryCheckedChange} />
                    <label for={`category-${category}`} class='form-ext-label'>{category} ({categoryCounts.get(category).solved}/{categoryCounts.get(category).total} solved)</label>
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
    paddingBottom: '0.625em',
    background: '#222'
  },
  row: {
    justifyContent: 'center',
    '& .title, & .frame__subtitle': {
      color: '#fff'
    }
  }
}, Challenges)
