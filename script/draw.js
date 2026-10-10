import data from '/assets/parts/data.json' with { type: 'json' };
import anims from '/assets/parts/animation.json' with { type: 'json' };
import {parts} from '/script/state.js';

let animation;
let prevFrame = 0;
let currentFrame, currentAnimation;
const ctx = canvas.getContext('2d', { willReadFrequently: true });

export function drawAll(a = false, reset = true) {

    animation = a;
    currentAnimation = parts.animation.variant;
    currentFrame = parts.animation.frame;

    const forbidden = ['background', 'eyes', 'hair', 'outline'];  // Parts not meant to be drawn in normal process

    if (reset) ctx.reset();

    ctx.fillStyle = '#e1eaf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawBg();

    // Outline
    if (parts.outline.variant) {
        for (const p of Object.keys(parts)) {
            if (!forbidden.includes(p))
                drawPart(p, true);
        }
    }

    for (const p of Object.keys(parts)) {
        if (!forbidden.includes(p))
            drawPart(p, false);
    }

    localStorage.setItem('parts', JSON.stringify(parts));
}


function applyAnimationTransforms(partAnimation) {

    if (!partAnimation) return;

    for (let [operation, coords] of Object.entries(partAnimation)) {
        if (/^\d/.test(operation))
            operation = operation.slice(1);
        if (typeof ctx[operation] === 'function')
            ctx[operation](...coords);
    }
}


function drawPart(p, outline = false) {

    let partAnimation, faceAnimation;
    let mirrorAnimation = false;
    if (animation && p !== 'face') {

        if (!anims[currentAnimation][currentFrame])
            currentFrame = prevFrame;
        else
            prevFrame = currentFrame;

        const reference = anims[currentAnimation][currentFrame].reference
        if (reference) currentFrame = reference;

        partAnimation = anims[currentAnimation][currentFrame][p];

        if (!parts[p].excludeTransform)
            faceAnimation = anims[currentAnimation][currentFrame]['face'];
    }

    if (partAnimation || faceAnimation) {
        ctx.save();

        if (partAnimation) {
            mirrorAnimation = !partAnimation.notMirrored;
            applyAnimationTransforms(partAnimation);
        }
        if (faceAnimation) applyAnimationTransforms(faceAnimation);
    }

    draw(p, outline);

    if (partAnimation || faceAnimation) ctx.restore(); // Reset animation transforms

    // Mirror if mirror setting is active & current part does not prevent mirror
    // Or if current part requires mirroring
    if ((parts[p].mirrored && !data[p][parts[p].variant].preventMirror) || data[p][parts[p].variant].mirrored) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        const secondColor = (p === 'pupils') ? parts[p].heterochromia : false;

        if (mirrorAnimation) applyAnimationTransforms(partAnimation);
        if (faceAnimation) applyAnimationTransforms(faceAnimation);

        draw(p, outline, secondColor);
        ctx.restore();
    }

    return;
}


function draw(p, stroke = false, secondColor = false, animate) {

    ctx.save();

    const part = parts[p];

    let shape;
    if (animation && p === 'animation' && anims[currentAnimation][currentFrame].animation) {
        const animationVariant = anims[currentAnimation][currentFrame].animation;
        shape = data[p][currentAnimation][animationVariant];
    } else {
        shape = data[p][part.variant];
    }

    // Get path info.
    const path = new Path2D(shape.d);

    // Flip single-sided parts if toggled
    if (part.flip) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    //ctx.translate(256, 256);
    //ctx.rotate(1.5);
    //ctx.translate(-256, -256);

    if (p !== 'face') {

        // Calculate offset from
        // Part
        // Face
        // Part's "family" (parts containing current part)
        let offset = [0, 0];

        if (part.offset)
            offset = [offset[0] + part.offset[0], offset[1] + part.offset[1]];

        if (part.family)
            part.family.forEach((i) => { offset[0] += parts[i].offset[0]; offset[1] += parts[i].offset[1]; });

        if (!part.excludeTransform)
            offset = [offset[0] + parts.face.offset[0], offset[1] + parts.face.offset[1]];

        if (shape.preventOffset)
            offset[shape.preventOffset - 1] = 0;

        ctx.translate(-1 * offset[0], offset[1]);
    }

    if (part.scale) {
        const centerX = canvas.width / 2;
        const centerY = canvas.width * part.scaleFactor;
        ctx.translate(centerX, centerY);
        ctx.scale(part.scale, part.scale);
        ctx.translate(-centerX, -centerY);
    }

    //ctx.translate(0, -20);
    if (stroke) {
        const outlineSettings = parts.outline;
        ctx.lineWidth = 16 * outlineSettings.scale ** 2;
        ctx.strokeStyle = outlineSettings.color;
        ctx.lineJoin = ctx.lineCap = 'round';

        ctx.stroke(path);
        ctx.restore();
        return;

    } else {

        if (!secondColor)
            ctx.fillStyle = data[p][parts[p].variant].mustMatch ? parts[part.matchPart].color : part.color;
        else {
            ctx.fillStyle = part.color2;
        }

        ctx.fill(path);
    }

    // Apply modifier if necessary
    if (shape.modifier) {

        ctx.save();
        const modifier = shape.modifier;
        const modPath = new Path2D(shape.modifier[0]);

        ctx.fillStyle = shape.modifier[1]; // Color
        ctx.globalCompositeOperation = shape.modifier[2]; // Blend mode
        ctx.globalAlpha = shape.modifier[3]; // Opacity

        ctx.fill(modPath);
        ctx.restore();
    }

    if (shape.darken) {
        ctx.save();

        const gradient = ctx.createLinearGradient(0, 0, 0, 600);
        gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
        gradient.addColorStop(0, 'rgba(0,0,0,0)');

        ctx.fillStyle = gradient;
        ctx.globalCompositeOperation = 'multiply'; // Blend mode
        //ctx.globalAlpha = shadow[2]; // Opacity

        ctx.fill(path);
        ctx.restore();
    }

    ctx.restore();
}


