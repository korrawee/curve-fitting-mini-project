const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bucket_name = 'elasticbeanstalk-ap-southeast-1-331815065301';

const s3 = new aws.S3();
aws.config.update({
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    accessKeyId: AWS_ACCESS_KEY_ID,
    region: 'ap-southeast-1'
});


const storage = multerS3({
    s3: s3,
    acl: 'public-read',
    bucker: bucket_name,
    key: (req, file, callBack) => {
        try{
            console.log(file.originalname)
            callBack(null, file.fieldname + req.sessionID + '.csv' )
        }catch{
            fs.mkdir(path.join(__dirname, '/public/uploads/'), (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Directory created successfully!');
            });
        }
    }
})

// Only CSV file available 
const csvFilter = ( req,res,file , callBack) => {
    if(file.mimetype.includes("csv"))   {
        callBack(null,true);
    }else{
        callBack( "Please upload only .csv files",true);        
    }
}
uploadFile = multer({ storage: storage ,fileFileter :csvFilter });
module.exports = uploadFile;
