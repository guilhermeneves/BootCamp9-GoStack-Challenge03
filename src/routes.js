import { Router } from 'express';

import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import GymPlanController from './app/controllers/GymPlanController';
import EnrollController from './app/controllers/EnrollController';

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

routes.post('/enroll', EnrollController.store);
routes.delete('/enroll/:id', EnrollController.delete);
routes.get('/enroll', EnrollController.index);
routes.put('/enroll/:id', EnrollController.update);
export default routes;
