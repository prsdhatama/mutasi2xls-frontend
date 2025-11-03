import { HashRouter, Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import { Toaster } from '@/components/ui/sonner'
import '@/App.css'

function App () {
  return (
    <div className='App'>
      <HashRouter>
        <Routes>
          <Route path='/' element={<HomePage />} />
        </Routes>
      </HashRouter>
      <Toaster position='top-center' />
    </div>
  )
}

export default App
