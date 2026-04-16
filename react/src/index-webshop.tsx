import ReactDOM from 'react-dom/client';
import Webshop from './webshop/Webshop';

/*require(`../assets/forus-webshop/scss/style-webshop-general-vars.scss`);*/

// eslint-disable-next-line @typescript-eslint/no-require-imports
require(`../assets/forus-webshop/scss/style-webshop-${env_data.client_skin}-vars.scss`);

// eslint-disable-next-line @typescript-eslint/no-require-imports
require(`../assets/forus-webshop/scss/webshop.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(<Webshop envData={env_data} />);
