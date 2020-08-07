import { createContext, useState, useCallback, FunctionComponent } from 'react'

interface AuthContextValue {
  authToken: string,
  setAuthToken: (token: string) => void;
}

// Using the context without a provider mounted should be an error
const AuthContext = createContext<AuthContextValue>(null as unknown as AuthContextValue)

const AuthProvider: FunctionComponent = ({ children }) => {
  const [authToken, setAuthToken] = useState<string>(localStorage.token ?? null)
  const handleSetAuthToken = useCallback((newAuthToken) => {
    localStorage.token = JSON.stringify(newAuthToken)
    setAuthToken(newAuthToken)
  }, [])
  return (
    <AuthContext.Provider value={{ authToken, setAuthToken: handleSetAuthToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthProvider }
export default AuthContext
