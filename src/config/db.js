import mongoose from "mongoose";
import ora from "ora";

export const conectarDB = async(url, dbName) => {
    const spinner = ora("Conectando DB").start()
    try {
        await mongoose.connect(
            url,
            {
                dbName
            }
        )
        spinner.succeed("DB Online"); 
    } catch (error) {
        spinner.fail(`Error al conectar DB: ${error}`);
    }
}