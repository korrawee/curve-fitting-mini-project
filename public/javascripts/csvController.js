const fs = require('fs');
const csv = require('fast-csv');
let data;
let message;
const upload = async(req,res) => {
    try {
        if(req.file == undefined){
            message = "Please upload CSV File!";
            return res.status(301);
        }
        message = '';
        let path = __dirname + "/../uploads/" + req.file.filename;
        fs.createReadStream(path)
        .pipe(csv.parse({headers: true}))
        .on('error',(error) =>{
            throw error.message;
        })
        .on("data", (row) =>{
            data = [[],[]];
            keys = Object.keys(row);
            data[0].push(row[keys[0]]); // X data-points
            data[1].push(row[keys[1]]); // Y data-points
        });
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: "Could not upload the file"
        });
    }finally{
        res.redirect(`/?mes=${message}`);
    }
};
const Getdata = data
module.exports = {
    upload,
    Getdata,
}