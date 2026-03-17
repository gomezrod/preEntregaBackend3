import { expect } from 'chai';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

import app from '../src/app.js';
import userModel from '../src/dao/models/User.js';
import petModel from '../src/dao/models/Pet.js';
import adoptionModel from '../src/dao/models/Adoption.js';

describe('Tests funcionales - router de Adoptions', function () {
    let mongoServer;

    before(async function () {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, { dbName: 'adoptme_adoptions_test' });
    });

    beforeEach(async function () {
        await adoptionModel.deleteMany({});
        await petModel.deleteMany({});
        await userModel.deleteMany({});
    });

    after(async function () {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
        await mongoServer.stop();
    });

    it('GET /api/adoptions debería devolver una lista vacía con status success', async function () {
        const response = await request(app).get('/api/adoptions');

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body).to.have.property('payload').that.is.an('array').with.length(0);
    });

    it('GET /api/adoptions/:aid debería devolver 404 si la adopción no existe', async function () {
        const adoptionId = new mongoose.Types.ObjectId().toString();

        const response = await request(app).get(`/api/adoptions/${adoptionId}`);

        expect(response.status).to.equal(404);
        expect(response.body).to.deep.equal({ status: 'error', error: 'Adoption not found' });
    });

    it('GET /api/adoptions/:aid debería devolver una adopción existente', async function () {
        const user = await userModel.create({
            first_name: 'Ana',
            last_name: 'Lopez',
            email: 'ana.lopez@example.com',
            password: 'hashed-password'
        });
        const pet = await petModel.create({
            name: 'Mora',
            specie: 'Perro',
            birthDate: new Date('2021-03-10'),
            adopted: true,
            owner: user._id
        });
        const adoption = await adoptionModel.create({ owner: user._id, pet: pet._id });

        const response = await request(app).get(`/api/adoptions/${adoption._id}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body.payload).to.have.property('_id', adoption._id.toString());
        expect(response.body.payload).to.have.property('owner', user._id.toString());
        expect(response.body.payload).to.have.property('pet', pet._id.toString());
    });

    it('POST /api/adoptions/:uid/:pid debería crear una adopción y actualizar usuario y mascota', async function () {
        const user = await userModel.create({
            first_name: 'Carlos',
            last_name: 'Ruiz',
            email: 'carlos.ruiz@example.com',
            password: 'hashed-password'
        });
        const pet = await petModel.create({
            name: 'Toby',
            specie: 'Perro',
            birthDate: new Date('2022-01-20')
        });

        const response = await request(app).post(`/api/adoptions/${user._id}/${pet._id}`);

        expect(response.status).to.equal(200);
        expect(response.body).to.deep.equal({ status: 'success', message: 'Pet adopted' });

        const adoption = await adoptionModel.findOne({ owner: user._id, pet: pet._id }).lean();
        expect(adoption).to.not.equal(null);

        const updatedPet = await petModel.findById(pet._id).lean();
        expect(updatedPet.adopted).to.equal(true);
        expect(updatedPet.owner.toString()).to.equal(user._id.toString());

        const updatedUser = await userModel.findById(user._id).lean();
        expect(updatedUser.pets).to.be.an('array').with.length(1);
        expect(updatedUser.pets[0]._id.toString()).to.equal(pet._id.toString());
    });

    it('POST /api/adoptions/:uid/:pid debería devolver 404 si el usuario no existe', async function () {
        const missingUserId = new mongoose.Types.ObjectId().toString();
        const pet = await petModel.create({
            name: 'Luna',
            specie: 'Gato',
            birthDate: new Date('2020-07-12')
        });

        const response = await request(app).post(`/api/adoptions/${missingUserId}/${pet._id}`);

        expect(response.status).to.equal(404);
        expect(response.body).to.deep.equal({ status: 'error', error: 'user Not found' });
    });

    it('POST /api/adoptions/:uid/:pid debería devolver 404 si la mascota no existe', async function () {
        const user = await userModel.create({
            first_name: 'Laura',
            last_name: 'Mendez',
            email: 'laura.mendez@example.com',
            password: 'hashed-password'
        });
        const missingPetId = new mongoose.Types.ObjectId().toString();

        const response = await request(app).post(`/api/adoptions/${user._id}/${missingPetId}`);

        expect(response.status).to.equal(404);
        expect(response.body).to.deep.equal({ status: 'error', error: 'Pet not found' });
    });

    it('POST /api/adoptions/:uid/:pid debería devolver 400 si la mascota ya fue adoptada', async function () {
        const user = await userModel.create({
            first_name: 'Bruno',
            last_name: 'Sosa',
            email: 'bruno.sosa@example.com',
            password: 'hashed-password'
        });
        const pet = await petModel.create({
            name: 'Kira',
            specie: 'Perro',
            birthDate: new Date('2019-11-11'),
            adopted: true,
            owner: user._id
        });

        const response = await request(app).post(`/api/adoptions/${user._id}/${pet._id}`);

        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ status: 'error', error: 'Pet is already adopted' });
    });
});
