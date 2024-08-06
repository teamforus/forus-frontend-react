# Dockerize Forus

- [Installation](#installation)
- [Docker compose](#docker-compose)
- [Docker image](#docker-image)

# Installation

**Repositories:**  
Frontend: [https://github.com/teamforus/forus-frontend-react](https://github.com/teamforus/forus-frontend-react)  
Backend: [https://github.com/teamforus/forus-backend](https://github.com/teamforus/forus-backend) 

## Get the project from GitHub
First, you need to clone the project from GitHub:
```bash
git clone git@github.com:teamforus/forus-frontend-react.git forus-frontend
```

### Checkout to the branch you would like to test:
Go to the newly created folder `forus-frontend`, and checkout to the branch desired branch:
```
cd forus-frontend
git checkout <BRANCH_NAME>
```

# Docker compose

## Project configuration
To build the project you need to create an `env.js` file,  where you can set api-url and other settings. 
As a staring point you can copy `env.example.js` or skip this step if you already have an `env.js` file.
```bash
cp env.example.js env.js 
```

## Choose how to run the project

### **Start the project using webpack devServer**. 
This option is better for development, as it automatically rebuilds the project whenever you modify files or switch branches.   
It also serves static files via Apache2 on port 3000.
```bash
rm -rf ./src/node_modules
docker compose up -d && docker compose exec app sh -c "npm i && yes n | npm run start"
```

[http://localhost:5000/webshop.general](http://localhost:5000/webshop.general) - Webshop  
[http://localhost:5000/dashboard.sponsor](http://localhost:5000/dashboard.sponsor) - Provider dashboard  
[http://localhost:5000/dashboard.provider](http://localhost:5000/dashboard.provider) - Sponsor dashboard  
[http://localhost:5000/dashboard.validator](http://localhost:5000/dashboard.validator) - Validator dashboard 

### **Compile the project and host the static files using Apache.**.  
This option is ideal for testing branches without making changes. It builds the files only when you run the command and keeps them in the container, so you don't have to rebuild the project each time you access the frontend. However, a full rebuild is required whenever you change a file or branch, as it won't detect changes on the fly.

```bash
rm -rf ./src/node_modules
docker compose up -d && docker compose exec app sh -c "npm i && yes n | npm run build"
```

[http://localhost:3000/webshop.general](http://localhost:3000/webshop.general) - Webshop  
[http://localhost:3000/dashboard.sponsor](http://localhost:3000/dashboard.sponsor) - Provider dashboard  
[http://localhost:3000/dashboard.provider](http://localhost:3000/dashboard.provider) - Sponsor dashboard  
[http://localhost:3000/dashboard.validator](http://localhost:3000/dashboard.validator) - Validator dashboard 

## Stop the containers
___ 

To stop containers run:

``` 
docker compose down
```

## Restart the container
___ 

To start again existing container, without `npm install` and `full rebuild` run:  
_Note: will not restart webpack_

``` 
docker compose up -d
```
But to be able to edit the code and see the changes you made, you will have to manually run the builder (see: `Build the assets` section)

## Installing/Updating node modules
___

To install/reinstall node module: 
``` 
docker compose exec app sh -c "npm install"
```

## Build the assets
___

To build the project use:
``` 
docker compose exec app sh -c "npm run build"
```

To build the project and watch for the change use:
``` 
docker compose exec app sh -c "npm run start"
``` 


# Docker image
Another way to run the project, is to use a prebuilt docker image.

You can either build the forus-frontend image yourself locally or download the image from docker-hub (will be available later).

## Build docker image:
First build docker image:

``` 
docker build -t forus-io/forus-frontend .
```

## Start the containers:
The next command will start the containers (`node`, `apache2`)
After you can run command to start docker containers (for node, apache2)

``` 
./docker/cmd/start.sh
```

## Links
___

If everything fine - the front-ends will be available at following urls:   

[http://localhost:5000/webshop.general](http://localhost:5000/webshop.general) - Webshop  
[http://localhost:5000/dashboard.sponsor](http://localhost:5000/dashboard.sponsor) - Provider dashboard  
[http://localhost:5000/dashboard.provider](http://localhost:5000/dashboard.provider) - Sponsor dashboard  
[http://localhost:5000/dashboard.validator](http://localhost:5000/dashboard.validator) - Validator dashboard 

### Stop containers
To stop the containers use:

``` 
docker stop forus-frontend
```
