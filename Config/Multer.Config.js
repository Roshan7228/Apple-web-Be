const multer = require('multer');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let Foldername = "UploadImage";
        let ProductFolder = `${Foldername}/Allproduct`
        if (!fs.existsSync(Foldername)) {
            fs.mkdirSync(Foldername);
        }
        if (!fs.existsSync(ProductFolder)) {
            fs.mkdirSync(ProductFolder);

        }
        cb(null, ProductFolder);

    },

    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});


const upload = multer({ storage: storage });
module.exports = upload;
