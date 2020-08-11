import { FunctionComponent, useState, useCallback, ChangeEvent } from 'react'
import TextInput from './textinput'
import { text, boolean, select } from '@storybook/addon-knobs'
import { Text } from 'theme-ui'

export default {
  title: 'TextInput',
  component: TextInput
}

export const Input: FunctionComponent = () =>
  <TextInput
    label={text('Label', 'Label')}
    error={text('Error', '')}
    showError={boolean('Show error', false)}
    type={select('Type', ['text', 'search', 'email', 'password', 'number', 'url'], 'text')}
  />

export const InputWithError: FunctionComponent = () =>
  <TextInput label='Label' error />

export const InputShowingNativeValidationError: FunctionComponent = () =>
  <TextInput label='Label' type='email' showError value='notanemail' />

export const InputWithoutLabel: FunctionComponent = () =>
  <TextInput error={boolean('Error', false)} />

export const InputsStackedNoPadding: FunctionComponent = () =>
  <>
    <TextInput label={text('Label 1', 'Label 1')}/>
    <TextInput label={text('Label 2', 'Label 2')}/>
  </>

export const ControlledInput: FunctionComponent = () => {
  const [value, setValue] = useState('')
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])

  return (
    <>
      <TextInput label='Label' value={value} onChange={onChange}
        error={text('Error', '')}
        showError={boolean('Show error', false)}
        type={select('Type', ['text', 'search', 'email', 'password', 'number', 'url'], 'text')}
      />
      <Text pt={3}>You typed: {value}</Text>
    </>
  )
}
