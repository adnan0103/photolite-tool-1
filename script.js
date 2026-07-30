const imageInput = document.getElementById("imageInput");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");

const targetSize = document.getElementById("targetSize");

const compressBtn = document.getElementById("compressBtn");
const batchBtn = document.getElementById("batchBtn");
const zipBtn = document.getElementById("zipBtn");
const resetBtn = document.getElementById("resetBtn");

const darkBtn = document.getElementById("darkBtn");

const downloadBtn = document.getElementById("downloadBtn");

const progressBox = document.getElementById("progressBox");
const fileInfo = document.getElementById("fileInfo");



let currentImage = null;

let selectedFiles = [];

let zipFiles = [];




// DARK MODE

darkBtn.onclick = function(){

    document.body.classList.toggle("dark");

};





// IMAGE SELECT


imageInput.addEventListener("change", function(e){


    selectedFiles =
    Array.from(e.target.files);



    if(selectedFiles.length === 0){

        return;

    }


    fileInfo.innerHTML =
    selectedFiles.length + " image selected";


    loadAndRemoveBackground(
        selectedFiles[0]
    );


});






// AI BACKGROUND REMOVE


async function loadAndRemoveBackground(file){


try{


progressBox.innerHTML =
"Removing background...";



let result =
await imglyRemoveBackground(file);



let url =
URL.createObjectURL(result);



let img =
new Image();



img.onload=function(){


currentImage = img;


drawPassport();


progressBox.innerHTML =
"White background ready ✅";


};



img.src=url;



}


catch(error){


console.log(error);


progressBox.innerHTML =
"AI failed - normal image used";



let url =
URL.createObjectURL(file);


let img =
new Image();



img.onload=function(){


currentImage=img;

drawPassport();


};


img.src=url;



}



}







// DRAW PASSPORT IMAGE


function drawPassport(){



let width =
Number(widthInput.value);


let height =
Number(heightInput.value);



canvas.width = width;

canvas.height = height;



// White background

ctx.fillStyle="#ffffff";

ctx.fillRect(
0,
0,
width,
height
);



if(!currentImage){

return;

}




let ratio =
Math.min(

width/currentImage.width,

height/currentImage.height

);



let newWidth =
currentImage.width * ratio;



let newHeight =
currentImage.height * ratio;



let x =
(width-newWidth)/2;



let y =
(height-newHeight)/2;



ctx.drawImage(

currentImage,

x,

y,

newWidth,

newHeight

);



}




widthInput.oninput =
drawPassport;


heightInput.oninput =
drawPassport;







// COMPRESS SINGLE IMAGE


compressBtn.onclick =
async function(){



if(!currentImage){

alert("Please select image first");

return;

}



progressBox.innerHTML =
"Compressing...";



let limit =
Number(targetSize.value)*1024;



let blob =
await compressCanvas(
canvas,
limit
);



downloadBtn.href =
URL.createObjectURL(blob);



downloadBtn.style.display =
"inline-block";



fileInfo.innerHTML =
"Final Size: "
+
(blob.size/1024).toFixed(2)
+
" KB";



progressBox.innerHTML =
"Completed ✅";



};







// COMPRESSION FUNCTION


function compressCanvas(canvas,limit){


return new Promise(resolve=>{


let quality = 0.95;



function process(){



canvas.toBlob(function(blob){



if(
blob.size <= limit ||
quality <=0.1
){


resolve(blob);


}

else{


quality -=0.05;

process();


}



},
"image/jpeg",
quality);



}



process();



});

}







// LOAD IMAGE PROMISE


function loadImage(file){


return new Promise(resolve=>{


let img =
new Image();



img.onload=function(){

resolve(img);

};



img.src =
URL.createObjectURL(file);



});


}







// BATCH COMPRESSION


batchBtn.onclick =
async function(){



if(selectedFiles.length===0){

alert("Select images first");

return;

}



zipFiles=[];



progressBox.innerHTML =
"Processing images...";



let limit =
Number(targetSize.value)*1024;



for(
let i=0;
i<selectedFiles.length;
i++
){



let img =
await loadImage(
selectedFiles[i]
);



let tempCanvas =
document.createElement("canvas");



tempCanvas.width =
Number(widthInput.value);



tempCanvas.height =
Number(heightInput.value);



let tempCtx =
tempCanvas.getContext("2d");



// White background

tempCtx.fillStyle="#ffffff";

tempCtx.fillRect(
0,
0,
tempCanvas.width,
tempCanvas.height
);



let ratio =
Math.min(

tempCanvas.width/img.width,

tempCanvas.height/img.height

);



let w =
img.width*ratio;


let h =
img.height*ratio;


let x =
(tempCanvas.width-w)/2;


let y =
(tempCanvas.height-h)/2;



tempCtx.drawImage(

img,

x,

y,

w,

h

);



let blob =
await compressCanvas(
tempCanvas,
limit
);



zipFiles.push({

name:
"passport-"+(i+1)+".jpg",

blob:blob

});



}



progressBox.innerHTML =
"All photos compressed ✅";



};







// ZIP DOWNLOAD


zipBtn.onclick =
async function(){



if(zipFiles.length===0){

alert("First compress images");

return;

}



let zip =
new JSZip();



zipFiles.forEach(file=>{


zip.file(
file.name,
file.blob
);


});



let content =
await zip.generateAsync({

type:"blob"

});



let link =
document.createElement("a");



link.href =
URL.createObjectURL(content);



link.download =
"passport-photos.zip";



link.click();



};








// RESET


resetBtn.onclick=function(){



currentImage=null;


selectedFiles=[];


zipFiles=[];



imageInput.value="";


canvas.width=0;


canvas.height=0;


fileInfo.innerHTML="";


downloadBtn.style.display="none";


progressBox.innerHTML="Ready";


};
