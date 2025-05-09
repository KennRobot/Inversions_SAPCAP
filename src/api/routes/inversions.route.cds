using {inv as myinv} from '../models/inversions_mongo';
@impl: 'src/api/controllers/inversions.controllers.js'

//NOTA: SAP CAP solo puede manejar solicitudes GET y POST
//GET lo realiza por medio de function
//POST lo realiza por medio de action
//para utilizar los metodos PUT y DELETE se tiene que hacer 
//en algun manejador como Postman o Insomnia, pero por medio 
//del metodo POST, por lo anterior explicado de SAP 

service inversionsRoute @(path:'/api/inv'){
    entity users as projection on myinv.Users;
    entity strategies as projection on myinv.strategies;
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

}