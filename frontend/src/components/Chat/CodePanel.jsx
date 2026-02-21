// frontend/src/components/Chat/CodePanel.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── THEME ───────────────────────────────────────────────────────────────────
const T = {
  bg0:       '#0d0d14',
  bg1:       '#12121c',
  bg2:       '#181826',
  bg3:       '#1e1e30',
  border:    '#2a2a3d',
  border2:   '#353550',
  accent:    '#7c6af7',
  accentDim: '#2d2548',
  text:      '#e2e0ff',
  muted:     '#6b6880',
  muted2:    '#8b879e',
  keyword:   '#bd93f9',
  string:    '#50fa7b',
  number:    '#ffb86c',
  comment:   '#4d4e60',
  func:      '#61dafb',
  tag:       '#ff79c6',
  attr:      '#f1fa8c',
  type:      '#8be9fd',
  operator:  '#ff79c6',
  decorator: '#ff9580',
  builtin:   '#8be9fd',
  bool:      '#bd93f9',
  special:   '#ff6e6e',
};

const LANG_CONFIGS = {
  python: {
    keywords: new Set(['def','class','import','from','as','return','if','elif','else','for','while',
      'try','except','finally','raise','with','pass','break','continue','lambda','yield',
      'async','await','not','and','or','in','is','global','nonlocal','del','assert','exec','print']),
    builtins: new Set(['len','range','print','input','type','str','int','float','list','dict',
      'set','tuple','bool','None','True','False','super','self','cls','open','zip','map',
      'filter','enumerate','sorted','reversed','isinstance','hasattr','getattr','setattr']),
    booleans: new Set(['True','False','None']),
    commentChar: '#',
    strings: ['"','\'','`'],
    multilineStrings: ['"""',"'''"],
  },
  javascript: {
    keywords: new Set(['import','export','default','from','const','let','var','function','return',
      'if','else','for','while','class','extends','new','this','async','await',
      'try','catch','throw','typeof','instanceof','void','in','of','switch','case',
      'break','continue','static','super','yield','delete','debugger','do']),
    builtins: new Set(['console','window','document','Math','Array','Object','String','Number',
      'Boolean','Promise','fetch','setTimeout','setInterval','clearTimeout','clearInterval',
      'JSON','localStorage','sessionStorage','navigator','location','history','Event']),
    booleans: new Set(['true','false','null','undefined','NaN','Infinity']),
    commentChar: '//',
    strings: ['"',"'",'`'],
  },
  jsx: {
    keywords: new Set(['import','export','default','from','const','let','var','function','return',
      'if','else','for','while','class','extends','new','this','async','await',
      'try','catch','throw','typeof','instanceof','void','in','of','switch','case',
      'break','continue','static','super','yield','useState','useEffect','useRef',
      'useCallback','useMemo','useContext','useReducer']),
    builtins: new Set(['React','console','window','document','Math','Array','Object','String',
      'Number','Boolean','Promise','fetch','setTimeout','setInterval','JSON','props',
      'children','className','style','onClick','onChange','onSubmit','key','ref']),
    booleans: new Set(['true','false','null','undefined']),
    commentChar: '//',
    strings: ['"',"'",'`'],
    isJSX: true,
  },
  html: { isHTML: true },
  css:  { isCSS: true },
};

// ─── CLIPBOARD HELPER ─────────────────────────────────────────────────────────
const copyToClipboard = (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
};

