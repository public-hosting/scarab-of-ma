import { ChangeEvent, useState } from 'react';

const CORRECT_CODE = '38';

export const Raffle = () => {
  const [code, setCode] = useState('');
  const [isCodeCorrect, setIsCodeCorrect] = useState<boolean | null>(null);

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.currentTarget.value.slice(0, 2));
  };

  const handleCheck = () => {
    setIsCodeCorrect(code === CORRECT_CODE);
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

  return (
    <div className="raffle">
      <div className="raffle__modal">
        {renderStatus()}
        <div>
          <input
            className="raffle__code"
            type="phone"
            value={code}
            onChange={handleCodeChange}
            placeholder="••"
            autoFocus={true}
          />
        </div>
        <button className="controls__item" type="button" onClick={handleCheck}>
          Unlock
        </button>
      </div>
    </div>
  );
};
