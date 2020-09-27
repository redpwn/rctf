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
  const challPageState = useMemo(() => JSON.parse(localStorage.getItem('challPageState') || '{}'), [])
  const [problems, setProblems] = useState(null)
  const [categories, setCategories] = useState(challPageState.categories || {})
  const [showSolved, setShowSolved] = useState(challPageState.showSolved || false)
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
    document.title = `Challenges | ${config.ctfName}`
  }, [])

  useEffect(() => {
    const action = async () => {
      if (problems !== null) {
        return
      }
      const { data, error, notStarted } = await getChallenges()
      if (error) {
        toast({ body: error, type: 'error' })
        return
      }

      setLoadState(notStarted ? loadStates.notStarted : loadStates.loaded)
      if (notStarted) {
        return
      }

      const newCategories = { ...categories }
      data.forEach(problem => {
        if (newCategories[problem.category] === undefined) {
          newCategories[problem.category] = false
        }
      })

      setProblems(data)
      setCategories(newCategories)
    }
    action()
  }, [toast, categories, problems])

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

  useEffect(() => {
    localStorage.challPageState = JSON.stringify({ categories, showSolved })
  }, [categories, showSolved])

  const problemsToDisplay = useMemo(() => {
    if (problems === null) {
      return []
    }
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
    if (problems !== null) {
      for (const problem of problems) {
        if (!categoryCounts.has(problem.category)) {
          categoryCounts.set(problem.category, {
            total: 0,
            solved: 0
          })
        }

        const solved = solveIDs.includes(problem.id)
        categoryCounts.get(problem.category).total += 1
        if (solved) {
          categoryCounts.get(problem.category).solved += 1
        }

        if (solved) {
          solvedCount += 1
        }
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
              Array.from(categoryCounts.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([category, { solved, total }]) => {
                return (
                  <div key={category} class='form-ext-control form-ext-checkbox'>
                    <input id={`category-${category}`} data-category={category} class='form-ext-input' type='checkbox' checked={categories[category]} onChange={handleCategoryCheckedChange} />
                    <label for={`category-${category}`} class='form-ext-label'>{category} ({solved}/{total} solved)</label>
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
