import { Component } from 'preact'
import config from '../config'
import 'linkstate/polyfill'
import withStyles from '../components/jss'

import { getChallenges } from '../api/challenges'

export default withStyles({
  problem: {
    marginBottom: '15px',
    paddingBottom: '10px'
  },
  divider: {
    margin: '10px',
    width: '80%'
  }
}, class Profile extends Component {
  state = {
    problems: []
  }

  componentDidMount () {
    document.title = 'Challenges' + config.ctfTitle

    getChallenges()
      .then(problems => {
        this.setState({
          problems
        })
      })
  }

  render ({ classes }, { problems }) {
    return (
      <div class='row u-center' style='align-items: initial !important'>
        <div class='col-2'>
          Config settings here
        </div>
        <div class='col-6'>
          {
            problems.map(problem => {
              const hasDownloads = problem.files.length !== 0
              return (
                <div class={`frame ${classes.problem}`} key={problem.id}>
                  <div class='frame__body'>
                    <div class='frame__title title'>{problem.name}</div>
                    <div class='frame__subtitle u-no-margin'>{problem.author}</div>
                    <div class='content-no-padding u-center'><div class={`divider ${classes.divider}`} /></div>
                    <div class='frame__subtitle'>{problem.description}</div>

                    {
                      hasDownloads &&
                        <div>
                          <p class='faded frame__subtitle u-no-margin'>Downloads</p>
                          <div class='tag-container'>
                            {
                              problem.files.map(file => {
                                return (
                                  <div class='tag' key={file.path}>
                                    <a href={config.staticEndpoint + '/' + file.path}>
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
            })
          }
        </div>

      </div>
    )
  }
})
