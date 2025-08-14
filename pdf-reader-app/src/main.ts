import React from 'react';
import ReactDOM from 'react-dom';
import PdfViewer from './components/PdfViewer';
import VoiceSelector from './components/VoiceSelector';
import HighlightedText from './components/HighlightedText';
import './assets/styles.css'; // Assuming you have a styles.css for basic styling

const App = () => {
    return (
        <div>
            <h1>PDF Reader with AI Voice</h1>
            <VoiceSelector />
            <PdfViewer />
            <HighlightedText />
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById('root'));