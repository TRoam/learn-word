import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CharacterManagement from './pages/CharacterManagement'
import VerificationMode from './pages/VerificationMode'
import Statistics from './pages/Statistics'
import MistakeBook from './pages/MistakeBook'
import MistakeTest from './pages/MistakeTest'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex space-x-8">
                <Link 
                  to="/" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  首页
                </Link>
                <Link 
                  to="/management" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  汉字库管理
                </Link>
                <Link 
                  to="/verification" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  验证模式
                </Link>
                <Link 
                  to="/mistakes" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  错题库
                </Link>
                <Link 
                  to="/statistics" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  学习统计
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/management" element={<CharacterManagement />} />
            <Route path="/verification" element={<VerificationMode />} />
            <Route path="/mistakes" element={<MistakeBook />} />
            <Route path="/mistakes/test" element={<MistakeTest />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
