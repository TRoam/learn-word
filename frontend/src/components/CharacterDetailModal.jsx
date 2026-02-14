import React, { useState, useEffect } from 'react'
import axios from 'axios'

function CharacterDetailModal({ character, onClose, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    pinyin: '',
    definition: '',
    words: '',
    sentences: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (character) {
      // 加载详细信息
      fetchCharacterDetail()
    }
  }, [character])

  const fetchCharacterDetail = async () => {
    try {
      const response = await axios.get(`/api/characters/${character.id}`)
      setFormData({
        pinyin: response.data.pinyin || '',
        definition: response.data.definition || '',
        words: response.data.words || '',
        sentences: response.data.sentences || ''
      })
    } catch (error) {
      console.error('获取详情失败:', error)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      await axios.put(`/api/characters/${character.id}`, formData)
      setEditing(false)
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error('保存失败:', error)
      alert('保存失败，请重试')
    }
    setLoading(false)
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (!character) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-3xl sm:rounded-lg rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto transition-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
        </div>

        {/* 标题栏 */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="text-4xl sm:text-6xl font-bold" style={{ fontFamily: 'serif' }}>
              {character.character}
            </div>
            <div>
              <div className="text-xs sm:text-sm opacity-90">汉字详情</div>
              <div className="text-xs sm:text-sm opacity-75">
                学习进度: {character.recognition_count}/3
                {character.is_mastered && <span className="ml-1 sm:ml-2 bg-green-400 px-1.5 sm:px-2 py-0.5 rounded text-xs">已掌握</span>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1.5 sm:p-2 transition min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 pb-safe-top">
          {/* 编辑/查看切换 */}
          <div className="flex justify-end">
            {editing ? (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditing(false)
                    fetchCharacterDetail() // 重新加载取消更改
                  }}
                  className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm sm:text-base min-h-[44px] active:scale-95"
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition disabled:bg-gray-400 text-sm sm:text-base min-h-[44px] active:scale-95"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-2 text-sm sm:text-base min-h-[44px] active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑
              </button>
            )}
          </div>

          {/* 拼音 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">拼音</label>
            {editing ? (
              <input
                type="text"
                value={formData.pinyin}
                onChange={(e) => handleChange('pinyin', e.target.value)}
                placeholder="例如: hàn"
                className="w-full px-3 sm:px-4 py-3 min-h-[48px] sm:min-h-0 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg sm:text-2xl"
              />
            ) : (
              <div className="text-xl sm:text-2xl text-blue-600 font-medium">
                {formData.pinyin || <span className="text-gray-400 text-base sm:text-lg">未设置</span>}
              </div>
            )}
          </div>

          {/* 释义 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">释义</label>
            {editing ? (
              <textarea
                value={formData.definition}
                onChange={(e) => handleChange('definition', e.target.value)}
                placeholder="输入汉字的含义和解释"
                rows="3"
                className="w-full px-3 sm:px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              />
            ) : (
              <div className="text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                {formData.definition || <span className="text-gray-400">未设置</span>}
              </div>
            )}
          </div>

          {/* 组词 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">组词</label>
            {editing ? (
              <textarea
                value={formData.words}
                onChange={(e) => handleChange('words', e.target.value)}
                placeholder="每行一个词语，例如：&#10;汉字&#10;汉语&#10;汉族"
                rows="5"
                className="w-full px-3 sm:px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm sm:text-base"
              />
            ) : (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                {formData.words ? (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {formData.words.split('\n').filter(w => w.trim()).map((word, index) => (
                      <span
                        key={index}
                        className="inline-block bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-lg text-base sm:text-lg"
                      >
                        {word.trim()}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 text-sm sm:text-base">未设置</span>
                )}
              </div>
            )}
          </div>

          {/* 造句 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">造句示例</label>
            {editing ? (
              <textarea
                value={formData.sentences}
                onChange={(e) => handleChange('sentences', e.target.value)}
                placeholder="每行一个句子，例如：&#10;汉字是世界上最古老的文字之一。&#10;我们要学好汉字。"
                rows="6"
                className="w-full px-3 sm:px-4 py-3 min-h-[48px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
              />
            ) : (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg space-y-2">
                {formData.sentences ? (
                  formData.sentences.split('\n').filter(s => s.trim()).map((sentence, index) => (
                    <div key={index} className="text-gray-700 leading-relaxed text-sm sm:text-base">
                      <span className="inline-block w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full text-center text-xs sm:text-sm leading-5 sm:leading-6 mr-1.5 sm:mr-2 flex-shrink-0">
                        {index + 1}
                      </span>
                      {sentence.trim()}
                    </div>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm sm:text-base">未设置</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CharacterDetailModal
