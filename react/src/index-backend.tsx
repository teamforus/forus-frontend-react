import ReactDOM from 'react-dom/client';
import Backend from './backend/Backend';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require(`../assets/forus-backend/scss/style.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Backend />);
