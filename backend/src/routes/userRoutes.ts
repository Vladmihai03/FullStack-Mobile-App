import { Router } from 'express';
import { createNewUser, deleteUser, listAllUsers, profileUser, signin, updateDescription, verifyUser, updateUsername, requestVacation, getUserRequestedVacation, listAllReservations, sendResponse, createTask, listUserTasks, updateTaskStatus, listAllTasks } from '../handlers/user';
import { isAdmin, protect } from '../modules/auth';

const router = Router();

router.post('/user', createNewUser);
router.post('/signin', signin);
router.get('/profile', protect, verifyUser);
router.put('/update-description', protect, updateDescription);
router.put('/update-username', protect, updateUsername);
router.get('/users', protect, isAdmin, listAllUsers);
router.delete('/delete-user', protect, isAdmin, deleteUser);
router.post('/profile-user', protect, isAdmin, profileUser);
router.post('/requestVacation', protect, requestVacation);
router.get('/userRequests', protect, getUserRequestedVacation);
router.get('/reservations',protect,  isAdmin, listAllReservations);
router.post('/statusResponse',protect,isAdmin, sendResponse);
router.post('/tasks', protect, isAdmin, createTask);
router.get('/tasks', protect, listUserTasks);
router.put('/tasks', protect, updateTaskStatus);
router.get('/admin-tasks', protect, isAdmin, listAllTasks);

export default router;
