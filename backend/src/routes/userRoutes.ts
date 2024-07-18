import { Router } from 'express';
import { createNewUser, deleteUser, listAllUsers, profileUser, signin, updateDescription, verifyUser, logoutUser, updateUsername } from '../handlers/user';
import { isAdmin, protect } from '../modules/auth';

const router = Router();

router.post('/user', createNewUser);
router.post('/signin', signin);
router.post('/logout', protect, logoutUser);
router.get('/profile', protect, verifyUser);
router.put('/update-description', protect, updateDescription);
router.put('/update-username', protect, updateUsername);
router.get('/users', protect, isAdmin, listAllUsers);
router.delete('/delete-user', protect, isAdmin, deleteUser);
router.post('/profile-user', protect, isAdmin, profileUser);

export default router;
