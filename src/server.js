import './config/dotenv.js';
import app from './app.js';
import { conectarDB } from './config/db.js';

const PORT = process.env.PORT || 8080;
const url = process.env.DB_URL;
const dbName = process.env.DB_NAME;

conectarDB(url, dbName);

app.listen(PORT, () => {
    console.log(`Server ejecutándose en http://localhost:${PORT}`);
});
