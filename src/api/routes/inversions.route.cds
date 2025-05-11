using {inv as myinv} from '../models/inversions_mongo';
@impl: 'src/api/controllers/inversions.controllers.js'

service inversionsRoute @(path:'/api/inv'){
    entity users as projection on myinv.Users;
    entity strategies as projection on myinv.strategies;
    entity simulation as projection on myinv.Simulation;
//******************* Users ***********************************
    @Core.Description: 'get-all-users'
    @path :'GetAllUsers'
    function GetAllUsers() returns array of users;

    @Core.Description: 'get-one-user'
    @path: 'GetUserById'
    function GetUserById (USER_ID: String) returns users;
//****************** Strategies *******************************
    @Core.Description: 'get-all-strategies'
    @path :'GetAllStrategies'
    function GetAllStrategies() returns array of strategies;

    @Core.Description: 'create-strategy-Iron-Condor'
    @path : 'CreateIronCondorStrategy'
    action CreateIronCondorStrategy(
        userId   : String,
        type     : String,
        symbol   : String,
        startDate: Date,
        endDate  : Date,
        legs     : many {
            type     : String;
            position : String;
            strike   : Integer;
    }
    ) returns {
        strategyId : String;
        status     : String;
    };

    @Core.Description: 'Get strategies by user ID'
    @path: 'GetStrategiesByUser'
    function GetStrategiesByUser(USER_ID: String) returns array of strategies;

    //****************** Simulation *******************************
    @Core.Description: 'get-all-simulations'
    @path :'GetAllSimulation'
    function GetAllSimulation() returns array of users;

    //****************** Nuevo: Obtener Opciones Históricas *******************************
    @Core.Description: 'Get Historical Options from Alpha Vantage'
    @path: 'GetHistoricalOptions'
    function GetHistoricalOptions(symbol: String) returns {
    optionsData: many {
        contractID         : String;
        symbol             : String;
        expiration         : Date;
        strike             : Decimal(10,2);
        type               : String;
        last               : Decimal(10,2);
        mark               : Decimal(10,2);
        bid                : Decimal(10,2);
        bid_size           : Integer;
        ask                : Decimal(10,2);
        ask_size           : Integer;
        volume             : Integer;
        open_interest      : Integer;
        date               : Date;
        implied_volatility : Decimal(10,5);
        delta              : Decimal(10,5);
        gamma              : Decimal(10,5);
        theta              : Decimal(10,5);
        vega               : Decimal(10,5);
        rho                : Decimal(10,5);
        };
    };

       //****************** Nuevo: Calcular Indicadores *******************************
    @Core.Description: 'Calculate indicators for given symbol'
    @path: 'CalculateIndicators'
    function CalculateIndicators(
        symbol: String,
        indicators: Array of String
    ) returns array of {
        date: Date;
        close: Decimal(10,2);
        EMA_50: Decimal(10,2);
        EMA_200: Decimal(10,2);
        RSI: Decimal(10,2);
        MACD: Decimal(10,2);
    };

}