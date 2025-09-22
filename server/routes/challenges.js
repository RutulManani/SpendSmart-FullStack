const express = require('express');
const router = express.Router();
const challengeController = require('../controllers/challengeController');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/', challengeController.getChallenges);
router.post('/start', challengeController.startChallenge);
router.get('/active', challengeController.getActiveChallenge);
router.post('/end/:challengeId', challengeController.endChallenge);
router.get('/history', challengeController.getChallengeHistory);

module.exports = router;