import { useState } from 'react'

// Şehir ve ilçe kodları
const SEHIRLER = [
  { kod: 34, ad: 'İstanbul', ilceler: [
    { kod: 1185, ad: 'Beykoz' }, { kod: 1186, ad: 'Kadıköy' }, { kod: 1187, ad: 'Üsküdar' },
    { kod: 1188, ad: 'Ataşehir' }, { kod: 1189, ad: 'Maltepe' }, { kod: 1190, ad: 'Kartal' },
    { kod: 1191, ad: 'Pendik' }, { kod: 1192, ad: 'Tuzla' }, { kod: 1193, ad: 'Sultanbeyli' },
    { kod: 1194, ad: 'Sancaktepe' }, { kod: 1195, ad: 'Çekmeköy' }, { kod: 1196, ad: 'Şile' },
    { kod: 1197, ad: 'Adalar' }, { kod: 1198, ad: 'Fatih' }, { kod: 1199, ad: 'Beyoğlu' },
    { kod: 1200, ad: 'Beşiktaş' }, { kod: 1201, ad: 'Şişli' }, { kod: 1202, ad: 'Kağıthane' },
    { kod: 1203, ad: 'Eyüpsultan' }, { kod: 1204, ad: 'Sarıyer' }, { kod: 1205, ad: 'Gaziosmanpaşa' },
    { kod: 1206, ad: 'Sultangazi' }, { kod: 1207, ad: 'Bayrampaşa' }, { kod: 1208, ad: 'Güngören' },
    { kod: 1209, ad: 'Bağcılar' }, { kod: 1210, ad: 'Bahçelievler' }, { kod: 1211, ad: 'Bakırköy' },
    { kod: 1212, ad: 'Zeytinburnu' }, { kod: 1213, ad: 'Esenler' }, { kod: 1214, ad: 'Arnavutköy' },
    { kod: 1215, ad: 'Başakşehir' }, { kod: 1216, ad: 'Avcılar' }, { kod: 1217, ad: 'Küçükçekmece' },
    { kod: 1218, ad: 'Bağcılar' }, { kod: 1219, ad: 'Esenyurt' }, { kod: 1220, ad: 'Beylikdüzü' },
    { kod: 1221, ad: 'Büyükçekmece' }, { kod: 1222, ad: 'Çatalca' }, { kod: 1223, ad: 'Silivri' },
  ]},
  { kod: 6, ad: 'Ankara', ilceler: [
    { kod: 100, ad: 'Çankaya' }, { kod: 101, ad: 'Keçiören' }, { kod: 102, ad: 'Yenimahalle' },
    { kod: 103, ad: 'Mamak' }, { kod: 104, ad: 'Altındağ' }, { kod: 105, ad: 'Etimesgut' },
    { kod: 106, ad: 'Sincan' }, { kod: 107, ad: 'Pursaklar' }, { kod: 108, ad: 'Gölbaşı' },
  ]},
  { kod: 35, ad: 'İzmir', ilceler: [
    { kod: 200, ad: 'Konak' }, { kod: 201, ad: 'Bornova' }, { kod: 202, ad: 'Karşıyaka' },
    { kod: 203, ad: 'Buca' }, { kod: 204, ad: 'Çiğli' }, { kod: 205, ad: 'Gaziemir' },
    { kod: 206, ad: 'Balçova' }, { kod: 207, ad: 'Narlıdere' }, { kod: 208, ad: 'Güzelbahçe' },
  ]},
  { kod: 16, ad: 'Bursa', ilceler: [
    { kod: 300, ad: 'Osmangazi' }, { kod: 301, ad: 'Nilüfer' }, { kod: 302, ad: 'Yıldırım' },
    { kod: 303, ad: 'Mudanya' }, { kod: 304, ad: 'Gemlik' }, { kod: 305, ad: 'İnegöl' },
  ]},
  { kod: 7, ad: 'Antalya', ilceler: [
    { kod: 400, ad: 'Muratpaşa' }, { kod: 401, ad: 'Kepez' }, { kod: 402, ad: 'Konyaaltı' },
    { kod: 403, ad: 'Alanya' }, { kod: 404, ad: 'Manavgat' }, { kod: 405, ad: 'Serik' },
  ]},
  { kod: 1, ad: 'Adana', ilceler: [
    { kod: 500, ad: 'Seyhan' }, { kod: 501, ad: 'Çukurova' }, { kod: 502, ad: 'Yüreğir' },
    { kod: 503, ad: 'Sarıçam' },
  ]},
  { kod: 42, ad: 'Konya', ilceler: [
    { kod: 600, ad: 'Selçuklu' }, { kod: 601, ad: 'Meram' }, { kod: 602, ad: 'Karatay' },
  ]},
  { kod: 27, ad: 'Gaziantep', ilceler: [
    { kod: 700, ad: 'Şahinbey' }, { kod: 701, ad: 'Şehitkamil' }, { kod: 702, ad: 'Nizip' },
  ]},
  { kod: 33, ad: 'Mersin', ilceler: [
    { kod: 800, ad: 'Yenişehir' }, { kod: 801, ad: 'Toroslar' }, { kod: 802, ad: 'Mezitli' },
    { kod: 803, ad: 'Akdeniz' },
  ]},
  { kod: 38, ad: 'Kayseri', ilceler: [
    { kod: 900, ad: 'Kocasinan' }, { kod: 901, ad: 'Melikgazi' }, { kod: 902, ad: 'Talas' },
  ]},
  { kod: 61, ad: 'Trabzon', ilceler: [
    { kod: 1000, ad: 'Ortahisar' }, { kod: 1001, ad: 'Akçaabat' }, { kod: 1002, ad: 'Araklı' },
  ]},
  { kod: 55, ad: 'Samsun', ilceler: [
    { kod: 1100, ad: 'Atakum' }, { kod: 1101, ad: 'Canik' }, { kod: 1102, ad: 'İlkadım' },
  ]},
]

