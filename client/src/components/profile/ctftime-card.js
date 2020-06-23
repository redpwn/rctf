import { Fragment } from 'preact'
import withStyles from '../jss'
import { putCtftime, deleteCtftime } from '../../api/auth'
import { useCallback } from 'preact/hooks'
import { useToast } from '../toast'
import CtftimeButton from '../ctftime-button'

const CtftimeCard = withStyles({
  ctftimeButton: {
    '& button': {
      borderColor: '#d9d9d9 !important'
    }
  }
}, ({ classes, ctftimeId, onUpdate }) => {
  const { toast } = useToast()

  const handleCtftimeDone = useCallback(async ({ ctftimeToken, ctftimeId }) => {
    const { kind, message } = await putCtftime({ ctftimeToken })
    if (kind !== 'goodCtftimeAuthSet') {
      toast({ body: message, type: 'error' })
      return
    }
    onUpdate({ ctftimeId })
  }, [toast, onUpdate])

  const handleRemoveClick = useCallback(async () => {
    const { kind, message } = await deleteCtftime()
    if (kind !== 'goodCtftimeRemoved') {
      toast({ body: message, type: 'error' })
      return
    }
    onUpdate({ ctftimeId: null })
  }, [toast, onUpdate])

  return (
    <div class='card'>
      <div class='content'>
        <p>CTFtime Integration</p>
        {ctftimeId === null ? (
          <Fragment>
            <p class='font-thin u-no-margin'>To login with CTFtime and get a badge on your profile, connect CTFtime to your account.</p>
            <div class='row u-center'>
              <CtftimeButton class={classes.ctftimeButton} onCtftimeDone={handleCtftimeDone} />
            </div>
          </Fragment>
        ) : (
          <Fragment>
            <p class='font-thin u-no-margin'>Your account is already connected to CTFtime. You can disconnect CTFtime from your account.</p>
            <div class='row u-center'>
              <button class='btn-info u-center' onClick={handleRemoveClick}>Remove</button>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  )
})

export default CtftimeCard