// ─── SYNTAX HIGHLIGHTER ───────────────────────────────────────────────────────
const tokenizeLine = (line, config, langKey) => {
  const tokens = [];
  let i = 0;

  if (!config) {
    tokens.push({ text: line, color: T.text });
    return tokens;
  }

  if (config.isHTML) {
    let rest = line;
    if (rest.includes('<!--')) {
      const start = rest.indexOf('<!--');
      if (start > 0) tokens.push({ text: rest.slice(0, start), color: T.text });
      tokens.push({ text: rest.slice(start), color: T.comment });
      return tokens;
    }
    const tagRe = /(<\/?)([\w-]+)((?:\s+[\w:-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]*))?)*)\s*(\/?>)/g;
    let lastIdx = 0;
    let m;
    while ((m = tagRe.exec(rest)) !== null) {
      if (m.index > lastIdx) tokens.push({ text: rest.slice(lastIdx, m.index), color: T.text });
      tokens.push({ text: m[1], color: T.muted2 });
      tokens.push({ text: m[2], color: T.tag });
      const attrStr = m[3];
      if (attrStr) {
        const attrTokens = [];
        let aLast = 0, am;
        const fullAttr = attrStr;
        while ((am = /([\w:-]+)(=(?:"[^"]*"|'[^']*'|[^\s>]*))?/g.exec(fullAttr.slice(aLast))) !== null) {
          if (am.index + aLast > aLast && am.index > 0) {
            attrTokens.push({ text: fullAttr.slice(aLast, am.index + aLast), color: T.text });
          }
          if (am[2]) {
            attrTokens.push({ text: am[1], color: T.attr });
            attrTokens.push({ text: '=', color: T.operator });
            attrTokens.push({ text: am[2].slice(1), color: T.string });
          } else {
            attrTokens.push({ text: am[1], color: T.attr });
          }
          aLast = am.index + aLast + am[0].length;
          if (aLast >= fullAttr.length) break;
        }
        attrTokens.forEach(t => tokens.push(t));
      }
      tokens.push({ text: m[4], color: T.muted2 });
      lastIdx = m.index + m[0].length;
    }
    if (lastIdx < rest.length) tokens.push({ text: rest.slice(lastIdx), color: T.text });
    return tokens;
  }

  if (config.isCSS) {
    if (line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return [{ text: line, color: T.comment }];
    }
    const propRe = /^(\s*)([\w-]+)(\s*:\s*)(.*?)(;?)$/;
    const m = propRe.exec(line);
    if (m) {
      return [
        { text: m[1], color: T.text },
        { text: m[2], color: T.attr },
        { text: m[3], color: T.operator },
        { text: m[4], color: T.string },
        { text: m[5], color: T.muted2 },
      ];
    }
    if (line.trim().startsWith('@')) return [{ text: line, color: T.keyword }];
    return [{ text: line, color: T.text }];
  }

  const { keywords, builtins, booleans, commentChar, strings: strChars, isJSX } = config;

  while (i < line.length) {
    if (commentChar && line.startsWith(commentChar, i)) {
      tokens.push({ text: line.slice(i), color: T.comment });
      break;
    }
    if (line[i] === '@' && i === line.search(/\S/)) {
      let j = i + 1;
      while (j < line.length && /[\w.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: T.decorator });
      i = j; continue;
    }
    if (strChars && strChars.includes(line[i])) {
      const q = line[i];
      let j = i + 1;
      while (j < line.length && line[j] !== q) { if (line[j] === '\\') j++; j++; }
      j++;
      tokens.push({ text: line.slice(i, j), color: T.string });
      i = j; continue;
    }
    if (isJSX && line[i] === '<') {
      let j = i + 1;
      const isClose = line[j] === '/';
      if (isClose) j++;
      const start = j;
      while (j < line.length && /[\w.]/.test(line[j])) j++;
      if (j > start) {
        const tagName = line.slice(start, j);
        const isComponent = /^[A-Z]/.test(tagName);
        tokens.push({ text: '<', color: T.muted2 });
        if (isClose) tokens.push({ text: '/', color: T.muted2 });
        tokens.push({ text: tagName, color: isComponent ? T.func : T.tag });
        i = j; continue;
      }
    }
    if (/\d/.test(line[i]) && (i === 0 || !/\w/.test(line[i - 1]))) {
      let j = i;
      while (j < line.length && /[\d._xXa-fA-FoObB]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: T.number });
      i = j; continue;
    }
    if (/[a-zA-Z_$]/.test(line[i])) {
      let j = i;
      while (j < line.length && /[\w$]/.test(line[j])) j++;
      const word = line.slice(i, j);
      let color = T.text;
      if (booleans?.has(word)) color = T.bool;
      else if (keywords?.has(word)) color = T.keyword;
      else if (builtins?.has(word)) color = T.builtin;
      else if (/[A-Z]/.test(word[0])) color = T.type;
      else if (line[j] === '(') color = T.func;
      tokens.push({ text: word, color });
      i = j; continue;
    }
    if (/[+\-*/%=!<>&|^~?:,.]/.test(line[i])) {
      tokens.push({ text: line[i], color: T.operator });
      i++; continue;
    }
    tokens.push({ text: line[i], color: T.text });
    i++;
  }

  return tokens;
};