export default function EczaneWidget({ onClose }) {
  const [secilenSehir, setSecilenSehir] = useState(SEHIRLER[0])
  const [secilenIlce, setSecilenIlce] = useState(null)
  const [iframeKey, setIframeKey] = useState(0)

  const getLokasyon = () => {
    if (secilenIlce) return secilenIlce.kod
    return secilenSehir.kod
  }

  const handleSehirChange = (e) => {
    const sehir = SEHIRLER.find(s => s.kod === parseInt(e.target.value))
    setSecilenSehir(sehir)
    setSecilenIlce(null)
    setIframeKey(prev => prev + 1)
  }

  const handleIlceChange = (e) => {
    const val = e.target.value
    if (val === '') {
      setSecilenIlce(null)
    } else {
      const ilce = secilenSehir.ilceler.find(i => i.kod === parseInt(val))
      setSecilenIlce(ilce)
    }
    setIframeKey(prev => prev + 1)
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 rounded-t-xl" style={{background:'#1a1a2e'}}>
        <div className="flex items-center gap-2">
          <span className="text-lg">💊</span>
          <span className="text-white text-sm font-bold">NÖBETÇİ ECZANELER</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs">✕ Kapat</button>
        )}
      </div>

      {/* Seçim Alanı */}
      <div className="flex gap-2 px-3 py-2" style={{background:'#16213e'}}>
        {/* Şehir */}
        <select
          value={secilenSehir.kod}
          onChange={handleSehirChange}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-600 text-white font-semibold"
          style={{background:'#0f3460'}}
        >
          {SEHIRLER.map(s => (
            <option key={s.kod} value={s.kod}>{s.ad}</option>
          ))}
        </select>

        {/* İlçe */}
        <select
          value={secilenIlce?.kod || ''}
          onChange={handleIlceChange}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-600 text-white"
          style={{background:'#0f3460'}}
        >
          <option value="">Tüm İlçeler</option>
          {secilenSehir.ilceler.map(i => (
            <option key={i.kod} value={i.kod}>{i.ad}</option>
          ))}
        </select>
      </div>

      {/* iframe */}
      <div className="rounded-b-xl overflow-hidden border border-gray-700">
        <iframe
          key={iframeKey}
          src={`https://www.eczaneler.gen.tr/iframe.php?lokasyon=${getLokasyon()}`}
          width="100%"
          height="350"
          style={{border:'none'}}
          title="Nöbetçi Eczaneler"
        />
      </div>
    </div>
  )
}
