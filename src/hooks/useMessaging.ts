import { useCallback, useEffect, useRef, useState } from 'react';

type TMessaging = {
  message: string | null;
  sendMessage(text: string): void;
};

const MESSAGE_LIFE_TIME_MS = 5000;

export function useMessaging(): TMessaging {
  const [message, setMessages] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const sendMessage = useCallback((text: string) => {
    setMessages(text);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setMessages(msg => (msg === text ? null : msg));
      timeoutRef.current = null;
    }, MESSAGE_LIFE_TIME_MS);
  }, []);

  return {
    message,
    sendMessage,
  };
}
