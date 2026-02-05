import './config/dotenv.js';
import express from 'express';
import { conectarDB } from './config/db.js';
import cookieParser from 'cookie-parser';

import usersRouter from './routes/users.routes.js';
import petsRouter from './routes/pets.routes.js';
import adoptionsRouter from './routes/adoption.routes.js';
import sessionsRouter from './routes/sessions.routes.js';
import mocksRouter from './routes/mocks.routes.js'

const app = express();
const PORT = process.env.PORT||8080;
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;
conectarDB(url, dbName);

app.use(express.json());
app.use(cookieParser());

app.use('/api/users',usersRouter);
app.use('/api/pets',petsRouter);
app.use('/api/adoptions',adoptionsRouter);
app.use('/api/sessions',sessionsRouter);
app.use('/api/mocks', mocksRouter);

app.listen(PORT,()=>console.log(`Server ejecutándose en http://localhost:${PORT}`))
