// frontend/src/components/Iddaa/IddaaCard.jsx
import { useState } from 'react'

function getTahmin(mac) {
  const h = parseFloat(mac.avgOdds.home)
  const d = parseFloat(mac.avgOdds.draw)
  const a = parseFloat(mac.avgOdds.away)
  const min = Math.min(h, d, a)
  const fark = 1.2 // Bu kadar yakınsa kombine

  // Üçü de yakınsa 1 0 2
  if (Math.max(h, d, a) - min < fark) 
    return { sonuc: '1 0 2', label: 'Belirsiz', renk: 'bg-gray-500' }

  // Ev ve beraberlik yakınsa 1 0
  if (Math.abs(h - d) < fark && h < a && d < a)
    return { sonuc: '1 0', label: mac.homeTeam, renk: 'bg-green-500' }

  // Deplasman ve beraberlik yakınsa 0 2
  if (Math.abs(a - d) < fark && a < h && d < h)
    return { sonuc: '0 2', label: mac.awayTeam, renk: 'bg-blue-500' }

  // Tek tahmin
  if (min === h) return { sonuc: '1', label: mac.homeTeam, renk: 'bg-green-500' }
  if (min === d) return { sonuc: '0', label: 'Beraberlik', renk: 'bg-yellow-500' }
  return { sonuc: '2', label: mac.awayTeam, renk: 'bg-blue-500' }
}

function OranBar({ label, odd, avgOdd, isMin }) {
  return (
    <div className={`flex-1 rounded-lg p-2 text-center transition-all ${isMin ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700'}`}>
      <div className="text-xs font-semibold mb-1 truncate">{label}</div>
      <div className={`text-lg font-bold ${isMin ? 'text-white' : 'text-gray-900'}`}>{avgOdd}</div>
      <div className={`text-xs ${isMin ? 'text-indigo-200' : 'text-gray-400'}`}>ort.</div>
    </div>
  )
}

export default function IddaaCard({ data }) {
  const [showAll, setShowAll] = useState(false)
  if (!data?.success) return null

  const { maclar, lig, toplam } = data
  const tahminler = maclar.map(m => getTahmin(m))
  const kupon = tahminler.map(t => t.sonuc).join('-')

  const bugunMaclar = maclar.filter(m => {
    const today = new Date().toDateString()
    return new Date(m.commenceTime).toDateString() === today
  })
  const yariMaclar = maclar.filter(m => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return new Date(m.commenceTime).toDateString() === tomorrow.toDateString()
  })

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-md mt-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-emerald-600 px-4 py-3 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-base flex items-center gap-2">
            🎯 {lig} — İddaa Oranları
          </h3>
          <p className="text-green-100 text-xs mt-0.5">{toplam} maç • Ortalama oranlar</p>
        </div>
        <div className="bg-white/20 rounded-lg px-3 py-1.5 text-center">
          <div className="text-white text-xs font-semibold">Tahmin Kuponu</div>
          <div className="text-white font-bold text-sm tracking-widest">{kupon}</div>
        </div>
      </div>

      {/* Maçlar */}
      <div className="divide-y divide-gray-100">
        {maclar.map((mac, idx) => {
          const tahmin = tahminler[idx]
          const hMin = parseFloat(mac.avgOdds.home) <= parseFloat(mac.avgOdds.draw) && parseFloat(mac.avgOdds.home) <= parseFloat(mac.avgOdds.away)
          const dMin = parseFloat(mac.avgOdds.draw) <= parseFloat(mac.avgOdds.home) && parseFloat(mac.avgOdds.draw) <= parseFloat(mac.avgOdds.away)
          const aMin = !hMin && !dMin

          return (
            <div key={mac.id} className="p-3 hover:bg-gray-50 transition-colors">
              {/* Tarih + Saat */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">{mac.tarih} • {mac.saat}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${tahmin.renk}`}>
                  Tahmin: {tahmin.sonuc}
                </span>
              </div>

              {/* Takımlar */}
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-900 text-sm flex-1">{mac.homeTeam}</span>
                <span className="text-gray-400 text-xs px-2">vs</span>
                <span className="font-semibold text-gray-900 text-sm flex-1 text-right">{mac.awayTeam}</span>
              </div>

              {/* Oranlar */}
              <div className="flex gap-2">
                <OranBar label="1 (Ev)" odd={mac.odds.home} avgOdd={mac.avgOdds.home} isMin={hMin} />
                <OranBar label="0 (Ber)" odd={mac.odds.draw} avgOdd={mac.avgOdds.draw} isMin={dMin} />
                <OranBar label="2 (Dep)" odd={mac.odds.away} avgOdd={mac.avgOdds.away} isMin={aMin} />
              </div>

              {/* Bookmaker sayısı */}
              <div className="text-right mt-1">
                <span className="text-xs text-gray-400">{mac.bookmakerCount} bahis sitesi</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-4 py-2 text-center">
        <p className="text-xs text-gray-400">⚠️ Bu tahminler oran analizine dayanır. Bahis oynama konusunda dikkatli olunuz.</p>
      </div>
    </div>
  )
}
