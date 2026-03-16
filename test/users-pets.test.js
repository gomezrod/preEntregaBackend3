import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

import app from '../src/app.js';
import userModel from '../src/dao/models/User.js';
import petModel from '../src/dao/models/Pet.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixtureFilePath = path.join(__dirname, 'fixtures', 'pet-image.txt');
const uploadsDirPath = path.join(__dirname, '..', 'src', 'public', 'img');

describe('Tests funcionales - routers de Usuarios y Mascotas', function () {
    let mongoServer;

    before(async function () {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, { dbName: 'adoptme_test' });
    });

    beforeEach(async function () {
        await userModel.deleteMany({});
        await petModel.deleteMany({});
    });

    afterEach(async function () {
        const files = await fs.readdir(uploadsDirPath);
        const testUploads = files.filter((fileName) => fileName.endsWith('-pet-image.txt'));
        await Promise.all(
            testUploads.map((fileName) => fs.unlink(path.join(uploadsDirPath, fileName)))
        );
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    describe('Router Users - /api/users', function () {
        it('GET /api/users debería devolver una lista vacía con estado de éxito', async function () {
            const response = await request(app).get('/api/users');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload').that.is.an('array').with.length(0);
        });

        it('GET /api/users/:uid debería devolver 404 cuando el usuario no existe', async function () {
            const nonExistingId = new mongoose.Types.ObjectId().toString();

            const response = await request(app).get(`/api/users/${nonExistingId}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.deep.equal({ status: 'error', error: 'User not found' });
        });

        it('GET /api/users/:uid debería devolver un usuario cuando existe', async function () {
            const createdUser = await userModel.create({
                first_name: 'Ana',
                last_name: 'Gomez',
                email: 'ana@example.com',
                password: 'hashed-password',
                role: 'user'
            });

            const response = await request(app).get(`/api/users/${createdUser._id}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload').that.is.an('object');
            expect(response.body.payload).to.have.property('_id', createdUser._id.toString());
            expect(response.body.payload).to.have.property('email', 'ana@example.com');
            expect(response.body.payload).to.not.have.property('password', 'plain-password');
        });

        it('PUT /api/users/:uid debería actualizar los campos del usuario y devolver un mensaje success', async function () {
            const createdUser = await userModel.create({
                first_name: 'Leo',
                last_name: 'Suarez',
                email: 'leo@example.com',
                password: 'hashed-password',
                role: 'user'
            });

            const updatePayload = {
                first_name: 'Leonardo',
                role: 'admin'
            };

            const response = await request(app)
                .put(`/api/users/${createdUser._id}`)
                .send(updatePayload);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ status: 'success', message: 'User updated' });

            const updatedUser = await userModel.findById(createdUser._id).lean();
            expect(updatedUser.first_name).to.equal('Leonardo');
            expect(updatedUser.role).to.equal('admin');
            expect(updatedUser.last_name).to.equal('Suarez');
        });

        it('PUT /api/users/:uid debería devolver 404 cuando se intenta actualizar un usuario que no existe', async function () {
            const nonExistingId = new mongoose.Types.ObjectId().toString();

            const response = await request(app)
                .put(`/api/users/${nonExistingId}`)
                .send({ first_name: 'Nope' });

            expect(response.status).to.equal(404);
            expect(response.body).to.deep.equal({ status: 'error', error: 'User not found' });
        });

        it('DELETE /api/users/:uid debería responder con éxito incluso si el usuario no existe (implementación actual)', async function () {
            const nonExistingId = new mongoose.Types.ObjectId().toString();

            const response = await request(app).delete(`/api/users/${nonExistingId}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ status: 'success', message: 'User deleted' });
        });
    });

    describe('Router Pets - /api/pets', function () {
        it('GET /api/pets debería devolver todas las mascotas con estado de éxito', async function () {
            await petModel.create({
                name: 'Milo',
                specie: 'Perro',
                birthDate: new Date('2021-01-01')
            });

            const response = await request(app).get('/api/pets');

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body).to.have.property('payload').that.is.an('array').with.length(1);
            expect(response.body.payload[0]).to.have.property('name', 'Milo');
            expect(response.body.payload[0]).to.have.property('adopted', false);
        });

        it('POST /api/pets debería crear una mascota cuando el cuerpo es válido', async function () {
            const payload = {
                name: 'Luna',
                specie: 'Gato',
                birthDate: '2022-04-10'
            };

            const response = await request(app).post('/api/pets').send(payload);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.have.property('_id');
            expect(response.body.payload).to.include({
                name: 'Luna',
                specie: 'Gato',
                adopted: false
            });

            const createdPet = await petModel.findById(response.body.payload._id).lean();
            expect(createdPet).to.not.equal(null);
            expect(createdPet.image).to.equal('');
        });

        it('POST /api/pets debería devolver 400 para un cuerpo incompleto', async function () {
            const response = await request(app)
                .post('/api/pets')
                .send({ name: 'Sin especie' });

            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({ status: 'error', error: 'Incomplete values' });
        });

        it('POST /api/pets/withimage debería crear una mascota con ruta de imagen', async function () {
            const response = await request(app)
                .post('/api/pets/withimage')
                .field('name', 'Rex')
                .field('specie', 'Perro')
                .field('birthDate', '2020-09-09')
                .attach('image', fixtureFilePath);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('status', 'success');
            expect(response.body.payload).to.have.property('_id');
            expect(response.body.payload).to.have.property('image').that.is.a('string');
            expect(response.body.payload.image).to.include('public/img');

            const createdPet = await petModel.findById(response.body.payload._id).lean();
            expect(createdPet).to.not.equal(null);
            expect(createdPet.image).to.be.a('string').and.include('public/img');
        });

        it('PUT /api/pets/:pid debería actualizar la mascota y mantener el contrato de respuesta', async function () {
            const createdPet = await petModel.create({
                name: 'Pipa',
                specie: 'Perro',
                birthDate: new Date('2019-10-10')
            });

            const response = await request(app)
                .put(`/api/pets/${createdPet._id}`)
                .send({ adopted: true });

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ status: 'success', message: 'pet updated' });

            const updatedPet = await petModel.findById(createdPet._id).lean();
            expect(updatedPet.adopted).to.equal(true);
        });

        it('DELETE /api/pets/:pid debería eliminar la mascota y devolver un mensaje de éxito', async function () {
            const createdPet = await petModel.create({
                name: 'Nina',
                specie: 'Gato',
                birthDate: new Date('2018-05-20')
            });

            const response = await request(app).delete(`/api/pets/${createdPet._id}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.deep.equal({ status: 'success', message: 'pet deleted' });

            const deletedPet = await petModel.findById(createdPet._id).lean();
            expect(deletedPet).to.equal(null);
        });
    });
});
