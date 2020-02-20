import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { getScoreboard } from '../api/scoreboard'

export default withStyles({
  frame: {
    paddingBottom: '10px'
  }
}, class Scoreboard extends Component {
  state = {
    scores: [],
    division: 0
  }

  componentDidMount () {
    document.title = 'Scoreboard' + config.ctfTitle

    getScoreboard()
      .then(data => {
        this.setState({
          scores: data.leaderboard
        })
      })
  }

  render ({ classes }, { scores, division }) {
    console.log(scores)
    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-3'>
          <div class={`frame ${classes.frame}`}>
            <div class='frame__body'>
              <div class='frame__title title'>Config</div>
              <div class='input-control'>
                <select required class='select' name='division' value={division} onChange={this.linkState('division')}>
                  <option value='' disabled selected>Division</option>
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
                        <td>{idx + 1}</td>
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
  }
})
