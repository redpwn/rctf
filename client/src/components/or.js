import withStyles from '../components/jss'

export default withStyles({
  root: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    margin: '15px auto',
    maxWidth: '500px',
    '&::before, &::after': {
      display: 'block',
      content: '""',
      flex: '1 0 0',
      height: '0',
      borderTop: '1px solid #333'
    },
    '& > *': {
      marginLeft: 'var(--gap-4)',
      marginRight: 'var(--gap-4)',
      fontVariant: 'small-caps',
      fontSize: '1.0rem'
    }
  }
}, ({ classes, ...props }) => {
  return (
    <div class='col-12' {...props} >
      <div class={classes.root}>
        <h6>or</h6>
      </div>
    </div>
  )
})
