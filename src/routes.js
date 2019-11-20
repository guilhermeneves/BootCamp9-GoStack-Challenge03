import { Router } from 'express';

import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import GymPlanController from './app/controllers/GymPlanController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);

routes.post('/student', StudentController.store);

routes.use(authMiddleware);

routes.put('/student/:id', StudentController.update);

routes.post('/gymplan', GymPlanController.store);
routes.delete('/gymplan/:id', GymPlanController.delete);
routes.put('/gymplan/:id', GymPlanController.update);
routes.get('/gymplan', GymPlanController.index);

export default routes;
