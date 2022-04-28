const math = require('mathjs');

const find_eqn = (sample_data, order) => { // sample_data => [ [],[] ]

    const n = sample_data[0].length;
    let x_data = [...sample_data[0]];
    let y_data = [...sample_data[1]];
    console.log(`x_data:\t${x_data}`);
    console.log(`y_data:\t${y_data}`);
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
                    console.log(`${x} ${math.pow(x,row)} ${y_data[i]}: ${i}\t${math.pow(x,row) * y_data[i]}`);
                    return math.round(math.pow(x,row) * y_data[i],8);
                }))
            }
        }
    }

    //  Convert array to matrix
    console.log("\nMatrix Left: \n",matrix_left);
    matrix_left = math.matrix(matrix_left);
    matrix_right = math.matrix(matrix_right);
    //  Invert left matrix
    matrix_left = math.inv(matrix_left);
    
    console.log("\nMatrix Left INV: \n",matrix_left);
    console.log("\nMatrix Right: \n",matrix_right);
    //  Find unknow variables from [matrix_left]^-1 * [matrix_right]
    let constants = math.multiply(matrix_left,matrix_right)["_data"];
    console.log("\nAfter Multiply: \n",constants);
    
    //  Construct function from constants 
    let fx ='';
    for (let i = 0 ; i < constants.length ;i++){
        if (i == 0){
            fx += constants[i];
        }
        else {
            let tmp = constants[i] >= 0 ? `+ ${constants[i]}` : String(constants[i]);
            fx += ` ${tmp} * (x ** ${i})` ;
        }
    }
    console.log(`\nEquation: ${fx}`);
    return fx;
};

const generateData = (value, i1, i2, step = 1) => {
    let yValues = new Array(), xValues = new Array();
    let res = new Array();

    for (let x = i1; x <= i2; x += step) {
        yValues.push(math.round(eval(value),8));
        xValues.push(x);
    }

    res.push(xValues);
    res.push(yValues);

    return res ;
}



exports.getpolynomials = (array_x, array_y, order = 1) =>{
    // let sample = [[0, 0.5, 1.0, 1.5, 2.0, 2.5],[0, 0.25, 1.0, 2.25, 4.0, 6.25]];
    let dataX, dataY, dataAll;
    // // Convert string of 2darray to dataX and dataY arrays
    // dataSplit = data.split(',')
    // dataSplit[0] = dataSplit[0].slice(2);
    // dataSplit[dataSplit.length-1] = dataSplit[dataSplit.length-1].slice(0,-2);
    // dataSplit[dataSplit.length/2] = dataSplit[dataSplit.length/2].slice(1);
    // dataSplit[(dataSplit.length/2)-1] = dataSplit[(dataSplit.length/2)-1].slice(0,-1);
    // dataSplit = dataSplit.map(x => {
    //     return parseFloat(x.replace(/^\s+|\s+$/g, ''));
    // });
    // console.log("HERE ",dataSplit);
    // dataX = dataSplit.slice(0, (dataSplit.length/2));
    // dataY = dataSplit.slice(dataSplit.length/2);
    // dataX = dataSplit.slice(0, (dataSplit.length/2));

    dataX = array_x;
    dataY = array_y;
    dataAll = [dataX, dataY] ;

    console.log("dataX: \t",dataX);
    console.log("dataY: \t",dataY);
    console.log(dataAll);

    const eqn = find_eqn(dataAll, order);
    const result = generateData(eqn, dataX[0], dataX[dataX.length-1], dataX[1] - dataX[0]);
    
    return [...result, dataX, dataY] ;
}
// data = '[[0, 0.5, 1.0, 1.5, 2.0, 2.5],[0, 0.25, 1.0, 2.25, 4.0, 5.25]]';
// console.log(getResult1(data));

// [[0 ,0.0 ,1 ,1.5 ,2 ,2.5],[0.06, -0.91, 1.62, 3.07, 3.35, 7.94]]
// [[0, 0.5, 1, 1.5, 2, 2.5],[0.0674, -0.9156, 1.6253, 3.0377, 3.3535, 7.9409]]