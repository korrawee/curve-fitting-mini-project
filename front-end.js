const {inputData, resultData} = require('./public/javascripts/fetch.js');
const {update} = require('./public/javascripts/graph');

const notic = document.querySelector(".notic-mes");
const err = document.getElementById('err-container');
const upload = document.querySelector('.browse-btn input');
const label = document.querySelector('.file-selected');


///////////////////////
// Load manual input //
///////////////////////
(async() => {
    //
    //  Fetch session data
    //
    inputData().then((d) =>{
        data = [[],[]];
        data[0].push(d[0]!=undefined? d[0]:'');
        data[0].push(d[1]!=undefined? d[1]:'');
        document.getElementById('data-x').defaultValue = data[0][0];
        document.getElementById('data-y').defaultValue = data[0][1];

        resultData().then((d)=>{
            data[1] = d;

            update(data);

        });

    });
})();


////////////////////////////
/// Display browsed file ///
////////////////////////////

upload.addEventListener("change", () => {
    let path = upload.value.split("\\");
    let last_index = path.length - 1;
	label.innerHTML = path[last_index];

    err.style.display = "none";
});


/////////////////////
/// Alert message ///
/////////////////////

notic.style.display = 'none';
err.style.display = 'none';
let url = new URL(window.location.href);
let message = url.searchParams.get("mess");

if(message != '' && message != undefined){

    err.style.display = "block";
    err.innerHTML = "Please Upload CSV File!";

}else{

    err.style.display = "none";
    
}