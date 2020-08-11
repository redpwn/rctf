import '@testing-library/jest-dom/extend-expect'

import { render, act, fireEvent } from '@testing-library/preact'

import { createRef } from 'react'

import TextInput from './textinput'

test('attributes should propagate', () => {
  const { queryByTestId } = render(
    <TextInput data-testid='test-input' autoFocus />
  )

  expect(queryByTestId('test-input')).toBeVisible()
  expect(queryByTestId('test-input')?.tagName).toBe('INPUT')
  expect(queryByTestId('test-input')).toHaveAttribute('autofocus')
})

test('forwards ref', () => {
  const ref = createRef<HTMLInputElement>()

  render(
    <TextInput ref={ref} />
  )

  expect(ref.current).not.toBeNull()
  if (ref.current === null) throw new Error()

  expect(ref.current.tagName).toBe('INPUT')
})

test('label should be visible', () => {
  const labelText = 'Label'

  const { queryByText, queryByLabelText } = render(
    <TextInput label={labelText} />
  )

  expect(queryByText(labelText)).toBeVisible()
  expect(queryByLabelText(labelText)).toBeVisible()
})

test('error text should be visible when showError', () => {
  const errorMessage = 'error message!'

  const { queryByText } = render(
    <TextInput error={errorMessage} showError />
  )

  expect(queryByText(errorMessage)).toBeVisible()
})

test('error text should not be visible when not showError', () => {
  const errorMessage = 'error message!'

  const { queryByText } = render(
    <TextInput error={errorMessage} />
  )

  expect(queryByText(errorMessage)).not.toBeInTheDocument()
})

test('native error message is visible', async () => {
  const errorMessage = 'error message!'
  const ref = createRef<HTMLInputElement>()

  const { queryByText } = render(
    <TextInput ref={ref} showError />
  )

  await act(() => {
    expect(ref.current).not.toBeNull()
    if (ref.current === null) throw new Error()

    ref.current.setCustomValidity(errorMessage)
    fireEvent.input(ref.current)
  })

  expect(queryByText(errorMessage)).toBeVisible()
})

test('reacts to "invalid" event', async () => {
  const errorMessage = 'error message!'
  const ref = createRef<HTMLInputElement>()

  const { queryByText } = render(
    <TextInput ref={ref} showError />
  )

  await act(() => {
    expect(ref.current).not.toBeNull()
    if (ref.current === null) throw new Error()

    ref.current.setCustomValidity(errorMessage)
    fireEvent.invalid(ref.current)
  })

  expect(queryByText(errorMessage)).toBeVisible()
})

test('updated error message is visible', async () => {
  const origErrorMessage = 'this is an error!'
  const newErrorMessage = 'oh noes!'

  const { queryByText, rerender } = render(
    <TextInput showError error={origErrorMessage} />
  )

  expect(queryByText(origErrorMessage)).toBeVisible()
  expect(queryByText(newErrorMessage)).not.toBeInTheDocument()

  rerender(
    <TextInput showError error={newErrorMessage} />
  )

  expect(queryByText(origErrorMessage)).not.toBeInTheDocument()
  expect(queryByText(newErrorMessage)).toBeVisible()
})

test('propagates onChange event', async () => {
  const testid = 'testid'
  const onChange = jest.fn()

  const { queryByTestId } = render(
    <TextInput data-testid={testid} onChange={onChange} />
  )

  expect(onChange).not.toBeCalled()

  const el = queryByTestId(testid)

  expect(el).toBeInTheDocument()
  if (el === null) throw new Error()

  fireEvent.input(el)

  expect(onChange).toBeCalledTimes(1)
})

test('does not crash with boolean error and showError', async () => {
  const testid = 'testid'

  const { queryByTestId } = render(
    <TextInput data-testid={testid} error showError />
  )

  expect(queryByTestId(testid)).toBeVisible()
})
