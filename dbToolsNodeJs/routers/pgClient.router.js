const { pgConnection ,pgLoadTables} = require('../controllers/pgClient.controller');
const { Router } = require('express');

const router = Router();

// http://localhost:3000/api/v1/pgServer/connection
router.post('/connection', pgConnection);


// http://localhost:3000/api/v1/pgServer/loadTables
router.get('/loadTables', pgLoadTables);

module.exports = router;