function drawBg() {
    const canvasWidth = 512;
    const canvasHeight = 512;

    const background = parts.background;
    const path = new Path2D('M0,0h512v512H0V0Z');

    let gradient;
    const stripeSize = 80;

    switch(background.variant) {
        case -1:

            // Scale image according to shorter side
            const shorterWidth = (background.img.width < background.img.height) ? true : false;
            const scale = (shorterWidth) ? canvasWidth / background.img.width : canvasHeight / background.img.height;

            const width = scale * background.img.width;
            const height = scale * background.img.height;

            if (shorterWidth)
                ctx.drawImage(background.img, 0, (height - canvasHeight) / -2, width, height);
            else
                ctx.drawImage(background.img, (width - canvasWidth) / -2, 0, width, height);

            return;

        case 0:
            ctx.fillStyle = background.color;
            break;
        case 1:
            gradient = ctx.createLinearGradient(0, 0, 0, 512);
            gradient.addColorStop(0, background.color);
            gradient.addColorStop(1, background.color2);
            ctx.fillStyle = gradient;
            break;
        case 2:
            gradient = ctx.createLinearGradient(0, 0, 512, 0);
            gradient.addColorStop(0, background.color);
            gradient.addColorStop(1, background.color2);
            ctx.fillStyle = gradient;
            break;
        case 3:
            gradient = ctx.createRadialGradient(256, 300, 120, 256, 300, 256);
            gradient.addColorStop(1, background.color);
            gradient.addColorStop(0, background.color2);
            ctx.fillStyle = gradient;
            break;

        case 4: // Vertical Stripes
            ctx.save();
            ctx.fillStyle = background.color;
            ctx.fill(path);

            ctx.beginPath();
            ctx.lineWidth = 30;
            ctx.strokeStyle = background.color2;

            for (let x = 0; x <= canvasWidth; x += stripeSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvasHeight);
            }

            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            return;

        case 5: // Horizontal Stripes
            ctx.save();
            ctx.fillStyle = background.color;
            ctx.fill(path);

            ctx.beginPath();
            ctx.lineWidth = 30;
            ctx.strokeStyle = background.color2;

            for (let y = 0; y <= canvasHeight ; y += stripeSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(canvasWidth, y);
            }

            ctx.stroke();
            ctx.closePath();
            ctx.restore();
            return;

        case 6: // Polka dots

            ctx.save();
            ctx.fillStyle = background.color;
            ctx.fill(path);

            const xSpacing = 80;
            const ySpacing = 30;
            const radius = 8;
            ctx.fillStyle = background.color2;

            let row = true;

            for (let y = 20; y < canvasHeight + ySpacing; y += ySpacing) {

                row = !row; // Alternate spacing between rows

                for (let x = 20; x < canvasWidth  + xSpacing; x += xSpacing) {

                    let xPosition = (row) ? x : x + xSpacing / 2;
                    ctx.beginPath();
                    ctx.arc(xPosition, y, radius, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.restore();
            return;

        default:
            return;
    }

    ctx.fill(path);
}
