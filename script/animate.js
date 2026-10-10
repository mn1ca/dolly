import data from '/assets/parts/data.json' with { type: 'json' };
import anims from '/assets/parts/animation.json' with { type: 'json' };
import {parts} from '/script/state.js';
import {drawAll} from '/script/draw.js';
import '/script/gif/gif.js';

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d', { willReadFrequently: true });
ctx.imageSmoothingEnabled = false;

const totalFrames = anims[parts.animation.variant].numFrames
const frameDelay = 1000 / 12; // 12 FPS
let currentFrame = 0;


// Animate in canvas
function previewAnimation() {
    document.getElementById('ugh').classList.add('pointer-lock');

    currentFrame = 0;
    let lastTime = performance.now();

    function loop(currentTime) {

        const elapsed = currentTime - lastTime;
        if (elapsed >= frameDelay) {

            lastTime = currentTime - (elapsed % frameDelay);

            if (currentFrame < totalFrames) {
                drawFrame(currentFrame, false);
                currentFrame++;
                requestAnimationFrame(loop);
            } else {
                document.getElementById('ugh').classList.remove('pointer-lock');
                drawAll();

            }

        } else {
            requestAnimationFrame(loop);
        }
    }

    requestAnimationFrame(loop);
}


// Create downloadable GIF
async function createGIF() {
    const gif = new GIF({
        workers: 2,
        quality: 10,
        width: canvas.width,
        height: canvas.height,
        workerScript: '/script/gif/gif.worker.js',
        transparent: 0x0000FF
        //globalPalette: true
    });

    for (let i = 0; i < totalFrames; i++) {
        await drawFrame(i, true);
        gif.addFrame(ctx, {copy: true, delay: frameDelay, dither: false});
    }

    drawAll();
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


function drawFrame(frame, grid) {
    parts.animation.frame = frame;
    drawAll(true);
}


document.getElementById('agh').addEventListener('click', createGIF);
document.getElementById('ugh').addEventListener('click', previewAnimation);
