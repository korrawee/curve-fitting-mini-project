const Chart = require('chart.js');

let myChart;
////////////////////
/// Update Graph ///
////////////////////
//  data[0] = sample_data, data[1] = {eqn1: [data_x1,data_y1,err], eqn2: [data_x2,data_y2,err]}
const update = (data) => {
    let given_data = data[0];
    
    data[1]["given"] = given_data[1];       // add given data y to json 
    
    let result_data = data[1];
    let expressions = {};

    let chartStatus = Chart.getChart("myChart"); // <canvas> id
    const dis = document.getElementById("display") ;

    if ( dis.childNodes.length != 0){      //   Delete previous data in display
        while (dis.firstChild) {
            dis.removeChild(dis.lastChild);
        }
    }

    Object.keys(result_data).map((key,i)=> {  

        //  Convert equation
        if(key != "given"){
            tmp = equationToHTML(key);
            expressions[key] = tmp;

            if(expressions[key] != NaN && result_data[key][2] != null){
                const gen_eqn_container = document.querySelector(".gen-eqn-container");
                gen_eqn_container.style.display = 'block';
                let eqn = document.createElement("p") ;
                var err = document.createElement("p") ;
                eqn.id = 'eqa-container' ;
                err.id = "error-txt";
                dis.appendChild(eqn) ;
                dis.appendChild(err) ;
                dis.appendChild(document.createElement("br")) ;

                eqn.innerHTML =`<span>No.${i+1}</span> <i id="eqa-txt">${expressions[key]}</i>`;                            // key = equation
                err.innerHTML = `\t<span>Error:</span> ${result_data[key][2]}` ;   //  err value

            }
        }
    })   


    ///////////////////
    // Copy Equation //
    ///////////////////

    const eqns = document.getElementById("display");
    eqns.addEventListener("click", (event) => {
        if(event.target.id === 'eqa-txt'){
            doCopyToClipboard(event.target.innerHTML);
            const notic = document.querySelector(".notic-mes");
            notic.textContent = "Copied equation successfully.";
            notic.style.display = 'block';
        }
    });

    /////////////////////////
    // Create download btn //
    /////////////////////////
    if (document.getElementById("dw-btn") === null){
        const div = document.getElementById("dw") ;
        if(document.getElementById("download-btn") != null){
            div.removeChild(document.getElementById("download-btn"));
        }
        const dl = document.createElement('a');
        dl.textContent = "Download Graph"
        dl.id = "download-btn";
        div.appendChild(dl) ;
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
            const dl = document.getElementById('download-btn');
            dl.download = 'chart.png';
            dl.href = myChart.toBase64Image(); ; 
        }
        catch (err) {
            console.log("download-btn:\t",err)
        }
        
    }
};


/////////////////////////////////////////////
//  Convert from 'x<sup>1</sup>' to 'x^1'  //
/////////////////////////////////////////////

const htmlToEquation = (eqn) =>{
    let key_pow = eqn.match(/<sup>(.*?)<\/sup>/g);
    let tmp = "";

    key_pow.map((key_pow,i)=>{
        // key = key.replace(key_pow,`x<sup>${i+1}</sup>`);
        if(tmp ===""){
            tmp = eqn.replace(key_pow,`^${i+1}`);   
        }else{
            tmp = tmp.replace(key_pow,`^${i+1}`);   
        }
    });
    return tmp;
};

///////////////////////////////////////////////////////
//  Convert from 'math.pow(x,1)' to 'x<sup>1</sup>'  //
///////////////////////////////////////////////////////

const equationToHTML = (eqn) =>{
    // key = '4 + ( -0.5 * math.pow(x,1) ) + ( + 0.5 * math.pow(x,2) )'
    let key_pow = eqn.match(/math.pow\((.*?)(.*?)\)/g);
    let tmp = "";

    key_pow.map((key_pow,i)=>{
        // key = key.replace(key_pow,`x<sup>${i+1}</sup>`);
        if(tmp ===""){
            tmp = eqn.replace(key_pow,`x<sup>${i+1}</sup>`);   
        }else{
            tmp = tmp.replace(key_pow,`x<sup>${i+1}</sup>`);   
        }
    });
    return tmp;
};


////////////////////////////////////
/// Crate dataset for each line ////
////////////////////////////////////
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

////////////////////////
// Random Graph Color //
////////////////////////
const getRandomColor = () => {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


/////////////////////////////
//  Copy eqn to clipboard  //
/////////////////////////////

const doCopyToClipboard = (eqn) => {
    let new_eqn = htmlToEquation(eqn);

    const temp = document.createElement("input");
    temp.setAttribute("value", new_eqn);
    document.querySelector("body").appendChild(temp);
    temp.select()

    document.execCommand("copy");

    document.body.removeChild(temp);

};

module.exports = {
    update,
}