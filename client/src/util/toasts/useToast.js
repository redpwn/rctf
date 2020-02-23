import { useContext } from 'preact/compat'
import ToastContext from './context'

function useToast () {
  const context = useContext(ToastContext)

  return { add: context.add, remove: context.remove }
}

export default useToast
