const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const {
  createWorkspace,
  inviteToWorkspace,
  updateWorkspaceRole
} = require('../controllers/workspaceController')

router.post('/', verifyToken, createWorkspace)
router.post('/:id/invites', verifyToken, inviteToWorkspace)
router.patch('/:id/roles', verifyToken, updateWorkspaceRole)

module.exports = router
