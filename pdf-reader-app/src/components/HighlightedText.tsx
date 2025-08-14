import React from 'react';

interface HighlightedTextProps {
    text: string;
    currentPosition: number;
}

const HighlightedText: React.FC<HighlightedTextProps> = ({ text, currentPosition }) => {
    const getHighlightedText = () => {
        const start = Math.max(0, currentPosition - 10);
        const end = Math.min(text.length, currentPosition + 10);
        const before = text.substring(0, start);
        const highlighted = text.substring(start, end);
        const after = text.substring(end);

        return (
            <span>
                {before}
                <span style={{ backgroundColor: 'yellow' }}>{highlighted}</span>
                {after}
            </span>
        );
    };

    return <div>{getHighlightedText()}</div>;
};

export default HighlightedText;