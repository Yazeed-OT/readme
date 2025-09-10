import React from 'react';
import { createRoot } from 'react-dom/client';
import PdfViewer from './components/PdfViewer';
import VoiceSelector from './components/VoiceSelector';
import HighlightedText from './components/HighlightedText';
// Styles import disabled temporarily to unblock dev server.
// import './assets/styles.css';

const App = () => {
  return (
    <div className="container">
      <h1>PDF Reader with AI Voice</h1>
      <VoiceSelector />
      <PdfViewer />
      <HighlightedText />
    </div>
  );
};

const el = document.getElementById('root');
if (el) createRoot(el).render(<App />);