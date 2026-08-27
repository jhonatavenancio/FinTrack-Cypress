const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  list,
  create,
  update,
  remove,
} = require('../controllers/transactionsController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', list);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
