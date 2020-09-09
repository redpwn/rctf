import {
  forwardRef,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  RefObject,
  ChangeEvent,
  InputHTMLAttributes,
} from 'react'
import { Box, Input, Label, Text } from 'theme-ui'
import { useId } from '@reach/auto-id'

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'url' | 'search' | 'password' | 'number' | 'email'
  label?: string
  error?: boolean | string
  showError?: boolean
  id?: string
  value?: string
  disabled?: boolean
  placeholder?: string
  bg?: string
  onChange?: JSX.IntrinsicElements['input']['onChange']
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      type = 'text',
      label,
      value,
      disabled = false,
      error = false,
      showError = false,
      id: _id,
      bg = 'background',
      onChange: _onChange,
      ...props
    },
    forwardedRef
  ) => {
    const id = useId(_id)
    const [uncontrolledHasValue, setUncontrolledHasValue] = useState(!!value)

    const hasValue = !!(value ?? uncontrolledHasValue)

    const internalRef = useRef<HTMLInputElement>(null)
    const ref = (forwardedRef ?? internalRef) as RefObject<HTMLInputElement>

    const [nativeErrorMessage, setNativeErrorMessage] = useState('')
    const propErrorMessage: string =
      error === true ? 'Validation error' : error || ''
    const errorMessage: string = propErrorMessage || nativeErrorMessage

    const updateNativeErrorMessage = useCallback(() => {
      if (ref.current) {
        setNativeErrorMessage(ref.current.validationMessage)
      }
    }, [ref])

    const onChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setUncontrolledHasValue(!!e.target.value)

        updateNativeErrorMessage()

        if (_onChange) {
          _onChange(e)
        }
      },
      [_onChange, updateNativeErrorMessage]
    )

    useLayoutEffect(() => {
      updateNativeErrorMessage()
    }, [type, updateNativeErrorMessage])

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
        <Box
          sx={{
            position: 'relative',
            mt: 2,
          }}
        >
          <Input
            {...props}
            id={id}
            type={type}
            value={value}
            disabled={disabled}
            ref={ref}
            onInvalid={updateNativeErrorMessage}
            onChange={onChange}
            onInput={onChange}
            sx={{
              color: disabled ? 'muted' : 'text',
              bg,
              transition: 'all 150ms',
              '::placeholder': {
                color: 'muted',
                transition: 'all 150ms',
                opacity: 0,
              },
              ':focus': {
                outline: 'none',
                borderColor: 'primary',
                '::placeholder': {
                  opacity: 1,
                },
              },
              ':invalid': {
                boxShadow: 'none',
                borderColor: 'danger',
              },
            }}
          />
          {label && (
            <Label
              htmlFor={id}
              sx={{
                position: 'absolute',
                height: '50%',
                top: 0,
                left: 0,
                color: 'muted',
                cursor: disabled ? 'default' : 'text',
                transition: 'all 150ms ease',
                transform: 'translateY(100%)',
                transformOrigin: '0 0',
                'input:focus + &': {
                  color: 'primary',
                  cursor: 'default',
                  transform: 'translateY(0) scale(0.9)',
                },
                ...(hasValue
                  ? {
                      color: 'text',
                      cursor: 'default',
                      transform: 'translateY(0) scale(0.9)',
                    }
                  : {}),
                'input:invalid + &&': {
                  color: 'danger',
                },
              }}
            >
              <Box
                as='span'
                sx={{
                  position: 'absolute',
                  ml: 1,
                  px: 1,
                  py: 0,
                  bg,
                  top: 0,
                  transform: 'translateY(-50%)',
                }}
              >
                {label}
              </Box>
            </Label>
          )}
        </Box>
        {showError && (
          <Text
            sx={{
              color: 'danger',
            }}
          >
            {errorMessage || <br />}
          </Text>
        )}
      </>
    )
  }
)

TextInput.displayName = 'TextInput'

export default TextInput
