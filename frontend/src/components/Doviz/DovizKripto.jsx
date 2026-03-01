// frontend/src/components/Doviz/DovizKripto.jsx

export default function DovizKripto({ data }) {
  if (!data?.success) return null
  const { doviz, kripto, guncelleme } = data

  const formatUSD = (n) => {
    if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
    if (n >= 1) return '$' + n.toFixed(2)
    return '$' + n.toFixed(4)
  }

  const formatTRY = (n) => {
    if (n >= 1000) return '₺' + n.toLocaleString('tr-TR', { maximumFractionDigits: 0 })
    return '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", marginTop: 12 }}>
      {/* DÖVIZ KARTI */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #334155',
        marginBottom: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>💱</span>
            <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Döviz Kurları</span>
            <span style={{
              background: '#22c55e20',
              color: '#22c55e',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 20,
              border: '1px solid #22c55e40'
            }}>CANLI</span>
          </div>
          <span style={{ color: '#64748b', fontSize: 11 }}>🕐 {guncelleme}</span>
        </div>

        {/* Döviz listesi */}
        <div>
          {doviz.map((d, i) => (
            <div key={d.kod} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 18px',
              borderBottom: i < doviz.length - 1 ? '1px solid #1e293b' : 'none',
              transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffffff08'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Bayrak + kod */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 120 }}>
                <div style={{
                  width: 36, height: 36,
                  background: '#334155',
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 700, color: '#94a3b8'
                }}>{d.sembol}</div>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{d.kod}</div>
                  <div style={{ color: '#64748b', fontSize: 10 }}>{d.isim}</div>
                </div>
              </div>

              {/* TRY değeri */}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: 16 }}>
                  ₺{d.try}
                </div>
                {d.not && <div style={{ color: '#64748b', fontSize: 10 }}>{d.not}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KRİPTO KARTI */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1a0f2e 100%)',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #334155',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: 10
        }}>
          <span style={{ fontSize: 20 }}>₿</span>
          <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 15 }}>Kripto Paralar</span>
          <span style={{
            background: '#a855f720',
            color: '#a855f7',
            fontSize: 10,
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: 20,
            border: '1px solid #a855f740'
          }}>CoinGecko</span>
        </div>

        {/* Kripto listesi */}
        <div>
          {kripto.map((k, i) => (
            <div key={k.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 18px',
              borderBottom: i < kripto.length - 1 ? '1px solid #1e293b' : 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#ffffff08'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* İkon + isim */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 140 }}>
                <div style={{
                  width: 36, height: 36,
                  background: k.renk + '22',
                  border: `1px solid ${k.renk}44`,
                  borderRadius: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 800, color: k.renk
                }}>{k.sembol}</div>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 13 }}>{k.isim}</div>
                  <div style={{ color: '#64748b', fontSize: 10 }}>{k.sembol}</div>
                </div>
              </div>

              {/* Fiyatlar */}
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ color: k.renk, fontWeight: 700, fontSize: 15 }}>
                  {formatUSD(k.usd)}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>
                  {formatTRY(k.try)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
