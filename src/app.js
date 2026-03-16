import express from 'express';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';

import usersRouter from './routes/users.routes.js';
import petsRouter from './routes/pets.routes.js';
import adoptionsRouter from './routes/adoption.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import mocksRouter from './routes/mocks.routes.js'
import swaggerSpecs from './docs/swagger.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/apidocs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks', mocksRouter);

export default app;
