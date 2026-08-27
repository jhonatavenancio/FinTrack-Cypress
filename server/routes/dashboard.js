const express = require('express');
const authMiddleware = require('../middleware/auth');
const { summary, byCategory } = require('../controllers/dashboardController');

const router = express.Router();

router.use(authMiddleware);

router.get('/summary', summary);
router.get('/by-category', byCategory);

module.exports = router;
