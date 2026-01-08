// Programmed by Tristan Hertzog

const fileInput = document.getElementById("myFile");
const form = document.getElementById("FileForm");
const downloadLink = document.getElementById("downloadLink");
const picNumEl = document.getElementById("imageAmount");
const count = Number(picNumEl.value);

// Modification Variables
let horizontalFLip = null;
let verticalFlip = null;
let rotation = null;
let cropping = null;
let translation = null;
let shearing = null;
let brightness = null;
let contrast = null;
let saturation = null;
let invertColors = null;
let blueTint = null;
let gaussianNoise = null;
let saltPepper = null

//----------------
// Main
//----------------

let lastZipUrl = null; 

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Update Modification Variables
  horizontalFLip = document.getElementById("checkbox1").checked;
  verticalFlip = document.getElementById("checkbox2").checked;
  rotation = document.getElementById("checkbox3").checked;
  cropping = document.getElementById("checkbox4").checked;
  translation = document.getElementById("checkbox5").checked;
  shearing = document.getElementById("checkbox6").checked;
  brightness = document.getElementById("checkbox7").checked;
  contrast = document.getElementById("checkbox8").checked;
  saturation = document.getElementById("checkbox9").checked;
  invertColors = document.getElementById("checkbox10").checked;
  blueTint = document.getElementById("BlueTintCheckbox").checked;
  gaussianNoise = document.getElementById("checkbox11").checked;
  saltPepper = document.getElementById("checkbox12").checked;

  const count = Math.max(1, parseInt(picNumEl.value, 10) || 0);

  const file = fileInput.files?.[0];
  if (!file) return alert("Please choose an image first.");

  // Load image once
  const dataURL = await fileToDataURL(file);

  // Offscreen canvas (no flicker, no DOM issues)
  const offscreenEl = document.createElement("canvas");
  offscreenEl.width = 1024;   
  offscreenEl.height = 1024; 

  const exportCanvas = new fabric.Canvas(offscreenEl, {
    renderOnAddRemove: false,
    selection: false,
  });

  fabric.Image.fromURL(dataURL, async (img) => {
    try {
      img.set({ objectCaching: false });

      const zip = new JSZip();

      for (let i = 0; i < count; i++) {
        exportCanvas.clear();

        let clone = await cloneFabricObject(img);

        // Modify each output
        HFlipImage(clone);
        VFlipImage(clone);
        RotateImage(clone);
        CropImage(clone);
        TranslateImage(clone);
        ShearImage(clone);

        BrightnessMod(clone);
        makeContrast(clone);
        makeSaturation(clone);
        makeInvert(clone);
        makeBlue(clone);

        clone = GaussianNoise(clone);
        clone = SaltPepperNoise(clone);

        fitCanvas(exportCanvas, clone);
        exportCanvas.renderAll();

        const pngBlob = await fabricCanvasToBlob(exportCanvas, "png");
        const fname = `image_${String(i + 1).padStart(2, "0")}.png`;

        // Add file to zip as Blob
        zip.file(fname, pngBlob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });

      if (lastZipUrl) URL.revokeObjectURL(lastZipUrl);
      lastZipUrl = URL.createObjectURL(zipBlob);

      downloadLink.href = lastZipUrl;
      downloadLink.download = "images.zip";
      downloadLink.style.cursor = "pointer";

      // UI download ready
      const notice = document.getElementById("download_notification");
      notice.style.display = "block";
      downloadLink.style.background = "#2563eb";
      downloadLink.style.color = "#fff";

      exportCanvas.dispose();
    } catch (err) {
      console.error(err);
      alert("Failed to generate ZIP. Check console for details.");
      exportCanvas.dispose();
    }
  });
});

// --------------------
// Image Modification
// --------------------

function HFlipImage(img) {
  if ((picNumEl == 1 || chance(.50)) && horizontalFLip) {
    img.set({flipX: true});
  }
}

function VFlipImage(img) {
  if ((picNumEl == 1 || chance(.50)) && verticalFlip) {
    img.set({flipY: true});
  }
}

function RotateImage(img) {
  if (rotation) {
    img.set({angle: getRndInteger(0, 360)});
  }
}

function CropImage(img) {
  if (cropping) {
    const centerX = img.width / 2;
    const centerY = img.height / 2;
    const width = img.width;
    const height = img.height;

    const x = getRndInteger(-width * 0.1, width * 0.1);
    const y = getRndInteger(-height * 0.1, height * 0.1);
    const rectWidth = getRndInteger((width - x) * 0.7, width - x);
    const rectHeight = getRndInteger((height - y) * 0.7, height - y);

    img.clipPath = new fabric.Rect({
      originX: "center",
      originY: "center",
      top: centerX + x,
      left: centerY + y,
      width: rectWidth,
      height: rectHeight,
      absolutePositioned: true,
    });
  }
}

function TranslateImage(img) {
  if (translation) {    
    dx = getRndInteger(0, img.width / 2);
    dy = getRndInteger(0, img.height / 2);

    img.set({
      left: img.left + dx,
      top:  img.top  + dy,
    });
  }
}

