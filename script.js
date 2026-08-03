const REMOVE_BG_API_KEY = "LjnHeLnkiKpbRCLdZ5YFzKxv";


const imageInput = document.getElementById("imageInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const widthInput = document.getElementById("width");
const heightInput = document.getElementById("height");
const targetSize = document.getElementById("targetSize");

const compressBtn = document.getElementById("compressBtn");
const resetBtn = document.getElementById("resetBtn");
const darkBtn = document.getElementById("darkBtn");

const downloadBtn = document.getElementById("downloadBtn");
const progressBox = document.getElementById("progressBox");
const fileInfo = document.getElementById("fileInfo");


let finalImage = null;



// Dark Mode

darkBtn.onclick = () => {
    document.body.classList.toggle("dark");
};




// Upload Image

imageInput.addEventListener("change", async function(){

    const file = this.files[0];

    if(!file){
        return;
    }


    progressBox.innerHTML =
    "Removing background...";


    const blob = await removeBackground(file);


    const url = URL.createObjectURL(blob);


    const img = new Image();


    img.onload = ()=>{

        finalImage = img;

        createPassport();

        progressBox.innerHTML =
        "White background ready ✅";

    };


    img.src = url;


});




// Remove Background API

async function removeBackground(file){


    const formData = new FormData();


    formData.append(
        "image_file",
        file
    );


    formData.append(
        "size",
        "auto"
    );


    const response = await fetch(
        "https://api.remove.bg/v1.0/removebg",
        {
            method:"POST",

            headers:{
                "X-Api-Key":REMOVE_BG_API_KEY
            },

            body:formData
        }
    );


    if(!response.ok){

        throw new Error(
            "Background removal failed"
        );

    }


    return await response.blob();

}






// Create Passport Image


function createPassport(){


    const width =
    Number(widthInput.value);


    const height =
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



    let ratio =
    Math.min(

        width/finalImage.width,

        height/finalImage.height

    );



    let w =
    finalImage.width * ratio;


    let h =
    finalImage.height * ratio;



    let x =
    (width-w)/2;


    let y =
    (height-h)/2;



    ctx.drawImage(
        finalImage,
        x,
        y,
        w,
        h
    );


}






// Compress


compressBtn.onclick = ()=>{


    const limit =
    Number(targetSize.value)*1024;



    compressImage(limit);



};





function compressImage(limit){


    let quality = 0.9;



    function run(){


        canvas.toBlob(blob=>{


            if(
                blob.size <= limit ||
                quality <=0.1
            ){


                downloadBtn.href =
                URL.createObjectURL(blob);


                downloadBtn.style.display =
                "inline-block";



                fileInfo.innerHTML =
                "Final Size: "+
                (blob.size/1024).toFixed(2)
                +" KB";


                progressBox.innerHTML =
                "Completed ✅";


            }

            else{


                quality -=0.05;

                run();

            }



        },
        "image/jpeg",
        quality);



    }



    run();



}





// Reset


resetBtn.onclick = ()=>{


    imageInput.value="";


    canvas.width=0;

    canvas.height=0;


    finalImage=null;


    downloadBtn.style.display="none";


    fileInfo.innerHTML="";


    progressBox.innerHTML="Ready";


};
