// frontend/src/components/Sidebar/ConversationList.jsx
import { useState } from 'react'

const ConversationList = ({ 
  conversations = [], 
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onRenameConversation
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [menuOpenId, setMenuOpenId] = useState(null)

  const formatDate = (date) => {
    const now = new Date()
    const conversationDate = new Date(date)
    const diffMs = now - conversationDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Şimdi'
    if (diffMins < 60) return `${diffMins} dk önce`
    if (diffHours < 24) return `${diffHours} saat önce`
    if (diffDays === 1) return 'Dün'
    if (diffDays < 7) return `${diffDays} gün önce`
    
    return conversationDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    })
  }

  const handleRename = (id) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim())
    }
    setEditingId(null)
    setMenuOpenId(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Bu konuşmayı silmek istediğinizden emin misiniz?')) {
      onDeleteConversation(id)
    }
    setMenuOpenId(null)
  }

  // Kapalı hali (Collapsed)
  if (isCollapsed) {
    return (
      <div className="w-12 h-full flex flex-col items-center py-4 bg-transparent border-r">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-gray-200 rounded-lg text-gray-600"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    // bg-transparent yaptık ki App.jsx'teki görsel rengi (krem) görünsün
    <div className="w-64 flex flex-col h-full bg-transparent text-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="font-semibold text-gray-700">Sohbetler</h2>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 hover:bg-gray-200 rounded text-gray-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Yeni Sohbet</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-2">
        {conversations.length === 0 ? (
          <div className="text-center text-gray-400 py-8 text-sm">
            Henüz sohbet yok
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative mb-1 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? 'bg-indigo-50 border border-indigo-100'
                  : 'hover:bg-gray-200/50'
              }`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="p-3 flex items-start gap-2">
                {/* Icon */}
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"/>
                </svg>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {editingId === conv.id ? (
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(conv.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(conv.id)
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      className="w-full bg-white border border-indigo-300 text-gray-800 px-2 py-1 rounded text-sm focus:outline-none"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <h3 className={`text-sm font-medium truncate ${currentConversationId === conv.id ? 'text-indigo-700' : 'text-gray-700'}`}>
                        {conv.title}
                      </h3>
                      <p className="text-xs text-gray-400">{formatDate(conv.updatedAt)}</p>
                    </>
                  )}
                </div>

                {/* Menu Button */}
                <button
  onClick={(e) => {
    e.stopPropagation()
    setMenuOpenId(menuOpenId === conv.id ? null : conv.id)
  }}
  // text-black ekledik ve opacity'yi artırdık
  className="opacity-60 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity text-black"
>
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
    <circle cx="8" cy="3" r="1.5"/>
    <circle cx="8" cy="8" r="1.5"/>
    <circle cx="8" cy="13" r="1.5"/>
  </svg>
</button>

                {/* Dropdown Menu */}
                {menuOpenId === conv.id && (
                  <div 
                    className="absolute right-2 top-12 bg-white border border-gray-200 rounded-lg shadow-xl z-10 py-1 min-w-[160px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        setEditTitle(conv.title)
                        setEditingId(conv.id)
                        setMenuOpenId(null)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      Yeniden adlandır
                    </button>
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="w-full px-4 py-2 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
                      </svg>
                      Sil
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ConversationList