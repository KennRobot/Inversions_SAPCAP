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

    @Core.Description: 'create new user'
    @path            : 'CreateUser'
    action   CreateUser(name : String,
                        email : String)                        
                        returns users;

    //****************** Strategies *******************************
    @Core.Description: 'get-all-strategies'
    @path            : 'GetAllStrategies'
    function GetAllStrategies()                                returns array of strategies;

    @Core.Description: 'create-strategy-Iron-Condor'
    @path            : 'CreateIronCondorStrategy'
    action   CreateIronCondorStrategy(userId : String,
                                      type : String,
                                      symbol : String,
                                      startDate : Date,
                                      endDate : Date,
                                      legs : many {
        type       : String;
        position   : String;
        strike     : Integer;
    })                                                         returns {
        strategyId : String;
        status     : String;
    };

    @Core.Description: 'Get strategies by user ID'
    @path            : 'GetStrategiesByUser'
    function GetStrategiesByUser(USER_ID : String)             returns array of strategies;

    //****************** Simulation *******************************
    @Core.Description: 'get-all-simulations'
    @path            : 'GetAllSimulation'
    function GetAllSimulation()                                returns array of simulation;

        @Core.Description: 'get-simulations-by-user'
    @path            : 'GetSimulatonByUserId'
    function GetSimulatonByUserId(USER_ID : String)                     returns simulation;

    //****************** Nuevo: Obtener Opciones Históricas *******************************
    @Core.Description: 'Get Historical Options '
    @path            : 'GetAllPricesHistory'
    function GetAllPricesHistory()                             returns array of priceshistory;

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


}
