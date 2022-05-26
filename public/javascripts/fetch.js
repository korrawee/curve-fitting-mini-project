//
// Load session data
//
exports.inputData = async () => {
    const response = await fetch('/api/session-data');
    let myArray;
    try{
        myArray = await response.json(); //extract JSON from the http response
        myArray = myArray.input;
    }catch{
        myArray = [];
    }
    return myArray;
}
exports.resultData = async () => {
    const response = await fetch('/api/generate-data');
    let myJson;
    try{
        myJson = await response.json(); //extract JSON from the http response
    }catch{
        myJson = {};
    }
    return myJson;
}
