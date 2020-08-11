import {
  forwardRef,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  RefObject,
  ChangeEvent,
  InputHTMLAttributes
} from 'react'
import { Box, Input, Label, Text } from 'theme-ui'
import { useId } from '@reach/auto-id'

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'url' | 'search' | 'password' | 'number' | 'email'
  label?: string
  error?: boolean | string
  showError?: boolean
  id?: string
  value?: string
  onChange?: JSX.IntrinsicElements['input']['onChange']
}

const labelAsideTransform = 'translateY(-55%) scale(0.9)'

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  type,
  label,
  value,
  error,
  showError,
  id: _id,
  onChange: _onChange,
  ...props
}, forwardedRef) => {
  const id = useId(_id)
  const [uncontrolledHasValue, setUncontrolledHasValue] = useState(!!value)

  const hasValue = !!(value ?? uncontrolledHasValue)

  const internalRef = useRef<HTMLInputElement>(null)
  const ref = (forwardedRef ?? internalRef) as RefObject<HTMLInputElement>

  const [nativeErrorMessage, setNativeErrorMessage] = useState('')
  const propErrorMessage: string = error === true ? 'Validation error' : (error || '')
  const errorMessage: string = propErrorMessage || nativeErrorMessage

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUncontrolledHasValue(!!e.target.value)

    if (ref.current) {
      setNativeErrorMessage(ref.current.validationMessage)
    }

    if (_onChange) {
      _onChange(e)
    }
  }, [ref, _onChange])

  useLayoutEffect(() => {
    if (ref.current) {
      setNativeErrorMessage(ref.current.validationMessage)
    }
  }, [type, ref])

  useLayoutEffect(() => {
    if (ref.current) {
      if (error) {
        ref.current.setCustomValidity(propErrorMessage)
      } else {
        ref.current.setCustomValidity('')
        ref.current.checkValidity()
      }
    }
  }, [ref, error, propErrorMessage])

  // END HOOKS BLOCK

  return (
    <>
      <Box sx={{
        position: 'relative',
        mt: 2
      }}>
        <Input
          {...props}
          id={id}
          type={type ?? 'text'}
          value={value}
          ref={ref}
          onChange={onChange} onInput={onChange}
          sx={{
            transition: 'all 300ms',
            willChange: 'borderColor',
            ':focus': {
              outline: 'none',
              borderColor: 'primary'
            },
            ':invalid': {
              borderColor: 'danger'
            }
          }}
        />
        {label &&
          <Label htmlFor={id} sx={{
            position: 'absolute',
            width: 'auto',
            ml: 1,
            px: 1,
            py: 0,
            bg: 'background',
            color: 'muted',
            bottom: '50%',
            transform: 'translateY(50%)',
            transformOrigin: '0 50%',
            transition: 'all 300ms ease',
            willChange: 'transform color',
            'input:focus + &': {
              color: 'primary',
              transform: labelAsideTransform
            },
            ...(hasValue ? {
              color: 'text',
              transform: labelAsideTransform
            } : {}),
            'input:invalid + &&': {
              color: 'danger'
            }
          }}>
            {label}
          </Label>
        }
      </Box>
      {showError && errorMessage &&
        <Text sx={{
          color: 'danger'
        }}>
          {errorMessage}
        </Text>
      }
    </>
  )
})

TextInput.displayName = 'TextInput'

export default TextInput
