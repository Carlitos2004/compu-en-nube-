const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask } = require('../controllers/taskController');

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);    // Ruta para editar/completar
router.delete('/:id', deleteTask); // <-- ESTA ES LA RUTA QUE PERMITE BORRAR

module.exports = router;