import withStyles from '../components/jss'

export default withStyles({
  quote: {
    fontSize: 'small',
    overflowWrap: 'break-word',
    userSelect: 'all',
    fontFamily: 'monospace'
  }
}, ({ classes, token, ...props }) => {
  return <blockquote class={classes.quote} {...props}>
    {token}
  </blockquote>
})
