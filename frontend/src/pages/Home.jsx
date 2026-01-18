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
    <div className="space-y-6">
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">汉字学习系统</h1>
        <p className="text-gray-600">通过反复练习，掌握更多汉字</p>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">总字数</div>
            <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">已掌握</div>
            <div className="text-3xl font-bold text-green-600">{stats.mastered}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">学习中</div>
            <div className="text-3xl font-bold text-yellow-600">{stats.learning}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-500 mb-1">未开始</div>
            <div className="text-3xl font-bold text-gray-600">{stats.not_started}</div>
          </div>

          <Link to="/mistakes" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
            <div className="text-sm text-gray-500 mb-1">错题库</div>
            <div className="text-3xl font-bold text-red-600">{mistakeCount}</div>
          </Link>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">学习进度</span>
            <span className="text-sm font-medium text-gray-700">{stats?.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-blue-600 h-4 rounded-full transition-all duration-500"
              style={{ width: `${stats?.progress || 0}%` }}
            ></div>
          </div>
        </div>

        {stats && stats.today_count > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">今日学习</h3>
            <p className="text-gray-600">今天已学习 {stats.today_count} 次</p>
            {stats.today_recognized.length > 0 && (
              <div className="mt-3">
                <p className="text-sm text-gray-500 mb-2">今日认识的汉字：</p>
                <div className="flex flex-wrap gap-2">
                  {stats.today_recognized.map((char, index) => (
                    <span 
                      key={index}
                      className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded text-lg"
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Link 
            to="/verification"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition text-center"
          >
            开始验证
          </Link>
          {mistakeCount > 0 && (
            <Link 
              to="/mistakes"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition text-center flex items-center justify-center gap-2"
            >
              <span>查看错题库</span>
              <span className="bg-red-800 px-2 py-0.5 rounded-full text-sm">{mistakeCount}</span>
            </Link>
          )}
          <Link 
            to="/management"
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-8 rounded-lg transition text-center"
          >
            管理汉字库
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
