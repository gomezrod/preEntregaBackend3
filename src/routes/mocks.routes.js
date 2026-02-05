import { Router } from "express";
import { createMultipleUsers, createMultiplePets } from "../services/mocker.js";
import { usersService, petsService } from "../services/index.js";

const router = Router();

router.get('/', (req, res) => {
    res.setHeader('Content-Type','application/json');
    return res.status(200).json({
        payload: {
            title: 'Mock API endpoint',
            description: 'En este endpoint se encontrarán los métodos necesarios para crear y cargar datos de prueba a la DB',
            endpoints: [
                {
                    route: '/mockingusers',
                    method: 'GET',
                    description: `Endpoint que recibe un número por parámetro query ?count y genera un mock con esa cantidad de usuarios en el formato que lo devolvería Mongo. Si no se proporciona el parámetro, será por defecto 50.`
                },
                {
                    route: '/mockingpets',
                    method: 'GET',
                    description: `Endpoint que recibe un número por parámetro query ?count y genera un mock con esa cantidad mascotas en el formato que lo devolvería Mongo. Si no se proporciona el parámetro, será por defecto 50.`
                },
                {
                    route: '/generateData',
                    method: 'POST',
                    description: `Endpoint que recibe por body los parámetros numéricos “users” y “pets” para generar e insertar en la base de datos la cantidad de registros indicados`
                },
            ]
        }
    });
})

router.get('/mockingpets', async (req, res) => {
    let { count } = req.query
    if(!count){
        count = 50
    }
    const pets = await createMultiplePets(parseInt(count))
    res.setHeader('Content-Type','application/json');
    return res.status(200).json({status: "success", payload: pets});
})

router.get('/mockingusers', async (req, res) => {
    let { count } = req.query
    if(!count){
        count = 50
    }
    const users = await createMultipleUsers(parseInt(count))
    res.setHeader('Content-Type','application/json');
    return res.status(200).json({status: "success", payload: users});
})

router.post('/generateData', async (req, res) => {
    const { pets, users } = req.body
    let randomPets, randomUsers = [];

    if(!pets && !users){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Se deben proporcionar valores a agregar`})
    }

    if(parseInt(pets)<=0 || parseInt(users)<=0){
        res.setHeader('Content-Type','application/json');
        return res.status(400).json({error:`Las cantidades proporcionadas deben ser mayor a 0`})
    }
    
    if(pets){
        randomPets = await createMultiplePets(parseInt(pets));
        randomPets.forEach(async pet => {
            await petsService.create(pet)
        });
    }

    if(users){
        randomUsers = await createMultipleUsers(parseInt(users));
        randomUsers.forEach(async user => {
            await usersService.create(user)
        });
    }

    res.setHeader('Content-Type','application/json');
    return res.status(201).json({status: "success", payload: `Se han agregado a la DB ${users? randomUsers.length : 0} usuarios y ${pets? randomPets.length : 0} mascotas`});
})

export default router;

