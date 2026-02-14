import React, { useState, useEffect } from 'react'
import axios from 'axios'
import CharacterDetailModal from '../components/CharacterDetailModal'

function CharacterManagement() {
  const [characters, setCharacters] = useState([])
  const [newCharacter, setNewCharacter] = useState('')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)

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

  const handleExportExcel = async () => {
    setExporting(true)
    try {
      const response = await axios.get('/api/characters/export', {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `汉字库导出_${new Date().toISOString().slice(0, 10)}.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      showMessage('success', '导出成功')
    } catch (error) {
      showMessage('error', '导出失败')
    } finally {
      setExporting(false)
    }
  }

  const handleImportExcel = async (e) => {
    e.preventDefault()
    if (!importFile) {
      showMessage('error', '请选择文件')
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('file', importFile)

    try {
      const response = await axios.post('/api/characters/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const { success, updated, skipped, errors } = response.data
      let msg = `导入成功: 新增${success}个，更新${updated}个`
      if (skipped > 0) {
        msg += `，跳过${skipped}个`
      }
      if (errors && errors.length > 0) {
        msg += `。错误: ${errors.join('; ')}`
      }
      showMessage('success', msg)
      setImportFile(null)
      fetchCharacters()
    } catch (error) {
      showMessage('error', error.response?.data?.error || '导入失败')
    } finally {
      setImporting(false)
    }
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
    <div className="space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">汉字库管理</h1>

      {message.text && (
        <div className={`p-3 sm:p-4 rounded-lg text-sm sm:text-base ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">添加新汉字</h2>
        <form onSubmit={handleAddCharacter} className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={newCharacter}
            onChange={(e) => setNewCharacter(e.target.value)}
            placeholder="输入单个汉字"
            maxLength="1"
            className="flex-1 px-3 sm:px-4 py-2 min-h-[48px] sm:min-h-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xl sm:text-2xl text-center active:scale-[0.98] transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 min-h-[48px] sm:min-h-0 rounded-lg font-semibold transition active:scale-95"
          >
            添加
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-4">Excel 导入导出</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition active:scale-95"
          >
            {exporting ? '导出中...' : '导出汉字库'}
          </button>
          <div className="flex-1 flex gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files[0])}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <button
              onClick={handleImportExcel}
              disabled={!importFile || importing}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 sm:px-6 py-2 rounded-lg font-semibold transition active:scale-95"
            >
              {importing ? '导入中...' : '导入'}
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs sm:text-sm text-gray-600">
          Excel格式：汉字 | 拼音 | 释义 | 组词 | 造句 | 认识次数 | 是否已掌握
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg sm:text-xl font-semibold">汉字列表 ({characters.length})</h2>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
              <span className="flex items-center gap-1 sm:gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                <span>已掌握</span>
              </span>
              <span className="flex items-center gap-1 sm:gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                <span>学习中</span>
              </span>
              <span className="flex items-center gap-1 sm:gap-2">
                <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded"></div>
                <span>未开始</span>
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-6">
          <div className="grid grid-cols-4 xs:grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-16 gap-1.5 sm:gap-2">
            {characters.map((char) => (
              <div
                key={char.id}
                className={`relative aspect-square border-2 ${getStatusColor(char)} rounded-lg flex flex-col items-center justify-center hover:shadow-lg transition-all cursor-pointer group active:scale-95`}
                onClick={() => handleCharacterClick(char)}
              >
                <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800" style={{ fontFamily: 'serif' }}>
                  {char.character}
                </div>
                <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                  {getStatusBadge(char)}
                </div>

                {/* 悬浮显示操作按钮 - 桌面端 */}
                <div className="absolute inset-0 bg-black bg-opacity-70 rounded-lg opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 sm:gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleCharacterClick(char)
                    }}
                    className="text-blue-300 hover:text-blue-100 text-xs font-medium px-1 py-1"
                  >
                    查看详情
                  </button>
                  {(char.recognition_count > 0 || char.is_mastered) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleResetCharacter(char.id)
                      }}
                      className="text-yellow-300 hover:text-yellow-100 text-xs font-medium px-1 py-1"
                    >
                      重置
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteCharacter(char.id)
                    }}
                    className="text-red-300 hover:text-red-100 text-xs font-medium px-1 py-1"
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
