const { pgConnection ,pgLoadInfoTables, pgCreateProcedureInsert} = require('../controllers/pgClient.controller');
const { Router } = require('express');

const router = Router();

// http://localhost:3000/api/v1/pgServer/connection
router.post('/connection', pgConnection);


// http://localhost:3000/api/v1/pgServer/loadInfoTables
router.get('/loadInfoTables', pgLoadInfoTables);

// http://localhost:3000/api/v1/pgServer/createProcedureCreate
router.post('/createProcedureCreate', pgCreateProcedureInsert);


module.exports = router;