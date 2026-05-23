const express = require('express');
const router = express.Router();
const requestController = require('../controller/requestController');

router.post('/', requestController.createDeckRequest);
router.get('/', requestController.getAllRequests);
router.put('/:id', requestController.updateRequestStatus);
router.delete('/:id', requestController.deleteRequest);

module.exports = router;
