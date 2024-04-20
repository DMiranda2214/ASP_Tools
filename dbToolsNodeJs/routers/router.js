const { Router } = require('express');
const pgClientRouter = require('./pgClient.router');

const router = Router();

router.use('/pgServer', pgClientRouter);

module.exports = router;