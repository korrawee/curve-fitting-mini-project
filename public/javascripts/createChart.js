const {io} = require('socket.io/client-dist/socket.io');
const Chart = require('chart.js');

var myChart ;

io().on('data', (data) =>{                  //  data[0] = sample_data, data[1] = {eqn1: [data_x1,data_y1,err], eqn2: [data_x2,data_y2,err]}
    console.log("Get Data: \t",data);
    let given_data = data[0];
    data[1]["given"] = given_data[1];       // add given data y to json 
    let result_data = data[1];
    
    let chartStatus = Chart.getChart("myChart"); // <canvas> id

    const dis = document.getElementById("display") ;

    if ( dis.childNodes.length != 0){
        eqn.destroy();
        err.destroy();
    }
    
    Object.keys(result_data).map((key)=> {  
        var eqn = document.createElement("label") ;
        var err = document.createElement("label") ;
        eqn.id = 'eqa-txt' ;
        err.id = "error-txt";

        eqn.innerHTML =`${key}`;                            // key = equation
        err.innerHTML = `\tError: ${result_data[key][2]}` ;   //  err value
        dis.appendChild(eqn) ;
        dis.appendChild(err) ;
        dis.appendChild(document.createElement("br")) ;
    });
    
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