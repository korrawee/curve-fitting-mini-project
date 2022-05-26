const multer = require('multer')

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/uploads/')    
    },
    filename: (req, file, callBack) => {
        try{
            console.log(file.originalname)
            callBack(null, file.fieldname + req.sessionID + '.csv' )
        }catch{
            fs.mkdir(path.join(__dirname, './public/uploads/'), (err) => {
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
