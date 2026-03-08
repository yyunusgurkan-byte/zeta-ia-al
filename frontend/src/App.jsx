// 🎯 ZETA AI
import { useState, useEffect, useRef } from 'react'
import { useChat } from './hooks/useChat'
import { useConversations } from './hooks/useConversations'
import { useSpeech } from './hooks/useSpeech'
import { checkHealth } from './services/api'
import { searchYouTube } from './services/youtube'
import { getIddaaOdds } from './services/iddaa'
import ConversationList from './components/Sidebar/ConversationList'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import { parseCodeBlocks } from './components/Chat/MessageBubble'
import CodePanel from './components/Chat/CodePanel'
import IddaaCard from './components/Iddaa/IddaaCard'
import EczaneWidget from './components/Eczane/EczaneWidget'
import DovizWidget from './components/Doviz/DovizWidget'
import SkorWidget from './components/Skor/SkorWidget'
import "../css/style.css"

function App() {

  // ── GENEL STATE ──────────────────────────────────────────
  const [input, setInput] = useState('')
  const [healthStatus, setHealthStatus] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  const [codeBlocks, setCodeBlocks] = useState([])
  const [showCodePanel, setShowCodePanel] = useState(false)
  const [showSkor, setShowSkor] = useState(false)

  // ── MÜZİK STATE ──────────────────────────────────────────
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [musicPlaylist, setMusicPlaylist] = useState([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [musicLoading, setMusicLoading] = useState(false)

  // ── CANLI MAÇ STATE ───────────────────────────────────────
  const [showLiveMatch, setShowLiveMatch] = useState(false)

  // ── HAVA DURUMU STATE ─────────────────────────────────────
  const [showWeather, setShowWeather] = useState(false)
  const [weatherCity, setWeatherCity] = useState('Istanbul')

  // ── ECZANE STATE ──────────────────────────────────────────
  const [showEczane, setShowEczane] = useState(false)

  // ── DÖVİZ STATE ───────────────────────────────────────────
  const [showDoviz, setShowDoviz] = useState(false)

  // ── REFS ──────────────────────────────────────────────────
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // ── HOOKS ─────────────────────────────────────────────────
  const { sendMessage, loading, error } = useChat()
  const {
    conversations, currentConversation,
    addMessageToConversation, createConversation,
    loadConversation, deleteConversation, renameConversation
  } = useConversations()
  const { speak, isEnabled, toggleSpeech } = useSpeech()

  // ── EFFECTS ───────────────────────────────────────────────

  useEffect(() => {
    checkHealth()
      .then(data => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline' }))
  }, [])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [currentConversation?.messages])

  useEffect(() => {
    if (showLiveMatch) {
      const configScript = document.createElement('script')
      configScript.type = 'text/javascript'
      configScript.innerHTML = `var proVars={"c_bg":"#2b2b2b","c_clr":"#ffffff","l_bg":"#c7c7c7","l_fw":"bold","m_bg":"#e3e3e3","m_bg2":"#e3e3e3","score_bg":"#b6ece5"};`
      document.body.appendChild(configScript)
      const script = document.createElement('script')
      script.src = 'https://widgets.proscores.app/njs/tr/prolivewidget.js'
      script.async = true
      script.onload = () => { if (window.proScoresInit) window.proScoresInit() }
      document.body.appendChild(script)
      return () => {
        if (document.body.contains(script)) document.body.removeChild(script)
        if (document.body.contains(configScript)) document.body.removeChild(configScript)
      }
    }
  }, [showLiveMatch])

  // ── DOSYA & RESİM YÜKLEME ────────────────────────────────

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (event) => {
      const fileContent = event.target.result
      addMessageToConversation({ role: 'user', content: `📄 "${file.name}" dosyasını yükledim.` })
      const analysisPrompt = `Aşağıdaki kodu analiz et:\n\nDosya: ${file.name}\n\`\`\`javascript\n${fileContent}\n\`\`\``
      let activeConv = currentConversation || await createConversation(`${file.name} Analizi`)
      const result = await sendMessage(analysisPrompt, activeConv.id, activeConv.messages || [])
      if (result.success) {
        addMessageToConversation({ role: 'assistant', content: result.message })
        if (isEnabled) speak("Dosya analizi tamamlandı.")
      }
    }
    reader.readAsText(file)
    e.target.value = null
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageUploading(true)
    try {
      addMessageToConversation({ role: 'user', content: `🖼️ "${file.name}" resmini yükledim.` })
      const formData = new FormData()
      formData.append('image', file)
      formData.append('prompt', 'Bu resimde ne var? Türkçe detaylı açıkla.')
      const response = await fetch('https://zeta-ai-backend.onrender.com/api/upload', { method: 'POST', body: formData })
      const data = await response.json()
      if (data.success) {
        addMessageToConversation({ role: 'assistant', content: data.analysis || '✅ Resim yüklendi!' })
        if (isEnabled && data.analysis) speak("Resim analizi tamamlandı.")
      } else throw new Error(data.message || 'Resim yüklenemedi')
    } catch (err) {
      addMessageToConversation({ role: 'assistant', content: `❌ Resim yüklenemedi: ${err.message}` })
    } finally {
      setImageUploading(false)
      e.target.value = null
    }
  }

  // ── KONUŞMA ──────────────────────────────────────────────

  const startNewConversation = async () => {
    await createConversation('Yeni Sohbet')
    if (window.innerWidth < 768) setIsSidebarOpen(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── MÜZİK FONKSİYONLARI ──────────────────────────────────

  const handlePlayMusic = async (query) => {
    setMusicLoading(true)
    try {
      const results = await searchYouTube(query, 1)
      if (results.length > 0) {
        setMusicPlaylist(results)
        setCurrentSongIndex(0)
        setShowMusicPlayer(true)
        addMessageToConversation({ role: 'assistant', content: `🎵 "${query}" için ${results.length} şarkı bulundu!` })
      } else {
        addMessageToConversation({ role: 'assistant', content: `❌ "${query}" için müzik bulunamadı.` })
      }
    } catch (error) {
      addMessageToConversation({ role: 'assistant', content: `❌ Müzik ararken hata: ${error.message}` })
    } finally {
      setMusicLoading(false)
    }
  }

  const handleAddToPlaylist = async (query) => {
    setMusicLoading(true)
    try {
      const results = await searchYouTube(query, 1)
      if (results.length > 0) {
        const newSong = results[0]
        const exists = musicPlaylist.some(song => song.id === newSong.id)
        if (exists) {
          addMessageToConversation({ role: 'assistant', content: `ℹ️ "${newSong.title}" zaten listede.` })
        } else {
          setMusicPlaylist(prev => [...prev, newSong])
          setShowMusicPlayer(true)
          addMessageToConversation({ role: 'assistant', content: `✅ "${newSong.title}" eklendi! (Toplam: ${musicPlaylist.length + 1})` })
        }
      } else {
        addMessageToConversation({ role: 'assistant', content: `❌ "${query}" için şarkı bulunamadı.` })
      }
    } catch (error) {
      addMessageToConversation({ role: 'assistant', content: `❌ Şarkı eklenirken hata: ${error.message}` })
    } finally {
      setMusicLoading(false)
    }
  }

  const handleNextSong = () => { if (currentSongIndex < musicPlaylist.length - 1) setCurrentSongIndex(prev => prev + 1) }
  const handlePrevSong = () => { if (currentSongIndex > 0) setCurrentSongIndex(prev => prev - 1) }
  const handleSelectSong = (index) => setCurrentSongIndex(index)
  const handleCloseMusicPlayer = () => setShowMusicPlayer(false)

  // ── MESAJ GÖNDERME (handleSend) ───────────────────────────

  const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    const lowerMessage = userMessage.toLowerCase()

    let activeConv = currentConversation || await createConversation('Yeni Sohbet')

    // 🎵 Boş player aç
    if (['çal', 'cal', 'oynat', 'play', 'aç', 'ac'].includes(lowerMessage)) {
      addMessageToConversation({ role: 'user', content: userMessage })
      setMusicPlaylist([])
      setCurrentSongIndex(0)
      setShowMusicPlayer(true)
      addMessageToConversation({ role: 'assistant', content: `🎵 Müzik çalar açıldı!` })
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 🎵 "X ekle" komutu
    if (showMusicPlayer) {
      const addMatch = userMessage.match(/^(.+)[\s]+(ekle|add)$/i)
      if (addMatch && addMatch[1].trim().split(/\s+/).length >= 2) {
        addMessageToConversation({ role: 'user', content: userMessage })
        await handleAddToPlaylist(addMatch[1].trim())
        setTimeout(() => inputRef.current?.focus(), 100)
        return
      }
    }

    // 🎵 "çal X" veya "X çal"
    let query = null
    let isMusic = false
    const startMatch = userMessage.match(/^(çal|cal|oynat|play|aç|ac)[\s]+(.+)$/i)
    if (startMatch && startMatch[2].trim().split(/\s+/).length >= 2) { query = startMatch[2].trim(); isMusic = true }
    if (!isMusic) {
      const endMatch = userMessage.match(/^(.+)[\s]+(çal|cal|oynat|play|aç|ac)$/i)
      if (endMatch && endMatch[1].trim().split(/\s+/).length >= 2) { query = endMatch[1].trim(); isMusic = true }
    }
    if (isMusic && query) {
      addMessageToConversation({ role: 'user', content: userMessage })
      await handlePlayMusic(query)
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 🏟️ Canlı maç
    if (lowerMessage.includes('canlı maç') || lowerMessage.includes('canli mac') ||
        lowerMessage.includes('maç skoru') || lowerMessage.includes('maç sonucu') ||
        lowerMessage.includes('live match') || lowerMessage.includes('tüm maçlar') ||
        lowerMessage.includes('tum maclar') || lowerMessage.includes('skorlar') ||
        lowerMessage.includes('canlı skorlar') || lowerMessage.includes('maçlar')) {
      addMessageToConversation({ role: 'user', content: userMessage })
      setShowLiveMatch(true)
      addMessageToConversation({ role: 'assistant', content: `🏟️ Canlı maç skorları açıldı!` })
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }


     // 📊 Puan Tablosu
if (lowerMessage.includes('puan') || lowerMessage.includes('sıralama') ||
    lowerMessage.includes('tablo') || lowerMessage.includes('standings')) {
  addMessageToConversation({ role: 'user', content: userMessage })
  setShowSkor(true)
  addMessageToConversation({ role: 'assistant', content: '📊 Puan tablosu açıldı!' })
  setTimeout(() => inputRef.current?.focus(), 100)
  return
}

    // 🌤️ Hava durumu
    if (lowerMessage.includes('hava') || lowerMessage.includes('hava durumu') ||
        lowerMessage.includes('sıcaklık') || lowerMessage.includes('sicaklik') ||
        lowerMessage.includes('yağmur') || lowerMessage.includes('kar')) {
      addMessageToConversation({ role: 'user', content: userMessage })
      const sehirler = ['istanbul','ankara','izmir','bursa','antalya','adana','konya','gaziantep','mersin','kayseri','trabzon','samsun','erzurum','diyarbakır','diyarbakir']
      const bulunanSehir = sehirler.find(s => lowerMessage.includes(s)) || 'Istanbul'
      const sehirUrl = bulunanSehir.charAt(0).toUpperCase() + bulunanSehir.slice(1)
      setWeatherCity(sehirUrl)
      setShowWeather(true)
      addMessageToConversation({ role: 'assistant', content: `🌤️ ${sehirUrl} hava durumu yüklendi!` })
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 💱 Döviz & Kripto & Altın
    if (lowerMessage.includes('döviz') || lowerMessage.includes('doviz') ||
        lowerMessage.includes('kripto') || lowerMessage.includes('bitcoin') ||
        lowerMessage.includes('dolar') || lowerMessage.includes('euro') ||
        lowerMessage.includes('kur') || lowerMessage.includes('altın') ||
        lowerMessage.includes('altin') || lowerMessage.includes('piyasa')) {
      addMessageToConversation({ role: 'user', content: userMessage })
      setShowDoviz(true)
      addMessageToConversation({ role: 'assistant', content: '💱 Piyasalar açıldı!' })
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 💊 Nöbetçi Eczane
    if (lowerMessage.includes('eczane') || lowerMessage.includes('nöbetçi')) {
      addMessageToConversation({ role: 'user', content: userMessage })
      setShowEczane(true)
      addMessageToConversation({ role: 'assistant', content: `💊 Nöbetçi eczaneler açıldı!` })
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 🎯 İddaa
    if (lowerMessage.includes('iddaa') || lowerMessage.includes('bahis') ||
        lowerMessage.includes('spor toto') || lowerMessage.includes('maç tahmini') ||
        lowerMessage.includes('toto') || lowerMessage.includes('tahmin')) {
      addMessageToConversation({ role: 'user', content: userMessage })
      addMessageToConversation({ role: 'assistant', content: '🎯 Süper Lig iddaa oranları yükleniyor...' })
      try {
        const data = await getIddaaOdds()
        addMessageToConversation({ role: 'assistant', content: '🎯 **Türkiye Süper Lig** iddaa oranları:', toolData: { type: 'iddaa', ...data } })
      } catch (err) {
        addMessageToConversation({ role: 'assistant', content: `❌ İddaa verisi alınamadı: ${err.message}` })
      }
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 💬 Normal sohbet
    addMessageToConversation({ role: 'user', content: userMessage })
    const result = await sendMessage(userMessage, activeConv.id, activeConv.messages || [])
    if (result.success) {
      addMessageToConversation({ role: 'assistant', content: result.message, toolData: result.toolData || null })
      if (isEnabled) speak(result.message)
    }
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── MESAJ İÇERİĞİ RENDER ─────────────────────────────────

  const renderMessageContent = (content) => {
    if (!content) return null
    const parts = []
    const regex = /```(\w+)?\n?([\s\S]*?)```/g
    let lastIndex = 0
    let match
    let i = 0
    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(<span key={`t${i++}`} style={{whiteSpace:'pre-wrap'}}>{content.slice(lastIndex, match.index)}</span>)
      }
      const lang = match[1] || 'code'
      const code = match[2].trim()
      parts.push(
        <div key={`c${i++}`} style={{margin:'8px 0', borderRadius:8, overflow:'hidden', border:'1px solid #313244', background:'#1e1e2e'}}>
          <div style={{display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'#11111b', borderBottom:'1px solid #313244'}}>
            <span style={{background:'#313244', color:'#89b4fa', fontSize:11, fontWeight:700, padding:'2px 8px', borderRadius:4, textTransform:'uppercase'}}>{lang}</span>
            <span style={{color:'#6c7086', fontSize:12}}>{code.split('\n').length} satır</span>
            <button style={{marginLeft:'auto', background:'#313244', border:'none', color:'#cdd6f4', fontSize:12, padding:'3px 10px', borderRadius:6, cursor:'pointer'}}
              onClick={() => { setCodeBlocks(parseCodeBlocks(content)); setShowCodePanel(true) }}>⬡ Panelde Aç</button>
            <button style={{background:'#313244', border:'none', color:'#cdd6f4', fontSize:12, padding:'3px 8px', borderRadius:6, cursor:'pointer'}}
              onClick={() => navigator.clipboard.writeText(code)}>📋</button>
          </div>
          <pre style={{margin:0, padding:'12px 16px', fontFamily:'Fira Code, Courier New, monospace', fontSize:13, color:'#cdd6f4', overflowX:'auto', maxHeight:150}}>
            <code>{code.split('\n').slice(0,6).join('\n')}{code.split('\n').length > 6 ? `\n... +${code.split('\n').length - 6} satır` : ''}</code>
          </pre>
        </div>
      )
      lastIndex = match.index + match[0].length
      i++
    }
    if (lastIndex < content.length) {
      parts.push(<span key={`t${i++}`} style={{whiteSpace:'pre-wrap'}}>{content.slice(lastIndex)}</span>)
    }
    return parts.length > 0 ? parts : <span style={{whiteSpace:'pre-wrap'}}>{content}</span>
  }

  const messages = currentConversation?.messages || []

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden relative">

      {/* SOL PANEL (Sidebar) */}
      {isSidebarOpen && (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 h-full flex-shrink-0 shadow-2xl border-r transform transition-all duration-300 ease-in-out md:relative" style={{ backgroundColor: '#FDFDFD' }}>
          <div className="w-64 h-full overflow-hidden">
            <ConversationList
              conversations={conversations}
              currentConversationId={currentConversation?.id}
              onSelectConversation={(id) => { loadConversation(id); if (window.innerWidth < 768) setIsSidebarOpen(false) }}
              onNewConversation={startNewConversation}
              onDeleteConversation={deleteConversation}
              onRenameConversation={renameConversation}
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </aside>
      )}

      {/* Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}

      {/* SAĞ PANEL */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white transition-all duration-300 ease-in-out">

        {/* ── HEADER ── */}
        <header className="bg-orange-100 text-white px-4 md:px-6 py-2 shadow-lg flex-shrink-0 relative">
          <div className="max-w-6xl mx-auto flex justify-between items-center">

            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 hover:bg-green-600 rounded-lg block">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-4 flex-1 justify-start">
              <div className="flex items-center justify-center ml-4">
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tighter drop-shadow-2xl" style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.9), 2px 2px 6px rgba(0,0,0,0.7)' }}>
                  AL ZETA
                </h1>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">

                {/* Resim Yükle */}
                <input type="file" id="image-upload" className="hidden" onChange={handleImageUpload} accept="image/jpeg,image/jpg,image/png,image/gif,image/webp" />
                <button type="button" onClick={() => document.getElementById('image-upload').click()} disabled={imageUploading}
                  className="p-2 bg-gray-900 hover:bg-green-700 text-white rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50" title="Resim Yükle">
                  {imageUploading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>

                {/* Müzik Çalar */}
                <button type="button" onClick={() => setShowMusicPlayer(!showMusicPlayer)}
                  className={`p-2 ${showMusicPlayer ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-900 hover:bg-green-700'} text-white rounded-lg transition-all shadow-md active:scale-95`} title="Müzik Çalar">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </button>

                {/* TTS Toggle */}
                <button onClick={toggleSpeech}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out ${isEnabled ? 'bg-gradient-to-r from-green-700 to-green-600' : 'bg-red-900'}`}>
                  <span className="sr-only">TTS Toggle</span>
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ease-in-out ${isEnabled ? 'translate-x-7' : 'translate-x-1'}`}>
                    <svg className={`h-6 w-6 p-1 ${isEnabled ? 'text-indigo-600' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
                      {isEnabled ? (
                        <path d="M10 3.75a.75.75 0 00-1.264-.546L5.203 6H2.667a.75.75 0 00-.75.75v6.5c0 .414.336.75.75.75h2.536l3.533 2.796A.75.75 0 0010 16.25V3.75zM11.25 7a.75.75 0 011.28-.53 5 5 0 010 7.06.75.75 0 11-1.28-.53 3.5 3.5 0 000-6zm2.47-2.47a.75.75 0 011.06 0 8 8 0 010 11.314.75.75 0 01-1.06-1.06 6.5 6.5 0 000-9.194.75.75 0 010-1.06z"/>
                      ) : (
                        <path d="M10.047 3.062a.75.75 0 01.453.688v12.5a.75.75 0 01-1.264.546L5.703 13.5H3.167a.75.75 0 01-.7-.48L1.5 9.75a.75.75 0 01.7-1.02h2.036l3.533-3.296a.75.75 0 01.81-.142zM13.78 7.22a.75.75 0 10-1.06 1.06L14.44 10l-1.72 1.72a.75.75 0 101.06 1.06l1.72-1.72 1.72 1.72a.75.75 0 101.06-1.06L16.56 10l1.72-1.72a.75.75 0 00-1.06-1.06L15.5 8.94l-1.72-1.72z"/>
                      )}
                    </svg>
                  </span>
                </button>
              </div>

              {/* Online Badge */}
              <div className="flex items-center gap-1.5 bg-gray-900/80 px-3 py-1.5 rounded-full border border-gray-300/20">
                <span className={`w-2 h-2 rounded-full animate-pulse ${healthStatus?.status === 'ok' ? 'bg-green-400' : 'bg-red-500'}`}></span>
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">
                  {healthStatus?.status === 'ok' ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </div>

          </div>
        </header>

        {/* ── MESAJLAR ── */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-4">

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-black-900">
                <p className="text-2xl mb-2 font-medium">Merhaba 👋</p>
                <p className="text-gray-900">Sana nasıl yardımcı olabilirim?</p>
              </div>
            )}

            {/* 🎵 MÜZİK ÇALAR */}
            {showMusicPlayer && (
              <div className="max-w-2xl mx-auto">
                <MusicPlayer
                  playlist={musicPlaylist}
                  currentIndex={currentSongIndex}
                  onNext={handleNextSong}
                  onPrev={handlePrevSong}
                  onSelectSong={handleSelectSong}
                  onClose={handleCloseMusicPlayer}
                />
              </div>
            )}

            {/* 🏟️ CANLI MAÇ */}
            {showLiveMatch && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{background:'#1a1a2e'}}>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    <span className="text-white text-sm font-bold">ZETA CANLI SKORLAR</span>
                  </div>
                  <button onClick={() => setShowLiveMatch(false)} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
                </div>
                <div className="rounded-b-xl overflow-hidden shadow-2xl border border-gray-700">
                  <a href="https://www.macsonuclari1.net/" data-w="" title="canlı skor"></a>
                </div>
              </div>
            )}

            {/* 🌤️ HAVA DURUMU */}
            {showWeather && (
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{background:'#1a1a2e'}}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🌤️</span>
                    <span className="text-white text-sm font-bold">ZETA HAVA DURUMU</span>
                  </div>
                  <button onClick={() => setShowWeather(false)} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
                </div>
                <div className="rounded-b-xl overflow-hidden shadow-2xl border border-gray-700">
                  <iframe
                    key={weatherCity}
                    src={`https://wttr.in/${weatherCity}?0&lang=tr`}
                    width="100%"
                    height="250"
                    frameBorder="0"
                    style={{border:'none'}}
                  />
                </div>
              </div>
            )}

            {/* 💊 NÖBETÇİ ECZANE */}
            {showEczane && (
              <EczaneWidget onClose={() => setShowEczane(false)} />
            )}

            {/* 💱 DÖVİZ & PİYASALAR */}
            {showDoviz && (
              <DovizWidget onClose={() => setShowDoviz(false)} />
            )}

            {showSkor && (
  <SkorWidget onClose={() => setShowSkor(false)} />
)}

            {/* ── MESAJ LİSTESİ ── */}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-xl shadow-sm ${msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-600'}`}>

                  <div className="whitespace-pre-wrap">
                    {msg.role === 'user' ? msg.content : renderMessageContent(msg.content)}
                  </div>

                  {/* Wikipedia resimleri */}
                  {msg.toolData?.images && msg.toolData.images.length > 0 && !msg.toolData?.organic && (
                    <div className="mt-4 space-y-3">
                      {msg.toolData.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <img src={img.thumbnail || img.url} alt={msg.toolData.title || 'Wikipedia resmi'}
                            className="w-full h-auto object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(img.url, '_blank')} loading="lazy" />
                          {img.type && (
                            <div className="px-2 py-1 bg-gray-100 text-xs text-gray-600">
                              {img.type === 'main' ? '📸 Ana görsel' : '🖼️ Ek görsel'}
                              {img.width && ` • ${img.width}×${img.height}`}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Wikipedia URL */}
                  {msg.toolData?.url && !msg.toolData?.organic && (
                    <a href={msg.toolData.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Wikipedia'da aç
                    </a>
                  )}

                  {/* Web Search Sonuçları */}
                  {msg.toolData?.organic && (
                    <div className="mt-4 space-y-4">
                      {msg.toolData.knowledgeGraph && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                          <div className="flex gap-4">
                            {msg.toolData.knowledgeGraph.image && <img src={msg.toolData.knowledgeGraph.image} alt={msg.toolData.knowledgeGraph.title} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">{msg.toolData.knowledgeGraph.title}</h3>
                              {msg.toolData.knowledgeGraph.type && <p className="text-sm text-gray-600 mb-2">{msg.toolData.knowledgeGraph.type}</p>}
                              {msg.toolData.knowledgeGraph.description && <p className="text-sm text-gray-700">{msg.toolData.knowledgeGraph.description}</p>}
                            </div>
                          </div>
                        </div>
                      )}
                      {msg.toolData.answerBox && (
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">⚡</span>
                            <div className="flex-1">
                              {msg.toolData.answerBox.title && <h4 className="font-semibold text-gray-900 mb-1">{msg.toolData.answerBox.title}</h4>}
                              <p className="text-gray-800">{msg.toolData.answerBox.answer}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      {msg.toolData.images && msg.toolData.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">🖼️ Resimler</h4>
                          <div className="grid grid-cols-3 gap-2">
                            {msg.toolData.images.slice(0, 6).map((img, imgIdx) => (
                              <img key={imgIdx} src={img.thumbnail} alt={img.title}
                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(img.original || img.link, '_blank')} loading="lazy" />
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.toolData.news && msg.toolData.news.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">📰 Haberler</h4>
                          <div className="space-y-2">
                            {msg.toolData.news.slice(0, 3).map((article, newsIdx) => (
                              <a key={newsIdx} href={article.link} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                                <div className="flex gap-3">
                                  {article.thumbnail && <img src={article.thumbnail} alt={article.title} className="w-16 h-16 rounded object-cover flex-shrink-0" />}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">{article.title}</h5>
                                    <p className="text-xs text-gray-600">{article.source} • {article.date}</p>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.toolData.videos && msg.toolData.videos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">🎥 Videolar</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {msg.toolData.videos.slice(0, 4).map((video, vidIdx) => (
                              <a key={vidIdx} href={video.link} target="_blank" rel="noopener noreferrer" className="block bg-gray-50 hover:bg-gray-100 rounded-lg overflow-hidden transition-colors">
                                {video.thumbnail && <img src={video.thumbnail} alt={video.title} className="w-full h-24 object-cover" />}
                                <div className="p-2">
                                  <h5 className="text-xs font-medium text-gray-900 line-clamp-2">{video.title}</h5>
                                  <p className="text-xs text-gray-600 mt-1">{video.channel}</p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.toolData.organic && msg.toolData.organic.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">🔍 Arama Sonuçları</h4>
                          <div className="space-y-3">
                            {msg.toolData.organic.slice(0, 5).map((result, resultIdx) => (
                              <a key={resultIdx} href={result.url} target="_blank" rel="noopener noreferrer" className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors">
                                <h5 className="text-sm font-semibold text-blue-600 hover:text-blue-800 mb-1">{result.title}</h5>
                                <p className="text-xs text-green-700 mb-1">{result.displayLink}</p>
                                {result.snippet && <p className="text-xs text-gray-700 line-clamp-2">{result.snippet}</p>}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.toolData.relatedSearches && msg.toolData.relatedSearches.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">İlgili Aramalar</h4>
                          <div className="flex flex-wrap gap-2">
                            {msg.toolData.relatedSearches.map((related, relIdx) => (
                              <a key={relIdx} href={related.link} target="_blank" rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs transition-colors">{related.query}</a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Football Sonuçları */}
                  {msg.toolData?.type && ['standings','topscorers','team','live'].includes(msg.toolData.type) && (
                    <div className="mt-4 space-y-4">
                      {msg.toolData.type === 'standings' && msg.toolData.standings && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2"><span className="text-2xl">⚽</span>{msg.toolData.league} Puan Durumu</h3>
                            <span className="text-xs text-green-100">{msg.toolData.source}</span>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>{['#','Takım','O','G','B','M','A','Y','AV','P','Form'].map(h => (<th key={h} className="px-2 py-2 text-center text-xs font-semibold text-gray-600">{h}</th>))}</tr>
                              </thead>
                              <tbody>
                                {msg.toolData.standings.slice(0, 10).map((team, idx) => (
                                  <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${idx < 3 ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-4 py-3 font-semibold text-gray-700">{team.rank}</td>
                                    <td className="px-4 py-3"><div className="flex items-center gap-2">{team.logo && <img src={team.logo} alt={team.team} className="w-6 h-6 object-contain" />}<span className="font-medium text-gray-900">{team.team}</span></div></td>
                                    <td className="px-2 py-3 text-center text-gray-600">{team.played}</td>
                                    <td className="px-2 py-3 text-center text-green-600 font-semibold">{team.win}</td>
                                    <td className="px-2 py-3 text-center text-gray-600">{team.draw}</td>
                                    <td className="px-2 py-3 text-center text-red-600">{team.lose}</td>
                                    <td className="px-2 py-3 text-center text-gray-700">{team.goalsFor}</td>
                                    <td className="px-2 py-3 text-center text-gray-700">{team.goalsAgainst}</td>
                                    <td className={`px-2 py-3 text-center font-semibold ${team.goalDiff > 0 ? 'text-green-600' : team.goalDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>{team.goalDiff > 0 ? '+' : ''}{team.goalDiff}</td>
                                    <td className="px-3 py-3 text-center font-bold text-lg text-blue-600">{team.points}</td>
                                    <td className="px-3 py-3"><div className="flex gap-0.5">{team.form && team.form.split('').map((r, fi) => (<span key={fi} className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold text-white ${r==='W'?'bg-green-500':r==='D'?'bg-gray-400':r==='L'?'bg-red-500':'bg-gray-300'}`}>{r}</span>))}</div></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      {msg.toolData.type === 'topscorers' && msg.toolData.scorers && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2"><span className="text-2xl">👟</span>En İyi Golcüler</h3>
                            <span className="text-xs text-orange-100">{msg.toolData.source}</span>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {msg.toolData.scorers.slice(0, 10).map((player, idx) => (
                              <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl font-bold text-gray-400 w-10 text-center">#{idx+1}</span>
                                  {player.photo && <img src={player.photo} alt={player.name} className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" />}
                                  <div className="flex-1"><h4 className="font-bold text-gray-900">{player.name}</h4><p className="text-sm text-gray-600">{player.team}</p></div>
                                  <div className="flex gap-4 text-right">
                                    <div><div className="text-2xl font-bold text-green-600">{player.goals}</div><div className="text-xs text-gray-500">Gol</div></div>
                                    <div><div className="text-xl font-semibold text-blue-600">{player.assists}</div><div className="text-xs text-gray-500">Asist</div></div>
                                    <div><div className="text-lg text-gray-700">{player.matches}</div><div className="text-xs text-gray-500">Maç</div></div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {msg.toolData.type === 'live' && msg.toolData.matches && (
                        <div className="bg-white rounded-lg border-2 border-red-500 overflow-hidden">
                          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3">
                            <h3 className="text-white font-bold flex items-center gap-2"><span className="animate-pulse">🔴</span>Canlı Maçlar</h3>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {msg.toolData.matches.map((match, idx) => (
                              <div key={idx} className="p-4 bg-red-50">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">{match.home}</span>
                                  <div className="text-center"><div className="text-2xl font-bold text-red-600">{match.score}</div><div className="text-xs text-red-600 font-semibold">{match.status}</div></div>
                                  <span className="font-semibold">{match.away}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* İddaa */}
                  {msg.toolData?.type === 'iddaa' && <IddaaCard data={msg.toolData} />}

                </div>
              </div>
            ))}

            {(loading || imageUploading) && (
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

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* Code Panel */}
        {showCodePanel && (
          <div style={{position:'fixed', right:0, top:0, width:'45%', height:'100vh', zIndex:100}}>
            <CodePanel codeBlocks={codeBlocks} onClose={() => setShowCodePanel(false)} />
          </div>
        )}

        {/* ── INPUT ── */}
        <footer className="bg-white border-t p-4 flex-shrink-0">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mesajınızı yazın..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 bg-white placeholder-black text-black"
                disabled={loading}
              />
              <button type="submit" disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-gray-900 text-white rounded-lg hover:bg-indigo-700 disabled:bg-red-900 transition-all">
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