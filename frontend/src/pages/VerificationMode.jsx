import React, { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

function VerificationMode() {
  const [currentCharacter, setCurrentCharacter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)

  useEffect(() => {
    fetchRandomCharacter()
  }, [])

  useEffect(() => {
    // 键盘快捷键支持
    const handleKeyPress = (e) => {
      if (loading || buttonDisabled) return
      
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleMark(false)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleMark(true)
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === ' ') {
        handleSkip()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentCharacter, loading, buttonDisabled])

  const fetchRandomCharacter = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/characters/random')
      
      if (response.data.message) {
        // 所有汉字都已掌握
        setCompleted(true)
        setCurrentCharacter(null)
      } else {
        setCurrentCharacter(response.data)
        setCompleted(false)
      }
      setLoading(false)
    } catch (error) {
      console.error('获取汉字失败:', error)
      setLoading(false)
    }
  }

  const handleMark = async (recognized) => {
    if (!currentCharacter || loading || buttonDisabled) return

    setButtonDisabled(true)
    setLoading(true)
    
    try {
      await axios.post(`/api/characters/${currentCharacter.id}/mark`, {
        recognized
      })

      // 直接显示下一个字，无需提示
      fetchRandomCharacter()

      // 2秒后恢复按钮可用状态
      setTimeout(() => {
        setButtonDisabled(false)
      }, 2000)

    } catch (error) {
      console.error('标记失败:', error)
      setLoading(false)
      setButtonDisabled(false)
    }
  }

  const handleSkip = () => {
    if (!currentCharacter || loading) return
    // 跳过当前汉字，直接加载下一个
    fetchRandomCharacter()
  }

  const handleRestart = () => {
    setCompleted(false)
    fetchRandomCharacter()
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-6">
          <div className="text-8xl">🎉</div>
          <h2 className="text-4xl font-bold text-gray-800">恭喜！</h2>
          <p className="text-xl text-gray-600">所有汉字都已掌握！</p>
          <button
            onClick={handleRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition"
          >
            重新检查
          </button>
        </div>
      </div>
    )
  }

  if (loading && !currentCharacter) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-2xl text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mb-12">
        <div 
          className="text-[20rem] font-bold text-gray-800 leading-none select-none"
          style={{ fontFamily: 'serif' }}
        >
          {currentCharacter?.character}
        </div>
      </div>

      <div className="flex flex-col items-center gap-4 mb-8">
        <div className="flex gap-8">
          <button
            onClick={() => handleMark(false)}
            disabled={loading || buttonDisabled}
            className="group bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-12 py-6 rounded-xl font-bold text-2xl transition shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <div className="flex flex-col items-center gap-2">
              <span>不认识</span>
              <span className="text-sm opacity-75">← 或 A</span>
            </div>
          </button>
          
          <button
            onClick={() => handleMark(true)}
            disabled={loading || buttonDisabled}
            className="group bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-12 py-6 rounded-xl font-bold text-2xl transition shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            <div className="flex flex-col items-center gap-2">
              <span>认识</span>
              <span className="text-sm opacity-75">→ 或 D</span>
            </div>
          </button>
        </div>
        
        <button
          onClick={handleSkip}
          disabled={loading}
          className="group bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold text-lg transition shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <div className="flex flex-col items-center gap-1">
            <span>跳过</span>
            <span className="text-xs opacity-75">↓ 或 S 或 空格</span>
          </div>
        </button>
      </div>

      {currentCharacter && (
        <div className="text-center text-gray-500 mt-4">
          <div className="text-sm">
            当前进度: {currentCharacter.recognition_count} / 3
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg text-center max-w-2xl">
        <p className="text-sm text-gray-600">
          💡 提示：使用键盘快捷键更快捷<br/>
          <kbd className="px-2 py-1 bg-white rounded border mx-1">←</kbd> 或 <kbd className="px-2 py-1 bg-white rounded border mx-1">A</kbd> 不认识 · 
          <kbd className="px-2 py-1 bg-white rounded border mx-1">→</kbd> 或 <kbd className="px-2 py-1 bg-white rounded border mx-1">D</kbd> 认识 · 
          <kbd className="px-2 py-1 bg-white rounded border mx-1">↓</kbd> 或 <kbd className="px-2 py-1 bg-white rounded border mx-1">S</kbd> 或 <kbd className="px-2 py-1 bg-white rounded border mx-1">空格</kbd> 跳过
        </p>
      </div>
    </div>
  )
}

export default VerificationMode
