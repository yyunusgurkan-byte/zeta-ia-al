// 🎯 ZETA AI - FULL RESPONSIVE & OTOMATİK ANALİZ DESTEKLİ VERSIYON
import { useState, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import { useConversations } from './hooks/useConversations'
import { useSpeech } from './hooks/useSpeech'
import { checkHealth } from './services/api'
import ConversationList from './components/Sidebar/ConversationList'

function App() {
  const [input, setInput] = useState('')
  const [healthStatus, setHealthStatus] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
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

  // 📁 DOSYA YÜKLEME VE ANALİZ FONKSİYONU
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const fileContent = event.target.result;
      
      addMessageToConversation({ 
        role: 'user', 
        content: `🔍 "${file.name}" dosyasını yükledim. Lütfen bu kodu analiz et ve hataları listele.` 
      });

      const analysisPrompt = `Aşağıdaki kodu analiz et. Varsa hataları listele ve iyileştirme önerileri sun:
      
      Dosya Adı: ${file.name}
      İçerik:
      \`\`\`javascript
      ${fileContent}
      \`\`\``;

      let activeConv = currentConversation;
      if (!activeConv) {
        activeConv = await createConversation(`${file.name} Analizi`);
      }

      const result = await sendMessage(analysisPrompt, activeConv.id, activeConv.messages || []);

      if (result.success) {
        addMessageToConversation({ role: 'assistant', content: result.message });
        if (isEnabled) speak("Dosya analizi tamamlandı.");
      }
    };

    reader.readAsText(file);
    e.target.value = null;
  };

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
      
      {/* SOL PANEL (Sidebar) */}
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

      {/* Karartma Katmanı */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SAĞ PANEL (Chat Alanı) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">

        {/* Header */}
        <header className="bg-gray-800 text-white px-4 md:px-6 py-2 shadow-lg flex-shrink-0 relative">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 -ml-2 hover:bg-indigo-500 rounded-lg"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            <div className="flex items-center gap-4 flex-1 md:flex-initial justify-center md:justify-start">
              <div className="h-20 md:h-28 w-40 md:w-48 flex items-center justify-center overflow-hidden"> 
                <img 
                  src="https://r.resimlink.com/hvdiOrR3Jub.png"
                  alt="Zeta Logo"
                  className="h-full w-full object-contain transform scale-[2.2] md:scale-[2.5]" 
                />
              </div>
              
              <div className="hidden sm:flex flex-col -ml-6">
                <div className="flex items-center gap-1.5 bg-indigo-900/30 px-3 py-1 rounded-full border border-indigo-400/20">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${healthStatus?.status === 'healthy' ? 'bg-green-400' : 'bg-red-500'}`}></span>
                  <span className="text-[10px] text-indigo-100 font-bold uppercase tracking-tighter">
                    {healthStatus?.status === 'healthy' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* HEADER KONTROLLERİ */}
            <div className="flex items-center gap-3">
              {/* DOSYA YÜKLEME (HEADER) */}
              <input 
                type="file" 
                id="header-file-upload" 
                className="hidden" 
                onChange={handleFileUpload} 
                accept=".js,.jsx,.ts,.tsx,.css,.html,.json"
              />
              <button
                type="button"
                onClick={() => document.getElementById('header-file-upload').click()}
                className="p-2 bg-black hover:bg-gray-700 text-white rounded-lg transition-all border border-gray-600 shadow-md active:scale-95"
                title="Dosya Yükle"
              >
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>

              {/* TTS BUTONU */}
              <button
                onClick={toggleSpeech}
                className={`relative w-16 h-8 md:w-20 md:h-10 flex items-center rounded-full p-1 transition-all duration-500 shadow-inner ${
                  isEnabled ? 'bg-gradient-to-r from-green-400 to-green-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-lg transform transition-transform duration-500 flex items-center justify-center text-[10px] md:text-sm ${
                    isEnabled ? 'translate-x-8 md:translate-x-10' : 'translate-x-0'
                  }`}
                >
                  {isEnabled ? '🔊' : '🔇'}
                </div>
                <div className={`w-full flex justify-between px-2 text-[8px] md:text-[10px] font-black pointer-events-none ${isEnabled ? 'text-white' : 'text-gray-500'}`}>
                  <span className={isEnabled ? 'opacity-100' : 'opacity-0'}>ON</span>
                  <span className={isEnabled ? 'opacity-0' : 'opacity-100'}>OFF</span>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-2xl mb-2 font-bold text-black">Merhaba 👋</p>
                <p className="text-black font-medium">Sana nasıl yardımcı olabilirim?</p>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-xl shadow-sm ${
                  msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100'
                }`}>
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

        {/* Input Only Footer */}
        <footer className="bg-white border-t p-4 flex-shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 bg-white placeholder-black text-black font-medium"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-2 p-1.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-red-900 transition-all"
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