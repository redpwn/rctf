import { Fragment } from 'preact'
import { useState, useCallback } from 'preact/hooks'
import Modal from './modal'
import { logout } from '../api/auth'

function LogoutDialog ({ onClose, ...props }) {
  const wrappedOnClose = useCallback(e => {
    e.preventDefault()
    onClose()
  }, [onClose])
  const doLogout = useCallback(e => {
    e.preventDefault()
    logout()
    onClose()
  }, [onClose])

  return (
    <Modal {...props} onClose={onClose}>
      <div class='modal-header'>
        <div class='modal-title'>Logout</div>
      </div>
      <div class='modal-body'>
        <div>Make sure you have saved your team code, or you may not be able to login again!</div>
      </div>
      <div class='modal-footer'>
        <div class='btn-container u-inline-block'>
          <button class='btn-small' onClick={wrappedOnClose}>Cancel</button>
        </div>
        <div class='btn-container u-inline-block'>
          <button class='btn-small btn-danger outline' onClick={doLogout}>Logout</button>
        </div>
      </div>
    </Modal>
  )
}

function LogoutButton ({ ...props }) {
  const [isDialogVisible, setIsDialogVisible] = useState(false)
  const onClick = useCallback(e => {
    e.preventDefault()
    setIsDialogVisible(true)
  }, [])
  const onClose = useCallback(() => setIsDialogVisible(false), [])

  return (
    <Fragment>
      <a {...props} href='#' native onClick={onClick}>
        Logout
      </a>
      <LogoutDialog open={isDialogVisible} onClose={onClose} />
    </Fragment>
  )
}

export default LogoutButton
