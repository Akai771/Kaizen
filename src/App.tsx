import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router'
import { Login } from './pages/Auth'
import { ThemeProvider } from './context/theme-provider'

function App() {
  useEffect(() => {
    // Hide loading screen when React is ready
    if (typeof window.hideLoading === 'function') {
      window.hideLoading()
    }
  }, [])
  
  return (
     <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
    <Router>
      <div className='bg-background h-[100vh] w-full'>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
    </ThemeProvider>
  )
}

export default App