function ShearImage(img) {
  if (shearing) {
    shearX = getRndInteger(-10, 10);
    shearY = getRndInteger(-10, 10);

    img.set({
      skewX: shearX,
      skewY: shearY,
    });
  }
}

//---------------------
// Color Modification
//---------------------

function BrightnessMod(img) {
  if (brightness) {
    amount = Math.random();

    img.filters = img.filters || [];
    img.filters.push(new fabric.Image.filters.Brightness({ brightness: amount }));

    img.applyFilters();
  }
}

function makeContrast(img) {
  if (contrast) {
    amount = Math.random();

    img.filters = img.filters || [];
    img.filters.push(new fabric.Image.filters.Contrast({ contrast: amount }));

    img.applyFilters();
  }
}

function makeSaturation(img) {
  if (saturation) {
    amount = Math.random();

    img.filters = img.filters || [];
    img.filters.push(new fabric.Image.filters.Saturation({ saturation: amount }));

    img.applyFilters();
  }
}

function makeInvert(img) {
  if (invertColors) {
    img.filters = img.filters || [];
    img.filters.push(new fabric.Image.filters.Invert());

    img.applyFilters();
  }
}

function makeBlue(img) {
  if (blueTint) {
    img.filters = img.filters || [];
    img.filters.push(new fabric.Image.filters.BlendColor({
      color: "rgb(0, 80, 255)",
      mode: "tint",     // "tint", "multiply", "screen"
      alpha: Math.random(),
    }));

    img.applyFilters();
  }
}

//---------------------
// Noise Modification
//---------------------

function GaussianNoise(img) {
  if (gaussianNoise) {
    const noiseURL = makeGaussianNoiseDataURL(1024, 1024, 18);
    noise = dataURLToFabricImage(noiseURL);

    return combineImages(img, noise);
  }
}

function SaltPepperNoise(img) {
  if (saltPepper) {

  }
}

// --------------------
// Helpers
// --------------------

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function fitCanvas(canvas, img) {
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  const scale = Math.min(cw / img.width, ch / img.height);

  img.set({
    left: cw / 2,
    top: ch / 2,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
  });

  canvas.add(img);
}

function cloneFabricObject(obj) {
  return new Promise((resolve) => obj.clone(resolve));
}

function fabricCanvasToBlob(canvas, format = "png") {
  return new Promise((resolve, reject) => {
    canvas.lowerCanvasEl.toBlob((blob) => {
      if (!blob) return reject(new Error("toBlob() returned null"));
      resolve(blob);
    }, `image/${format}`);
  });
}

function chance(percent) {
  return Math.random() < percent
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

function combineImages(img1, img2) {
  img1.set({ left: 0, top: 0 });
  img2.set({ left: 0, top: 0, opacity: 0.4 });

  canvas.add(img1);
  canvas.add(img2);
  canvas.renderAll();
}

// Generative AI

// --------------------
// Gaussian Noise 
// --------------------

// Standard normal N(0,1) using Box-Muller
function randn() {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp255(x) {
  return x < 0 ? 0 : x > 255 ? 255 : x;
}

function GaussianNoise(img) {
  if (!gaussianNoise) return img;

  const stdDev = 18; // try 5 - 30

  // Fabric image element (HTMLImageElement/HTMLCanvasElement)
  const el = img._element;
  if (!el) return img;

  const w = img.width;
  const h = img.height;
  if (!w || !h) return img;

  // Draw the current image into an offscreen canvas
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;

  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(el, 0, 0, w, h);

  // Read pixels and inject Gaussian noise
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    const n = randn() * stdDev;

    d[i]     = clamp255(d[i]     + n); // R
    d[i + 1] = clamp255(d[i + 1] + n); // G
    d[i + 2] = clamp255(d[i + 2] + n); // B
    // d[i + 3] alpha unchanged
  }

  ctx.putImageData(imageData, 0, 0);

  // Replace the Fabric image's underlying element with the noisy canvas
  // (sync; no waiting for dataURL decode)
  img.setElement(c);
  img.set({ dirty: true });

  return img;
}

//---------------------------
// Salt and Pepper noise
//---------------------------

function SaltPepperNoise(img) {
  if (!saltPepper) return img;

  // p = fraction of pixels to corrupt (try 0.005 .. 0.05)
  const p = 0.02; // 2% noisy pixels

  const el = img._element;
  if (!el) return img;

  const w = img.width;
  const h = img.height;
  if (!w || !h) return img;

  // Draw current image into an offscreen canvas
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;

  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(el, 0, 0, w, h);

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;

  // Iterate pixels: with probability p, set to black or white
  for (let i = 0; i < d.length; i += 4) {
    if (Math.random() < p) {
      const v = Math.random() < 0.5 ? 0 : 255; // pepper or salt
      d[i] = v;       // R
      d[i + 1] = v;   // G
      d[i + 2] = v;   // B
      // alpha unchanged
    }
  }

  ctx.putImageData(imageData, 0, 0);

  // Replace underlying element with noisy canvas
  img.setElement(c);
  img.set({ dirty: true });

  return img;
}
