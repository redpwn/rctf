import { FunctionComponent } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from 'theme-ui'
import theme from './util/theme'
import { AuthProvider } from './util/auth'
import Home from './routes/home'

const App: FunctionComponent = () => {
  return (
    <Routes>
      <Route path='/' element={<Home />} />
    </Routes>
  )
}

const WrappedApp: FunctionComponent = () => (
  <AuthProvider>
    <ThemeProvider theme={theme}>
      <Router>
        <App />
      </Router>
    </ThemeProvider>
  </AuthProvider>
)

export default WrappedApp
