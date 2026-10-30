import data from '/assets/parts/data.json' with { type: 'json' };
import anims from '/assets/parts/animation.json' with { type: 'json' };
import {parts, setBlobURL} from '/script/state.js';
import {drawAll} from '/script/draw.js';
import '/script/gif/gif.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d', { willReadFrequently: true });
ctx.imageSmoothingEnabled = false;

let totalFrames;
const frameDelay = 1000 / 12; // 12 FPS
let currentFrame = 0;
let started = 0;

// Animate in canvas
export function previewAnimation() {
    totalFrames = anims[parts.animation.variant].numFrames;

    started++;
    const current = started;

    currentFrame = 0;
    let lastTime = performance.now();

    function loop(currentTime) {

        // Cancel current animation if new one is started
        if (started !== current)
            return;

        const elapsed = currentTime - lastTime;
        if (elapsed >= frameDelay) {

            lastTime = currentTime - (elapsed % frameDelay);

            if (currentFrame < totalFrames) {
                drawFrame(currentFrame);
                currentFrame++;
                requestAnimationFrame(loop);

            } else drawAll();

        } else requestAnimationFrame(loop);
    }

    requestAnimationFrame(loop);
}


// Create downloadable GIF
export async function createGIF() {

    totalFrames = anims[parts.animation.variant].numFrames;
    console.log(totalFrames, parts.animation.variant );

    const gif = new GIF({
        workers: 2,
        quality: 5,
        width: canvas.width,
        height: canvas.height,
        workerScript: '/script/gif/gif.worker.js',
        transparent: null
        //globalPalette: true
    });

    for (let i = 0; i < totalFrames; i++) {
        await drawFrame(i);
        gif.addFrame(ctx, {copy: true, delay: frameDelay, dither: false});
    }

    drawAll();
    gif.render();

    let url;
    gif.on('finished', (blob) => {
        url = URL.createObjectURL(blob);
        setBlobURL(url);
        const img = document.createElement('img');
        img.src = url;
        document.getElementById('wrapper').appendChild(img);

        /*if (document.getElementById('download-img'))
            document.getElementById('download-img').href = url;
            document.getElementById('download-img').download = 'animation.gif';*/
    });
}


function drawFrame(frame) {
    parts.animation.frame = frame;
    drawAll(true);
}
