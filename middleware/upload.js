const multer = require('multer');

const storage = multer.memoryStorage()

// Only CSV file available 
const fileFilter = (req, file , callBack) => {
    if(file.mimetype.split("/")[1] === "csv")   {
        callBack(null,true);
    }else{
        callBack(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);        
    }
}
exports.uploadFile = multer({
     storage: storage,fileFilter: fileFilter 
});
