const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const multer = require('multer')
const useLocalTasks = process.env.TASKS_STORAGE === 'memory' || !process.env.DB_HOST
const authenticate = process.env.FEATURE_AUTH_ENABLED === 'true'
  ? verifyToken
  : (req, _res, next) => {
      req.userId = process.env.DEV_USER_ID || 'local-dev-user'
      next()
    }
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
} = useLocalTasks
  ? require('../controllers/localTaskController')
  : require('../controllers/taskController')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

router.patch('/bulk/complete', authenticate, bulkComplete)
router.delete('/bulk/delete', authenticate, bulkDelete)
router.get('/', authenticate, listTasks)
router.get('/:id', authenticate, getTask)
router.post('/', authenticate, createTask)
router.put('/:id', authenticate, updateTask)
router.patch('/:id/status', authenticate, updateTaskStatus)
router.delete('/:id', authenticate, deleteTask)
router.post('/:id/restore', authenticate, restoreTask)
router.post('/:id/subtasks', authenticate, createSubtask)
router.put('/:id/subtasks/:subId', authenticate, updateSubtask)
router.post('/:id/attachments', authenticate, upload.single('attachment'), uploadAttachment)
router.delete('/:id/attachments/:attId', authenticate, deleteAttachment)
router.post('/:id/comments', authenticate, createComment)

module.exports = router
