import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useEffect, useRef, useState } from 'react';

import { TInventoryItem } from 'lib/player';
import { classNames } from 'lib/classNames';

type TStatusBarProps = {
  jellyLevel: number;
  inventory: TInventoryItem[];
};

export const StatusBar = (props: TStatusBarProps) => {
  const { jellyLevel, inventory } = props;
  const hasKey = inventory.includes('key');

  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const hostClasses = classNames({
    status: true,
    status_focus: isAnimating,
  });

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
        <TransitionGroup>
          {hasKey && (
            <CSSTransition classNames="status__inventory" timeout={1000}>
              <div className="status__inventory">
                <div className="status__key" />
              </div>
            </CSSTransition>
          )}
        </TransitionGroup>
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
