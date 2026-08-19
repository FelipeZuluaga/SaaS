const express = require('express');
const router = express.Router();
const { getNetProfits } = require('../controllers/dashboardController');

// Ruta base: /api/dashboard/net-profits
router.get('/net-profits', getNetProfits);

module.exports = router;