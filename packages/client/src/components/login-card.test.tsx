import '@testing-library/jest-dom/extend-expect'

import { render, screen } from './test-util'
import userEvent from '@testing-library/user-event'

import LoginCard from './login-card'

const defaultProps = {
  ctfName: 'testCTF',
}

describe('onTokenLogin', () => {
  const setup = async () => {
    const onTokenLogin = jest.fn()
    const onCtftimeLogin = jest.fn()

    const token = 'tokendata'

    render(
      <LoginCard {...defaultProps} {...{ onTokenLogin, onCtftimeLogin }} />
    )

    const inputNode = screen.queryByLabelText('Team Code or Link', {
      exact: false,
    })
    if (inputNode === null) throw new Error()
    userEvent.type(inputNode, token)

    return {
      onTokenLogin,
      onCtftimeLogin,
      token,
      inputNode,
    }
  }

  it('should fire on submit', async () => {
    const { onTokenLogin, onCtftimeLogin, token, inputNode } = await setup()

    onTokenLogin.mockClear()
    onCtftimeLogin.mockClear()

    userEvent.type(inputNode, '{enter}')

    expect(onCtftimeLogin).not.toBeCalled()
    expect(onTokenLogin).toHaveBeenCalledTimes(1)
    expect(onTokenLogin).toBeCalledWith(token)

    expect(inputNode).toBeInTheDocument()
  })

  it('should fire on click', async () => {
    const { onTokenLogin, onCtftimeLogin, token } = await setup()

    onTokenLogin.mockClear()
    onCtftimeLogin.mockClear()

    const buttonNode = screen.queryByRole('button', { name: 'Log In' })
    expect(buttonNode).toBeInTheDocument()
    if (buttonNode === null) throw new Error()
    userEvent.click(buttonNode)

    expect(onCtftimeLogin).not.toBeCalled()
    expect(onTokenLogin).toHaveBeenCalledTimes(1)
    expect(onTokenLogin).toBeCalledWith(token)
  })
})

describe('onCtftimeLogin', () => {
  it('should fire on click', () => {
    const onTokenLogin = jest.fn()
    const onCtftimeLogin = jest.fn()

    render(
      <LoginCard {...defaultProps} {...{ onTokenLogin, onCtftimeLogin }} />
    )

    const buttonNode = screen.queryByRole('button', {
      name: 'Log In with CTFtime',
    })
    expect(buttonNode).toBeInTheDocument()
    if (buttonNode === null) throw new Error()
    userEvent.click(buttonNode)

    expect(onTokenLogin).not.toBeCalled()
    expect(onCtftimeLogin).toHaveBeenCalledTimes(1)
  })
})
