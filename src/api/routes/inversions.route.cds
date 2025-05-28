    using {inv as myinv} from '../models/inversions_mongo';

    @impl: 'src/api/controllers/inversions.controllers.js'

    service inversionsRoute @(path: '/api/inv') {
        entity users         as projection on myinv.Users;
        entity strategies    as projection on myinv.strategies;
        entity simulation    as projection on myinv.Simulation;
        entity priceshistory as projection on myinv.PRICES_HISTORY;

        //******************* Users ***********************************
        @Core.Description: 'get-all-users'
        @path            : 'GetAllUsers'
        function GetAllUsers()                                     returns array of users;

        @Core.Description: 'get-one-user'
        @path            : 'GetUserById'
        function GetUserById(USER_ID : String)                     returns users;

        //Crear un nuevo usuario
        @Core.Description: 'Create a new user'
        @path            : 'CreateUser'
        action CreateUser(
            name         : String(100),
            lastName     : String(100),
            birthDate    : String(20),
            alias        : String(100),
            email        : String(255),
            phoneNumber  : String(20),
            departament  : String(100),
            street       : String(255),
            postalCode   : Integer,
            city         : String(100),
            state        : String(100),
            country      : String(100)
        ) returns users;

        @Core.Description: 'Update-one-user'
        @path            : 'UpdateUser'
        action UpdateUser(
            USER_ID: String,
            name         : String(100),
            lastName     : String(100),
            birthDate    : String(20),
            alias        : String(100),
            email        : String(255),
            phoneNumber  : String(20),
            departament  : String(100),
            street       : String(255),
            postalCode   : Integer,
            city         : String(100),
            state        : String(100),
            country      : String(100),
            wallet: {
            balance: Decimal(15,2);
            currency: String;
            }
        ) returns users;


        //****************** Strategies *******************************
        @Core.Description: 'get-all-strategies'
        @path            : 'GetAllStrategies'
        function GetAllStrategies()                                returns array of strategies;

        @Core.Description: 'Create a new investment strategy'
        @path: 'CreateStrategy'
        action CreateStrategy(
            VALUEID     : String,
            LABELID     : String,
            VALUE       : String,
            COMPANYID   : Integer,
            CEDIID      : Integer,
            ALIAS       : String null,
            SEQUENCE    : Integer null,
            IMAGE       : String null,
            DESCRIPTION : String null,
            USER_ID     : String null
        ) returns strategies;

        @Core.Description: 'Get strategies by user ID'
        @path            : 'GetStrategiesByUser'
        function GetStrategiesByUser(USER_ID : String)             returns array of strategies;

        //Borrado logico de estrategias
        @Core.Description: 'logical-delete-strategy'
        @path: 'DeleteStrategyLogical'
        action DeleteStrategyLogical(
            LABELID : String
        ) returns {
            message : String;
        };

        //****************** Simulation *******************************
        @Core.Description: 'get-all-simulations'
        @path            : 'GetAllSimulation'
        function GetAllSimulation()                                returns array of simulation;

        @Core.Description: 'get-simulations-by-user'
        @path            : 'GetSimulationsByUserId'
        function GetSimulationsByUserId(IDUSER : String)                     returns simulation;

        @Core.Description: 'get-simulations-by-symbols'
        @path            : 'GetSimulationBySymbols'
        function GetSimulationBySymbols(symbol : String)                     returns simulation;

        @Core.Description: 'get-simulations-for-range-amount'
        @path            : 'GetSimulationForMonto'
        function GetSimulationForMonto(min: Integer, max: Integer)           returns simulation;

        @Core.Description: 'get-simulations-for-range-date'
        @path            : 'GetSimulationsForRangeDate'
        function GetSimulationsForRangeDate(startDate: Date, endDate: Date )                     returns simulation;

        @Core.Description: 'Simula una estrategia Iron Condor'
        @path: 'SimulateIronCondor'
        action SimulateIronCondor(
            symbol: String,
            entryDate: Date,
            expiryDate: Date,
            shortCallStrike: Decimal(10,2),
            longCallStrike: Decimal(10,2),
            shortPutStrike: Decimal(10,2),
            longPutStrike: Decimal(10,2),
            idUser: String,
            amount: Integer,             // Campo amount agregado
            startDate: Date,             // Campo startDate agregado
            endDate: Date,               // Campo endDate agregado
            simulationName: String,      // Campo simulationName agregado
            idStrategy: String           // Campo idStrategy agregado
        ) returns {
            signal: String;
            netCredit: Decimal(10,2);
            maxLoss: Decimal(10,2);
            maxProfit: Decimal(10,2);
            riskRewardRatio: Decimal(10,2);
            percentageReturn: Decimal(5,2);
            saved: Boolean;
        };
        // Update a simulation name by ID
        @Core.Description: 'Update simulation name by ID'
        @path: 'UpdateSimulationName'
        action UpdateSimulationName(
            IDSIMULATION: String,
            newName: String
        ) returns {
            message: String;
        };
        // Borrado logico de simulaciones
        @Core.Description: 'logical-delete-simulation'
        @path: 'DeleteSimulationLogical'
        action DeleteSimulationLogical(
            IDSIMULATION : String
        ) returns {
            message : String;
        };

        //****************** Nuevo: Obtener Opciones Históricas *******************************
        @Core.Description: 'Get Historical Options '
        @path            : 'GetAllPricesHistory'
        function GetAllPricesHistory()                             returns array of priceshistory;

        @Core.Description: 'Get Historical Options Only Symbol '
        @path            : 'GetPricesHistoryBySymbol'
        function GetPricesHistoryBySymbol(symbol : String)         returns array of priceshistory;

        //****************** Nuevo: Calcular Indicadores *******************************
        @Core.Description: 'Calculate investment indicators'
        @path: 'CalculateIndicators'
        action CalculateIndicators(
            symbol: String,
            timeframe: String,
            interval: String,
            indicators: array of String
        ) returns {
            symbol: String;
            timeframe: String;
            interval: String;
            calculatedIndicators: {
                RSI: Decimal(5,2);
                MACD: Decimal(5,2);
            }
        };
        // Delete a simulation by ID
        @path: 'deleteSimulation'
        action DeleteSimulation(id: String) returns {
            IDSIMULATION: String;
            status: String;
        };
        
    }
