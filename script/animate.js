import data from '/assets/parts/data.json' with { type: 'json' };
import anims from '/assets/parts/animation.json' with { type: 'json' };
import {parts} from '/script/state.js';
import {drawAll} from '/script/draw.js';
import '/script/gif/gif.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d', { willReadFrequently: true });

const totalFrames = anims[parts.animation.variant].numFrames
const frameDelay = 1000 / 12; // 12 FPS


// Animate in canvas
function previewAnimation() {
    for (let i = 0; i < totalFrames; i++) {
        setTimeout(() => {drawFrame(i)}, i * frameDelay);
    }
}


// Create downloadable GIF
async function createGIF() {
    const gif = new GIF({
        workers: 2,
        quality: 1,
        width: canvas.width,
        height: canvas.height,
        workerScript: '/script/gif/gif.worker.js',
        transparent: 0xe1eaf5
    });

    for (let i = 0; i < totalFrames; i++) {
        await drawFrame(i);
        gif.addFrame(ctx, {copy: true, delay: frameDelay, dither: false});
    }

    gif.render();

    gif.on('finished', (blob) => {
        const url = URL.createObjectURL(blob);
        const img = document.createElement('img');
        img.onload = () => {URL.revokeObjectURL(img.src)};
        img.src = url;
        document.body.appendChild(img);
        img.style.pointerEvents = 'default';
    });
}


function drawFrame(frame) {
    parts.animation.frame = frame;
    drawAll(false, true);
}


document.getElementById('agh').addEventListener('click', createGIF);
document.getElementById('ugh').addEventListener('click', previewAnimation);
