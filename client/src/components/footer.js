import withStyles from './jss'

const Footer = ({ classes }) => (
  <div class={classes.root}>
    <span>
      Powered by <a href='https://rctf.redpwn.net/' target='_blank' rel='noopener noreferrer'>rCTF</a>
    </span>
  </div>
)

export default withStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
    '& a': {
      display: 'inline',
      padding: 0
    },
    fontSize: '0.85rem',
    opacity: 0.5,
    '&:hover': {
      opacity: 1
    },
    transition: 'opacity 300ms ease'
  }
}, Footer)
