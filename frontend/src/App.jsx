// 🎯 ZETA AI - FULL RESPONSIVE & GÜNCEL VERSIYON
import { useState, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import { useConversations } from './hooks/useConversations'
import { useSpeech } from './hooks/useSpeech'
import { checkHealth } from './services/api'
import ConversationList from './components/Sidebar/ConversationList'

function App() {
  const [input, setInput] = useState('')
  const [healthStatus, setHealthStatus] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false) // Mobilde varsayılan kapalı
  
  const { sendMessage, loading, error } = useChat()
  const { 
    conversations,
    currentConversation, 
    addMessageToConversation,
    createConversation,
    loadConversation,
    deleteConversation,
    renameConversation
  } = useConversations()
  const { speak, isEnabled, toggleSpeech } = useSpeech()

  useEffect(() => {
    checkHealth()
      .then(data => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline' }))
  }, [])

  const startNewConversation = async () => {
    await createConversation('Yeni Sohbet')
    if (window.innerWidth < 768) setIsSidebarOpen(false)
  }

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    let activeConv = currentConversation
    if (!activeConv) {
      activeConv = await createConversation('Yeni Sohbet')
    }

    addMessageToConversation({ role: 'user', content: userMessage })
    const result = await sendMessage(userMessage, activeConv.id, activeConv.messages || [])

    if (result.success) {
      addMessageToConversation({ role: 'assistant', content: result.message })
      if (isEnabled) speak(result.message)
    }
  }

  const messages = currentConversation?.messages || []

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden relative">
      
      {/* SOL PANEL (Sidebar) - Mobilde Üstte Açılır, Masaüstünde Sabit */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 w-64 h-full border-r flex-shrink-0 shadow-2xl md:shadow-none`}
        style={{ backgroundColor: '#FDFDFD' }}
      >
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversation?.id}
          onSelectConversation={(id) => {
            loadConversation(id)
            if (window.innerWidth < 768) setIsSidebarOpen(false)
          }}
          onNewConversation={startNewConversation}
          onDeleteConversation={deleteConversation}
          onRenameConversation={renameConversation}
        />
      </aside>

      {/* Karartma Katmanı (Mobilde panel açıkken arkayı kapatır) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SAĞ PANEL (Chat Alanı) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">

        {/* Header */}
        <header className="bg-gray-50 text-white px-4 md:px-6 py-2 shadow-lg flex-shrink-0 relative">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            
            {/* Mobilde Menü Butonu */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-indigo-500 rounded-lg"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Sol Taraf: Dev Logo ve Durum Bilgisi */}
            <div className="flex items-center gap-4 flex-1 md:flex-initial justify-center md:justify-start">
              <div className="h-20 md:h-28 w-40 md:w-48 flex items-center justify-center overflow-hidden"> 
                <img 
                  src="https://r.resimlink.com/hvdiOrR3Jub.png"
                  alt="Zeta Logo"
                  className="h-full w-full object-contain transform scale-[2.2] md:scale-[2.5]" 
                />
              </div>
              
              <div className="hidden sm:flex flex-col -ml-6">
                <div className="flex items-center gap-1.5 bg-gray-900/80 px-3 py-1 rounded-full border border-white-900/20">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${healthStatus?.status === 'healthy' ? 'bg-green-400' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] text-black-900 font-bold uppercase tracking-tighter">
                    {healthStatus?.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sağ Taraf: TTS Toggle Switch */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-xs font-medium text-gray-900">Sesli Yanıt</span>
              <button
                onClick={toggleSpeech}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isEnabled 
                    ? 'bg-gradient-to-r from-red-500 to-green-600 shadow-lg shadow-red-500/50' 
                    : 'bg-red-700'
                }`}
              >
                <span className="sr-only">TTS Toggle</span>
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
                    isEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                >
                  <svg 
                    className={`h-6 w-6 p-1 transition-colors duration-300 ${
                      isEnabled ? 'text-indigo-600' : 'text-gray-400'
                    }`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    {isEnabled ? (
                      <path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6H2.667a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.536l3.533 2.796A.75.75 0 0010 16.25V3.75zM11.25 7a.75.75 0 011.28-.53 5 5 0 010 7.06.75.75 0 11-1.28-.53 3.5 3.5 0 000-6zm2.47-2.47a.75.75 0 011.06 0 8 8 0 010 11.314.75.75 0 01-1.06-1.06 6.5 6.5 0 000-9.194.75.75 0 010-1.06z"/>
                    ) : (
                      <path d="M10.047 3.062a.75.75 0 01.453.688v12.5a.75.75 0 01-1.264.546L5.703 13.5H3.167a.75.75 0 01-.7-.48L1.5 9.75a.75.75 0 01.7-1.02h2.036l3.533-3.296a.75.75 0 01.81-.142zM13.78 7.22a.75.75 0 10-1.06 1.06L14.44 10l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L16.56 10l1.72-1.72a.75.75 0 00-1.06-1.06L15.5 8.94l-1.72-1.72z"/>
                    )}
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-black-900">
                <p className="text-2xl mb-2 font-medium">Merhaba 👋</p>
                <p className="text-gray-500">Sana nasıl yardımcı olabilirim?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[80%] p-4 rounded-xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-800 border border-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Input */}
        <footer className="bg-white border-t p-4 flex-shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <input
  type="text"
  value={input}
  onChange={(e) => setInput(e.target.value)}
  placeholder="Mesajınızı yazın..."
  // border-2 ve border-gray-400 ile çerçeveyi belirginleştirdik
  className="w-full px-4 py-3 pr-12 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white placeholder-black text-black"
  disabled={loading}
  autoFocus
/>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            {error && <p className="mt-2 text-red-500 text-sm">❌ {error}</p>}
          </form>
        </footer>
      </div>
    </div>
  )
}

export default App