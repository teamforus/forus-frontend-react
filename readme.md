# Forus React frontend
## Deploy
### Requirements
- React and dependecies (node.js) - https://react.dev/learn/start-a-new-react-project
### Steps
0. Clone this repository and change current folder
```bash
git clone git@github.com:teamforus/forus-frontend-react.git
cd forus-frontend-react
```

1. Install package dependencies
```bash
npm install
```
2. Prepare env file with configurations
```bash
cp env.example.js env.js
```

3. If you need to run frontend locally
   - Execute:
     ```bash
     npm run start
     ```
   - <details>
     <summary>Access frontend by next URLs</summary>
     
       - *Web shops*:
         - http://localhost:5000/webshop.general
         - http://localhost:5000/webshop.nijmegen

       - *Dashboards*:
         - http://localhost:5000/dashboard.sponsor
         - http://localhost:5000/dashboard.provider
         - http://localhost:5000/dashboard.validator
     </details>
4. If you need to build distributive only to use it in deployment later, execute:
   ```bash
   npm build
   ```
