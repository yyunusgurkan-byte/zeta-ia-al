// 🎯 ZETA AI - NETLEŞTİRİLMİŞ ARAYÜZ VERSİYONU
import { useState, useEffect } from 'react'
import { useChat } from './hooks/useChat'
import { useConversations } from './hooks/useConversations'
import { useSpeech } from './hooks/useSpeech'
import { checkHealth } from './services/api'

function App() {
  const [input, setInput] = useState('')
  const [healthStatus, setHealthStatus] = useState(null)
  
  const { sendMessage, loading, error } = useChat()
  const { 
    currentConversation, 
    addMessageToConversation,
    startNewConversation 
  } = useConversations()
  const { speak, isEnabled, toggleSpeech } = useSpeech()

  useEffect(() => {
    checkHealth()
      .then(data => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline' }))
  }, [])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    addMessageToConversation({
      role: 'user',
      content: userMessage
    })

    const result = await sendMessage(
      userMessage,
      currentConversation?.id,
      currentConversation?.messages || []
    )

    if (result.success) {
      addMessageToConversation({
        role: 'assistant',
        content: result.message
      })

      if (isEnabled) {
        speak(result.message)
      }
    }
  }

  const messages = currentConversation?.messages || []

  return (
    // Arka planı görseldeki tona sadık kalarak koruduk
    <div className="min-h-screen bg-[#F8F8F7] flex flex-col font-sans">
      
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 shadow-md sticky top-0 z-10 border-b-2 border-indigo-800">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-full shadow-md">
              <img 
    src="https://r.resimlink.com/hvdiOrR3Jub.png" 
    alt="Zeta Logo" 
    className="h-14 w-14 object-cover rounded-full" 
    style={{ mixBlendMode: 'multiply' }} // Kareleri Header rengiyle kaynaştırmaya çalışır
  />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Zeta AI</h1>
              <p className="text-xs font-bold text-indigo-100 uppercase tracking-tighter">
                {healthStatus?.status === 'healthy' ? '✅ SİSTEM ÇEVRİMİÇİ' : '❌ BAĞLANTI YOK'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button onClick={toggleSpeech} className={`p-2 rounded-lg border-2 transition-all ${isEnabled ? 'bg-green-500 border-green-600' : 'bg-indigo-700 border-indigo-800'}`}>
              {isEnabled ? '🔊' : '🔇'}
            </button>
            <button onClick={startNewConversation} className="px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-black border-2 border-indigo-100 hover:bg-indigo-50">
              YENİ SOHBET
            </button>
          </div>
        </div>
      </div>

      {/* Chat Alanı */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Karşılama Metni - Yazılar artık silik değil, net siyah/gri */}
          {messages.length === 0 && (
            <div className="text-center py-24">
              <div className="bg-white/50 border-2 border-dashed border-gray-300 rounded-3xl p-10 inline-block">
                <h2 className="text-3xl font-black text-gray-800 mb-2">Zeta AI'ya Hoş Geldiniz</h2>
                <p className="text-lg font-bold text-gray-600">Size nasıl yardımcı olabilirim? Bir şeyler sormaya başlayın.</p>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] px-5 py-3 rounded-2xl text-base leading-relaxed border-2 shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white border-indigo-700 rounded-br-none font-medium'
                    : 'bg-white text-gray-900 border-gray-300 rounded-bl-none font-medium'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl border-2 border-gray-200 shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Alanı - Çizgiler ve placeholder netleştirildi */}
      <div className="bg-white border-t-4 border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-3xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajınızı buraya net bir şekilde yazın..."
            // Placeholder rengi "placeholder-gray-500" ile netleştirildi
            className="w-full pl-5 pr-28 py-4 bg-gray-50 border-2 border-gray-400 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 text-gray-900 font-bold placeholder-gray-500 transition-all shadow-inner"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="absolute right-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 disabled:bg-red-900 border-b-4 border-red-900 active:border-b-0 transition-all shadow-lg"
          >
            GÖNDER
          </button>
        </div>
        {error && (
          <p className="max-w-3xl mx-auto mt-2 text-red-600 text-xs font-black text-center bg-red-50 p-2 rounded-lg border border-red-200 uppercase">
            Hata: {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default App