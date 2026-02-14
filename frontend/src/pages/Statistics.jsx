import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CharacterDetailModal from '../components/CharacterDetailModal'

function Statistics() {
  const [stats, setStats] = useState(null)
  const [recentRecords, setRecentRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, recordsRes] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/records/recent?limit=50')
      ])

      setStats(statsRes.data)
      setRecentRecords(recordsRes.data)
      setLoading(false)
    } catch (error) {
      console.error('获取数据失败:', error)
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCharacterClick = async (charText) => {
    try {
      // 根据汉字文本查找汉字ID
      const response = await axios.get('/api/characters')
      const char = response.data.find(c => c.character === charText)
      if (char) {
        setSelectedCharacter(char)
      }
    } catch (error) {
      console.error('查找汉字失败:', error)
    }
  }

  const handleCloseDetail = () => {
    setSelectedCharacter(null)
  }

  const handleUpdateDetail = () => {
    fetchData() // 刷新数据
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">学习统计</h1>

      {/* 汉字详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateDetail}
        />
      )}

      {stats && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="text-xs sm:text-sm opacity-90 mb-1">总字数</div>
              <div className="text-2xl sm:text-4xl font-bold">{stats.total}</div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="text-xs sm:text-sm opacity-90 mb-1">已掌握</div>
              <div className="text-2xl sm:text-4xl font-bold">{stats.mastered}</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="text-xs sm:text-sm opacity-90 mb-1">学习中</div>
              <div className="text-2xl sm:text-4xl font-bold">{stats.learning}</div>
            </div>

            <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg shadow-lg p-4 sm:p-6 text-white">
              <div className="text-xs sm:text-sm opacity-90 mb-1">未开始</div>
              <div className="text-2xl sm:text-4xl font-bold">{stats.not_started}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">整体进度</h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-medium text-gray-700">掌握进度</span>
                  <span className="text-xs sm:text-sm font-medium text-gray-700">{stats.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 lg:h-4">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 sm:h-3 lg:h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 sm:pt-4">
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
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">今日学习</h2>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-blue-50 rounded-lg">
                <span className="text-sm sm:text-base text-gray-700">今日学习次数</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-600">{stats.today_count}</span>
              </div>

              {stats.today_recognized.length > 0 && (
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">今日认识的汉字：</p>
                  <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-16 gap-1.5 sm:gap-2">
                    {stats.today_recognized.map((char, index) => (
                      <div
                        key={index}
                        onClick={() => handleCharacterClick(char)}
                        className="aspect-square bg-green-100 border-2 border-green-400 rounded-lg flex items-center justify-center text-xl sm:text-2xl font-bold text-gray-800 cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
                        style={{ fontFamily: 'serif' }}
                        title="点击查看详情"
                      >
                        {char}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <h2 className="text-lg sm:text-xl font-semibold">最近学习记录</h2>
        </div>

        {/* 桌面端表格 */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">汉字</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">结果</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">时间</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    <span className="text-2xl sm:text-3xl font-medium text-gray-900">{record.character}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                    {record.recognized ? (
                      <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">✓ 认识</span>
                    ) : (
                      <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-800 font-medium">✗ 不认识</span>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                    {formatDate(record.recorded_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 移动端卡片视图 */}
        <div className="sm:hidden p-3 space-y-2">
          {recentRecords.map((record) => (
            <div
              key={record.id}
              className="bg-gray-50 rounded-lg p-3 active:bg-gray-100 transition cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl font-medium text-gray-900" style={{ fontFamily: 'serif' }}>
                  {record.character}
                </div>
                <div className="flex-1">
                  {record.recognized ? (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 font-medium">
                      ✓ 认识
                    </span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800 font-medium">
                      ✗ 不认识
                    </span>
                  )}
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDate(record.recorded_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Statistics
