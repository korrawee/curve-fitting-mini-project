require("dotenv").config();
const express = require('express');
const app = express();
const http = require('http').Server(app);
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');

const { logger }  = require('./middleware/logEvents');
const errorHandler  = require('./middleware/errorHandler');
const session = require('express-session');
const {uploadFile, s3Upload, s3GetObject} = require('./middleware/upload');
const {init_session} = require('./middleware/session');

const PORT = process.env.PORT || 3500;
// ---------------------------------------------------
// Express configurations
app.use(session(
    {
        secret: 'my_session_secret', // 128 character random string is recommended
        resave: true,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000, httpOnly: true }
    })
);
// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
const whitelist = [`http://localhost:${PORT}`,"http://curve-fitting-online-dev.us-west-2.elasticbeanstalk.com"]
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

///////////////////
//      API      //
///////////////////
app.get('/api/session-data', (req,res) => {
    res.send(req.session.data.input);
});
app.get('/api/generate-data', (req,res) => {
    res.send(req.session.data.json_result);
});

///////////////////
// Route Handler //
///////////////////
app.get('^/$|/index(.html)?/:mes', (req,res) => {

    if(req.session.isFirst == 1) {
    } else {
        req.session.isFirst = init_session.isFirst;
        req.session.data = init_session.data;
        res.cookie('isFirst', 1, { maxAge: 24 * 60 * 60 * 1000, singed: true});
    }
    
    const my_path = path.join(__dirname, 'views', 'index.html');

    res.sendFile( my_path );
});

app.post('^/$|/index(.html)?', (req,res) => {

    const {getpolynomials,isDataAvailable} = require('./public/javascripts/equation.js');  
    let data_x,data_y;

    let order = parseInt(req.body["data-order"]);
    //  Parse string data to array of data_x and data_y
    data_x = req.body["data-x"].split(',').map(x => parseFloat(x.trim()));
    data_y = req.body["data-y"].split(',').map(y => parseFloat(y.trim()));

    if(isDataAvailable(data_x,data_y)){
        res.redirect('/?mess=' + "Error! your dataset must have at least 2 points and number of x values must equal to number of y values")    
    }

    let json_result = getpolynomials(data_x, data_y, order);     // = {eqn1: [data_x1,data_y1,error1], eqn2: [data_x2,data_y2,error2]}
    
    // Save data to session
    req.session.data = {
        "input": {"input":[data_x, data_y]},
        "json_result": json_result,
        "prev_src" : {"prev_src": req.body.src}
    };

    res.redirect('/');
});

app.post('^/$|/upload(.html)?', uploadFile.single("up_data"), async (req,res) =>{    
    let message = '';
    let data_x=[], data_y = [];
    
    if(req.file == undefined){
        message = "Please upload CSV File!";
        return res.redirect('/?mess=' + message);
    }
    const results = await s3Upload(req,req.file);
    try {
       // console.log(results);
      } catch (err) {
        console.log(err);
    }
    let {key} = results;

    let fileStream = await s3GetObject(key);
    fileStream.pipe(csv.parse({headers: true}))
    
    fileStream.pipe(csv.parse({headers: true}))

    .on('error',(error) =>{

        throw error.message;

    })
    .on("data", (row) =>{

        keys = Object.keys(row);
        data_x.push(row[keys[0]]); // X data-points
        data_y.push(row[keys[1]]); // Y data-points
        message = "Upload file successfuly.";
        req.body["data-x"] = data_x;
        req.body["data-y"] = data_y;

    }).on("finish", () => {
        const {getpolynomials, isDataAvailable} = require('./public/javascripts/equation.js');  
        let order = parseInt(req.body["data-order"]);

        if(isDataAvailable(data_x,data_y)){
            res.redirect('/?mess=' + "Error! your dataset must have at least 2 points and number of x values must equal to number of y values");   
        }

        let json_result = getpolynomials(data_x, data_y, 1);     // = {eqn1: [data_x1,data_y1,error1], eqn2: [data_x2,data_y2,error2]}
        
        // Save data to session
        req.session.data = {
            "input": {"input":[data_x, data_y]},
            "json_result": json_result,
            "prev_src" : {"prev_src": req.body.src}
        };
        res.redirect('/?mess=' + message);
    });
});


/////////////////////////
//   Return 404 error  // 
// for undefined route //
/////////////////////////
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