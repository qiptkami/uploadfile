import React, { useEffect, useRef } from 'react';
import ClipboardJS from 'clipboard';

const CopyButton: React.FC<{ text: string; className: string | undefined }> = ({
  text,
  className,
}) => {
  const copyRef = useRef<any>();
  useEffect(() => {
    const button = copyRef.current;
    if (button) {
      const clipboard = new ClipboardJS(button, {
        text: () => text,
      });

      clipboard.on('success', () => {
        console.log('Text copied!');
      });

      clipboard.on('error', () => {
        console.log('Failed to copy text.');
      });

      return () => {
        clipboard.destroy();
      };
    }
  }, [text]);

  return (
    <button
      ref={copyRef}
      className={className}
      data-clipboard-text={text}
      style={{ maxWidth: '98px' }}
    >
      Copy Url
    </button>
  );
};

export default CopyButton;
