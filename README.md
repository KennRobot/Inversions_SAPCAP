# INVERSIONS

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

## ¿Qué es la estrategia Iron Condor?
Es una estrategia de opciones que combina:

Venta de una call a un strike alto (shortCallStrike)

Compra de una call a un strike aún más alto (longCallStrike)

Venta de una put a un strike bajo (shortPutStrike)

Compra de una put a un strike aún más bajo (longPutStrike)

Esto crea un rango donde se espera que el precio del activo termine (entre shortPutStrike y shortCallStrike). Las opciones compradas (longCallStrike y longPutStrike) limitan las pérdidas si el precio se mueve fuera del rango.

![Screenshot of a comment on a GitHub issue showing an image, added in the Markdown, of an Octocat smiling and raising a tentacle.](https://myoctocat.com/assets/images/base-octocat.svg)

## Campos y su función
* symbol: "AMZN": El símbolo del activo subyacente, en este caso Amazon. Define sobre qué acción o activo se hace la estrategia.
* entryDate: "2025-05-15": Fecha en la que se inicia la simulación o la posición.
* expiryDate: "2025-06-15": Fecha de expiración de las opciones usadas en la estrategia. Todas las opciones que uses deben expirar en esta fecha.
* shortCallStrike: Precio de ejercicio (strike) de la opción call que vas a vender (short). Generalmente es un precio más alto que el precio actual del activo.
* longCallStrike: Precio de ejercicio de la opción call que vas a comprar (long). Normalmente debe ser mayor que el shortCallStrike para limitar la pérdida (por eso suele estar por encima del strike shortCall). Pero aquí está en 59 que es menor que 60, lo cual es un error. Debe cumplir:
longCallStrike > shortCallStrike
* shortPutStrike: Precio de ejercicio de la opción put que vas a vender (short). Generalmente es un precio más bajo que el precio actual del activo.
* longPutStrike: Precio de ejercicio de la opción put que vas a comprar (long). Debe ser menor que el shortPutStrike para limitar la pérdida. Debe cumplir:
longPutStrike < shortPutStrike
* idUser: "user-001": Identificador del usuario que hace la simulación.
* amount: Monto de dinero que el usuario está dispuesto a usar en la simulación.
* startDate: "2025-05-15": Fecha de inicio para evaluar la simulación (similar a entryDate).
* endDate: "2025-06-15": Fecha final para evaluar la simulación (similar a expiryDate).
* simulationName: "Iron Condor AMZN": Nombre descriptivo para identificar la simulación.
* idStrategy: "IronCondor":Tipo de estrategia a simular (en este caso Iron Condor).

## Indicadores y cálculos que se están usando
### Volatilidad Histórica
``` File calculatorsSimulations ```

Se calcula a partir de los retornos logarítmicos diarios de los precios de cierre (last) del activo.

Fórmula usada: ```Volatilidad = 𝜎 log returns × 252 ```

Se usa como insumo clave para calcular primas de opciones en la estrategia Iron Condor.

###  Cálculo de Prima de Opciones
``` function calculateOptionPremium```

Utiliza una versión simplificada del modelo Black-Scholes para calcular el precio teórico de opciones tipo Call y Put (Compra y Venta).

Factores considerados:

* Precio actual del activo (getCurrentPrice)
* Strike price
* Volatilidad histórica
* Tasa libre de riesgo (5%)
* Tiempo hasta la expiración (30 días)

### RSI (Índice de Fuerza Relativa)
``` Function calculateRSI ```

Mide la magnitud de ganancias recientes frente a pérdidas recientes en un período.

Se calcula con el período de 7 días (ajustable).

Fórmula:

### VIX Simulado

``` Function calculateVolatility ```

Se calcula como la volatilidad histórica anualizada del activo, expresada como porcentaje. Aunque no representa la volatilidad implícita de las opciones, actúa como una buena aproximación del riesgo de mercado percibido, especialmente útil cuando no se dispone de datos de opciones reales.




## URL

http://localhost:3020/api/inv

## ENDPOINTS Usuarios

Endpoint | URL | Body | Finish | Creator | Description
---------|----------|---------|---------|---------|---------
`GET`  |  /api/inv/GetAllUsers | none | Yes | Kennby| Todos los usuarios
`GET`  |  /api/inv/GetUserById | {"USER_ID": "user-001"} | Yes| Kennby| Un solo  usuarios
`POST`  |  /api/inv/CreateUser | {"name": "nombre", "email": "correo"} | Yes| Jesus | Nuevo usuario

## ENDPOINTS Estrategias

Endpoint | URL | Body | Finish | Creator | Description
---------|----------|---------|---------|---------|---------
`GET`  |  /api/inv/GetAllStrategies | none | Yes| Kennby| Todos las estrategias
`POST` | /api/inv/CreateIronCondorStrategy | {"userId": "user-001", "type": "IronCondor","symbol":"AMZN", "startDate": "2025-05-01", "endDate": "2025-06-01", "legs": [ { "type": "Call","position": "Sell", "strike": 120 }, { "type": "Call", "position": "Buy", "strike": 125 }, { "type": "Put", "position": "Sell", "strike": 110 }, { "type": "Put", "position": "Buy", "strike": 105 }]} | Yes| Pedro| Nueva estrategia



## ENDPOINTS Simulacion

Endpoint | URL | Body | Finish | Creator | Description
---------|----------|---------|---------|---------|---------
`GET`  |  /api/inv/GetAllSimulation | none | Yes| Kennby| Todas las simulaciones
`GET`  |  /api/inv/GetAllPricesHistory | none | Yes| Kennby | Todos los precios historicos
`POST` |  /api/inv/CalculateIndicators?symbol=AMZN&timeframe=6months&interval=1d | {"symbol":"AMZN","timeframe": "1months","interval": "6d", "indicators": ["RSI", "MACD"]} | Yes| Kennby | Mostrando Indicadores
`POST`  |  /api/inv/SimulateIronCondor | {"symbol": "AMZN","entryDate": "2025-05-15","expiryDate": "2025-06-15","shortCallStrike": 110,"longCallStrike": 115,"shortPutStrike": 90,"longPutStrike": 85,"idUser": "user-002","amount": 10000,"startDate": "2025-05-15", "endDate":"2025-06-15","simulationName": "Iron Condor AMZN", "idStrategy": "IronCondor"  }" | Yes | Pedro/Jesus | comenzar la simulacion usando la estrategia seleccionada
`GET`  |  /api/inv/getSimulation?id=1234 | {"USER_ID": "user-001"} | Yes| Kennby | solo las simulacion por usuario
`POST`  |  /api/inv/UpdateSimulationName | {"idSimulation": "APPL_2023-03-15","newName": "Iron condor v2"} | YES| Pedro | editar solo el nombre
`PUT`  |  /api/inv/DeleteSimulation | {"id": "4e92de0e-aacf-463e-bb20-f40e8c3cf007"}| YES | Jesus | eliminar la simulacion


