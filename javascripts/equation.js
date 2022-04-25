const { matrix, re } = require('mathjs');
const math = require('mathjs');

const find_eqn = (sample_data, order = 1) => { // sample_data => [ [],[] ]

    const n = sample_data[0].length;
    let x_data = [...sample_data[0]];
    let y_data = [...sample_data[1]];

    let matrix_left = [...Array(order+1).fill().map( x => Array(order+1) )],   // Init matrix
        matrix_mid = [...Array(order+1)],
        matrix_right = [...Array(order+1)];
    let a,b;
    
    for(let col=0; col <= order; col++){

        for(let row=0; row <= order; row++){    
            if(row== 0 && col == 0){
                //  Left matrix [0,0]
                matrix_left[row][col] = n;
            }else{
                //  Left matrix
                matrix_left[row][col] = math.sum(x_data.map(x => {return math.pow(x, row+col)}));
                //  Right matrix
                matrix_right[row] = math.sum(x_data.map( (x,i) => {
                    return math.pow(x,row) * y_data[i];
                }))
            }
        }
    }
    // Convert array to matrix
    console.log("\nMatrix Left: \n",matrix_left);
    matrix_left = math.matrix(matrix_left);
    matrix_right = math.matrix(matrix_right);
    matrix_left = math.inv(matrix_left);
    
    console.log("\nMatrix Left INV: \n",matrix_left);
    console.log("\nMatrix Right: \n",matrix_right);

    matrix_mid = math.multiply(matrix_left,matrix_right)["_data"];
    console.log("\nAfter Multiply: \n",matrix_mid);
    
    // Convert Matrix Equation to Multiple degree Equation
    let fx ='';
    for (let i = 0 ; i < matrix_mid.length ;i++){
        if (i == 0){
            fx += matrix_mid[i];
        }
        else {
            let tmp = matrix_mid[i] >= 0 ? `+ ${matrix_mid[i]}` : String(matrix_mid[i]);
            fx += ` ${tmp} * (x ** ${i})` ;
        }
    }
    console.log(`\nEquation: ${fx}`);
    return fx;
};
const generateData = (value, i1, i2, step = 1) => {
    // generateData("x * 2 + 7", 0, 10, 0.5);
    let yValues =[],xValues = [];
    let res = [];
    for (let x = i1; x <= i2; x += step) {
        yValues.push(math.round(eval(value),8));
        xValues.push(x);
    }
    res.push(xValues);
    res.push(yValues);
    return res ;
}



exports.getResult = (data) =>{
    // let sample = [[0, 0.5, 1.0, 1.5, 2.0, 2.5],[0, 0.25, 1.0, 2.25, 4.0, 6.25]];
    dataSplit = data.split(',')
    dataSplit[0] = dataSplit[0].slice(2);
    dataSplit[dataSplit.length-1] = dataSplit[dataSplit.length-1].slice(0,-2);
    dataSplit[dataSplit.length/2] = dataSplit[dataSplit.length/2].slice(1);
    dataSplit[(dataSplit.length/2)-1] = dataSplit[(dataSplit.length/2)-1].slice(0,-1);
    dataSplit = dataSplit.map(x => {
        return parseFloat(x.replace(/^\s+|\s+$/g, ''));
    });
    console.log("HERE ",dataSplit);
    let dataX = dataSplit.slice(0, (dataSplit.length/2));
    let dataY = dataSplit.slice(dataSplit.length/2);
    dataX = dataSplit.slice(0, (dataSplit.length/2));
    console.log("dataX: \t",dataX);
    console.log("dataY: \t",dataY);
    let dataAll = [dataX, dataY] ;
    console.log(dataAll);
    const eqn = find_eqn(dataAll,2);
    const result = generateData(eqn, dataX[0], dataX[dataX.length-1], dataX[1] - dataX[0]);
    return [...result, dataX, dataY] ;
}
// data = '[[0, 0.5, 1.0, 1.5, 2.0, 2.5],[0, 0.25, 1.0, 2.25, 4.0, 5.25]]';
// console.log(getResult1(data));

// [[0 ,0.0 ,1 ,1.5 ,2 ,2.5],[0.06, -0.91, 1.62, 3.07, 3.35, 7.94]]
// [[0, 0.5, 1, 1.5, 2, 2.5],[0.0674, -0.9156, 1.6253, 3.0377, 3.3535, 7.9409]]