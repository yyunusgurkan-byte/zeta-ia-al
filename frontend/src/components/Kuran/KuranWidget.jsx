import { useState } from 'react'

export default function KuranWidget({ onClose }) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{ background: '#1a1a2e' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="text-white text-sm font-bold">ZETA KUR'AN-I KERİM</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
        )}
      </div>

      {/* iframe */}
      <div className="rounded-b-xl overflow-hidden border border-gray-700 relative">
        {!loaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10" style={{height: 700}}>
            <span className="text-4xl mb-4">📖</span>
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></div>
            </div>
            <p className="text-gray-400 text-sm mt-3">Kur'an-ı Kerim yükleniyor...</p>
          </div>
        )}
        <iframe
          src="https://kuran.diyanet.gov.tr/mushaf"
          width="100%"
          height="700"
          frameBorder="0"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={() => setLoaded(true)}
          style={{ border: 'none', display: 'block' }}
        />
      </div>
    </div>
  )
}