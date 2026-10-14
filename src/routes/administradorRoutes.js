const express = require('express');
const administradorController = require('../controllers/administradorController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/', verifyToken, administradorController.registrarAdministrador);
router.get('/', verifyToken, administradorController.listarAdministradores);
router.get('/:id', verifyToken, administradorController.obtenerAdministrador);
router.put('/:id', verifyToken, administradorController.actualizarAdministrador);
router.patch('/:id/password', verifyToken, administradorController.cambiarPassword);
router.delete('/:id', verifyToken, administradorController.eliminarAdministrador);

module.exports = router;
