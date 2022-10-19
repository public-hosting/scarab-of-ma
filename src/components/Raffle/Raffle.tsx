import { ChangeEvent, useEffect, useState } from 'react';
import { classNames } from 'lib/classNames';
import { POEM } from 'lib/poem';

type TRaffleProps = {
  onGiftReturn: () => void;
  onPoemOpen: () => void;
}

const CORRECT_CODE = '38';

const PRIZES = [
  'Sick Apartment',
  'Poem',
  '10 Bitcoins',

  'Tesla',
  'Cliff Side Castle',
  'New Surfboard',

  'Sick Apartment',
  'Poem',
  '10 Bitcoins',
];

export const Raffle = (props: TRaffleProps) => {
  const { onGiftReturn, onPoemOpen } = props;
  const [code, setCode] = useState('');
  const [isCodeCorrect, setIsCodeCorrect] = useState<boolean | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [isScrollVisible, setIsScrollVisible] = useState(false);

  const itemsClasses = classNames({
    machine__items: true,
    machine__items_spinning: isSpinning,
  });

  useEffect(() => {
    if (isSpinning) {
      setTimeout(() => {
        setWinnerIndex(7);
        setTimeout(() => {
          onPoemOpen();
          setIsScrollVisible(true);
        }, 3000);
      }, 17300);
    }
  }, [isSpinning]);

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.currentTarget.value.slice(0, 2));
  };

  const handleCheck = () => {
    setIsCodeCorrect(code === CORRECT_CODE);
  };

  const handleRaffleStart = () => {
    setIsSpinning(true);
  };

  const renderStatus = () => {
    if (isCodeCorrect === null) {
      return <div className="raffle__modal-title">Enter code</div>;
    }

    if (isCodeCorrect) {
      return <div className="raffle__modal-title">Hooray!</div>;
    }

    return (
      <div className="raffle__modal-title raffle__modal-title_error">Na-a</div>
    );
  };

  const renderContent = () => {
    if (!isCodeCorrect) {
      return (
        <div className="raffle__modal">
          {renderStatus()}
          <div>
            <input
              className="raffle__code"
              type="tel"
              value={code}
              onChange={handleCodeChange}
              placeholder="••"
              autoFocus={true}
            />
          </div>
          <button
            className="controls__item"
            type="button"
            onClick={handleCheck}
          >
            Unlock
          </button>
          <button
            className="controls__item"
            type="button"
            onClick={onGiftReturn}
          >
            Close
          </button>
        </div>
      );
    }

    if (isScrollVisible) {
      return <div className="scroll">
        <div className="scroll__viewport">{POEM}</div>
      </div>;
    }

    return (
      <>
        {isSpinning && <div className="raffle__pika" />}
        <div className="machine" onClick={handleRaffleStart}>
          <div className="machine__title">
            <span className="machine__accent">!</span>
            <span className="machine__accent">!</span>
            <span className="machine__accent">!</span>
            Raffle
            <span className="machine__accent">!</span>
            <span className="machine__accent">!</span>
            <span className="machine__accent">!</span>
          </div>
          <div className="machine__pointer" />
          <div className="machine__window">
            <div className={itemsClasses}>
              {PRIZES.map((prize, i) => (
                <div
                  key={i}
                  className={classNames({
                    machine__slot: true,
                    machine__slot_winner: i === winnerIndex,
                  })}
                >
                  {isSpinning ? prize : '???'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return <div className="raffle">{renderContent()}</div>;
};
