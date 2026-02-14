import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useSearchParams } from 'react-router-dom'
import CharacterDetailModal from '../components/CharacterDetailModal'

function VerificationMode() {
  const [searchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'learn' // learn or review

  const [currentCharacter, setCurrentCharacter] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  useEffect(() => {
    fetchRandomCharacter()
  }, [mode])

  useEffect(() => {
    // 键盘快捷键支持
    const handleKeyPress = (e) => {
      if (loading || buttonDisabled || !currentCharacter) return

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        handleMark(false)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        handleMark(true)
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'l' || e.key === 'L') {
        // L 键打开学习详情
        handleLearn()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentCharacter, loading, buttonDisabled])

  const fetchRandomCharacter = async () => {
    setLoading(true)
    try {
      const endpoint = mode === 'review'
        ? '/api/characters/random?mastered=true'
        : '/api/characters/random'
      const response = await axios.get(endpoint)

      if (response.data.message) {
        const message = mode === 'review'
          ? '没有已掌握的汉字可复习'
          : '所有汉字都已掌握'
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

  const handleLearn = () => {
    if (!currentCharacter || loading) return
    setSelectedCharacter(currentCharacter)
  }

  const handleCloseDetail = () => {
    setSelectedCharacter(null)
  }

  const handleUpdateDetail = () => {
    // 详情更新后刷新当前字符
    if (selectedCharacter) {
      fetchCharacterById(selectedCharacter.id)
    }
  }

  const fetchCharacterById = async (id) => {
    try {
      const response = await axios.get(`/api/characters/${id}`)
      setCurrentCharacter(response.data)
    } catch (error) {
      console.error('刷新汉字信息失败:', error)
    }
  }

  const handleRestart = () => {
    setCompleted(false)
    fetchRandomCharacter()
  }

  if (completed) {
    const isReview = mode === 'review'
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="text-6xl sm:text-8xl">{isReview ? '📚' : '🎉'}</div>
          <h2 className="text-2xl sm:text-4xl font-bold text-gray-800">
            {isReview ? '复习完成' : '恭喜！'}
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            {isReview ? '没有已掌握的汉字可复习' : '所有汉字都已掌握！'}
          </p>
          <button
            onClick={handleRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg transition min-h-[44px] active:scale-95"
          >
            {isReview ? '重新开始复习' : '重新检查'}
          </button>
        </div>
      </div>
    )
  }

  if (loading && !currentCharacter) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="text-xl sm:text-2xl text-gray-600">加载中...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 min-h-[70vh]">
      {/* 汉字展示区域 - 居中 */}
      <div className="flex-1 flex items-center justify-center w-full">
        <div
          className="text-[8rem] sm:text-[10rem] md:text-[14rem] lg:text-[20rem] font-bold text-gray-800 leading-none select-none text-center"
          style={{ fontFamily: 'serif' }}
        >
          {currentCharacter?.character}
        </div>
      </div>

      {/* 进度显示 */}
      {currentCharacter && (
        <div className="text-center text-gray-500 mb-4 sm:mb-6">
          <div className="text-sm sm:text-base">
            学习进度: {currentCharacter.recognition_count} / 3
          </div>
        </div>
      )}

      {/* 操作按钮区域 */}
      <div className="flex flex-col items-center gap-3 sm:gap-4 w-full max-w-2xl">
        {/* 主要操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 w-full">
          <button
            onClick={() => handleMark(false)}
            disabled={loading || buttonDisabled}
            className="flex-1 group bg-red-500 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-xl sm:text-2xl transition shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 min-h-[60px]"
          >
            <div className="flex flex-col items-center gap-1">
              <span>不认识</span>
              <span className="text-xs sm:text-sm opacity-75 hidden sm:inline">← 或 A</span>
            </div>
          </button>

          <button
            onClick={() => handleMark(true)}
            disabled={loading || buttonDisabled}
            className="flex-1 group bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 sm:px-12 py-4 sm:py-5 rounded-xl font-bold text-xl sm:text-2xl transition shadow-lg hover:shadow-xl active:scale-95 disabled:active:scale-100 min-h-[60px]"
          >
            <div className="flex flex-col items-center gap-1">
              <span>认识</span>
              <span className="text-xs sm:text-sm opacity-75 hidden sm:inline">→ 或 D</span>
            </div>
          </button>
        </div>

        {/* 学习按钮 */}
        <button
          onClick={handleLearn}
          disabled={loading}
          className="group bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 sm:px-12 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition shadow-md hover:shadow-lg active:scale-95 min-h-[52px] flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span>学习这个字</span>
          <span className="text-xs opacity-75 hidden sm:inline">按 L</span>
        </button>
      </div>

      {/* 桌面端提示 */}
      <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-blue-50 rounded-lg text-center max-w-2xl hidden sm:block">
        <p className="text-sm text-gray-600">
          💡 提示：使用键盘快捷键更快捷<br/>
          <kbd className="px-2 py-1 bg-white rounded border mx-1">←</kbd> 或 <kbd className="px-2 py-1 bg-white rounded border mx-1">A</kbd> 不认识 ·
          <kbd className="px-2 py-1 bg-white rounded border mx-1">→</kbd> 或 <kbd className="px-2 py-1 bg-white rounded border mx-1">D</kbd> 认识 ·
          <kbd className="px-2 py-1 bg-white rounded border mx-1">L</kbd> 学习详情
        </p>
      </div>

      {/* 汉字详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateDetail}
        />
      )}
    </div>
  )
}

export default VerificationMode
