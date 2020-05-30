import withStyles from './jss'
import { useToast } from './toast'
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
          toast({ body: 'Copied team invite URL to clipboard' })
        })
      } catch (error) {
        console.error(error)
      }
    }
  }, [toast, token])

  return (
    <blockquote class={classes.quote} onClick={onTeamCodeClick} {...props}>
      {token}
    </blockquote>
  )
})
