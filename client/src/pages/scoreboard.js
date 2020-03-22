import { useState, useEffect, useCallback } from 'preact/hooks'
import config from '../../../config/client'
import withStyles from '../components/jss'

import { getScoreboard } from '../api/scoreboard'

const TEAMS_PER_PAGE = 100

const Scoreboard = withStyles({
  frame: {
    paddingBottom: '10px'
  }
}, ({ classes }) => {
  const [scores, setScores] = useState([])
  const [division, setDivision] = useState('')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  const divisionChangeHandler = useCallback((e) => setDivision(e.target.value), [setDivision])

  useEffect(() => { document.title = `Scoreboard${config.ctfTitle}` }, [])
  useEffect(() => {
    const _division = division === '' ? undefined : division
    console.log(_division)
    getScoreboard({
      division: _division,
      offset: (page - 1) * TEAMS_PER_PAGE,
      limit: TEAMS_PER_PAGE
    })
      .then(data => {
        setScores(data.leaderboard)
        setTotalItems(data.total)
      })
  }, [division, page])

  return (
    <div class='row u-center' style='align-items: initial !important'>
      <div class='col-3'>
        <div class={`frame ${classes.frame}`}>
          <div class='frame__body'>
            <div class='frame__title title'>Config</div>
            <div class='input-control'>
              <select required class='select' name='division' value={division} onChange={divisionChangeHandler}>
                <option value='' selected>All</option>
                <option value='0'>High School</option>
                <option value='1'>College</option>
                <option value='2'>Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class='col-6'>
        <div class={`frame ${classes.frame}`} style='padding-top: 25px'>
          <div class='frame__body'>
            <table class='table small'>
              <thead>
                <tr>
                  <th style='width: 10px'>#</th>
                  <th>Team</th>
                  <th style='width: 50px'>Points</th>
                </tr>
              </thead>
              <tbody>
                {
                  scores.map(({ id, name, score }, idx) =>
                    <tr key={id}>
                      <td>{idx + 1 + (page - 1) * TEAMS_PER_PAGE}</td>
                      <td>
                        <a href={`/profile/${id}`}>{name}</a>
                      </td>
                      <td>{score}</td>
                    </tr>
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Scoreboard
