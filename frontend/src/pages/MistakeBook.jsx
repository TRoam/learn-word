import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import CharacterDetailModal from '../components/CharacterDetailModal'

function MistakeBook() {
  const navigate = useNavigate()
  const [mistakes, setMistakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [sortBy, setSortBy] = useState('time') // time: 按时间排序, count: 按错误次数排序

  useEffect(() => {
    fetchMistakes()
  }, [])

  const fetchMistakes = async () => {
    try {
      const response = await axios.get('/api/mistakes')
      setMistakes(response.data)
      setLoading(false)
    } catch (error) {
      console.error('获取错题库失败:', error)
      setLoading(false)
    }
  }

  const handleCharacterClick = (char) => {
    setSelectedCharacter(char)
  }

  const handleCloseDetail = () => {
    setSelectedCharacter(null)
  }

  const handleUpdateDetail = () => {
    fetchMistakes() // 刷新列表
  }

  const handleStartTest = () => {
    navigate('/mistakes/test')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (char) => {
    if (char.is_mastered) {
      return 'bg-green-100 border-green-400'
    } else if (char.recognition_count > 0) {
      return 'bg-yellow-100 border-yellow-400'
    } else {
      return 'bg-red-100 border-red-400'
    }
  }

  const getStatusBadge = (char) => {
    if (char.is_mastered) {
      return <span className="text-xs text-green-600">已掌握</span>
    } else if (char.recognition_count > 0) {
      return <span className="text-xs text-yellow-600">{char.recognition_count}/3</span>
    } else {
      return <span className="text-xs text-red-600">0/3</span>
    }
  }

  const sortedMistakes = [...mistakes].sort((a, b) => {
    if (sortBy === 'time') {
      return new Date(b.last_mistake_time) - new Date(a.last_mistake_time)
    } else {
      return b.mistake_count - a.mistake_count
    }
  })

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">错题库</h1>
        <div className="flex items-center gap-4">
          {mistakes.length > 0 && (
            <button
              onClick={handleStartTest}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              开始测试
            </button>
          )}
          <div className="text-sm text-gray-600">
            共 <span className="text-2xl font-bold text-red-600">{mistakes.length}</span> 个汉字
          </div>
        </div>
      </div>

      {/* 汉字详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateDetail}
        />
      )}

      {mistakes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">太棒了！</h2>
          <p className="text-gray-600">目前还没有标记为不认识的汉字</p>
          <p className="text-sm text-gray-500 mt-2">继续努力学习吧！</p>
        </div>
      ) : (
        <>
          {/* 排序选项 */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">排序方式：</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('time')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'time'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  最近标记
                </button>
                <button
                  onClick={() => setSortBy('count')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    sortBy === 'count'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  错误次数
                </button>
              </div>
            </div>
          </div>

          {/* 网格展示 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
              {sortedMistakes.map((char) => (
                <div
                  key={char.id}
                  onClick={() => handleCharacterClick(char)}
                  className={`relative aspect-square border-2 ${getStatusColor(char)} rounded-lg flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:scale-105 transition-all p-2`}
                >
                  {/* 汉字 */}
                  <div className="text-4xl font-bold text-gray-800 mb-1" style={{ fontFamily: 'serif' }}>
                    {char.character}
                  </div>
                  
                  {/* 状态标记 */}
                  <div className="text-center">
                    {getStatusBadge(char)}
                  </div>
                  
                  {/* 错误次数徽章 */}
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold shadow-lg">
                    ✗{char.mistake_count}
                  </div>
                  
                  {/* 拼音（如果有） */}
                  {char.pinyin && (
                    <div className="text-xs text-blue-600 mt-1 truncate max-w-full">
                      {char.pinyin}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 详细列表 */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">详细列表</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">汉字</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">拼音</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">错误次数</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后标记时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedMistakes.map((char) => (
                    <tr key={char.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-3xl font-medium text-gray-900" style={{ fontFamily: 'serif' }}>
                          {char.character}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600">
                          {char.pinyin || <span className="text-gray-400">未设置</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(char)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {char.mistake_count} 次
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(char.last_mistake_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleCharacterClick(char)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MistakeBook
