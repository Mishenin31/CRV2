// Автор: Мишенин
// Middleware: требовать аутентификацию для защищённых маршрутов

function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ error: 'Требуется авторизация' });
}

module.exports = { requireAuth };
