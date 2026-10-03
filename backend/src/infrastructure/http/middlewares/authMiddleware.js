'use strict';

function crearAuthMiddleware(tokenService) {
  return function autenticar(req, res, next) {
    const cabecera = req.headers.authorization;
    if (!cabecera || !cabecera.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado.' });
    }

    const token = cabecera.split(' ')[1];
    try {
      const payload = tokenService.verificar(token);
      req.usuario = payload; // { id, rol }
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado.' });
    }
  };
}

function requerirAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Se requiere rol de administrador.' });
  }
  next();
}

module.exports = { crearAuthMiddleware, requerirAdmin };
