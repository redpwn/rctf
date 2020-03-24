import { useState, useEffect } from 'preact/hooks'
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

  // For some reason unmounting portals causes Preact to crash, so just don't
  // render the modal in a portal as Cirrus already applies styles to make the
  // modal appear over everything from anywhere in the tree.
  return (open || isLinger) &&
    <div class={`modal shown ${classes.animated}${open ? '' : ' leaving'}`} hidden={!(open || isLinger)}>
      <div class='modal-overlay' onClick={onClose} aria-label='Close' />
      <div class='modal-content' role='document'>
        {children}
      </div>
    </div>
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
