const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const multer = require('multer')
const {
  listTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  restoreTask,
  createSubtask,
  updateSubtask,
  uploadAttachment,
  deleteAttachment,
  bulkComplete,
  bulkDelete,
  createComment
} = require('../controllers/taskController')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.patch('/bulk/complete', verifyToken, bulkComplete)
router.delete('/bulk/delete', verifyToken, bulkDelete)
router.get('/', verifyToken, listTasks)
router.get('/:id', verifyToken, getTask)
router.post('/', verifyToken, createTask)
router.put('/:id', verifyToken, updateTask)
router.patch('/:id/status', verifyToken, updateTaskStatus)
router.delete('/:id', verifyToken, deleteTask)
router.post('/:id/restore', verifyToken, restoreTask)
router.post('/:id/subtasks', verifyToken, createSubtask)
router.put('/:id/subtasks/:subId', verifyToken, updateSubtask)
router.post('/:id/attachments', verifyToken, upload.single('attachment'), uploadAttachment)
router.delete('/:id/attachments/:attId', verifyToken, deleteAttachment)
router.post('/:id/comments', verifyToken, createComment)

module.exports = router
