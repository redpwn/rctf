import withStyles from './jss'

export default withStyles({
  root: {
    padding: '25px'
  },
  submit: {
    marginTop: '25px'
  },
  icon: {
    '& svg': {
      verticalAlign: 'middle',
      height: '16px',
      fill: '#333'
    }
  }
}, (props) => {
  const { classes, children, onSubmit, disabled, buttonText, errors } = props

  return (
    <form onSubmit={onSubmit} class={props.class}>
      {
        [].concat(children).map(input => {
          let { icon, error, name } = input.props

          if (errors !== undefined && name !== undefined) error = error || errors[name]
          const hasError = error !== undefined

          input.props.class += ' input-contains-icon'
          if (hasError) {
            input.props.class += ' input-error'
          }
          return (
            <div class='form-section' key={name}>
              {
                hasError &&
                  <label class='text-danger info font-light'>{error}</label>
              }
              <div class={`${classes.input} input-control`}>
                {input}
                <span class='icon'>
                  {icon !== undefined &&
                    <div class={`icon ${classes.icon}`}>
                      {icon}
                    </div>}
                </span>
              </div>
            </div>
          )
        })
      }
      <button disabled={disabled} class={`${classes.submit} btn-info u-center`} name='btn' value='submit' type='submit'>{buttonText}</button>
      <span class='fg-danger info' />
    </form>
  )
})
