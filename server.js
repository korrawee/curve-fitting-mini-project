const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { logger }  = require('./middleware/logEvents');
const errorHandler  = require('./middleware/errorHandler');
const { sendFile } = require('express/lib/response');
const PORT = process.env.PORT || 3500;


// custom middleware logger
app.use(logger);

// Cross Origin Resource Sharing
const whitelist = ['https://www.google.com','http://127.0.0.1:5500', 'http://localhost:3500']
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

app.get('^/$|/index(.html)?', (req,res) => {
    // res.sendFile('./views/index.html', {root: __dirname});
    const math = require('mathjs');
    const my_path = path.join(__dirname, 'views', 'index.html');
    fs.readFile(my_path, 'utf8', async (err,data) => {
        if(err) next();
        
        // Example data
        let my_data = [
            {x:0,y:1},
            {x:1,y:1.5},
            {x:2,y:2},
            {x:3,y:5},
            {x:4,y:10},
            {x:5,y:10},
        ]
        let x_data, y_data;
        let matrix_data;
        
        // Parse x and y to arrays
        x_data = my_data.map((point) => {
            return point["x"];
        });
        y_data = my_data.map((point) => {
            return point["y"];
        });

        // matrix_data = math.matrix([x_data,y_data]);

        data = data.replace(/data: \[.*/g, `data: [${String(y_data)}],` );
        data = data.replace(/labels: \[.*/g, `labels: [${String(x_data)}],`);
        await fs.writeFile(my_path, data, 'utf8', function (err) {
            if (err) return console.log(err);

        });
        console.log(data);
    });

    res.sendFile( my_path );
});
app.post('^/$|/index(.html)?', (req,res) => {

    const my_path = path.join(__dirname, 'views', 'index.html');
    fs.readFile(my_path, 'utf8',async (err,data) => {
        if(err) next();
        
        data = data.replace(/data: \[.*/g, `data: [${String(req.body["data"])}],` );
        await fs.writeFile(my_path, data, 'utf8', function (err) {
            if (err) return console.log(err);
        
        });
        console.log(data);
    });

    res.sendFile(my_path);
});

app.get('/new-page(.html)?', (req,res) => {
    res.sendFile( path.join(__dirname, 'views', 'new-page.html') );
});

app.get('/old-page(.html)?', (req,res) => {
    res.redirect( 301, '/new-page.html');
});

    // Route handler
app.get("/hello(.html)?", (req,res, next) => {
    console.log('attempted to load hello.html');
    next()
}, (req,res) => {
    res.send("Hello world");
})

    // Chaining oute handlers
const one = (req,res, next) => {
    console.log("one");
    next();
}
const two = (req,res, next) => {
    console.log("two");
    next();
}
const three = (req,res) => {
    console.log("three");
    res.send('Finished!');
}

app.get('/chain(.html)?', [one, two, three]);

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

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));