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
        <div className="text-xl sm:text-2xl text-gray-600">加载中...</div>
      </div>
    )
  }

  if (completed) {
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4 sm:space-y-6 max-w-md px-4">
          <div className="text-6xl sm:text-8xl">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '😊' : '💪'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">测试完成！</h2>

          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">总题数</div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">{totalCount}</div>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-lg">
                <div className="text-xs sm:text-sm text-gray-600 mb-1">认识</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{correctCount}</div>
              </div>
            </div>

            <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">正确率</div>
              <div className="text-3xl sm:text-4xl font-bold text-purple-600">{accuracy}%</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition min-h-[44px] active:scale-95"
            >
              再测一次
            </button>
            <button
              onClick={handleBackToMistakes}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition min-h-[44px] active:scale-95"
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
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="text-6xl sm:text-8xl">🎉</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">太棒了！</h2>
          <p className="text-lg sm:text-xl text-gray-600">错题库中没有汉字了</p>
          <button
            onClick={handleBackToMistakes}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition min-h-[44px] active:scale-95"
          >
            返回错题库
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh]">
      {/* Progress bar */}
      <div className="w-full max-w-4xl mb-4 sm:mb-8 px-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs sm:text-sm text-gray-600">错题测试进度</span>
          <span className="text-xs sm:text-sm font-medium text-gray-700">
            {currentIndex + 1} / {totalCount}
            <span className="ml-2 text-green-600">✓ {correctCount}</span>
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
          <div
            className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalCount) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Character display */}
      <div className="mb-6 sm:mb-12">
        <div
          className="text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[20rem] font-bold text-gray-800 leading-none select-none"
          style={{ fontFamily: 'serif' }}
        >
          {currentCharacter?.character}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 mb-6 sm:mb-8 w-full max-w-2xl px-4">
        {/* Main action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-8 w-full">
          <button
            onClick={() => handleMark(false)}
            disabled={loading || buttonDisabled}
            className="flex-1 group bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-12 py-4 sm:py-6 rounded-xl font-bold text-xl sm:text-2xl transition shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 min-h-[56px] sm:min-h-0"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span>不认识</span>
              <span className="text-xs sm:text-sm opacity-75 hidden sm:inline">← 或 A</span>
            </div>
          </button>

          <button
            onClick={() => handleMark(true)}
            disabled={loading || buttonDisabled}
            className="flex-1 group bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-12 py-4 sm:py-6 rounded-xl font-bold text-xl sm:text-2xl transition shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 min-h-[56px] sm:min-h-0"
          >
            <div className="flex flex-col items-center gap-1 sm:gap-2">
              <span>认识</span>
              <span className="text-xs sm:text-sm opacity-75 hidden sm:inline">→ 或 D</span>
            </div>
          </button>
        </div>

        {/* Secondary buttons */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
          <button
            onClick={handleSkip}
            disabled={loading}
            className="flex-1 group bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition shadow-md hover:shadow-lg active:scale-95 min-h-[44px]"
          >
            <div className="flex flex-col items-center gap-1">
              <span>跳过</span>
              <span className="text-xs opacity-75 hidden sm:inline">↓ 或 S 或 空格</span>
            </div>
          </button>

          <button
            onClick={handleBackToMistakes}
            className="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 sm:px-8 py-3 rounded-lg font-medium text-base sm:text-lg transition active:scale-95 min-h-[44px]"
          >
            退出测试
          </button>
        </div>
      </div>

      {/* Error count */}
      {currentCharacter && currentCharacter.mistake_count > 1 && (
        <div className="text-center text-gray-500 mt-2 sm:mt-4">
          <div className="text-sm">
            这个字错了 <span className="text-red-600 font-bold">{currentCharacter.mistake_count}</span> 次
          </div>
        </div>
      )}

      {/* Keyboard shortcuts hint - hidden on mobile */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg text-center max-w-2xl hidden sm:block">
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
