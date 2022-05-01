const {io} = require('socket.io/client-dist/socket.io');
const Chart = require('chart.js');
var data_x = new Array(1);
var data_y = new Array(2);
var myChart ;

io().on('data', (data) =>{
    console.log("Get Data: \t",data);
    let given_data = [...data[0]];
    let gen_data = [...data[1]];
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
        console.log("Create download-btn");
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

    myChart = new Chart("myChart", {
        type: "line",
        data: {
            labels: data_x[0],
            datasets: [
                {
                    label:'Input data',
                    backgroundColor: "rgba(0,0,255,1.0)",
                    borderColor: "rgba(0,0,0,0)",
                    data: data_y[0]
                },{   
                    label:'2nd Order Polynomial',
                    backgroundColor: "rgba(0,255,0,1.0)",
                    borderColor: "rgba(0,0,0,1)",
                    data: data_y[1]
                }
            ],
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


