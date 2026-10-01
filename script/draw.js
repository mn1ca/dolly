import data from '/assets/parts/data.json' with { type: 'json' };
import {parts} from '/script/state.js';

export function drawAll(excludeBg = false) {

    if (!excludeBg) {
        const ctx = canvas.getContext('2d');
        ctx.reset();
        ctx.fillStyle = '#e1eaf5';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#c3d8fa';

        const width = 512;
        const height = 512;
        const gridCellSize = 52;

        for (let x = 0; x <= canvas.width; x += gridCellSize) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }

        for (let y = 0; y <= canvas.height; y += gridCellSize) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }

        ctx.stroke();
        ctx.closePath();
        ctx.restore();
    }

    const forbidden = ['background', 'eyes', 'hair', 'outline'];  // Parts not meant to be drawn in normal process

    drawBg();

    // Outline
    if (parts['outline'].variant) {
        for (const p of Object.keys(parts)) {
            if (!forbidden.includes(p))
                drawPart(p, true);
        }
    }

    for (const p of Object.keys(parts)) {
        if (!forbidden.includes(p))
            drawPart(p);
    }
}


function drawPart(p, outline = false) {

    const ctx = canvas.getContext('2d');

    draw(p, outline);

    // Mirror if mirror setting is active & current part does not prevent mirror
    // Or if current part requires mirroring
    if ((parts[p].mirrored && !data[p][parts[p].variant].preventMirror) || data[p][parts[p].variant].mirrored) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        const secondColor = (p === 'pupils') ? parts[p].heterochromia : false;
        if (p === 'pupils') console.log(parts[p].heterochromia, secondColor);

        draw(p, outline, secondColor);
        ctx.restore();
    }

    return;
}


function draw(p, stroke = false, secondColor = false) {

    const ctx = canvas.getContext('2d');
    ctx.save();

    const part = parts[p];

    // Get path info.
    const shape = data[p][part.variant];
    const path = new Path2D(shape.d);

    // Flip single-sided parts if toggled
    if (part.flip) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
    }

    if (part.offset && p !== 'face') {

        // Calculate offset from
        // Part
        // Face
        // Part's "family" (parts containing current part)
        let offset = [part.offset[0], part.offset[1]];

        if (part.family)
            part.family.forEach((i) => { offset[0] += parts[i].offset[0]; offset[1] += parts[i].offset[1]; });

        if (!part.excludeTransform)
            offset = [offset[0] + parts['face'].offset[0], offset[1] + parts['face'].offset[1]];

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
        const outlineSettings = parts['outline'];
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
            console.log(ctx.fillStyle);
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
    const background = parts.background;
    const ctx = canvas.getContext('2d');
    const path = new Path2D('M0,0h512v512H0V0Z');

    let gradient;

    switch(background.variant) {
        case -1:

            // Scale image according to shorter side
            const shorterWidth = (background.img.width < background.img.height) ? true : false;
            const scale = (shorterWidth) ? canvas.width / background.img.width : canvas.height / background.img.height;

            const width = scale * background.img.width;
            const height = scale * background.img.height;

            if (shorterWidth)
                ctx.drawImage(background.img, 0, (height - canvas.height) / -2, width, height);
            else
                ctx.drawImage(background.img, (width - canvas.width) / -2, 0, width, height);

            return;

        case 0:
            return;
        case 1:
            ctx.fillStyle = background.color;
            console.log('hi');
            break;
        case 2:
            gradient = ctx.createLinearGradient(0, 0, 0, 512);
            gradient.addColorStop(0, background.color);
            gradient.addColorStop(1, background.color2);
            ctx.fillStyle = gradient;
            break;
        case 3:
            gradient = ctx.createLinearGradient(0, 0, 512, 0);
            gradient.addColorStop(0, background.color);
            gradient.addColorStop(1, background.color2);
            ctx.fillStyle = gradient;
            break;
        case 3:
            gradient = ctx.createLinearGradient(0, 0, 512, 0);
            gradient.addColorStop(0, background.color);
            gradient.addColorStop(1, background.color2);
            ctx.fillStyle = gradient;
            break;
        case 4:
            gradient = ctx.createRadialGradient(256, 300, 120, 256, 300, 256);
            gradient.addColorStop(0, background.color);
            gradient.addColorStop(1, background.color2);
            ctx.fillStyle = gradient;
    }

    ctx.fill(path);
}
