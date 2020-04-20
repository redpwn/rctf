import { Component } from 'preact'
import Form from '../components/form'
import config from '../../../config/client'
import 'linkstate/polyfill'
import withStyles from '../components/jss'
import { register } from '../api/auth'
import UserCircle from '../icons/user-circle.svg'

export default withStyles({
  root: {
    padding: '1.5em'
  },
  submit: {
    marginTop: '1.5em'
  },
  title: {
    textAlign: 'center'
  }
}, class CtftimeAdditional extends Component {
  state = {
    showName: false,
    disabledButton: false,
    division: '',
    name: '',
    errors: {}
  }

  render ({ classes }, { showName, disabledButton, division, name, errors }) {
    return (
      <div class='row u-center'>
        <h4 class={`col-12 ${classes.title}`}>Finish registration</h4>
        <Form class={`${classes.root} col-6`} onSubmit={this.handleSubmit} disabled={disabledButton} errors={errors} buttonText='Register'>
          <select required class='select' name='division' value={division} onChange={this.linkState('division')}>
            <option value='' disabled selected>Division</option>
            {
              Object.entries(config.divisions).map(([name, code]) => {
                return <option key={code} value={code}>{name}</option>
              })
            }
          </select>
          {showName && (
            <input autofocus required icon={<UserCircle />} name='name' placeholder='Team Name' type='text' value={name} onChange={this.linkState('name')} />
          )}
        </Form>
      </div>
    )
  }

  handleSubmit = (e) => {
    e.preventDefault()

    this.setState({
      disabledButton: true
    })

    register({
      ctftimeToken: this.props.ctftimeToken,
      division: this.state.division,
      name: this.state.name || undefined
    })
      .then(errors => {
        if (!errors) {
          return
        }
        if (errors.name) {
          this.setState({
            showName: true
          })
        }

        this.setState({
          errors,
          disabledButton: false
        })
      })
  }
})
