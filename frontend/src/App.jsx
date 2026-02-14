import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import CharacterManagement from './pages/CharacterManagement'
import VerificationMode from './pages/VerificationMode'
import Statistics from './pages/Statistics'
import MistakeBook from './pages/MistakeBook'
import MistakeTest from './pages/MistakeTest'

function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
  }

  const navLinks = [
    { to: '/', label: '首页' },
    { to: '/management', label: '汉字库管理' },
    { to: '/verification', label: '验证模式' },
    { to: '/mistakes', label: '错题库' },
    { to: '/statistics', label: '学习统计' },
  ]

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Brand */}
              <Link
                to="/"
                className="flex-shrink-0 flex items-center"
                onClick={closeMobileMenu}
              >
                <span className="text-xl sm:text-2xl font-bold text-blue-600">汉字学习</span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden md:flex space-x-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md text-sm font-medium transition"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={toggleMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 min-h-[44px] min-w-[44px] active:scale-95 transition"
                  aria-expanded={mobileMenuOpen}
                  aria-label="主菜单"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    {mobileMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile menu overlay */}
          {mobileMenuOpen && (
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
              onClick={closeMobileMenu}
            ></div>
          )}

          {/* Mobile menu drawer */}
          <div
            className={`md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Mobile header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="text-lg font-bold text-blue-600">菜单</span>
                <button
                  onClick={closeMobileMenu}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none min-h-[44px] min-w-[44px] active:scale-95 transition"
                  aria-label="关闭菜单"
                >
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Mobile navigation links */}
              <div className="flex-1 overflow-y-auto py-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={closeMobileMenu}
                    className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-l-4 border-transparent hover:border-blue-600 transition min-h-[48px] flex items-center"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Mobile footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500 text-center">汉字学习系统</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
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
