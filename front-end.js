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
notic.style.display = "none";
err.style.display = "none";
let url = new URL(window.location.href);
let message = url.searchParams.get("mess");

if(message === "Upload file successfuly."){

    notic.style.display = "block";
    notic.innerHTML = message;

}else if(message === "Please upload CSV File!"){

    err.style.display = "block";
    err.innerHTML = message;

}else if(message === "Error! your dataset must have at least 2 points and number of x values must equal to number of y values"){
    err.style.display = "block";
    err.innerHTML = message;
}else{

    err.style.display = "none";
}