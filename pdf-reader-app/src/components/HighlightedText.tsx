import React, { useEffect, useMemo, useState } from 'react';

export default function HighlightedText() {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const onText = (e: Event) => setText((e as CustomEvent<string>).detail);
    const onBoundary = (e: Event) => setIdx((e as CustomEvent<number>).detail);
    window.addEventListener('reader:text', onText as EventListener);
    window.addEventListener('reader:boundary', onBoundary as EventListener);
    return () => {
      window.removeEventListener('reader:text', onText as EventListener);
      window.removeEventListener('reader:boundary', onBoundary as EventListener);
    };
  }, []);

  const { pre, word, post } = useMemo(() => sliceAtWord(text, idx), [text, idx]);

  return (
    <div>
      <h3>Text (highlight follows speech)</h3>
      {text ? (
        <p style={{ lineHeight: 1.8 }}>
          <span>{pre}</span>
          <mark>{word}</mark>
          <span>{post}</span>
        </p>
      ) : (
        <p className="small">Load a PDF to see extracted text here.</p>
      )}
    </div>
  );
}

function sliceAtWord(s: string, i: number) {
  if (!s) return { pre: '', word: '', post: '' };
  i = Math.max(0, Math.min(i, s.length));
  const isSpace = (c: string) => /\s/.test(c);

  // Move i to inside a word if it lands on whitespace
  let j = i;
  while (j < s.length && isSpace(s[j])) j++;
  if (j >= s.length) j = i;

  // Find word start
  let start = j;
  while (start > 0 && !isSpace(s[start - 1])) start--;
  // Find word end
  let end = j;
  while (end < s.length && !isSpace(s[end])) end++;

  return {
    pre: s.slice(0, start),
    word: s.slice(start, end) || (s[j] ?? ''),
    post: s.slice(end),
  };
}