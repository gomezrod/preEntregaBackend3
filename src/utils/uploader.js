import __dirname from "./index.js";
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        let targetFolder = 'documents';

        if (file.fieldname === 'image') {
            targetFolder = 'pets';
        }

        const destinationPath = path.join(__dirname, '..', 'public', targetFolder);
        if (!fs.existsSync(destinationPath)) {
            fs.mkdirSync(destinationPath, { recursive: true });
        }

        cb(null, destinationPath)
    },
    filename:function(req,file,cb){
        cb(null,`${Date.now()}-${file.originalname}`)
    }
})

const uploader = multer({storage})

export default uploader;