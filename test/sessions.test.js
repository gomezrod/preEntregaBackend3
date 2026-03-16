import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import userModel from '../src/dao/models/User.js';

describe('Tests funcionales - router de Sessions', function () {
    let mongoServer;

    before(async function () {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, { dbName: 'adoptme_sessions_test' });
    });

    beforeEach(async function () {
        await userModel.deleteMany({});
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    describe('POST /api/sessions/register', function () {
        it('debería registrar un usuario con password hasheada y campos nuevos inicializados', async function () {
            const payload = {
                first_name: 'Rodri',
                last_name: 'Gomez',
                email: 'rodri@example.com',
                password: '123456'
            };

            const response = await request(app).post('/api/sessions/register').send(payload);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload').that.is.a('string');

            const createdUser = await userModel.findById(response.body.payload).lean();
            expect(createdUser).to.not.equal(null);
            expect(createdUser.email).to.equal(payload.email);
            expect(createdUser.password).to.be.a('string');
            expect(createdUser.password).to.not.equal(payload.password);
            expect(createdUser.documents).to.be.an('array').with.length(0);
            expect(createdUser.last_connection).to.equal(null);
        });

        it('debería devolver 400 si faltan campos', async function () {
            const response = await request(app)
                .post('/api/sessions/register')
                .send({ first_name: 'Rodri' });

            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({ status: 'error', error: 'Incomplete values' });
        });

        it('debería devolver 400 si el email ya existe', async function () {
            const payload = {
                first_name: 'Rodri',
                last_name: 'Gomez',
                email: 'rodri@example.com',
                password: '123456'
            };

            await request(app).post('/api/sessions/register').send(payload);
            const duplicateResponse = await request(app).post('/api/sessions/register').send(payload);

            expect(duplicateResponse.status).to.equal(400);
            expect(duplicateResponse.body).to.deep.equal({ status: 'error', error: 'User already exists' });
        });
    });

    describe('POST /api/sessions/login', function () {
        const validCredentials = {
            email: 'login@example.com',
            password: 'abc123'
        };

        beforeEach(async function () {
            await request(app).post('/api/sessions/register').send({
                first_name: 'Login',
                last_name: 'Tester',
                ...validCredentials
            });
        });

        it('debería devolver 400 si faltan credenciales', async function () {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({ email: validCredentials.email });

            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({ status: 'error', error: 'Incomplete values' });
        });

        it('debería devolver 404 si el usuario no existe', async function () {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({ email: 'inexistente@example.com', password: 'abc123' });

            expect(response.status).to.equal(404);
            expect(response.body).to.deep.equal({ status: 'error', error: "User doesn't exist" });
        });

        it('debería devolver 400 si la password es incorrecta', async function () {
            const response = await request(app)
                .post('/api/sessions/login')
                .send({ email: validCredentials.email, password: 'wrong-password' });

            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({ status: 'error', error: 'Incorrect password' });
        });

        it('debería loguear correctamente, setear cookie y actualizar last_connection', async function () {
            const beforeLogin = await userModel.findOne({ email: validCredentials.email }).lean();
            expect(beforeLogin.last_connection).to.equal(null);

            const response = await request(app)
                .post('/api/sessions/login')
                .send(validCredentials);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ status: 'success', message: 'Logged in' });
            expect(response.headers).to.have.property('set-cookie');
            expect(response.headers['set-cookie'][0]).to.include('coderCookie=');

            const afterLogin = await userModel.findOne({ email: validCredentials.email }).lean();
            expect(afterLogin.last_connection).to.not.equal(null);
        });
    });
});
