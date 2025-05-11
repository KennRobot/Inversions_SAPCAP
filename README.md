# Getting Started

Welcome to your new project for class NoSQL.

It contains these folders and files, following our recommended project layout create in SAP CAP:

File or Folder | Purpose
---------|----------
`app/` | content for UI frontends goes here
`db/` | your domain models and data go here
`frontend/` | your frontend
`src/` | your service models and code go here
`.env` | your variables of entorn for Mongo DB
`package.json` | project metadata and configuration
`readme.md` | this getting started guide
`server.js` | this main project

File or Folder src | Purpose
---------|----------
`api/` | content for structure backend
`config/` | your conection to Mongo DB

File or Folder api | Purpose
---------|----------
`controllers/` | your controllers
`models/` | your schemas of Mongo DB and entity for SAP CAP
`routes/` | your routes of the project
`services/` | your servicies of project


## URL

http://localhost:3020/api/inv

## ENDPOINTS

Endpoint | URL | Body | Use
---------|----------|---------|---------
`GET`  |  http://localhost:3020/api/inv/GetAllUsers | none | Yes
`GET`  |  http://localhost:3020/api/inv/GetAllSimulation | none | Yes
`GET`  |  http://localhost:3020/api/inv/GetAllStrategies | none | Yes
`GET`  |  http://localhost:3020/api/inv/GetHistoricalOptions?symbol=AMZN | none | No
`GET`  |  http://localhost:3020/api/inv/GetUserById | {"USER_ID": "user-001"} | Yes
`GET` | https://www.alphavantage.co/query?function=HISTORICAL_OPTIONS&symbol=AMZN&apikey=9BIPPPBV4TA9MZGE | none | No
`GET` | http://localhost:3020/api/inv/GetAllPricesHistory | none | Yes
`POST` | http://localhost:3020/api/inv/CalculateIndicators?symbol=AMZN&timeframe=6months&interval=1d | {"symbol": "AMZN",
  "timeframe": "1months",
  "interval": "6d",
  "indicators": ["RSI", "MACD"]
} | Yes
