import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useEffect, useRef, useState } from 'react';

import { TInventoryItem } from 'lib/player';

type TStatusBarProps = {
  jellyLevel: number;
  inventory: TInventoryItem[];
};

function classNames(classes: Record<string, boolean>): string {
  return Object.entries(classes)
    .flatMap(([key, value]) => (value ? [key] : []))
    .join(' ');
}

export const StatusBar = (props: TStatusBarProps) => {
  const { jellyLevel, inventory } = props;
  const hasKey = inventory.includes('key');

  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hostClasses = classNames({
    status: true,
    status_focus: isAnimating,
  });
  const keyClasses = classNames({
    status__key: true,
    status__key_preset: hasKey,
  });

  useEffect(() => {
    if (hasKey) {
      setIsAnimating(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }
  }, [hasKey]);

  useEffect(() => {
    if (jellyLevel !== 0) {
      setIsAnimating(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setIsAnimating(false);
      }, 2000);
    }
  }, [jellyLevel]);

  return (
    <>
      <div className={hostClasses}>
        <div className="status__label">Jellies size</div>
        <div className="status__bar">
          <div className="status__jelly" style={{ height: `${jellyLevel}%` }} />
        </div>
        <div className={keyClasses} />
      </div>
      <TransitionGroup>
        {jellyLevel >= 100 && (
          <CSSTransition classNames="tabachoy" timeout={600}>
            <div className="tabachoy">Tabachoy</div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </>
  );
};
