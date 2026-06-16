const express = require('express')
const router = express.Router()
const verifyToken = require('../middlewares/auth')
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController')

router.get('/', verifyToken, listCategories)
router.post('/', verifyToken, createCategory)
router.put('/:id', verifyToken, updateCategory)
router.delete('/:id', verifyToken, deleteCategory)

module.exports = router
