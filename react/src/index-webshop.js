import ReactDOM from 'react-dom/client';
import Webshop from './webshop//Webshop';
require(`../assets/forus-webshop/scss/${env_data.client_key}/vars.scss`);
require(`../assets/forus-webshop/scss/${env_data.client_key}/style-webshop-${env_data.client_key}.scss`);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<Webshop envData={env_data} />);
