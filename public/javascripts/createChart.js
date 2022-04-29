const {io} = require('socket.io/client-dist/socket.io');
const Chart = require('chart.js');
var data_x = new Array(1);
var data_y = new Array(2);

io().on('data', (data) =>{
    console.log(data);
    let given_data = [...data[0]];
    let gen_data = [...data[1]];

    data_x[0] = [...given_data[0]]; // old data
    data_y[0] = [...given_data[1]]; // old data
    data_y[1] = [...gen_data[2]];   // generate data (y)
    
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


