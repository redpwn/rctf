import { createContext } from 'preact'
import { useState, useContext, useCallback, useEffect } from 'preact/hooks'
import withStyles from './jss'

const ToastCtx = createContext()

// Use sequential IDs
let toastIdCounter = 0

function genToastId () {
  return toastIdCounter++
}

function Toast ({ children, remove, type, id }) {
  const wrappedRemove = useCallback(() => remove(id), [remove, id])
  useEffect(() => {
    const duration = 1000 * 5
    const timeout = setTimeout(wrappedRemove, duration)

    return () => clearTimeout(timeout)
  }, [wrappedRemove])

  return (
    <div className={`toast toast--${type}`}>
      {children}
      <button onClick={wrappedRemove} className='btn-close' />
    </div>
  )
}

const ToastContainer = withStyles({
  container: {
    position: 'fixed',
    top: '1em',
    right: '1em',
    zIndex: 9999,
    width: '320px'
  }
}, ({ classes, ...props }) => <div class={classes.container} {...props} />)

export function ToastProvider ({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts(toasts => toasts.filter(t => id !== t.id))
  }, [])
  const add = useCallback((data) => {
    const id = genToastId()
    const toast = {
      ...data,
      id
    }
    setToasts(toasts => [...toasts, toast])
    return () => remove(id)
  }, [remove])

  return (
    <ToastCtx.Provider value={add}>
      {children}
      { toasts.length > 0 &&
        <ToastContainer>
          { toasts.map(({ id, type, body }) =>
            <Toast type={type} key={id} id={id} remove={remove}>
              {body}
            </Toast>
          )}
        </ToastContainer>
      }
    </ToastCtx.Provider>
  )
}

export function useToast () {
  const toast = useContext(ToastCtx)

  return { toast }
}

export function withToast (Component) {
  return function Toasted (props) {
    const { toast } = useToast()
    return (
      <Component {...props} toast={toast} />
    )
  }
}
