import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CharacterDetailModal from '../components/CharacterDetailModal'

function CharacterManagement() {
  const [characters, setCharacters] = useState([])
  const [newCharacter, setNewCharacter] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  useEffect(() => {
    fetchCharacters()
  }, [])

  const fetchCharacters = async () => {
    try {
      const response = await axios.get('/api/characters')
      setCharacters(response.data)
      setLoading(false)
    } catch (error) {
      console.error('获取汉字列表失败:', error)
      setLoading(false)
    }
  }

  const handleAddCharacter = async (e) => {
    e.preventDefault()
    
    if (!newCharacter.trim()) {
      showMessage('error', '请输入汉字')
      return
    }

    if (newCharacter.length !== 1) {
      showMessage('error', '请输入单个汉字')
      return
    }

    try {
      await axios.post('/api/characters', { character: newCharacter })
      setNewCharacter('')
      showMessage('success', '添加成功')
      fetchCharacters()
    } catch (error) {
      showMessage('error', error.response?.data?.error || '添加失败')
    }
  }

  const handleDeleteCharacter = async (id) => {
    if (!window.confirm('确定要删除这个汉字吗？')) {
      return
    }

    try {
      await axios.delete(`/api/characters/${id}`)
      showMessage('success', '删除成功')
      fetchCharacters()
    } catch (error) {
      showMessage('error', '删除失败')
    }
  }

  const handleResetCharacter = async (id) => {
    if (!window.confirm('确定要重置这个汉字的学习进度吗？')) {
      return
    }

    try {
      await axios.post(`/api/characters/${id}/reset`)
      showMessage('success', '重置成功')
      fetchCharacters()
    } catch (error) {
      showMessage('error', '重置失败')
    }
  }

  const showMessage = (type, text) => {
    setMessage({ type, text })
    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleCharacterClick = (char) => {
    setSelectedCharacter(char)
  }

  const handleCloseDetail = () => {
    setSelectedCharacter(null)
  }

  const handleUpdateDetail = () => {
    fetchCharacters() // 刷新列表
  }

  const getStatusColor = (char) => {
    if (char.is_mastered) {
      return 'bg-green-100 border-green-400'
    } else if (char.recognition_count > 0) {
      return 'bg-yellow-100 border-yellow-400'
    } else {
      return 'bg-white border-gray-300'
    }
  }

  const getStatusBadge = (char) => {
    if (char.is_mastered) {
      return <span className="text-xs text-green-600">✓</span>
    } else if (char.recognition_count > 0) {
      return <span className="text-xs text-yellow-600">{char.recognition_count}/3</span>
    } else {
      return null
    }
  }

  if (loading) {
    return <div className="text-center py-12">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">汉字库管理</h1>

      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message.text}
        </div>
      )}

      {/* 汉字详情模态框 */}
      {selectedCharacter && (
        <CharacterDetailModal
          character={selectedCharacter}
          onClose={handleCloseDetail}
          onUpdate={handleUpdateDetail}
        />
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">添加新汉字</h2>
        <form onSubmit={handleAddCharacter} className="flex gap-3">
          <input
            type="text"
            value={newCharacter}
            onChange={(e) => setNewCharacter(e.target.value)}
            placeholder="输入单个汉字"
            maxLength="1"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-2xl text-center"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
          >
            添加
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">汉字列表 ({characters.length})</h2>
          <div className="flex gap-4 text-sm">
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
              <span>已掌握</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
              <span>学习中</span>
            </span>
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
              <span>未开始</span>
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2">
            {characters.map((char) => (
              <div
                key={char.id}
                className={`relative aspect-square border-2 ${getStatusColor(char)} rounded-lg flex flex-col items-center justify-center hover:shadow-lg transition-all cursor-pointer group`}
                onClick={() => handleCharacterClick(char)}
              >
                <div className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
                  {char.character}
                </div>
                <div className="absolute top-1 right-1">
                  {getStatusBadge(char)}
                </div>
                
                {/* 悬浮显示操作按钮 */}
                <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCharacterClick(char)
                    }}
                    className="text-blue-300 hover:text-blue-100 text-xs font-medium"
                  >
                    查看详情
                  </button>
                  {(char.recognition_count > 0 || char.is_mastered) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResetCharacter(char.id)
                      }}
                      className="text-yellow-300 hover:text-yellow-100 text-xs font-medium"
                    >
                      重置
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCharacter(char.id)
                    }}
                    className="text-red-300 hover:text-red-100 text-xs font-medium"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterManagement
