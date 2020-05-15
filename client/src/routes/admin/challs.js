import { useState, useEffect } from 'preact/hooks'

import config from '../../config'
import withStyles from '../../components/jss'
import Problem from '../../components/admin/problem'

import { getChallenges } from '../../api/admin/challs'

const Challenges = ({ classes }) => {
  const [problems, setProblems] = useState([])

  useEffect(() => {
    document.title = `Challenges${config.ctfTitle}`
  }, [])

  useEffect(() => {
    const action = async () => {
      setProblems(await getChallenges())
    }
    action()
  }, [])

  return (
    <div class={`row ${classes.row}`}>
      <div class='col-9'>
        {
          problems.map(problem => {
            return (
              <Problem key={problem.id} problem={problem} />
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
