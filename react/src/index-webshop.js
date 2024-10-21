import ReactDOM from 'react-dom/client';
import Webshop from './webshop/Webshop';

// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
require(`../assets/forus-webshop/scss/style-webshop-general-vars.scss`);

// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
require(`../assets/forus-webshop/scss/style-webshop-${env_data.client_skin}-vars.scss`);

// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
require(`../assets/forus-webshop/scss/webshop.scss`);

// eslint-disable-next-line no-undef, @typescript-eslint/no-require-imports
require(`../assets/forus-webshop/scss/style-webshop-${env_data.client_skin}.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
// eslint-disable-next-line no-undef
root.render(<Webshop envData={env_data} />);
