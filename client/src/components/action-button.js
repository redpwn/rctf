import withStyles from './jss'

const ActionButton = withStyles({
  root: {
    padding: '16px !important',
    color: '#fff',
    background: '#222',
    boxShadow: 'rgba(250,250,250,0.6) 0px 0px 1rem 0px',
    fontSize: '20px',
    borderRadius: '1rem',
    textAlign: 'center',
    transition: 'box-shadow ease-in-out 0.2s, transform ease-in-out 0.2s',
    margin: '20px auto',
    '&:hover': {
      boxShadow: 'rgba(250,250,250,0.6) 0px 0px 1.1rem 0px',
      transform: 'scale(1.1)',
      color: '#fff'
    },
    '& svg': {
      height: '1em',
      position: 'relative',
      top: '0.125em'
    }
  }
}, ({ classes, ...rest }) => (
  <div class='row'>
    <a class={classes.root} {...rest} />
  </div>
))

export default ActionButton
