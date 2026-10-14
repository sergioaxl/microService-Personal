const express = require('express');
const personalController = require('../controllers/personalController');
const verifyToken = require('../middlewares/verifyToken');
const verifyTokenOrServiceKey = require('../middlewares/verifyTokenOrServiceKey');

const router = express.Router();

router.post('/', verifyToken, personalController.registrarPersonal);
router.get('/', verifyTokenOrServiceKey, personalController.listarPersonal);
router.get('/huella/:id', verifyTokenOrServiceKey, personalController.obtenerPorIdHuella);
router.patch('/:id/huella-confirmada', verifyToken, personalController.confirmarHuella);
router.get('/:id', verifyTokenOrServiceKey, personalController.obtenerPersonal);
router.put('/:id', verifyToken, personalController.actualizarPersonal);
router.patch('/:id/estado', verifyToken, personalController.cambiarEstado);
router.delete('/:id', verifyToken, personalController.eliminarPersonal);

module.exports = router;
