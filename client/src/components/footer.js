import withStyles from './jss'

const Footer = ({ classes }) => (
  <div class={classes.root}>
    <audio autoPlay loop id='musicPlay'>
      <source src='https://blog.ammaraskar.com/assets/misc_files/keygen-boosted-lowbitrate.mp3' type='audio/mpeg' />
    </audio>
    <span>
      Powered by <a href='https://rctf.redpwn.net/' target='_blank' rel='noopener noreferrer'>rCTF</a>
    </span>
  </div>
)

export default withStyles({
  root: {
    backgroundImage: 'url("https://www.cameronsworld.net/img/content/22/left-side/28.gif")',
    display: 'flex',
    justifyContent: 'center',
    padding: '1rem',
    '& a': {
      display: 'inline',
      padding: 0
    },
    fontSize: '0.85rem',
    opacity: 0.7,
    '&:hover': {
      opacity: 1
    },
    transition: 'opacity 300ms ease'
  }
}, Footer)
