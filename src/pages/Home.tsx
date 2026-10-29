import { useState, type ReactElement } from 'react';
import reactLogo from '../assets/react.svg';
import viteLogo from '/vite.svg';

/** Initial value for the demo counter. */
const INITIAL_COUNT = 0;

function Home(): ReactElement {
  const [count, setCount] = useState<number>(INITIAL_COUNT);

  const incrementCount = (): void => {
    // The updater form avoids stale state if renders are batched.
    setCount((previousCount) => previousCount + 1);
  };

  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button type="button" onClick={incrementCount}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default Home;
