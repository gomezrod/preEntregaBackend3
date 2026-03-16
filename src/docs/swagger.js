import path from 'path';
import { fileURLToPath } from 'url';
import swaggerJSDoc from 'swagger-jsdoc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.3',
        info: {
            title: 'AdoptMe API',
            version: '1.0.0',
            description: 'Documentacion de la API para Sessions, Pets y Adoptions.'
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT||8080}`,
                description: 'Servidor local'
            }
        ]
    },
    apis: [
        path.join(__dirname, 'components.yaml'),
        path.join(__dirname, 'sessions.yaml'),
        path.join(__dirname, 'users.yaml'),
        path.join(__dirname, 'pets.yaml'),
        path.join(__dirname, 'adoptions.yaml')
    ]
};

const swaggerSpecs = swaggerJSDoc(options);

export default swaggerSpecs;