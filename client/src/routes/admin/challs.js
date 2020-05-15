import { useState, useEffect } from 'preact/hooks'
import { v4 as uuid } from 'uuid'

import config from '../../config'
import withStyles from '../../components/jss'
import Problem from '../../components/admin/problem'

import { getChallenges } from '../../api/admin/challs'

const SAMPLE_PROBLEM = {
  name: '',
  descriptions: '',
  category: '',
  author: '',
  files: [],
  points: {
    min: 0,
    max: 0
  }
}

const Challenges = ({ classes }) => {
  const [problems, setProblems] = useState([])
  const [newId, setNewId] = useState(uuid())

  useEffect(() => setNewId(uuid()), [problems])

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
          problems.concat({
            ...SAMPLE_PROBLEM,
            id: newId
          }).map(problem => {
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
