const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  restoreTask
} = require('../controllers/taskController')

router.get('/', verifyToken, listTasks)
router.get('/:id', verifyToken, getTask)
router.post('/', verifyToken, createTask)
router.put('/:id', verifyToken, updateTask)
router.patch('/:id/status', verifyToken, updateTaskStatus)
router.delete('/:id', verifyToken, deleteTask)
router.post('/:id/restore', verifyToken, restoreTask)

module.exports = router
