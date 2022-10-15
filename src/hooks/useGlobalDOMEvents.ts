import { useEffect, useRef, useState } from 'react';

type TUseGlobalDOMEventsOptions = {
  [key in keyof GlobalEventHandlersEventMap]?: (
    event: GlobalEventHandlersEventMap[key],
  ) => void;
};

export function useGlobalDOMEvents(options: TUseGlobalDOMEventsOptions) {
  const handlersRef = useRef(options);
  handlersRef.current = options;

  const [handlers] = useState(() => {
    const types = Object.keys(options) as (keyof GlobalEventHandlersEventMap)[];

    return types.reduce<TUseGlobalDOMEventsOptions>((acc, type) => {
      acc[type] = (event: Event) => {
        const handler = handlersRef.current?.[type] as
          | EventListener
          | undefined;
        handler?.(event);
      };

      return acc;
    }, {});
  });

  useEffect(() => {
    for (let [key, func] of Object.entries(handlers)) {
      document.body.addEventListener(key, func as EventListener, false);
    }
    return () => {
      for (let [key, func] of Object.entries(handlers)) {
        window.removeEventListener(key, func as EventListener, false);
      }
    };
  }, []);
}
