const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/challengeController');

// All of these are user-facing (auth required), not admin-only
router.get('/', auth, ctrl.listChallenges);
router.get('/active', auth, ctrl.getActiveChallenge);
router.post('/start', auth, ctrl.startChallenge);
router.post('/end/:id', auth, ctrl.endChallenge);

module.exports = router;