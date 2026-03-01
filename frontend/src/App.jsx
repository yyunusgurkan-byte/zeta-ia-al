// 🎯 ZETA AI - WIKIPEDIA RESİMLERİ + YOUTUBE MÜZİK ÇALAR + CANLI MAÇ
import { useState, useEffect, useRef } from 'react'
import { useChat } from './hooks/useChat'
import { useConversations } from './hooks/useConversations'
import { useSpeech } from './hooks/useSpeech'
import { checkHealth } from './services/api'
import { searchYouTube } from './services/youtube'
import { getLiveMatches, getTeamLiveMatch, getMatchStatistics, getMatchEvents } from './services/football'
import { getNobetciEczaneler } from './services/eczane'
import ConversationList from './components/Sidebar/ConversationList'
import MusicPlayer from './components/MusicPlayer/MusicPlayer'
import LiveMatch from './components/LiveMatch/LiveMatch'
import { parseCodeBlocks } from './components/Chat/MessageBubble'
import CodePanel from './components/Chat/CodePanel'
import { getIddaaOdds } from './services/iddaa'
import IddaaCard from './components/Iddaa/IddaaCard'
import { getDovizKripto } from './services/doviz'
import DovizKripto from './components/Doviz/DovizKripto'
import "../css/style.css";

function App() {
  const [input, setInput] = useState('')
  const [healthStatus, setHealthStatus] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [imageUploading, setImageUploading] = useState(false)
  
  // 🎵 Müzik Player State'leri
  const [showMusicPlayer, setShowMusicPlayer] = useState(false)
  const [musicPlaylist, setMusicPlaylist] = useState([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [musicLoading, setMusicLoading] = useState(false)

  // 🏟️ Canlı Maç State'leri
  const [liveMatchData, setLiveMatchData] = useState(null)
  const [matchStatistics, setMatchStatistics] = useState(null)
  const [matchEvents, setMatchEvents] = useState(null)
  const [showLiveMatch, setShowLiveMatch] = useState(false)
  const [eczaneLoading, setEczaneLoading] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [currentConversation?.messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    checkHealth()
      .then(data => setHealthStatus(data))
      .catch(() => setHealthStatus({ status: 'offline' }))
  }, [])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = async (event) => {
      const fileContent = event.target.result;

      addMessageToConversation({
        role: 'user',
        content: `📄 "${file.name}" dosyasını yükledim. Lütfen bu kodu analiz et ve hataları listele.`
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageUploading(true);

    try {
      addMessageToConversation({
        role: 'user',
        content: `🖼️ "${file.name}" resmini yükledim. Lütfen analiz et.`
      });

      const formData = new FormData();
      formData.append('image', file);
      formData.append('prompt', 'Bu resimde ne var? Türkçe detaylı açıkla.');

      const apiUrl = 'https://zeta-ai-backend.onrender.com';
      const response = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        const analysisText = data.analysis 
          ? data.analysis 
          : '✅ Resim başarıyla yüklendi! (Vision API yapılandırılmamış, analiz yapılamadı.)';

        addMessageToConversation({
          role: 'assistant',
          content: analysisText
        });

        if (isEnabled && data.analysis) {
          speak("Resim analizi tamamlandı.");
        }
      } else {
        throw new Error(data.message || 'Resim yüklenemedi');
      }

    } catch (err) {
      console.error('Resim yükleme hatası:', err);
      addMessageToConversation({
        role: 'assistant',
        content: `❌ Resim yüklenemedi: ${err.message}`
      });
    } finally {
      setImageUploading(false);
      e.target.value = null;
    }
  };

  const startNewConversation = async () => {
    await createConversation('Yeni Sohbet')
    if (window.innerWidth < 768) setIsSidebarOpen(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // 🏟️ Canlı maç verilerini getir
  const handleGetLiveMatch = async (teamName = null) => {
    try {
      let match;
      
      if (teamName) {
        // Belirli bir takımın maçını getir
        match = await getTeamLiveMatch(teamName);
        
        if (!match) {
          addMessageToConversation({
            role: 'assistant',
            content: `❌ ${teamName} için canlı maç bulunamadı.`
          });
          return;
        }
      } else {
        // Tüm canlı maçları getir (ilkini göster)
        const matches = await getLiveMatches();
        
        if (matches.length === 0) {
          addMessageToConversation({
            role: 'assistant',
            content: `❌ Şu an canlı maç bulunmamaktadır.`
          });
          return;
        }
        
        match = matches[0]; // İlk canlı maçı göster
      }
      
      // Maç istatistiklerini ve olaylarını getir
      const [stats, events] = await Promise.all([
        getMatchStatistics(match.fixture.id),
        getMatchEvents(match.fixture.id)
      ]);
      
      setLiveMatchData(match);
      setMatchStatistics(stats);
      setMatchEvents(events);
      setShowLiveMatch(true);
      
      const teamInfo = teamName 
        ? `${teamName} maçı` 
        : `${match.teams.home.name} - ${match.teams.away.name}`;
      
      addMessageToConversation({
        role: 'assistant',
        content: `🏟️ ${teamInfo} için canlı maç bilgileri yüklendi!`
      });
      
    } catch (error) {
      console.error('Canlı maç getirme hatası:', error);
      addMessageToConversation({
        role: 'assistant',
        content: `❌ Canlı maç bilgileri alınamadı: ${error.message}`
      });
    }
  };

  // 🎵 Müzik Fonksiyonları
  const handlePlayMusic = async (query) => {
    setMusicLoading(true)
    try {
      const results = await searchYouTube(query, 1)
      if (results.length > 0) {
        setMusicPlaylist(results) // Yeni liste oluştur
        setCurrentSongIndex(0)
        setShowMusicPlayer(true)
        
        addMessageToConversation({
          role: 'assistant',
          content: `🎵 "${query}" için ${results.length} şarkı bulundu. Müzik çalar açıldı!`
        })
      } else {
        addMessageToConversation({
          role: 'assistant',
          content: `❌ "${query}" için müzik bulunamadı.`
        })
      }
    } catch (error) {
      console.error('Müzik arama hatası:', error)
      addMessageToConversation({
        role: 'assistant',
        content: `❌ Müzik ararken hata oluştu: ${error.message}`
      })
    } finally {
      setMusicLoading(false)
    }
  }

  // 🎵 Playlist'e ekleme fonksiyonu
 const handleAddToPlaylist = async (query) => {
  setMusicLoading(true)
  try {
    const results = await searchYouTube(query, 1)
    if (results.length > 0) {
      const newSong = results[0]
      
      const exists = musicPlaylist.some(song => song.id === newSong.id)
      if (exists) {
        addMessageToConversation({
          role: 'assistant',
          content: `ℹ️ "${newSong.title}" zaten listede mevcut.`
        })
      } else {
        setMusicPlaylist(prev => [...prev, newSong])
        setShowMusicPlayer(true)
        addMessageToConversation({
          role: 'assistant',
          content: `✅ "${newSong.title}" sıraya eklendi! (Toplam: ${musicPlaylist.length + 1} şarkı)`
        })
      }
    } else {
      addMessageToConversation({
        role: 'assistant',
        content: `❌ "${query}" için şarkı bulunamadı.`
      })
    }
  } catch (error) {
    addMessageToConversation({
      role: 'assistant',
      content: `❌ Şarkı eklenirken hata: ${error.message}`
    })
  } finally {
    setMusicLoading(false)
  }
}

  const handleNextSong = () => {
    if (currentSongIndex < musicPlaylist.length - 1) {
      setCurrentSongIndex(prev => prev + 1)
    }
  }

  const handlePrevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1)
    }
  }

  const handleSelectSong = (index) => {
    setCurrentSongIndex(index)
  }

  const handleCloseMusicPlayer = () => {
    setShowMusicPlayer(false)
  }

 const handleSend = async (e) => {
    if (e) e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    const lowerMessage = userMessage.toLowerCase()

    // ✅ HER ZAMAN conversation oluştur (ilk mesajda yoksa yarat)
    let activeConv = currentConversation
    if (!activeConv) {
      activeConv = await createConversation('Yeni Sohbet')
    }

    // 🎵 Sadece "çal/cal/oynat/play/aç/ac" yazıldıysa - boş player aç
    if (['çal', 'cal', 'oynat', 'play', 'aç', 'ac'].includes(lowerMessage)) {
      addMessageToConversation({ role: 'user', content: userMessage })
      setMusicPlaylist([])
      setCurrentSongIndex(0)
      setShowMusicPlayer(true)
      addMessageToConversation({
        role: 'assistant',
        content: `🎵 Müzik çalar açıldı! Şarkı aramak için "çal şarkı adı" yazabilirsiniz.`
      })
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 🎵 "X ekle" komutu - SADECE player açıksa çalışır
    if (showMusicPlayer) {
      const addMatch = userMessage.match(/^(.+)[\s]+(ekle|add)$/i)
      if (addMatch) {
        const query = addMatch[1].trim()
        if (query.split(/\s+/).length >= 2) {
          addMessageToConversation({ role: 'user', content: userMessage })
          await handleAddToPlaylist(query)
          setTimeout(() => inputRef.current?.focus(), 100)
          return
        }
      }
    }

    // 🎵 "çal X" veya "X çal" komutu - Yeni müzik çal
    let query = null
    let isMusic = false
    
    const startMatch = userMessage.match(/^(çal|cal|oynat|play|aç|ac)[\s]+(.+)$/i)
    if (startMatch) {
      const searchQuery = startMatch[2].trim()
      if (searchQuery.split(/\s+/).length >= 2) {
        query = searchQuery
        isMusic = true
      }
    }
    
    if (!isMusic) {
      const endMatch = userMessage.match(/^(.+)[\s]+(çal|cal|oynat|play|aç|ac)$/i)
      if (endMatch) {
        const searchQuery = endMatch[1].trim()
        if (searchQuery.split(/\s+/).length >= 2) {
          query = searchQuery
          isMusic = true
        }
      }
    }
    
    if (isMusic && query) {
      addMessageToConversation({ role: 'user', content: userMessage })
      await handlePlayMusic(query.trim())
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 🏟️ Canlı maç komutları
    if (lowerMessage.includes('canlı maç') || 
        lowerMessage.includes('maç skoru') || 
        lowerMessage.includes('live match') ||
        lowerMessage.includes('maç sonucu') ||
        lowerMessage.includes('canli mac')) {
      
      addMessageToConversation({ role: 'user', content: userMessage });
      
      const teamMatch = userMessage.match(/(?:konyaspor|galatasaray|fenerbahçe|fenerbahce|beşiktaş|besiktas|trabzonspor|başakşehir|basaksehir|ankaragücü|ankaragucu|antalyaspor|alanyaspor|sivasspor|kayserispor|kasımpaşa|kasimpasa|gaziantep|göztepe|goztepe|hatayspor|adana demirspor|fatih karagümrük|fatih karagumruk|giresunspor|İstanbulspor|istanbulspor|pendikspor|rizespor|samsunspor|ümraniye|umraniye)/gi);
      const teamName = teamMatch ? teamMatch[0] : null;
      
      await handleGetLiveMatch(teamName);
      setTimeout(() => inputRef.current?.focus(), 100);
      return;
    }


    // 💱 DÖVİZ & KRİPTO
if (lowerMessage.includes('döviz') || lowerMessage.includes('doviz') ||
    lowerMessage.includes('kripto') || lowerMessage.includes('bitcoin') ||
    lowerMessage.includes('dolar') || lowerMessage.includes('euro') ||
    lowerMessage.includes('kur')) {
  addMessageToConversation({ role: 'user', content: userMessage })
  addMessageToConversation({ role: 'assistant', content: '💱 Döviz ve kripto kurları yükleniyor...' })
  try {
    const data = await getDovizKripto()
    addMessageToConversation({
      role: 'assistant',
      content: '💱 Güncel döviz ve kripto kurları:',
      toolData: { type: 'doviz', ...data }
    })
  } catch (err) {
    addMessageToConversation({ role: 'assistant', content: `❌ Döviz verisi alınamadı: ${err.message}` })
  }
  setTimeout(() => inputRef.current?.focus(), 100)
  return
}

    // 💊 NÖBETÇİ ECZANE
    if (lowerMessage.includes('eczane') && (lowerMessage.includes('nöbet') || lowerMessage.includes('nobet') || lowerMessage.includes('açık') || lowerMessage.includes('acik'))) {
      addMessageToConversation({ role: 'user', content: userMessage })
      const sehirler = ['istanbul','ankara','izmir','bursa','antalya','adana','konya','gaziantep','mersin','kayseri','eskişehir','eskisehir','diyarbakır','diyarbakir','samsun','trabzon','malatya','sakarya','denizli','manisa','balıkesir','balikesir','van','erzurum','kahramanmaraş','kahramanmaras']
      const bulunanSehir = sehirler.find(s => lowerMessage.includes(s)) || 'istanbul'
      const sehirGoster = bulunanSehir.charAt(0).toUpperCase() + bulunanSehir.slice(1)
      setEczaneLoading(true)
      addMessageToConversation({ role: 'assistant', content: `💊 **${sehirGoster}** için nöbetçi eczaneler aranıyor...` })
      try {
        const data = await getNobetciEczaneler(bulunanSehir)
        addMessageToConversation({
          role: 'assistant',
          content: data.success ? `💊 **${data.sehir}** için **${data.toplam}** nöbetçi eczane bulundu:` : `❌ Nöbetçi eczane bilgisi alınamadı.`,
          toolData: data.success ? { type: 'eczane', ...data } : null
        })
      } catch (err) {
        addMessageToConversation({ role: 'assistant', content: `❌ Nöbetçi eczane hatası: ${err.message}` })
      } finally {
        setEczaneLoading(false)
      }
      setTimeout(() => inputRef.current?.focus(), 100)
      return
    }

    // 🎯 İDDAA
if (lowerMessage.includes('iddaa') || lowerMessage.includes('bahis') || 
    lowerMessage.includes('spor toto') || lowerMessage.includes('maç tahmini') ||
    lowerMessage.includes('toto') || lowerMessage.includes('tahmin')) {
  addMessageToConversation({ role: 'user', content: userMessage })
  addMessageToConversation({ role: 'assistant', content: '🎯 Süper Lig iddaa oranları ve tahminler yükleniyor...' })
  try {
    const data = await getIddaaOdds()
    addMessageToConversation({
      role: 'assistant',
      content: '🎯 **Türkiye Süper Lig** iddaa oranları:',
      toolData: { type: 'iddaa', ...data }
    })
  } catch (err) {
    addMessageToConversation({ role: 'assistant', content: `❌ İddaa verisi alınamadı: ${err.message}` })
  }
  setTimeout(() => inputRef.current?.focus(), 100)
  return
}

    // 💬 NORMAL SOHBET
    addMessageToConversation({ role: 'user', content: userMessage })
    const result = await sendMessage(userMessage, activeConv.id, activeConv.messages || [])

    if (result.success) {
      addMessageToConversation({ 
        role: 'assistant', 
        content: result.message,
        toolData: result.toolData || null
      })
      if (isEnabled) speak(result.message)
    }

    setTimeout(() => inputRef.current?.focus(), 100)
  }

const [codeBlocks, setCodeBlocks] = useState([])
const [showCodePanel, setShowCodePanel] = useState(false)

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
          <button
            style={{marginLeft:'auto', background:'#313244', border:'none', color:'#cdd6f4', fontSize:12, padding:'3px 10px', borderRadius:6, cursor:'pointer'}}
            onClick={() => { setCodeBlocks(parseCodeBlocks(content)); setShowCodePanel(true) }}
          >⬡ Panelde Aç</button>
          <button
            style={{background:'#313244', border:'none', color:'#cdd6f4', fontSize:12, padding:'3px 8px', borderRadius:6, cursor:'pointer'}}
            onClick={() => navigator.clipboard.writeText(code)}
          >📋</button>
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

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden relative">

      {/* SOL PANEL (Sidebar) */}
      {isSidebarOpen && (
        <aside
          className="fixed inset-y-0 left-0 z-50 w-64 h-full flex-shrink-0 shadow-2xl border-r transform transition-all duration-300 ease-in-out md:relative"
          style={{ backgroundColor: '#FDFDFD' }}
        >
          <div className="w-64 h-full overflow-hidden">
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
              onClose={() => setIsSidebarOpen(false)}
            />
          </div>
        </aside>
      )}

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SAĞ PANEL (Chat Alanı) */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white transition-all duration-300 ease-in-out">

        {/* Header */}
       <header className="bg-orange-100 text-white px-4 md:px-6 py-2 shadow-lg flex-shrink-0 relative">
          <div className="max-w-6xl mx-auto flex justify-between items-center">

           <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 -ml-2 hover:bg-green-600 rounded-lg block"
            >
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

     <div className="flex items-center gap-4 flex-1 justify-start">
  <div className="flex items-center justify-center ml-4">
    <h1 className="text-5xl md:text-4xl font-black text-white tracking-tighter drop-shadow-2xl" style={{ textShadow: '4px 4px 12px rgba(0,0,0,0.9), 2px 2px 6px rgba(0,0,0,0.7)' }}>
      AL ZETA
    </h1>
  </div>
</div>

           {/* HEADER KONTROLLERİ */}
<div className="flex flex-col items-end gap-1">
  
  {/* Butonlar */}
  <div className="flex items-center gap-2">
    
    {/* 🖼️ RESİM YÜKLEME BUTONU */}
    <input
      type="file"
      id="image-upload"
      className="hidden"
      onChange={handleImageUpload}
      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
    />
    <button
      type="button"
      onClick={() => document.getElementById('image-upload').click()}
      disabled={imageUploading}
      className="p-2 bg-gray-900 hover:bg-green-700 text-white rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
      title="Resim Yükle"
    >
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

    {/* 🎵 MÜZİK ÇALAR BUTONU */}
    <button
      type="button"
      onClick={() => setShowMusicPlayer(!showMusicPlayer)}
      className={`p-2 ${showMusicPlayer ? 'bg-pink-600 hover:bg-pink-700' : 'bg-gray-900 hover:bg-green-700'} text-white rounded-lg transition-all shadow-md active:scale-95`}
      title="Müzik Çalar"
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
      </svg>
    </button>

    {/* TTS Toggle */}
    <button
      onClick={toggleSpeech}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ease-in-out ${
        isEnabled 
          ? 'bg-gradient-to-r from-green-700 to-green-600' 
          : 'bg-red-900'
      }`}
    >
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

        {/* Messages */}
        <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-4">
            
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-black-900">
                <p className="text-2xl mb-2 font-medium">Merhaba 👋</p>
                <p className="text-gray-900">Sana nasıl yardımcı olabilirim?</p>
              </div>
            )}

            {/* 🎵 MÜZİK ÇALAR - Karşılama mesajının hemen altında */}
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

            {/* 🏟️ CANLI MAÇ - Müzik çalardan sonra */}
            {showLiveMatch && liveMatchData && (
              <div className="max-w-2xl mx-auto">
                <LiveMatch 
                  matchData={liveMatchData}
                  statistics={matchStatistics}
                  events={matchEvents}
                />
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] md:max-w-[80%] p-4 rounded-xl shadow-sm ${
                  msg.role === 'user' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900 border border-gray-600'
                }`}>
                  {/* Mesaj içeriği */}
                  <div className="whitespace-pre-wrap">
  {msg.role === 'user' 
    ? msg.content 
    : renderMessageContent(msg.content)
  }
</div>
                  
                  {/* 🖼️ Wikipedia resimleri varsa göster */}
                  {msg.toolData?.images && msg.toolData.images.length > 0 && !msg.toolData?.organic && (
                    <div className="mt-4 space-y-3">
                      {msg.toolData.images.map((img, imgIdx) => (
                        <div key={imgIdx} className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                          <img
                            src={img.thumbnail || img.url}
                            alt={msg.toolData.title || 'Wikipedia resmi'}
                            className="w-full h-auto object-contain max-h-96 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(img.url, '_blank')}
                            loading="lazy"
                          />
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

                  {/* 🔗 Wikipedia URL varsa göster */}
                  {msg.toolData?.url && !msg.toolData?.organic && (
                    <a
                      href={msg.toolData.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Wikipedia'da aç
                    </a>
                  )}

                  {/* 🌐 WEB SEARCH SONUÇLARI */}
                  {msg.toolData?.organic && (
                    <div className="mt-4 space-y-4">
                      
                      {/* Knowledge Graph */}
                      {msg.toolData.knowledgeGraph && (
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                          <div className="flex gap-4">
                            {msg.toolData.knowledgeGraph.image && (
                              <img 
                                src={msg.toolData.knowledgeGraph.image} 
                                alt={msg.toolData.knowledgeGraph.title}
                                className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-gray-900 mb-1">
                                {msg.toolData.knowledgeGraph.title}
                              </h3>
                              {msg.toolData.knowledgeGraph.type && (
                                <p className="text-sm text-gray-600 mb-2">{msg.toolData.knowledgeGraph.type}</p>
                              )}
                              {msg.toolData.knowledgeGraph.description && (
                                <p className="text-sm text-gray-700">{msg.toolData.knowledgeGraph.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Answer Box */}
                      {msg.toolData.answerBox && (
                        <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                          <div className="flex items-start gap-2">
                            <span className="text-2xl">⚡</span>
                            <div className="flex-1">
                              {msg.toolData.answerBox.title && (
                                <h4 className="font-semibold text-gray-900 mb-1">
                                  {msg.toolData.answerBox.title}
                                </h4>
                              )}
                              <p className="text-gray-800">{msg.toolData.answerBox.answer}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Images */}
                      {msg.toolData.images && msg.toolData.images.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            🖼️ Resimler
                          </h4>
                          <div className="grid grid-cols-3 gap-2">
                            {msg.toolData.images.slice(0, 6).map((img, imgIdx) => (
                              <img
                                key={imgIdx}
                                src={img.thumbnail}
                                alt={img.title}
                                className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(img.original || img.link, '_blank')}
                                loading="lazy"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* News */}
                      {msg.toolData.news && msg.toolData.news.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            📰 Haberler
                          </h4>
                          <div className="space-y-2">
                            {msg.toolData.news.slice(0, 3).map((article, newsIdx) => (
                              <a
                                key={newsIdx}
                                href={article.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <div className="flex gap-3">
                                  {article.thumbnail && (
                                    <img 
                                      src={article.thumbnail} 
                                      alt={article.title}
                                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <h5 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                                      {article.title}
                                    </h5>
                                    <p className="text-xs text-gray-600">
                                      {article.source} • {article.date}
                                    </p>
                                  </div>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Videos */}
                      {msg.toolData.videos && msg.toolData.videos.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            🎥 Videolar
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {msg.toolData.videos.slice(0, 4).map((video, vidIdx) => (
                              <a
                                key={vidIdx}
                                href={video.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block bg-gray-50 hover:bg-gray-100 rounded-lg overflow-hidden transition-colors"
                              >
                                {video.thumbnail && (
                                  <img 
                                    src={video.thumbnail} 
                                    alt={video.title}
                                    className="w-full h-24 object-cover"
                                  />
                                )}
                                <div className="p-2">
                                  <h5 className="text-xs font-medium text-gray-900 line-clamp-2">
                                    {video.title}
                                  </h5>
                                  <p className="text-xs text-gray-600 mt-1">
                                    {video.channel}
                                  </p>
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Web Results */}
                      {msg.toolData.organic && msg.toolData.organic.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            🔍 Arama Sonuçları
                          </h4>
                          <div className="space-y-3">
                            {msg.toolData.organic.slice(0, 5).map((result, resultIdx) => (
                              <a
                                key={resultIdx}
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                              >
                                <h5 className="text-sm font-semibold text-blue-600 hover:text-blue-800 mb-1">
                                  {result.title}
                                </h5>
                                <p className="text-xs text-green-700 mb-1">{result.displayLink}</p>
                                {result.snippet && (
                                  <p className="text-xs text-gray-700 line-clamp-2">{result.snippet}</p>
                                )}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Related Searches */}
                      {msg.toolData.relatedSearches && msg.toolData.relatedSearches.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">İlgili Aramalar</h4>
                          <div className="flex flex-wrap gap-2">
                            {msg.toolData.relatedSearches.map((related, relIdx) => (
                              <a
                                key={relIdx}
                                href={related.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-xs transition-colors"
                              >
                                {related.query}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ⚽ FOOTBALL SONUÇLARI */}
                  {msg.toolData?.type && (msg.toolData.type === 'standings' || msg.toolData.type === 'topscorers' || msg.toolData.type === 'team' || msg.toolData.type === 'live') && (
                    <div className="mt-4 space-y-4">
                      
                      {/* PUAN DURUMU */}
                      {msg.toolData.type === 'standings' && msg.toolData.standings && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              <span className="text-2xl">⚽</span>
                              {msg.toolData.league} Puan Durumu
                            </h3>
                            <span className="text-xs text-green-100">{msg.toolData.source}</span>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">#</th>
                                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Takım</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">O</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">G</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">B</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">M</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">A</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">Y</th>
                                  <th className="px-2 py-2 text-center text-xs font-semibold text-gray-600">AV</th>
                                  <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600">P</th>
                                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">Form</th>
                                </tr>
                              </thead>
                              <tbody>
                                {msg.toolData.standings.slice(0, 10).map((team, idx) => (
                                  <tr key={idx} className={`border-b border-gray-100 hover:bg-gray-50 ${idx < 3 ? 'bg-blue-50/30' : ''}`}>
                                    <td className="px-4 py-3 font-semibold text-gray-700">{team.rank}</td>
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2">
                                        {team.logo && (
                                          <img src={team.logo} alt={team.team} className="w-6 h-6 object-contain" />
                                        )}
                                        <span className="font-medium text-gray-900">{team.team}</span>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 text-center text-gray-600">{team.played}</td>
                                    <td className="px-2 py-3 text-center text-green-600 font-semibold">{team.win}</td>
                                    <td className="px-2 py-3 text-center text-gray-600">{team.draw}</td>
                                    <td className="px-2 py-3 text-center text-red-600">{team.lose}</td>
                                    <td className="px-2 py-3 text-center text-gray-700">{team.goalsFor}</td>
                                    <td className="px-2 py-3 text-center text-gray-700">{team.goalsAgainst}</td>
                                    <td className={`px-2 py-3 text-center font-semibold ${team.goalDiff > 0 ? 'text-green-600' : team.goalDiff < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                                      {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
                                    </td>
                                    <td className="px-3 py-3 text-center font-bold text-lg text-blue-600">{team.points}</td>
                                    <td className="px-3 py-3">
                                      <div className="flex gap-0.5">
                                        {team.form && team.form.split('').map((result, formIdx) => (
                                          <span
                                            key={formIdx}
                                            className={`w-5 h-5 rounded-sm flex items-center justify-center text-xs font-bold text-white ${
                                              result === 'W' ? 'bg-green-500' :
                                              result === 'D' ? 'bg-gray-400' :
                                              result === 'L' ? 'bg-red-500' : 'bg-gray-300'
                                            }`}
                                          >
                                            {result}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* EN İYİ GOLCÜLER */}
                      {msg.toolData.type === 'topscorers' && msg.toolData.scorers && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-3 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              <span className="text-2xl">👟</span>
                              En İyi Golcüler
                            </h3>
                            <span className="text-xs text-orange-100">{msg.toolData.source}</span>
                          </div>
                          
                          <div className="divide-y divide-gray-100">
                            {msg.toolData.scorers.slice(0, 10).map((player, idx) => (
                              <div key={idx} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="flex-shrink-0 w-10 text-center">
                                    <span className="text-2xl font-bold text-gray-400">#{idx + 1}</span>
                                  </div>
                                  
                                  {player.photo && (
                                    <img 
                                      src={player.photo} 
                                      alt={player.name}
                                      className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                                    />
                                  )}
                                  
                                  <div className="flex-1">
                                    <h4 className="font-bold text-gray-900">{player.name}</h4>
                                    <p className="text-sm text-gray-600">{player.team}</p>
                                  </div>
                                  
                                  <div className="flex gap-4 text-right">
                                    <div>
                                      <div className="text-2xl font-bold text-green-600">{player.goals}</div>
                                      <div className="text-xs text-gray-500">Gol</div>
                                    </div>
                                    <div>
                                      <div className="text-xl font-semibold text-blue-600">{player.assists}</div>
                                      <div className="text-xs text-gray-500">Asist</div>
                                    </div>
                                    <div>
                                      <div className="text-lg text-gray-700">{player.matches}</div>
                                      <div className="text-xs text-gray-500">Maç</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TAKIM MAÇLARI */}
                      {msg.toolData.type === 'team' && msg.toolData.matches && msg.toolData.matches.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3">
                            <h3 className="text-white font-bold">
                              {msg.toolData.team} - {msg.toolData.matchType === 'next' ? 'Gelecek Maçlar' : 'Son Maçlar'}
                            </h3>
                          </div>
                          
                          <div className="divide-y divide-gray-100">
                            {msg.toolData.matches.map((match, idx) => (
                              <div key={idx} className="p-4 hover:bg-gray-50">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      {match.homeLogo && (
                                        <img src={match.homeLogo} alt={match.home} className="w-8 h-8" />
                                      )}
                                      <span className="font-semibold text-gray-900">{match.home}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="text-center px-4">
                                    <div className="text-xl font-bold text-gray-900">{match.score}</div>
                                    <div className="text-xs text-gray-500 mt-1">{match.date}</div>
                                  </div>
                                  
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-semibold text-gray-900">{match.away}</span>
                                      {match.awayLogo && (
                                        <img src={match.awayLogo} alt={match.away} className="w-8 h-8" />
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CANLI MAÇLAR */}
                      {msg.toolData.type === 'live' && msg.toolData.matches && (
                        <div className="bg-white rounded-lg border-2 border-red-500 overflow-hidden">
                          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 py-3">
                            <h3 className="text-white font-bold flex items-center gap-2">
                              <span className="animate-pulse">🔴</span>
                              Canlı Maçlar
                            </h3>
                          </div>
                          
                          <div className="divide-y divide-gray-100">
                            {msg.toolData.matches.map((match, idx) => (
                              <div key={idx} className="p-4 bg-red-50">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold">{match.home}</span>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{match.score}</div>
                                    <div className="text-xs text-red-600 font-semibold">{match.status}</div>
                                  </div>
                                  <span className="font-semibold">{match.away}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* 💊 NÖBETÇİ ECZANE */}
                  {msg.toolData?.type === 'eczane' && (
                    <div className="mt-3 bg-white rounded-lg border-2 border-green-500 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 flex items-center justify-between">
                        <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                          <span>💊</span>
                          Nöbetçi Eczaneler — {msg.toolData.sehir}
                        </h3>
                        <div className="text-right">
                          <div className="text-xs text-green-100">{msg.toolData.tarih}</div>
                          <div className="text-xs text-green-100">{msg.toolData.toplam} eczane</div>
                        </div>
                      </div>
                      <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                        {msg.toolData.eczaneler && msg.toolData.eczaneler.length === 0 ? (
                          <div className="p-6 text-center text-gray-500">
                            <span className="text-4xl block mb-2">🔍</span>
                            Bugün için nöbetçi eczane bulunamadı.
                          </div>
                        ) : (
                          msg.toolData.eczaneler && msg.toolData.eczaneler.map((eczane, idx) => (
                            <div key={idx} className="p-4 hover:bg-green-50 transition-colors">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm">💊 {eczane.ad}</h4>
                                  {eczane.ilce && (
                                    <span className="inline-block mt-1 text-xs font-semibold bg-green-100 text-gray-900 px-2 py-0.5 rounded-full">
                                      📍 {eczane.ilce}
                                    </span>
                                  )}
                                  {eczane.adres && (
                                    <p className="text-xs font-semibold text-gray-900 mt-1">🗺️ {eczane.adres}</p>
                                  )}
                                </div>
                                {eczane.telefon && (
                                  <a
                                    href={`tel:${eczane.telefon.replace(/\s/g, '')}`}
                                    className="flex-shrink-0 flex items-center gap-1 bg-green-200 text-gray text-xs px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    📞 {eczane.telefon}
                                  </a>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div className="bg-gray-50 px-4 py-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Kaynak: nosyapi.com</span>
                        <a href={msg.toolData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                          Tüm eczaneleri gör →
                        </a>
                      </div>
                    </div>
                  )}

                  {/* 💱 DÖVİZ */}
                  {msg.toolData?.type === 'doviz' && (
                    <div className="mt-3">
                      <DovizKripto data={msg.toolData} />
                    </div>
                  )}
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

{showCodePanel && (
  <div style={{position:'fixed', right:0, top:0, width:'45%', height:'100vh', zIndex:100}}>
    <CodePanel
      codeBlocks={codeBlocks}
      onClose={() => setShowCodePanel(false)}
    />
  </div>
)}

        {/* Input Footer */}
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
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 p-2 bg-gray-900 text-white rounded-lg hover:bg-indigo-700 disabled:bg-red-900 transition-all"
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