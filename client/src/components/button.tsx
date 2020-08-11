import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Button as ThemeUIButton } from 'theme-ui'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string
  disabled?: boolean
  outline?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant: _variant,
  disabled,
  outline,
  ...props
}, forwardedRef) => {
  const variant = _variant ?? 'primary'

  return (
    <ThemeUIButton
      {...props}
      disabled={disabled}
      ref={forwardedRef}
      sx={outline ? {
        bg: 'transparent',
        borderColor: variant,
        borderWidth: 1,
        borderStyle: 'solid',
        color: variant,
        transition: 'all 300ms',
        ':not(:disabled):hover, :not(:disabled):focus': {
          outline: 'none',
          bg: variant,
          color: 'text'
        },
        ':active': {
          filter: 'brightness(0.8)'
        },
        ':disabled': {
          filter: 'saturate(0.5) brightness(1.4)'
        }
      } : {
        bg: variant,
        transition: 'all 300ms',
        ':hover, :focus': {
          outline: 'none',
          filter: 'brightness(0.8)'
        },
        ':active': {
          filter: 'brightness(0.6)'
        },
        ':disabled': {
          filter: 'saturate(0.5) brightness(1.2)'
        }
      }}
    />
  )
})

Button.displayName = 'Button'

export default Button
