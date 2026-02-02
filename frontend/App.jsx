// 🎯 ZETA AI - BASIT TEST VERSIYONU
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

  // Backend sağlık kontrolü
  useEffect(() => {
    checkHealth()
      .then(data => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline' }))
  }, [])

  // Mesaj gönder
  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')

    // Kullanıcı mesajını ekle
    addMessageToConversation({
      role: 'user',
      content: userMessage
    })

    // Backend'e gönder
    const result = await sendMessage(
      userMessage,
      currentConversation?.id,
      currentConversation?.messages || []
    )

    if (result.success) {
      // AI yanıtını ekle
      addMessageToConversation({
        role: 'assistant',
        content: result.message
      })

      // TTS aktifse seslendir
      if (isEnabled) {
        speak(result.message)
      }
    }
  }

  const messages = currentConversation?.messages || []

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-indigo-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">🤖 Zeta AI</h1>
            <p className="text-sm text-indigo-200">
              Backend: {healthStatus?.status === 'healthy' ? '✅ Bağlı' : '❌ Bağlanamadı'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleSpeech}
              className={`px-4 py-2 rounded-lg ${
                isEnabled ? 'bg-green-500' : 'bg-gray-500'
              }`}
            >
              {isEnabled ? '🔊 TTS Açık' : '🔇 TTS Kapalı'}
            </button>
            <button
              onClick={startNewConversation}
              className="px-4 py-2 bg-blue-500 rounded-lg"
            >
              ➕ Yeni Sohbet
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-800 shadow'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-lg shadow">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Mesajınızı yazın..."
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
          >
            Gönder
          </button>
        </div>
        {error && (
          <p className="max-w-4xl mx-auto mt-2 text-red-500 text-sm">
            ❌ {error}
          </p>
        )}
      </div>
    </div>
  )
}

export default App
