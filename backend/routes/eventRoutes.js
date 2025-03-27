const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { createEventRules, updateEventRules, checkEventRules } = require('../middleware/validator');

// イベントの存在確認
router.get('/check/:eventId', checkEventRules, eventController.checkEventExists);

// イベント取得
router.get('/:eventId', checkEventRules, eventController.getEvent);

// イベントと回答データを一括取得
router.get('/:eventId/withResponses', checkEventRules, eventController.getEventWithResponses);

// イベント作成
router.post('/', createEventRules, eventController.createEvent);

// イベント更新
router.patch('/:eventId', updateEventRules, eventController.updateEvent);

// イベント削除
router.delete('/:eventId', checkEventRules, eventController.deleteEvent);

module.exports = router;