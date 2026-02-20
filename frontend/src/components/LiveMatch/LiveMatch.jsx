// 🏟️ Canlı Maç Component
import { useState, useEffect } from 'react';

const LiveMatch = ({ matchData, statistics, events }) => {
  const [currentTime, setCurrentTime] = useState('');

 useEffect(() => {
  let interval;
  if (showLiveMatch && liveMatchData) {
    interval = setInterval(() => {
      // Belirli aralıklarla maçı tazele
      handleGetLiveMatch(liveMatchData.teams.home.name);
    }, 60000); // Her 1 dakikada bir güncelle
  }
  return () => clearInterval(interval);
}, [showLiveMatch, liveMatchData]);

  if (!matchData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <p className="text-gray-500">Canlı maç bulunamadı</p>
      </div>
    );
  }

  const { fixture, teams, goals, score } = matchData;
  const homeTeam = teams.home;
  const awayTeam = teams.away;
  const homeGoals = goals.home ?? 0;
  const awayGoals = goals.away ?? 0;
  const elapsed = fixture.status.elapsed;
  const status = fixture.status.long;

  // İstatistikleri parse et
  const getStatValue = (teamStats, statType) => {
    const stat = teamStats?.find(s => s.type === statType);
    return stat?.value ?? 0;
  };

  const homeStats = statistics?.[0]?.statistics || [];
  const awayStats = statistics?.[1]?.statistics || [];

  const homePossession = parseInt(getStatValue(homeStats, 'Ball Possession')) || 50;
  const awayPossession = 100 - homePossession;

  // Goller ve kartları filtrele
  const goals_list = events?.filter(e => e.type === 'Goal') || [];
  const cards = events?.filter(e => e.type === 'Card') || [];

  return (
    <div className="bg-gradient-to-br from-green-900 to-green-700 rounded-lg overflow-hidden shadow-xl">
      {/* Header - Dakika ve Lig */}
      <div className="bg-black/30 px-4 py-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          <span className="text-white text-sm font-bold">CANLI</span>
        </div>
        <div className="text-white text-sm">
          {fixture.league.name} • {fixture.league.round}
        </div>
      </div>

      {/* Saha Görseli */}
      <div className="relative p-6">
        {/* Saha çizgileri */}
        <div className="relative bg-green-600 rounded-lg p-4 border-4 border-white/30">
          {/* Orta çizgi */}
          <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/40"></div>
          
          {/* Orta daire */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white/40 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white/40 rounded-full"></div>

          {/* Sol kale */}
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-20 border-2 border-white/40 border-l-0"></div>
          <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-2 h-12 border-2 border-white/40 border-l-0"></div>

          {/* Sağ kale */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-20 border-2 border-white/40 border-r-0"></div>
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-12 border-2 border-white/40 border-r-0"></div>

          {/* Skor Kartı - Merkez */}
          <div className="relative z-10 flex justify-center py-8">
            <div className="bg-white/95 backdrop-blur rounded-lg px-6 py-3 shadow-2xl">
              <div className="flex items-center gap-6">
                {/* Ev Sahibi */}
                <div className="flex items-center gap-3">
                  <img src={homeTeam.logo} alt={homeTeam.name} className="w-10 h-10" />
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{homeTeam.name}</div>
                    <div className="text-xs text-gray-500">Ev Sahibi</div>
                  </div>
                </div>

                {/* Skor */}
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-gray-900">{homeGoals}</span>
                    <span className="text-2xl text-gray-400">-</span>
                    <span className="text-4xl font-bold text-gray-900">{awayGoals}</span>
                  </div>
                  <div className="mt-1 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                    {elapsed}'
                  </div>
                </div>

                {/* Deplasman */}
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <div className="font-bold text-gray-900">{awayTeam.name}</div>
                    <div className="text-xs text-gray-500">Deplasman</div>
                  </div>
                  <img src={awayTeam.logo} alt={awayTeam.name} className="w-10 h-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="bg-white px-6 py-4 space-y-4">
        {/* Top Sahipliği */}
        <div>
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span>{homePossession}%</span>
            <span className="text-gray-500">Top Sahipliği</span>
            <span>{awayPossession}%</span>
          </div>
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="bg-blue-600 transition-all duration-500" 
              style={{ width: `${homePossession}%` }}
            ></div>
            <div 
              className="bg-red-600 transition-all duration-500" 
              style={{ width: `${awayPossession}%` }}
            ></div>
          </div>
        </div>

        {/* Diğer İstatistikler */}
        <div className="grid grid-cols-3 gap-4 text-center text-sm">
          <div>
            <div className="font-bold text-lg">{getStatValue(homeStats, 'Shots on Goal')}</div>
            <div className="text-gray-500">İsabetli Şut</div>
            <div className="font-bold text-lg">{getStatValue(awayStats, 'Shots on Goal')}</div>
          </div>
          <div>
            <div className="font-bold text-lg">{getStatValue(homeStats, 'Corner Kicks')}</div>
            <div className="text-gray-500">Korner</div>
            <div className="font-bold text-lg">{getStatValue(awayStats, 'Corner Kicks')}</div>
          </div>
          <div>
            <div className="font-bold text-lg">{getStatValue(homeStats, 'Fouls')}</div>
            <div className="text-gray-500">Faul</div>
            <div className="font-bold text-lg">{getStatValue(awayStats, 'Fouls')}</div>
          </div>
        </div>

        {/* Goller */}
        {goals_list.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-bold text-sm mb-2">⚽ Goller</h4>
            <div className="space-y-2">
              {goals_list.map((goal, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="font-mono text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    {goal.time.elapsed}'
                  </span>
                  <span className={goal.team.id === homeTeam.id ? 'text-blue-700 font-semibold' : 'text-red-700 font-semibold'}>
                    {goal.player.name}
                  </span>
                  <span className="text-gray-500 text-xs">
                    ({goal.detail})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kartlar */}
        {cards.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-bold text-sm mb-2">🟨 Kartlar</h4>
            <div className="flex gap-2 flex-wrap">
              {cards.map((card, idx) => (
                <div key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                  <span className={card.detail === 'Yellow Card' ? 'text-yellow-500' : 'text-red-500'}>
                    {card.detail === 'Yellow Card' ? '🟨' : '🟥'}
                  </span>
                  <span>{card.player.name}</span>
                  <span className="text-gray-500">({card.time.elapsed}')</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 px-4 py-2 text-center text-xs text-gray-500">
        Güncelleme: {currentTime} • API-Football
      </div>
    </div>
  );
};

export default LiveMatch;