const detectLang = (language, code) => {
  const l = (language || '').toLowerCase();
  if (['jsx','tsx'].includes(l)) return 'jsx';
  if (['js','javascript','ts','typescript'].includes(l)) return 'javascript';
  if (l === 'python' || l === 'py') return 'python';
  if (l === 'html') return 'html';
  if (l === 'css' || l === 'scss' || l === 'sass') return 'css';
  if (code?.includes('def ') && code?.includes(':')) return 'python';
  if (code?.includes('import React') || code?.includes('useState') || code?.includes('jsx')) return 'jsx';
  if (code?.includes('const ') || code?.includes('function ')) return 'javascript';
  if (code?.includes('<html') || code?.includes('<!DOCTYPE')) return 'html';
  if (code?.includes('{') && code?.includes(':') && code?.includes(';')) return 'css';
  return 'javascript';
};

const LANG_LABELS = {
  python: 'Python', javascript: 'JavaScript', jsx: 'JSX / React',
  html: 'HTML', css: 'CSS', code: 'Code',
};

const LANG_ICONS = {
  python: '🐍', javascript: '⚡', jsx: '⚛️',
  html: '🌐', css: '🎨', code: '📄',
};

const highlight = (code, langKey) => {
  const config = LANG_CONFIGS[langKey] || null;
  return (code || '').split('\n').map((line, idx) => (
    <div key={idx} style={{ lineHeight: '1.65', minHeight: '1.65em', display: 'flex' }}>
      {tokenizeLine(line, config, langKey).map((t, i) => (
        <span key={i} style={{ color: t.color, whiteSpace: 'pre' }}>{t.text}</span>
      ))}
      {!line && <span style={{ whiteSpace: 'pre' }}> </span>}
    </div>
  ));
};

