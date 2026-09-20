const express = require('express');
const personalController = require('../controllers/personalController');

const router = express.Router();

router.post('/', personalController.registrarPersonal);
router.get('/', personalController.listarPersonal);
router.get('/codigo/:codigo', personalController.obtenerPorCodigoBarras);
router.get('/:id', personalController.obtenerPersonal);
router.put('/:id', personalController.actualizarPersonal);
router.patch('/:id/estado', personalController.cambiarEstado);
router.delete('/:id', personalController.eliminarPersonal);

module.exports = router;
