const express = require('express');
const departamentoController = require('../controllers/departamentoController');

const router = express.Router();

router.post('/', departamentoController.crearDepartamento);
router.get('/', departamentoController.listarDepartamentos);
router.get('/:id', departamentoController.obtenerDepartamento);
router.put('/:id', departamentoController.actualizarDepartamento);
router.delete('/:id', departamentoController.eliminarDepartamento);

module.exports = router;
