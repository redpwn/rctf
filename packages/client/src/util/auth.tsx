import {
  createContext,
  useState,
  useCallback,
  FunctionComponent,
  useContext,
} from 'react'

interface AuthContextValue {
  authToken: string | null
  setAuthToken: (token: string | null) => void
}

// Using the context without a provider mounted should be an error
const AuthContext = createContext<AuthContextValue>(
  null as unknown as AuthContextValue
)

const AuthProvider: FunctionComponent = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.token ?? null
  )
  const handleSetAuthToken = useCallback((newAuthToken: string | null) => {
    if (newAuthToken === null) {
      delete localStorage.token
    } else {
      localStorage.token = newAuthToken
    }
    setAuthToken(newAuthToken)
  }, [])
  return (
    <AuthContext.Provider
      value={{ authToken, setAuthToken: handleSetAuthToken }}
    >
      {children}
    </AuthContext.Provider>
  )
}

const useAuth = (): AuthContextValue => useContext(AuthContext)

export { AuthProvider }
export default useAuth
