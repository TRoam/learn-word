import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

function Home() {
  const [stats, setStats] = useState(null)
  const [mistakeCount, setMistakeCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchMistakes()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/stats')
      setStats(response.data)
      setLoading(false)
    } catch (error) {
      console.error('获取统计信息失败:', error)
      setLoading(false)
    }
  }

  const fetchMistakes = async () => {
    try {
      const response = await axios.get('/api/mistakes')
      setMistakeCount(response.data.length)
    } catch (error) {
      console.error('获取错题库失败:', error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 标题 */}
      <div className="text-center py-6 sm:py-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">汉字学习系统</h1>
        <p className="text-sm sm:text-base text-gray-600">通过反复练习，掌握更多汉字</p>
      </div>

      {stats && (
        <>
          {/* 统计卡片 */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">总字数</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">{stats.total}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">已掌握</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">{stats.mastered}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">学习中</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">{stats.learning}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">未开始</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600">{stats.not_started}</div>
            </div>

            <div className="bg-white rounded-lg shadow p-3 sm:p-4 lg:p-6">
              <div className="text-xs sm:text-sm text-gray-500 mb-1">错题库</div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-600">{mistakeCount}</div>
            </div>
          </div>

          {/* 学习进度 */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">学习进度</h2>
            <div className="mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">整体掌握度</span>
                <span className="text-xs sm:text-sm font-medium text-gray-700">{stats.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 lg:h-4">
                <div
                  className="bg-blue-600 h-2 sm:h-3 lg:h-4 rounded-full transition-all duration-500"
                  style={{ width: `${stats.progress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.mastered}</div>
                <div className="text-xs text-gray-500">已掌握</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.learning}</div>
                <div className="text-xs text-gray-500">学习中</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-gray-600">{stats.not_started}</div>
                <div className="text-xs text-gray-500">未开始</div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">快速操作</h2>
            <div className="flex flex-col gap-3">
              {/* 学习和复习按钮 */}
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/verification?mode=learn"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition text-center min-h-[52px] sm:min-h-[56px] flex flex-col items-center justify-center active:scale-95"
                >
                  <span className="text-lg sm:text-xl mb-1">📝</span>
                  <span className="text-sm sm:text-base">开始学习</span>
                  <span className="text-xs opacity-75">未掌握汉字</span>
                </Link>
                <Link
                  to="/verification?mode=review"
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg transition text-center min-h-[52px] sm:min-h-[56px] flex flex-col items-center justify-center active:scale-95"
                  >
                  <span className="text-lg sm:text-xl mb-1">📚</span>
                  <span className="text-sm sm:text-base">复习</span>
                  <span className="text-xs opacity-75">已掌握汉字</span>
                </Link>
              </div>

              {/* 次要操作按钮 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {mistakeCount > 0 && (
                  <Link
                    to="/mistake-test"
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition text-center flex items-center justify-center gap-2 min-h-[52px] sm:min-h-[56px] active:scale-95 text-base sm:text-lg"
                  >
                    <span>📕 错题测试</span>
                    <span className="bg-red-800 px-2 sm:px-3 py-0.5 rounded-full text-sm sm:text-base">{mistakeCount}</span>
                  </Link>
                )}
                <Link
                  to="/management"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition text-center flex items-center justify-center min-h-[52px] sm:min-h-[56px] active:scale-95 text-base sm:text-lg"
                >
                  ⚙️ 管理汉字库
                </Link>
                <Link
                  to="/statistics"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition text-center flex items-center justify-center min-h-[52px] sm:min-h-[56px] active:scale-95 text-base sm:text-lg"
                >
                  📊 学习统计
                </Link>
              </div>
            </div>
          </div>

          {/* 今日学习 */}
          {stats.today_count > 0 && (
            <div className="bg-white rounded-lg shadow p-4 sm:p-6 lg:p-8">
              <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">今日学习</h2>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg mb-3 sm:mb-4">
                <span className="text-sm sm:text-base text-gray-700">今日学习次数</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">{stats.today_count}</span>
              </div>

              {stats.today_recognized.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">今日认识的汉字：</p>
                  <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-16 gap-1.5 sm:gap-2">
                    {stats.today_recognized.map((char, index) => (
                      <span
                        key={index}
                        className="inline-block bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded text-base sm:text-lg text-center font-medium"
                        style={{ fontFamily: 'serif' }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Home
