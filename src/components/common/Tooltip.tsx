import React, { useState } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  delay?: number;
}

export default function Tooltip({ text, children, delay = 500 }: TooltipProps) {
  const [show, setShow] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    const id = setTimeout(() => setShow(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setShow(false);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {show && (
        <div className="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-md shadow-lg whitespace-normal max-w-xs transform -translate-x-1/2 left-1/2 -bottom-2 translate-y-full">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -translate-x-1/2 -top-1 left-1/2" />
        </div>
      )}
    </div>
  );
}
