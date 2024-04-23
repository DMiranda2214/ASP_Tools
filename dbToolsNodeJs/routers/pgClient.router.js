const { pgConnection ,
        pgLoadInfoTables, 
        pgCreateProcedureInsert,
        pgCreateProcedureUpdate, } = require('../controllers/pgClient.controller');
const { Router } = require('express');

const router = Router();

// http://localhost:3000/api/v1/pgServer/connection
router.post('/connection', pgConnection);


// http://localhost:3000/api/v1/pgServer/loadInfoTables
router.get('/loadInfoTables', pgLoadInfoTables);

// http://localhost:3000/api/v1/pgServer/createProcedureInsert
router.post('/createProcedureInsert', pgCreateProcedureInsert);


// http://localhost:3000/api/v1/pgServer/createProcedureUpdate
router.post('/createProcedureUpdate', pgCreateProcedureUpdate);


module.exports = router;