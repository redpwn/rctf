import { Story } from '@storybook/react'
import { OmitArgs } from '../sb-util'
import { FunctionComponent, useState, useCallback, ChangeEvent } from 'react'
import TextInput, { TextInputProps } from './text-input'
import { text } from '@storybook/addon-knobs'
import { Text } from 'theme-ui'

export default {
  title: 'TextInput',
  component: TextInput,
}

const Template: Story<TextInputProps> = props => <TextInput {...props} />

export const Default = Template.bind({})
Default.args = {
  label: 'Label',
  error: '',
}

export const Focused: typeof Template = props => (
  <Template {...props} autoFocus />
)
Focused.args = { ...Default.args }

export const WithPlaceholder: typeof Template = props => (
  <Template {...props} autoFocus />
)
WithPlaceholder.args = {
  ...Default.args,
  placeholder: 'Placeholder text',
}

export const Disabled = Template.bind({})
Disabled.args = {
  ...Default.args,
  disabled: true,
}

export const DisabledWithValue = Disabled.bind({})
DisabledWithValue.args = {
  ...Disabled.args,
  value: 'Value',
}

export const WithError = Template.bind({})
WithError.args = {
  ...Default.args,
  error: true,
}

export const ShowingNativeValidationError = Template.bind({})
ShowingNativeValidationError.args = {
  ...Default.args,
  type: 'email',
  value: 'notanemail',
  showError: true,
}

export const WithoutLabel = Template.bind({})
WithoutLabel.args = {
  ...Default.args,
  label: '',
}

export const StackedNoPadding: FunctionComponent = () => (
  <>
    <TextInput label={text('Label 1', 'Label 1')} />
    <TextInput label={text('Label 2', 'Label 2')} />
  </>
)

export const ControlledInput: OmitArgs<
  typeof Template,
  'value' | 'onChange'
> = props => {
  const [value, setValue] = useState('')
  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }, [])

  return (
    <>
      <Template {...props} value={value} onChange={onChange} />
      <Text pt={3}>You typed: {value}</Text>
    </>
  )
}
ControlledInput.args = { ...Default.args }
