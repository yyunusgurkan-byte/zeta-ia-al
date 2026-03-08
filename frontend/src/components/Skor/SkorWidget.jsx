import { useState, useEffect } from 'react'

const LIGLER = [
  { ad: '🇹🇷 Süper Lig',    key: 'superlig'   },
  { ad: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier Lig', key: 'premier'    },
  { ad: '🇪🇸 La Liga',      key: 'laliga'     },
  { ad: '🇩🇪 Bundesliga',   key: 'bundesliga' },
  { ad: '🇮🇹 Serie A',      key: 'seriea'     },
]

export default function SkorWidget({ onClose }) {
  const [aktif, setAktif] = useState(LIGLER[0])
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchStandings = async (lig) => {
    setLoading(true)
    setError(null)
    setStandings([])
    try {
      const res = await fetch(`https://zeta-ai-backend.onrender.com/api/football/standings/${lig.key}`)
      const data = await res.json()
      if (data.success) {
        setStandings(data.standings)
      } else {
        setError('Veri alınamadı.')
      }
    } catch (e) {
      setError('Bağlantı hatası: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStandings(aktif)
  }, [aktif])

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{ background: '#1a1a2e' }}>
        <div className="flex items-center gap-2">
          <span className="text-lg">⚽</span>
          <span className="text-white text-sm font-bold">ZETA PUAN TABLOSU</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
        )}
      </div>

      {/* Lig Seçici */}
      <div className="flex gap-2 px-3 py-2 flex-wrap" style={{ background: '#16213e' }}>
        {LIGLER.map(lig => (
          <button
            key={lig.key}
            onClick={() => setAktif(lig)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              aktif.key === lig.key
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {lig.ad}
          </button>
        ))}
      </div>

      {/* İçerik */}
      <div className="rounded-b-xl overflow-hidden border border-gray-700 bg-white">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-6 text-center text-red-500">❌ {error}</div>
        )}

        {!loading && !error && standings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-900 text-white text-xs">
                  {['#', 'Takım', 'O', 'G', 'B', 'M', 'GF', 'GA', 'AV', 'P'].map(h => (
                    <th key={h} className="px-2 py-2 text-center font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {standings.map((team, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-100 hover:bg-green-50 transition-colors ${
                      idx < 2 ? 'bg-blue-50' :
                      idx < 4 ? 'bg-blue-50/40' :
                      standings.length - idx <= 3 ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-2 py-2 text-center font-bold text-gray-700 w-8">{team.rank}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {team.logo && (
                          <img src={team.logo} alt={team.team} className="w-5 h-5 object-contain flex-shrink-0" />
                        )}
                        <span className="font-medium text-gray-900 text-xs truncate max-w-[100px]">{team.team}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-gray-600 text-xs">{team.played}</td>
                    <td className="px-2 py-2 text-center text-green-600 font-semibold text-xs">{team.win}</td>
                    <td className="px-2 py-2 text-center text-gray-500 text-xs">{team.draw}</td>
                    <td className="px-2 py-2 text-center text-red-500 text-xs">{team.lose}</td>
                    <td className="px-2 py-2 text-center text-gray-600 text-xs">{team.goalsFor}</td>
                    <td className="px-2 py-2 text-center text-gray-600 text-xs">{team.goalsAgainst}</td>
                    <td className={`px-2 py-2 text-center font-semibold text-xs ${team.goalDiff > 0 ? 'text-green-600' : team.goalDiff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {team.goalDiff > 0 ? '+' : ''}{team.goalDiff}
                    </td>
                    <td className="px-2 py-2 text-center font-bold text-blue-700">{team.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-3 py-2 bg-gray-50 flex gap-4 text-xs text-gray-500">
              <span><span className="inline-block w-3 h-3 bg-blue-200 rounded mr-1"></span>Şampiyonlar Ligi</span>
              <span><span className="inline-block w-3 h-3 bg-red-100 rounded mr-1"></span>Küme düşme</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}