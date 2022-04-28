const {io} = require('socket.io/client-dist/socket.io');
const Chart = require('chart.js');
var data_x = new Array(2);
var data_y = new Array(2);

io().on('data', (data) =>{
    console.log(data);
    data_x[0] = [...data[0]];
    data_x[1] = [...data[2]];
    data_y[0] = [...data[1]];
    data_y[1] = [...data[3]];
    
    let chartStatus = Chart.getChart("myChart"); // <canvas> id
    console.log(chartStatus);
    if (chartStatus != undefined) {
      chartStatus.destroy();
    }
    
    let myChart = new Chart("myChart", {
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
    });
});


//  listening to server


