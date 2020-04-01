import withStyles from '../components/jss'
import { useToast } from '../components/toast'
import { useCallback } from 'preact/hooks'

export default withStyles({
  quote: {
    fontSize: 'small',
    overflowWrap: 'break-word',
    userSelect: 'all',
    fontFamily: 'monospace',
    cursor: 'pointer'
  }
}, ({ classes, token, ...props }) => {
  const { toast } = useToast()

  const onTeamCodeClick = useCallback(() => {
    if (navigator.clipboard) {
      try {
        navigator.clipboard.writeText(token).then(() => {
          toast({ body: 'Copied team code to clipboard' })
        })
      } catch (error) {
        console.error(error)
      }
    }
  }, [toast, token])

  return <blockquote class={classes.quote} onClick={onTeamCodeClick} {...props}>
    {token}
  </blockquote>
})
