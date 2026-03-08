import { useState } from 'react'

const KATEGORILER = [
  {
    ad: 'Tümü',
    ins: 'SG14BIL,SNZD,SSEK,SG22BIL,SRON,SJPY,SBRL,SCSK,XSLV,USD/TRL,SLYD,XGYARIM,XGLD,SGIKIBUCUK,SG18BIL,SGEL,SJOD,SKWD,SMXN,SINR,STND,SKZT,SARS,SGATA,SBHD,SGGREMSE,SAED,SILS,USGLDKG,SPLN,SPHP,SHUF,XGZIYNET,SZAR,SCUM,SSAR,XHGLD,SHKD,SDKK,SCOP,EUR/TRL,SGBESLI,SUAH,SNOK,SKRW,GBP/TRL,SSYP',
    height: 1443
  },
  {
    ad: '💵 Döviz',
    ins: 'USD/TRL,EUR/TRL,GBP/TRL,SJPY,SSEK,SNZD,SRON,SBRL,SCSK,SLYD,SMXN,SINR,SKRW,SNOK,SUAH,SZAR,SDKK,SHKD,SCOP,SPLN,SPHP,SHUF',
    height: 700
  },
  {
    ad: '🥇 Altın',
    ins: 'XGLD,XGYARIM,SGIKIBUCUK,SG14BIL,SG18BIL,SG22BIL,SGBESLI,SGATA,XGZIYNET,SGGREMSE,XHGLD,USGLDKG',
    height: 400
  },
  {
    ad: '🥈 Gümüş',
    ins: 'XSLV,SGEL',
    height: 120
  },
]

export default function DovizWidget({ onClose }) {
  const [aktifKategori, setAktifKategori] = useState(KATEGORILER[0])
  const [key, setKey] = useState(0)

  const handleKategori = (kat) => {
    setAktifKategori(kat)
    setKey(prev => prev + 1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{background:'#1a1a2e'}}>
        <div className="flex items-center gap-2">
          <span className="text-lg">💱</span>
          <span className="text-white text-sm font-bold">ZETA PİYASALAR</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
        )}
      </div>

      {/* Kategori Butonları */}
      <div className="flex gap-2 px-3 py-2 flex-wrap" style={{background:'#16213e'}}>
        {KATEGORILER.map(kat => (
          <button
            key={kat.ad}
            onClick={() => handleKategori(kat)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
              aktifKategori.ad === kat.ad
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {kat.ad}
          </button>
        ))}
      </div>

      {/* iframe */}
      <div className="rounded-b-xl overflow-hidden border border-gray-700">
        <iframe
          key={key}
          title="Paratic Piyasalar"
          sandbox="allow-modals allow-same-origin allow-scripts allow-popups allow-pointer-lock"
          src={`https://widget.paratic.com/?toolName=liste&background=mavi&header=Piyasalar&ins=${aktifKategori.ins}`}
          frameBorder="0"
          style={{width:'100%', height: aktifKategori.height, border:'none'}}
        />
      </div>
    </div>
  )
}
