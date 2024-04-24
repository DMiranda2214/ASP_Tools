const { pgConnection ,
        pgLoadInfoTables, 
        pgCreateProcedureInsert,
        pgCreateProcedureUpdate, 
        pgCreateProcedureDelete,
        pgCreateProcedureGetAll,
        createProcedureGetXId, } = require('../controllers/pgClient.controller');
const { verifyToken } = require('../middleware/auth.handler');
const { Router } = require('express');

const router = Router();

// http://localhost:3000/api/v1/pgServer/connection
router.post('/connection', pgConnection);


// http://localhost:3000/api/v1/pgServer/loadInfoTables
router.get('/loadInfoTables', verifyToken , pgLoadInfoTables);

// http://localhost:3000/api/v1/pgServer/createProcedureInsert
router.post('/createProcedureInsert', verifyToken, pgCreateProcedureInsert);


// http://localhost:3000/api/v1/pgServer/createProcedureUpdate
router.post('/createProcedureUpdate', verifyToken, pgCreateProcedureUpdate);

// http://localhost:3000/api/v1/pgServer/createProcedureDelete
router.post('/createProcedureDelete', verifyToken, pgCreateProcedureDelete);

// http://localhost:3000/api/v1/pgServer/createProcedureGetAll
router.post('/createProcedureGetAll', verifyToken, pgCreateProcedureGetAll);

// http://localhost:3000/api/v1/pgServer/createProcedureGetXId
router.post('/createProcedureGetXId', verifyToken, createProcedureGetXId);


module.exports = router;