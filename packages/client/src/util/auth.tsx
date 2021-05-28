import {
  createContext,
  useState,
  useCallback,
  FunctionComponent,
  useContext,
  useMemo,
} from 'react'

interface AuthContextValue {
  authToken: string | null
  setAuthToken: (token: string | null) => void
}

// Using the context without a provider mounted should be an error
const AuthContext = createContext<AuthContextValue>(
  null as unknown as AuthContextValue
)

export const AuthProvider: FunctionComponent = ({ children }) => {
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
  const contextValue = useMemo(
    () => ({ authToken, setAuthToken: handleSetAuthToken }),
    [authToken, handleSetAuthToken]
  )
  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextValue => useContext(AuthContext)
export const useAuthToken = (): string | null => useAuth().authToken
export const useIsLoggedIn = (): boolean => useAuthToken() !== null

export default useAuth
