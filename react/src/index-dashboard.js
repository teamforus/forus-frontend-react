import ReactDOM from 'react-dom/client';
import Dashboard from './dashboard/Dashboard';

// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
require(`../assets/forus-platform/scss/general/vars.scss`);
// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
require(`../assets/forus-platform/scss/general/style-dashboard-${env_data.client_skin}.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
// eslint-disable-next-line no-undef
root.render(<Dashboard envData={env_data} />);
