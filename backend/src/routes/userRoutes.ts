import { Router } from 'express';
import { createNewUser, signin, updateDescription, verifyUser } from '../handlers/user';
import { protect } from '../modules/auth';

const router = Router();

router.post('/user', createNewUser);
router.post('/signin', signin);
router.get('/profile', protect, verifyUser)
router.put('/description', protect, updateDescription);

export default router;
