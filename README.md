![Workflow file path](https://github.com/agbanusi/Funda-Wallet/workflows/test-integration/badge.svg)

I used 
- Postgresql database for concurrency and easy structure data
- bcrypt for encryption
- sequelize as a postgresql query wrapper
- jsdoc for documentations generation, documentation also in documentation.md
- chai and mocha for tests

Even though I couldn't finish this project it was a lot of fun doing it.

## Steps to reproduce:
#### Requirements:
- Node.js binary
- Postgresql server running
- .env file added to the root irectory containing values for 
  - SECRET  : the key to encrypt our users token
  - SECRET2 : the key to encryt our admins token
  - POSTGRES : the postgres URI example is "postgres://postgres:password@localhost:5432/postgres or use ElephantSQL for paostgres as a service.
  - API : api key for currency conversion api

#### Instructions
- run ```git clone https://github.com/agbanusi/Funda-Wallet```

- then after sucessfule cloning, run ```cd Funda_Wallet && npm install``` in the directory you cloned it to movr the directory to the folder you cloned and install the dependencies.

- run ```npm run start``` to run it locally with reload for each update or just run ```npm run build```

- Go to http://localhost:5000/


To run on docker with the docker-compose: 

- run ```docker-compose up```

- Go to http://localhost:5000/

NB. You need docker-compose installed

## Test link is at https://delicious-caramel-paprika.glitch.me