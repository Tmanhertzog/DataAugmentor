// Tristan Hertzog



document.getElementById("FileForm").addEventListener("submit", e => {
    e.preventDefault();

    const imageFile = document.getElementById("myFile").value;
    const imageAmount = document.getElementById("imageAmount").value;
    const horizontalFLip = document.getElementById("checkbox1").value;
    const verticalFlip = document.getElementById("checkbox2").value;
    const rotation = document.getElementById("checkbox3").value;
    const cropping = document.getElementById("checkbox4").value;
    const translation = document.getElementById("checkbox5").value;
    const shearing = document.getElementById("checkbox6").value;
    const brightness = document.getElementById("checkbox7").value;
    const contrast = document.getElementById("checkbox8").value;
    const saturation = document.getElementById("checkbox9").value;
    const invertColors = document.getElementById("checkbox10").value;
    const gaussianNoise = document.getElementById("checkbox11").value;
    const saltPepper = document.getElementById("checkbox12").value;
    
    console.log(imageFile)
    console.log(imageAmount)
    console.log(saltPepper);
})

function imageAugment() {

}