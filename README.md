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

Endpoint | URL | Body | Finish | Creator
---------|----------|---------|---------|---------
`GET`  |  /api/inv/GetAllUsers | none | Yes | Kennby
`GET`  |  /api/inv/GetAllSimulation | none | Yes| Kennby
`GET`  |  /api/inv/GetAllStrategies | none | Yes| Kennby
`GET`  |  /api/inv/GetHistoricalOptions?symbol=AMZN | none | No| Kennby
`GET`  |  /api/inv/GetUserById | {"USER_ID": "user-001"} | Yes| Kennby
`GET`  |  /api/inv/GetAllPricesHistory | none | Yes| Kennby
`POST` |  /api/inv/CalculateIndicators?symbol=AMZN&timeframe=6months&interval=1d | {"symbol":"AMZN","timeframe": "1months","interval": "6d", "indicators": ["RSI", "MACD"]} | Yes| Kennby
`POST` | /api/inv/CreateIronCondorStrategy | {"userId": "user-001", "type": "IronCondor","symbol":"AMZN", "startDate": "2025-05-01", "endDate": "2025-06-01", "legs": [ { "type": "Call","position": "Sell", "strike": 120 }, { "type": "Call", "position": "Buy", "strike": 125 }, { "type": "Put", "position": "Sell", "strike": 110 }, { "type": "Put", "position": "Buy", "strike": 105 }]} | Yes| Pedro

