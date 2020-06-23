import { useState, useEffect } from 'preact/hooks'
import { createPortal } from 'preact/compat'
import withStyles from './jss'

const ANIMATION_DURATION = 150

function Modal ({
  classes, open, onClose, children
}) {
  const [isLinger, setIsLinger] = useState(open)

  useEffect(() => {
    if (open) {
      setIsLinger(true)
    } else {
      const timer = setTimeout(() => {
        setIsLinger(false)
      }, ANIMATION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [open])

  useEffect(() => {
    function listener (e) {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('keyup', listener)
      return () => document.removeEventListener('keyup', listener)
    }
  }, [open, onClose])

  return (open || isLinger) && createPortal((
    <div class={`modal shown ${classes.animated}${open ? '' : ' leaving'}`} hidden={!(open || isLinger)}>
      <div class='modal-overlay' onClick={onClose} aria-label='Close' />
      <div class={`modal-content ${classes.modal}`} role='document'>
        {children}
      </div>
    </div>
  ), document.body)
}

const ANIMATION_INITIAL_SCALE = 0.8

export default withStyles({
  '@keyframes container': {
    from: {
      opacity: 0
    },
    to: {
      opactiy: 1
    }
  },
  '@keyframes content': {
    from: {
      transform: `scale(${ANIMATION_INITIAL_SCALE})`
    },
    to: {
      transform: 'scale(1)'
    }
  },
  modal: {
    background: '#222',
    color: '#fff',
    maxWidth: 'initial'
  },
  animated: {
    '&': {
      display: 'flex',
      animation: `$container ${ANIMATION_DURATION}ms ease-out`
    },
    '& .modal-content': {
      animation: `$content ${ANIMATION_DURATION}ms ease-out`
    },
    '&.leaving': {
      opacity: 0,
      transition: `opacity ${ANIMATION_DURATION}ms ease-in`
    },
    '&.leaving .modal-content': {
      transform: `scale(${ANIMATION_INITIAL_SCALE})`,
      transition: `transform ${ANIMATION_DURATION}ms ease-in`
    }
  }
}, Modal)
