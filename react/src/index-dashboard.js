import ReactDOM from 'react-dom/client';
import Dashboard from './dashboard/Dashboard';

require(`../assets/forus-platform/scss/general/vars.scss`);
require(`../assets/forus-platform/scss/general/style-dashboard-${env_data.client_key}.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Dashboard envData={env_data} />);
