import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ForgotPassword, Login, Signup } from './pages/Auth'
import { ThemeProvider } from './context/theme-provider'
import { Toaster } from './components/ui/sonner'
import TaskManagement from './pages/TaskManagement/taskManagement'
import MainLayout from './layout/layout'
import Settings from './pages/Settings/Settings'
import Expense from './pages/ExpenseManagement/expense'

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
        <div className='bg-background text-foreground min-h-screen w-full'>
          <Routes>
            {/* Auth Routes (without layout) */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected Routes (with layout) */}
            <Route path="/task-management" element={<MainLayout><TaskManagement /></MainLayout>} />
            <Route path="/expense-management" element={<MainLayout><Expense /></MainLayout>} />
            <Route path="/settings" element={<MainLayout><Settings /></MainLayout>} />
            
            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App