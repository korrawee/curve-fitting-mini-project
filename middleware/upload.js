const {S3} = require('aws-sdk');
const multer = require('multer');

////////////////
// AWS config //
////////////////

const s3 = new S3();

exports.s3Upload = async (req, file) =>{   
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${req.sessionID}-${file.originalname}`,
        Body: file.buffer,
    }
    return await s3.upload(param).promise();
}    

exports.s3GetObject = async (key) =>{
    const param = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    }
    let result = await s3.getObject(param).createReadStream('utf-8');
    return result
};

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
