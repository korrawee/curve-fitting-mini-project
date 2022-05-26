const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const bucket_name = 'elasticbeanstalk-ap-southeast-1-331815065301';

const s3 = new aws.S3();
aws.config.update({
    secretAccessKey: "9k6X4ANMRdANtDvdSQNmD3sh7jwYDtDuaP99T9No",
    accessKeyId: "AKIAU2QNYC3KXPE3QL6H",
    region: 'ap-southeast-1'
});


const storage = multerS3({
    s3: s3,
    acl: 'public-read',
    bucket: bucket_name,
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
