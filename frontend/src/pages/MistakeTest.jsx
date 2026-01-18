import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

function MistakeTest() {
  const navigate = useNavigate()
  const [mistakes, setMistakes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentCharacter, setCurrentCharacter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [buttonDisabled, setButtonDisabled] = useState(false)

  useEffect(() => {
    fetchMistakes()
  }, [])

  useEffect(() => {
    // 键盘快捷键支持
    const handleKeyPress = (e) => {
      if (loading || completed || buttonDisabled) return
      
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
  }, [currentCharacter, loading, completed, buttonDisabled])

  const fetchMistakes = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/mistakes')
      const mistakesList = response.data
      
      if (mistakesList.length === 0) {
        setCompleted(true)
        setLoading(false)
        return
      }

      // 随机打乱顺序
      const shuffled = mistakesList.sort(() => Math.random() - 0.5)
      setMistakes(shuffled)
      setTotalCount(shuffled.length)
      setCurrentCharacter(shuffled[0])
      setCurrentIndex(0)
      setLoading(false)
    } catch (error) {
      console.error('获取错题库失败:', error)
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

      if (recognized) {
        // 认识了，计数+1
        setCorrectCount(prev => prev + 1)
      }

      // 移动到下一个
      const nextIndex = currentIndex + 1
      if (nextIndex >= mistakes.length) {
        // 测试完成
        setCompleted(true)
        setLoading(false)
        setButtonDisabled(false)
      } else {
        setCurrentIndex(nextIndex)
        setCurrentCharacter(mistakes[nextIndex])
        setLoading(false)
        
        // 2秒后恢复按钮可用状态
        setTimeout(() => {
          setButtonDisabled(false)
        }, 2000)
      }
    } catch (error) {
      console.error('标记失败:', error)
      setLoading(false)
      setButtonDisabled(false)
    }
  }

  const handleSkip = () => {
    if (!currentCharacter || loading) return
    
    // 跳过，移动到下一个
    const nextIndex = currentIndex + 1
    if (nextIndex >= mistakes.length) {
      setCompleted(true)
    } else {
      setCurrentIndex(nextIndex)
      setCurrentCharacter(mistakes[nextIndex])
    }
  }

  const handleBackToMistakes = () => {
    navigate('/mistakes')
  }

  const handleRestart = () => {
    setCompleted(false)
    setCurrentIndex(0)
    setCorrectCount(0)
    fetchMistakes()
  }

  if (loading && !currentCharacter) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-2xl text-gray-600">加载中...</div>
      </div>
    )
  }

  if (completed) {
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-8xl">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '😊' : '💪'}
          </div>
          <h2 className="text-4xl font-bold text-gray-800">测试完成！</h2>
          
          <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">总题数</div>
                <div className="text-3xl font-bold text-blue-600">{totalCount}</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">认识</div>
                <div className="text-3xl font-bold text-green-600">{correctCount}</div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">正确率</div>
              <div className="text-4xl font-bold text-purple-600">{accuracy}%</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              再测一次
            </button>
            <button
              onClick={handleBackToMistakes}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition"
            >
              返回错题库
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mistakes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-6">
          <div className="text-8xl">🎉</div>
          <h2 className="text-4xl font-bold text-gray-800">太棒了！</h2>
          <p className="text-xl text-gray-600">错题库中没有汉字了</p>
          <button
            onClick={handleBackToMistakes}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition"
          >
            返回错题库
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* 进度条 */}
      <div className="w-full max-w-4xl mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">错题测试进度</span>
          <span className="text-sm font-medium text-gray-700">
            {currentIndex + 1} / {totalCount} 
            <span className="ml-2 text-green-600">✓ {correctCount}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* 汉字展示 */}
      <div className="mb-12">
        <div 
          className="text-[20rem] font-bold text-gray-800 leading-none select-none"
          style={{ fontFamily: 'serif' }}
        >
          {currentCharacter?.character}
        </div>
      </div>

      {/* 按钮 */}
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
        
        <div className="flex gap-4">
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
          
          <button
            onClick={handleBackToMistakes}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-lg font-medium text-lg transition"
          >
            退出测试
          </button>
        </div>
      </div>

      {/* 错误统计 */}
      {currentCharacter && currentCharacter.mistake_count > 1 && (
        <div className="text-center text-gray-500 mt-4">
          <div className="text-sm">
            这个字错了 <span className="text-red-600 font-bold">{currentCharacter.mistake_count}</span> 次
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

export default MistakeTest
