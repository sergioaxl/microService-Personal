const express = require('express');
const departamentoController = require('../controllers/departamentoController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.post('/', verifyToken, departamentoController.crearDepartamento);
router.get('/', departamentoController.listarDepartamentos);
router.get('/:id', departamentoController.obtenerDepartamento);
router.put('/:id', verifyToken, departamentoController.actualizarDepartamento);
router.delete('/:id', verifyToken, departamentoController.eliminarDepartamento);

module.exports = router;
