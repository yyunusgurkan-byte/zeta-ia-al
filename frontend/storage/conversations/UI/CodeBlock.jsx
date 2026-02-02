// frontend/src/components/UI/CodeBlock.jsx

import React, { useState } from 'react';
import './CodeBlock.css';

const CodeBlock = ({ code, language = 'javascript', filename = null }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getLanguageLabel = (lang) => {
    const labels = {
      javascript: 'JavaScript',
      jsx: 'React JSX',
      typescript: 'TypeScript',
      tsx: 'React TSX',
      python: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      csharp: 'C#',
      php: 'PHP',
      ruby: 'Ruby',
      go: 'Go',
      rust: 'Rust',
      swift: 'Swift',
      kotlin: 'Kotlin',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      json: 'JSON',
      xml: 'XML',
      sql: 'SQL',
      bash: 'Bash',
      shell: 'Shell',
      powershell: 'PowerShell',
      markdown: 'Markdown',
      yaml: 'YAML',
      dockerfile: 'Dockerfile'
    };
    return labels[lang.toLowerCase()] || lang.toUpperCase();
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <div className="code-info">
          <span className="code-language">{getLanguageLabel(language)}</span>
          {filename && <span className="code-filename">{filename}</span>}
        </div>
        <button 
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          title="Kodu kopyala"
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13.5 4L6 11.5L2.5 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Kopyalandı!</span>
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="5" y="5" width="9" height="9" rx="1" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M3 10H2a1 1 0 01-1-1V2a1 1 0 011-1h7a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span>Kopyala</span>
            </>
          )}
        </button>
      </div>
      <div className="code-content">
        <pre>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
};

export default CodeBlock;