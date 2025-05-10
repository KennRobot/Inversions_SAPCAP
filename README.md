# Getting Started

Welcome to your new project.

It contains these folders and files, following our recommended project layout:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`src/` | your service models and code go here
`package.json` | project metadata and configuration
`readme.md` | this getting started guide
`server.js` | this main project


## URL

http://localhost:3020/api/inv

## ENDPOINTS


GET    http://localhost:3020/api/inv/GetAllUsers
GET    http://localhost:3020/api/inv/GetAllSimulation
GET    http://localhost:3020/api/inv/GetAllStrategies
GET    http://localhost:3020/api/inv/GetHistoricalOptions?symbol=AMZN

GET    http://localhost:3020/api/inv/GetUserById
        body:{
            "USER_ID": "user-001"
        }

GET https://www.alphavantage.co/query?function=HISTORICAL_OPTIONS&symbol=AMZN&apikey=9BIPPPBV4TA9MZGE

