import { useState } from 'react'

const KATMANLAR = [
  { ad: '🌊 Dalgalar',   overlay: 'waves',       level: 'surface' },
  { ad: '💨 Rüzgar',     overlay: 'wind',        level: 'surface' },
  { ad: '🌡️ Sıcaklık',  overlay: 'temp',        level: 'surface' },
  { ad: '🌧️ Yağmur',    overlay: 'rain',        level: 'surface' },
  { ad: '☁️ Bulut',      overlay: 'clouds',      level: 'surface' },
  { ad: '💧 Nem',        overlay: 'humidity',    level: '850h'    },
  { ad: '🌪️ Basınç',    overlay: 'pressure',    level: 'surface' },
]

const BASE = 'https://embed.windy.com/embed.html'
const LAT = 39.0
const LON = 35.0
const ZOOM = 5

export default function WindyWidget({ onClose }) {
  const [aktif, setAktif] = useState(KATMANLAR[0])
  const [key, setKey] = useState(0)

  const handleKatman = (k) => {
    setAktif(k)
    setKey(prev => prev + 1)
  }

  const src = `${BASE}?type=map&location=coordinates&metricRain=default&metricTemp=default&metricWind=default&zoom=${ZOOM}&overlay=${aktif.overlay}&product=ecmwf&level=${aktif.level}&lat=${LAT}&lon=${LON}`

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{ background: '#1a1a2e' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <span className="text-white text-sm font-bold">ZETA HAVA HARİTASI</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
        )}
      </div>

      {/* İçerik */}
      <div className="flex rounded-b-xl overflow-hidden border border-gray-700" style={{ background: '#16213e' }}>

        {/* Sol - Harita */}
        <div className="flex-1">
          <iframe
            key={key}
            src={src}
            width="100%"
            height="450"
            frameBorder="0"
            style={{ border: 'none', display: 'block' }}
          />
        </div>

        {/* Sağ - Katman Seçici */}
        <div className="flex flex-col gap-2 p-3 w-36 flex-shrink-0" style={{ background: '#16213e' }}>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 text-center">Katman</span>
          {KATMANLAR.map(k => (
            <button
              key={k.overlay}
              onClick={() => handleKatman(k)}
              className={`text-xs px-2 py-2.5 rounded-lg font-semibold transition-all text-left ${
                aktif.overlay === k.overlay
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {k.ad}
            </button>
          ))}
        </div>

      </div>
    </div>
  )
}
