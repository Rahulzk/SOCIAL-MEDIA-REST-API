const express = require('express');
const { register, login, followUser, logout, updatePassword, updateProfile, deleteMyProfile, myProfile, findUser } = require('../controllers/user');
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();

router.post('/register',register);
router.post('/login',login)
router.get('/follow/:id',isAuthenticated,followUser)
router.get('/logout',logout)
router.put('/update/password',isAuthenticated,updatePassword)
router.put('/update/profile',isAuthenticated,updateProfile)
router.delete('/delete/me',isAuthenticated,deleteMyProfile)
router.get('/me',isAuthenticated,myProfile)
router.get('/user/:id',isAuthenticated,findUser)

module.exports = router
