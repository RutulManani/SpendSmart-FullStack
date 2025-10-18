const auth = require('./auth');

module.exports = function adminAuth(req, res, next) {
  // first verify token
  auth(req, res, function onAuthed() {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access only' });
    }
    next();
  });
};