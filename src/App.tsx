import { useEffect } from 'react'

function App() {
  useEffect(() => {
    // Hide loading screen when React is ready
    if (typeof window.hideLoading === 'function') {
      window.hideLoading()
    }
  }, [])
  
  return (
    <div className='bg-background h-[100vh] w-full flex items-center justify-center'>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Desktop Application
        </h1>
        
        <p className="text-muted-foreground">
          Built with Electron, React & TypeScript
        </p>
        
        {/* Simple status indicator */}
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-lg text-sm">
          <span>⚡</span>
          Desktop App Running
        </div>
      </div>
    </div>
  )
}

export default App