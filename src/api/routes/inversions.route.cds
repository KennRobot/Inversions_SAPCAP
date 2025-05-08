using {inv as myinv} from '../models/inversions_mongo';
@impl: 'src/api/controllers/inversions.controllers.js'

//NOTA: SAP CAP solo puede manejar solicitudes GET y POST
//GET lo realiza por medio de function
//POST lo realiza por medio de action
//para utilizar los metodos PUT y DELETE se tiene que hacer 
//en algun manejador como Postman o Insomnia, pero por medio 
//del metodo POST, por lo anterior explicado de SAP 

service inversionsRoute @(path:'/api/inv'){
    entity users as projection on myinv.users;
    entity strategies as projection on myinv.strategies;
//******************* PARA MONGO DB ***********************************
    @Core.Description: 'get-all-users'
    @path :'GetAllUsers'
    function GetAllUsers() returns array of users;

    @Core.Description: 'get-all-strategies'
    @path :'GetAlStrategies'
    function GetAlStrategies() returns array of strategies;
}