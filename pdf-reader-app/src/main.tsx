import React from 'react';
import { createRoot } from 'react-dom/client';
import PdfViewer from './components/PdfViewer';
import VoiceSelector from './components/VoiceSelector';
import HighlightedText from './components/HighlightedText';
import './style.css';

function Header() {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved ? saved === 'dark' : false);
  }, []);
  React.useEffect(() => {
    document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);
  return (
    <div className="header">
      <div className="logo">Book Reader</div>
      <div className="nav">
        <a href="#">My Books</a>
        <a href="#">Upload Book</a>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:16 }}>
        <button id="themeToggle" aria-label="Toggle theme" onClick={() => setIsDark(v => !v)} style={{ background:'transparent', border:'none', color:'#fff', fontSize:'1.2rem', cursor:'pointer' }}>{isDark ? '☀️' : '🌙'}</button>
        <div className="user">user1</div>
      </div>
    </div>
  );
}

const App = () => {
  return (
    <div className="main-container">
      <Header />
      <div className="controls-bar">
        <div className="book-controls">
          <VoiceSelector />
          <button onClick={() => window.location.reload()} style={{ background:'#e3e7f7', color:'#3f51b5', border:'none', borderRadius:4, padding:'4px 12px', cursor:'pointer' }}>Reset</button>
        </div>
        <div className="page-controls">
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>{'<'} Previous</button>
          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}>Next {'>'}</button>
        </div>
      </div>
      <div className="book-card">
        <div className="book-page">
          <PdfViewer />
        </div>
        <div className="book-page highlighted">
          <HighlightedText />
        </div>
      </div>
    </div>
  );
};

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);