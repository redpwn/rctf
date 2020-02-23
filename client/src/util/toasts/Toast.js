import React, { useEffect, useRef } from 'preact/compat'

function Toast ({ children, remove }) {
  const removeRef = useRef()
  removeRef.current = remove

  useEffect(() => {
    const duration = 1000 * 5
    const id = setTimeout(() => removeRef.current(), duration)

    return () => clearTimeout(id)
  }, [])

  return (
    <div className='toast toast--success'>
      <button onClick={remove} className='btn-close' />
      {children}
    </div>
  )
}

export default Toast
