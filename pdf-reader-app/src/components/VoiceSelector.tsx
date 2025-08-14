import React, { useState } from 'react';

const VoiceSelector = ({ onVoiceChange }) => {
    const [selectedVoice, setSelectedVoice] = useState('');

    const voices = window.speechSynthesis.getVoices();

    const handleVoiceChange = (event) => {
        const voice = event.target.value;
        setSelectedVoice(voice);
        onVoiceChange(voice);
    };

    return (
        <div>
            <label htmlFor="voice-select">Select Voice:</label>
            <select id="voice-select" value={selectedVoice} onChange={handleVoiceChange}>
                {voices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                        {voice.name} ({voice.lang})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default VoiceSelector;