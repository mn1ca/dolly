// Converts image to base64 string
// https://stackoverflow.com/questions/22172604/convert-image-from-url-to-base64
export function getBase64Image(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx_c = c.getContext('2d');
    ctx_c.drawImage(img, 0, 0);

    const dataURL = c.toDataURL('image/png');
    return dataURL;
}


// Converts base64 string to image
export function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}


export function rollID() {
    let idVariant;
    const lucky = 0.0069;
    const roll = Math.random();

    if (roll < lucky)
        idVariant = 11;
    else
       idVariant = Math.floor(Math.random() * 11);

    localStorage.setItem('idVariant', idVariant);
    return idVariant;
}


function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


export function generateStickers(numStickers) {
    const min = 0, max = 11;
    const stickers = new Set();
    while (stickers.size < numStickers) {
        stickers.add(random(min, max));
    }

    let i = 1;
    for (const s of stickers) {
        const sticker = document.querySelector(`#stickers :nth-child(${i})`);
        const direction = (i % 2) ? -1 : 1;
        sticker.src = `/assets/stickers/${s}.svg`;
        sticker.style.transform = `rotate(${random(8, 20) * direction}deg)`;

        i++;
    }
}
