const express = require('express');
const app = express();
const http = require('http').Server(app);

const io = require('socket.io')(http);
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { logger }  = require('./middleware/logEvents');
const errorHandler  = require('./middleware/errorHandler');
const { sendFile } = require('express/lib/response');
const PORT = process.env.PORT || 3500;

const multer = require('multer')
const csv = require('fast-csv');
// ---------------------------------------------------
// Express configurations

// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
const whitelist = ['https://www.google.com','http://127.0.0.1:5500', `http://localhost:${PORT}`]
const corsOptions = {
    origin: (origin, callback) => {
        if (whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true);
        } else{
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));

// built-in middleware to handle urlencoded data 
// 'content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json 
app.use(express.json());

// server static files
app.use(express.static(__dirname + '/public'));

// ---------------------------------------------------
// Route Handler
app.get('^/$|/index(.html)?', (req,res) => {
    // res.sendFile('./views/index.html', {root: __dirname});
    const math = require('mathjs');
    const my_path = path.join(__dirname, 'views', 'index.html');
    res.sendFile( my_path );
});

app.post('^/$|/index(.html)?', (req,res) => {
    const my_path = path.join(__dirname, 'views', 'index.html');
    const {getpolynomials} = require('./public/javascripts/equation.js');  
    //  Parse string data to array of data_x and data_y
    let data_x = req.body["data-x"].split(',').map(x => parseFloat(x.trim()));
    let data_y = req.body["data-y"].split(',').map(y => parseFloat(y.trim()));
    let order = parseInt(req.body["data-order"]);
    let arrResult = getpolynomials(data_x, data_y, order);     // [eqn, dataset]

    console.log('result =>\t',arrResult);
    // Socket.io
    io.on('connection', function(socket) {
        console.log('A user connected');
        io.emit('data', [[data_x,data_y], arrResult]);
        //Whenever someone disconnects this piece of code executed
        socket.on('disconnect', function () {
        console.log('A user disconnected');
        });
    });
    res.redirect(req.get('referer'));
});

const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        console.log("1")
        callBack(null, './public/uploads')    
    },
    filename: (req, file, callBack) => {
        try{
            console.log("2")
            callBack(null, file.fieldname + '-' + Date.now() + '-' + file.originalname )
        }catch{
            fs.mkdir(path.join(__dirname, './public/uploads'), (err) => {
                if (err) {
                    return console.error(err);
                }
                console.log('Directory created successfully!');
            });
        }
    }
})

const csvFilter = ( req, file , callBack) => {
    if(file.mimetype.includes("csv"))   {
        console.log("3")
        callBack(null,true);
    }else{
        console.log("4")
        callBack( "Please upload only .csv files" , false );
    }
}
const upload = multer({ storage: storage ,fileFileter :csvFilter });
// const upload = multer({ dest: 'tmp/csv/' });

app.post('^/$|/upload(.html)?', upload.single("up_data") , (req,res) => {
    // console.log("Get : ",req.file.filename)
    // res.render('show',req.file)
    const fileRows = [];
    let filePath = __basedir + '/public/uploads' + req.file.filename ;
    csv.fromPath(req.file.path)
        .on("data", function (data) {
            fileRows.push(data);
    })
        .on("end", function () {
            console.log(fileRows)
            fs.unlinkSync(req.file.path);   
    })
    //res.sendFile( path.join(__dirname, 'views', 'upload.html') );

});

app.get('/new-page(.html)?', (req,res) => {
    res.sendFile( path.join(__dirname, 'views', 'new-page.html') );
});

app.get('/old-page(.html)?', (req,res) => {
    res.redirect( 301, '/new-page.html');
});

app.all('*', (req, res) =>{
    res.status(404);
    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }else if(req.accepts('json')) {
        res.json({error: "404 Not Found"});
    }else{
        res.type('txt').send('"404 Not Found"');
    }
});
// ---------------------------------------------------



app.use(errorHandler);


http.listen(PORT, () => console.log(`Server running on port ${PORT}`));