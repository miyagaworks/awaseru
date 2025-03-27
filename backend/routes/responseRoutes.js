const express = require('express');
const router = express.Router();
const responseController = require('../controllers/responseController');
const { updateResponseRules, checkEventRules } = require('../middleware/validator');

// イベントの全レスポンスを取得
router.get('/:eventId', checkEventRules, responseController.getResponses);

// レスポンス更新
router.patch('/:eventId', updateResponseRules, responseController.updateResponse);

// 複数レスポンスの一括更新
router.post('/:eventId', checkEventRules, responseController.updateResponses);

module.exports = router;