// ─── PREVIEW BUILDER ──────────────────────────────────────────────────────────
const buildCombinedPreview = (codeBlocks) => {
  let htmlParts = [], cssParts = [], jsParts = [];

  const fullHtml = codeBlocks.find(b => b.code &&
    (b.code.includes('<!DOCTYPE') || b.code.includes('<html')));
  if (fullHtml) return fullHtml.code;

  codeBlocks.forEach(block => {
    const lang = (block.language || '').toLowerCase();
    const code = block.code || '';
    const looksLikeCSS = (lang === 'css' || lang === 'scss') &&
      !code.includes('function') && !code.includes('var ') &&
      !code.includes('const ') && !code.includes('document.');
    const looksLikeHTML = lang === 'html' ||
      (code.trim().startsWith('<') && !code.includes('function'));
    if (looksLikeCSS) cssParts.push(code);
    else if (looksLikeHTML) htmlParts.push(code);
    else jsParts.push(code);
  });

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { background: #0d0d14; color: #e2e0ff; font-family: 'Segoe UI', sans-serif; padding: 20px; margin: 0; }
  ${cssParts.join('\n')}
</style>
</head>
<body>
  ${htmlParts.join('\n')}
  <script>
    try {
      ${jsParts.join('\n')}
    } catch(e) {
      document.body.innerHTML += '<div style="color:#ff6e6e;padding:10px;background:#2a1020;border-radius:8px;margin-top:12px;">❌ ' + e.message + '</div>';
    }
  <\/script>
</body>
</html>`;
};

const shouldShowPreview = (codeBlocks) =>
  codeBlocks.some(block => {
    const lang = (block.language || '').toLowerCase();
    const code = block.code || '';
    return ['html','css','javascript','js','jsx','tsx','ts','code'].includes(lang)
      || code.includes('<div') || code.includes('<html')
      || code.includes('document.') || code.includes('getElementById')
      || code.includes('setInterval') || code.includes('function')
      || code.includes('const ') || code.includes('var ');
  });

// ─── LIVE PREVIEW ─────────────────────────────────────────────────────────────
const LivePreview = ({ codeBlocks }) => {
  const iframeRef = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const html = buildCombinedPreview(codeBlocks);
    const iframe = iframeRef.current;
    if (!iframe) return;
    setLoading(true);
    iframe.src = 'about:blank';
    setTimeout(() => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.open(); doc.write(html); doc.close();
        setLoading(false);
      } catch (e) { setLoading(false); }
    }, 60);
  }, [codeBlocks]);

  return (
    <div style={{ borderRadius: 12, overflow: 'hidden', border: `1px solid ${T.border2}`, background: T.bg1 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: T.bg0, borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%', background: '#50fa7b',
            boxShadow: '0 0 8px #50fa7b99',
            animation: loading ? 'none' : 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ color: T.text, fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>
            CANLI ÖNİZLEME
          </span>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: T.bg3, border: `1px solid ${T.border}`, color: T.muted2,
            fontSize: 11, padding: '4px 12px', borderRadius: 6, cursor: 'pointer',
            fontWeight: 600, letterSpacing: '0.03em', transition: 'all 0.2s',
          }}
        >
          {expanded ? '⬆ Küçült' : '⬇ Genişlet'}
        </button>
      </div>
      {loading && (
        <div style={{
          height: 4, background: `linear-gradient(90deg, transparent, ${T.accent}, transparent)`,
          animation: 'shimmer 1.5s ease-in-out infinite',
          backgroundSize: '200% 100%',
        }} />
      )}
      <iframe
        ref={iframeRef}
        style={{
          width: '100%', height: expanded ? 440 : 240,
          border: 'none', background: T.bg0, display: 'block',
          transition: 'height 0.35s cubic-bezier(0.4,0,0.2,1)',
        }}
        title="Canlı Önizleme"
      />
    </div>
  );
};

// ─── CODE BLOCK ───────────────────────────────────────────────────────────────
const CodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const [hovered, setHovered] = useState(false);
  const langKey = detectLang(language, code);
  const lines = (code || '').split('\n');
  const label = LANG_LABELS[langKey] || language || 'Code';
  const icon = LANG_ICONS[langKey] || '📄';

  const copy = useCallback(() => {
    copyToClipboard(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }, [code]);

  return (
    <div
      style={{
        borderRadius: 12, overflow: 'hidden',
        border: `1px solid ${hovered ? T.border2 : T.border}`,
        background: T.bg1, transition: 'border-color 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 16px', background: T.bg0, borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 14 }}>{icon}</span>
          <span style={{
            color: T.accent, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            {label}
          </span>
          <span style={{
            background: T.bg3, color: T.muted, fontSize: 10,
            padding: '2px 7px', borderRadius: 4, fontWeight: 600,
          }}>
            {lines.length} satır
          </span>
        </div>
        <button
          onClick={copy}
          style={{
            background: copied ? '#1a3a25' : T.bg3,
            border: `1px solid ${copied ? '#50fa7b44' : T.border}`,
            color: copied ? '#50fa7b' : T.muted2,
            fontSize: 11, padding: '5px 14px', borderRadius: 7,
            cursor: 'pointer', fontWeight: 600, letterSpacing: '0.03em',
            transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {copied ? '✓ Kopyalandı' : '⎘ Kopyala'}
        </button>
      </div>

      <div style={{ display: 'flex', overflowX: 'auto' }}>
        <div style={{
          padding: '14px 10px', background: T.bg0, borderRight: `1px solid ${T.border}`,
          userSelect: 'none', flexShrink: 0, minWidth: 44,
        }}>
          {lines.map((_, i) => (
            <div key={i} style={{
              color: T.comment, fontSize: 12, fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              lineHeight: '1.65', textAlign: 'right', paddingRight: 2,
            }}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre style={{
          margin: 0, padding: '14px 20px',
          fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
          fontSize: 13, lineHeight: '1.65', color: T.text,
          background: T.bg1, flex: 1, overflowX: 'auto',
        }}>
          {highlight(code, langKey)}
        </pre>
      </div>
    </div>
  );
};

// ─── MAIN PANEL ───────────────────────────────────────────────────────────────
const CodePanel = ({ codeBlocks, onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!codeBlocks || codeBlocks.length === 0) return null;

  const active = codeBlocks[activeIndex];
  const showPreview = shouldShowPreview(codeBlocks);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: T.bg0, borderLeft: `2px solid ${T.border2}`, overflow: 'hidden',
      fontFamily: "'Segoe UI', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a3d; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #353550; }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', background: T.bg1, borderBottom: `1px solid ${T.border}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: T.accentDim,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
          }}>
            ⌨️
          </div>
          <div>
            <div style={{ color: T.text, fontWeight: 700, fontSize: 14, letterSpacing: '-0.01em' }}>
              Kod Görünümü
            </div>
            <div style={{ color: T.muted, fontSize: 11, marginTop: 1 }}>
              {codeBlocks.length} blok · Zeta AI
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, marginRight: 8 }}>
            {['#ff5f57','#febc2e','#28c840'].map((c, i) => (
              <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c, opacity: 0.8 }} />
            ))}
          </div>
          <button
            onClick={onClose}
            style={{
              background: T.bg3, border: `1px solid ${T.border}`, color: T.muted,
              cursor: 'pointer', fontSize: 13, width: 30, height: 30, borderRadius: 7,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.target.style.background = '#3a1a2a'; e.target.style.color = T.special; }}
            onMouseLeave={e => { e.target.style.background = T.bg3; e.target.style.color = T.muted; }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tabs */}
      {codeBlocks.length > 1 && (
        <div style={{
          display: 'flex', background: T.bg1, borderBottom: `1px solid ${T.border}`,
          overflowX: 'auto', flexShrink: 0, padding: '0 12px', gap: 4,
        }}>
          {codeBlocks.map((block, i) => {
            const lk = detectLang(block.language, block.code);
            const isActive = i === activeIndex;
            return (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                style={{
                  padding: '10px 16px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${isActive ? T.accent : 'transparent'}`,
                  color: isActive ? T.accent : T.muted,
                  cursor: 'pointer', fontSize: 12, fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.2s',
                }}
              >
                <span>{LANG_ICONS[lk] || '📄'}</span>
                <span>{LANG_LABELS[lk] || block.language || 'Code'}</span>
                <span style={{
                  background: isActive ? T.accentDim : T.bg3,
                  color: isActive ? T.accent : T.muted,
                  fontSize: 9, padding: '1px 5px', borderRadius: 3, fontWeight: 700,
                }}>
                  #{i + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <CodeBlock code={active.code} language={active.language} />

        {showPreview && <LivePreview codeBlocks={codeBlocks} />}

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 8, padding: '4px 0', alignItems: 'center',
        }}>
          <button
            onClick={() => {
              const blob = new Blob([active.code], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              const ext = { python: 'py', javascript: 'js', jsx: 'jsx', html: 'html', css: 'css' };
              const lk = detectLang(active.language, active.code);
              a.href = url; a.download = `code.${ext[lk] || 'txt'}`; a.click();
              URL.revokeObjectURL(url);
            }}
            style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg2, color: T.muted2, fontSize: 12, cursor: 'pointer',
              fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.border2}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >
            ⬇ İndir
          </button>
          <button
            onClick={() => copyToClipboard(codeBlocks.map(b => b.code).join('\n\n'))}
            style={{
              padding: '7px 16px', borderRadius: 8, border: `1px solid ${T.border}`,
              background: T.bg2, color: T.muted2, fontSize: 12, cursor: 'pointer',
              fontWeight: 600, transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.border2}
            onMouseLeave={e => e.currentTarget.style.borderColor = T.border}
          >
            📋 Tümünü Kopyala
          </button>
          <span style={{
            marginLeft: 'auto', color: T.muted, fontSize: 11,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.accent, display: 'inline-block' }} />
            {active.code.split('\n').length} satır
          </span>
        </div>
      </div>
    </div>
  );
};

export default CodePanel;