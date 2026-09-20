const express = require('express');
const administradorController = require('../controllers/administradorController');

const router = express.Router();

router.post('/', administradorController.registrarAdministrador);
router.get('/', administradorController.listarAdministradores);
router.get('/:id', administradorController.obtenerAdministrador);
router.put('/:id', administradorController.actualizarAdministrador);
router.patch('/:id/password', administradorController.cambiarPassword);
router.delete('/:id', administradorController.eliminarAdministrador);

module.exports = router;
