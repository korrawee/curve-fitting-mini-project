const {io} = require('socket.io/client-dist/socket.io');
const Chart = require('chart.js');

var myChart ;

io().on('data', (data) =>{                  //  data[0] = sample_data, data[1] = {eqn1: [data_x1,data_y1], eqn2: [data_x2,data_y2]}
    console.log("Get Data: \t",data);
    let given_data = data[0];
    data[1]["given"] = given_data[1];       // add given data y to json 
    let result_data = data[1];

    // console.log("given_data: ",given_data)
    // console.log("gen_data: ",gen_data[3])

    data_x[0] = [...given_data[0]]; // old data
    data_y[0] = [...given_data[1]]; // old data
    data_y[1] = [...gen_data[2]];   // generate data (y)
    eqaVal = gen_data[0] ;
    errVal = gen_data[3] ; //error value
    
    let chartStatus = Chart.getChart("myChart"); // <canvas> id

    const dis = document.getElementById("display") ;

    if ( dis.childNodes.length === 0){
        var eqa = document.createElement("label") ;
        var err = document.createElement("label") ;
        eqa.id = 'eqa-txt' ;
        err.id = "error-txt";
    }else{
        eqa.destroy();
        err.destroy();
    }
    eqa.innerHTML =`${eqaVal}`;
    err.innerHTML = `Error: ${errVal}` ;
    dis.appendChild(eqa) ;
    dis.appendChild(err) ;
    
    if (document.getElementById("dw-btn") === null){
        const div = document.getElementById("dw") ;
        const dw = document.createElement("button") ; 
        dw.id = "dw-btn" ;
        dw.innerHTML = "Download"
        var a = document.createElement('a');
        a.appendChild(dw) ;
        div.appendChild(a) ;
    }
    
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    
    let result_datasets = getDatasets(result_data);

    myChart = new Chart("myChart", {
        type: "line",
        data: {
            labels: given_data[0],  //  data x 
            datasets: result_datasets,
        },
        options: {
            animation: {
                onComplete: done
              }
        }
    });
    function done(){
        try{
            a.download = 'chart.png';
            a.href = myChart.toBase64Image(); ; 
        }
        catch (err) {
            console.log("download-btn:\t",err)
        }
       
    }
});

//  listening to server

const getDatasets = (data) => {
    let order = {1:"1st", 2:"2nd", 3:"3rd", 
                    4:"4th", 5:"5th", 6:"6th", 
                    7:"7th", 8:"8th", 9:"9th"};
    let result_keys = Object.keys(data);
    let datasets = new Array();

    result_keys.map((key,i) => {
        if(key === "given") {   // push given data to first elem.
            let d = {
                label: key,
                backgroundColor: "rgba(0,0,255,1.0)",
                borderColor: "rgba(0,0,255,1)",
                data: data[key]
            } 
            datasets.unshift(d)
        }else{
            let color = getRandomColor();
            let d = {
                label:`${order[i+1]} order`,
                backgroundColor: color,
                borderColor: color,
                data: data[key][1]
            } 
            datasets.push(d);
        }
    });
    return datasets;
};

const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }