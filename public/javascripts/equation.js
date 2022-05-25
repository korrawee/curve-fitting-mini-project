const math = require('mathjs');

const find_eqn = (sample_data, order) => { // sample_data => [ [],[] ]

    const n = sample_data[0].length;
    let x_data = [...sample_data[0]];
    let y_data = [...sample_data[1]];

    let matrix_left = [...Array(order+1).fill().map( x => Array(order+1) )],   // Init matrix
        matrix_mid = [...Array(order+1)],
        matrix_right = [...Array(order+1)];
    
    //  Make left and right matrixs for solving the unknow variables
    for(let col=0; col <= order; col++){

        for(let row=0; row <= order; row++){    
            if(row== 0 && col == 0){
                //  Left matrix [0,0]
                matrix_left[row][col] = n;
            }else{
                //  Left matrix
                matrix_left[row][col] = math.round(math.sum(x_data.map(x => {return math.pow(x, row+col)})), 8);
                //  Right matrix
                matrix_right[row] = math.sum(x_data.map( (x,i) => {
                    return math.round(math.pow(x,row) * y_data[i],8);
                }))
            }
        }
    }

    //  Convert array to matrix
    let decimal = 5;

    matrix_left = math.matrix(matrix_left);
    matrix_right = math.matrix(matrix_right);
    matrix_right["_data"] = matrix_right["_data"].map( inner => Number(inner.toFixed(decimal)))
   
    //  Invert left matrix
    matrix_left = math.inv(matrix_left);
    matrix_left["_data"] = matrix_left["_data"].map(outer => outer.map(inner => Number(inner.toFixed(decimal))));

    //  Find unknow variables from [matrix_left]^-1 * [matrix_right]
    let constants = math.multiply(matrix_left,matrix_right)["_data"];
    constants = constants.map( inner => Number(inner.toFixed(decimal)))
    
    //  Construct function from constants 
    let fx ='';
    for (let i = 0 ; i < constants.length ;i++){
        if (i == 0){
            fx += constants[i];
        }
        else {
            let tmp = constants[i] >= 0 ? `+ ${constants[i]}` : String(constants[i]);
            fx += ` + ( ${tmp} * math.pow(x,${i}) )` ;
        }
    }
    return fx;
};

const generateData = (eqn, data_x) => {

    let yValues = new Array(), xValues = new Array();
    let res = new Array();

    for (let i = 0; i < data_x.length; i ++ ) {
        let x = data_x[i];
        yValues.push(math.round(eval(eqn),2));
        xValues.push(x);
    }

    res.push(xValues);
    res.push(yValues);
    return res ;    //  [x,y]
}


const error = ( input1 , input2 ) =>{
    err = 0;
    try{
        if(input1.length !== input2.length){
            throw("Error: Length Not Equal");
        }else{
            for (let i =0 ; i < input1.length ; i++){
                err += Math.pow(input1[i] - input2[i], 2) // ผลรวม ของ ผลต่าง y 2 ตัว
            }
            err = math.round(err / input1.length, 3);
        }
    }catch (error) {
        console.log("Error: " + error);
    }
    return err;
}

const getArrayEquations = (sample_data, order) => {
    let array_equation = new Array();

    for (let i = 1 ; i <= order ; i++){
        array_equation.push( find_eqn(sample_data, i) );
    }

    return array_equation;
}

exports.getpolynomials = (array_x, array_y, order = 1) =>{
    let dataX, dataY, dataAll;
    let result = {};
    dataX = [...array_x];
    dataY = [...array_y];
    dataAll = [dataX, dataY] ;

    const equations = getArrayEquations(dataAll, order);
    
    equations.map((eqn)=>{
        result[eqn] = generateData(eqn, dataX);
        result[eqn].push(error(dataY,result[eqn][1]));
    });

    return result ;    // = {eqn1: [data_x1,data_y1, err], eqn2: [data_x2,data_y2, err]}
}

exports.isDataAvailable = (data_x,data_y) => {
    if(data_x.length != data_y.length || data_x.length <= 1 || data_y.length <= 1
        || isNaN(data_x[0]) || isNaN(data_y[0]) ){
        return true
    }
    return false
}


// SAMPLE DATA
// [[0, 0.5, 1.0, 1.5, 2.0, 2.5],[0, 0.25, 1.0, 2.25, 4.0, 5.25]]
// [[0 ,0.0 ,1 ,1.5 ,2 ,2.5],[0.06, -0.91, 1.62, 3.07, 3.35, 7.94]]
// [[0, 0.5, 1, 1.5, 2, 2.5],[0.0674, -0.9156, 1.6253, 3.0377, 3.3535, 7.9409]]