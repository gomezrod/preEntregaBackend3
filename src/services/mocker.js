import { fakerES_MX as fa } from '@faker-js/faker';
import { createHash } from '../utils/index.js';

const minDate = '2015-01-01T00:00:00.000Z';
const maxDate = '2025-01-01T00:00:00.000Z'
const mockPassword = "coder123";
const roles = ["admin", "user"];
const species = ["dog", "cat"]

export async function createRandomUser() {
  return {
    first_name: fa.person.firstName(),
    last_name: fa.person.lastName(),
    email: fa.internet.email(),
    role: fa.helpers.arrayElement(roles),
    password: await createHash(mockPassword),
    pets: []
  };
}

export async function createRandomPet() {
  return {
    name: fa.animal.petName(),
    specie: fa.helpers.arrayElement(species),
    birthDate: fa.date.between({from: minDate, to: maxDate}),
    adopted: false,
    owner: null,
  };
}

export async function createMultiplePets(count) {
    try {
        const pets = [];
        while(count>0){
            pets.push( await createRandomPet())
            count--;
        }
        // return {
        //     docs: pets,
        //     totalDocs: pets.length
        // };   
        return pets;
    } catch (error) {
        return error
    }
}

export async function createMultipleUsers(count) {
    try {
        const users = [];
        while(count>0){
            users.push( await createRandomUser())
            count--;
        }
        // return {
        //     docs: users,
        //     totalDocs: users.length
        // };
        return users;
    } catch (error) {
        return error
    }
}