/*"-": {
            "d": "M179.7,400.09c-10.55,0-21.09-4.08-29.01-12.21-6.85-7.03-10.54-16.3-10.39-26.09.15-9.8,4.11-18.95,11.17-25.77,13.25-12.82,34.5-12.5,47.37.7,5.69,5.84,8.75,13.54,8.63,21.68-.12,8.14-3.42,15.74-9.27,21.41-5.38,5.2-13.42,8.06-21.47,7.67-7.39-.37-13.84-3.37-18.15-8.46-7.67-9.04-9.15-25.17.98-33.87,5.32-4.57,13.1-6.23,20.81-4.44,6.56,1.52,11.74,5.35,13.83,10.24,3.02,7.04.29,18.01-7.88,22.13-5.46,2.76-13.62,2.68-17.98-2.9-3.54-4.52-3.59-11.13-.14-16.45,1.21-1.85,3.69-2.38,5.54-1.18,1.86,1.21,2.38,3.69,1.18,5.54-1.57,2.41-1.68,5.35-.27,7.15,1.82,2.32,5.88,1.78,8.06.68,4.07-2.06,5.67-8.22,4.12-11.82-1.08-2.51-4.25-4.66-8.28-5.59-5.15-1.2-10.43-.16-13.77,2.71-6.28,5.39-5.2,16.58-.09,22.61,2.87,3.38,7.28,5.38,12.44,5.64,5.88.3,11.69-1.74,15.51-5.42,4.32-4.18,6.75-9.78,6.83-15.77.09-5.99-2.17-11.66-6.36-15.96-9.79-10.05-25.97-10.29-36.05-.54-5.51,5.33-8.61,12.48-8.72,20.13-.11,7.65,2.77,14.89,8.12,20.38,12.45,12.78,33.01,13.09,45.84.68,1.59-1.54,4.13-1.5,5.67.09,1.54,1.59,1.5,4.13-.09,5.67-7.84,7.58-18,11.36-28.14,11.36Z"
        }*/

import data from '/assets/parts/data.json' with { type: 'json' };

let activeTab = 'face';
let b = 0;

let parts = {
    'neck': {
        'variant': 0,
        'color': '#b8b8b8',
    },

    'face': {
        'variant': 0,
        'color': '#b8b8b8',
        'offset': [0, 0],
    },

    'eyes': {
        'offset': [0, 0],
        'transform': 8,
    },

    'pupils': {
        'variant': 1,
        'color': '#000000',
        'offset': [0, 0],
        'mirrored': true,

        'family': ['eyes']
    },

    'sparkles': {
        'variant': 3,
        'color': '#ffffff',
        'offset': [0, 0],
        'mirrored': true,

        'transform': 25,

        'family': ['eyes', 'pupils']
    },

    'eyelids': {
        'variant': 0,
        'color': '#b8b8b8',
        'offset': [0, 0],
        'mirrored': true,

        'family': ['eyes', 'eyelashes']
    },

    'eyebrows': {
       'variant': 0,
        'color': '#756e63',
        'offset': [0, 0],
        'mirrored': true,

        //'transform': 10,
    },

    'eyelashes': {
        'variant': 1,
        'color': '#000000',
        'offset': [0, 0],
        'mirrored': true,

        'family': ['eyes']
    },

    'nose': {
        'variant': 0,
        'color': '#000000',
        'offset': [0, 0],

        'transform': 10,
    },

    'mouth': {
        'variant': 0,
        'color': '#702f37',
        'offset': [0, 0],

        'transform': 10,
    }
}


document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('canvas');
    onload();

    drawAll();
    /*
    const img = canvas.toDataURL('image/png');
    document.write('<img src="'+img+'"/>');*/
});


function onload() {
    const tabs = ['face', 'hair', 'eyebrows', 'eyes', 'nose', 'mouth', 'accessory', 'background', 'about'];
    for (const c of tabs) {
        document.getElementById(c).onclick = () => {changeTabs(c)};
    }


    function createSlider(setting, left = '', right = '', p, i) {
        const slider = document.createElement('input');

        const value = (parts[p].transform) ? parts[p].transform : 15;

        slider.type = 'range';
        slider.min = -1 * value;
        slider.max = value;
        slider.step = 1;
        slider.value = 0;
        slider.addEventListener('input', (event) => {
            parts[p].offset[i] = parseInt(event.target.value);
            drawAll();
        });

        const imgLeft = document.createElement('img');
        imgLeft.src = `/assets/${left}`;
        const imgRight = document.createElement('img');
        imgRight.src = `/assets/${right}`;

        setting.append(imgLeft, slider, imgRight);
    }

    for (const p of Object.keys(parts)) {

        if (document.getElementById(`${p}-gallery`)) {
            console.log(Object.keys(data[p]).length);

            for (let i = 0; i < Object.keys(data[p]).length; i++) {
                const div = document.createElement('div');
                const img = document.createElement('img');
                img.src = `/assets/parts/${p}/${i}.svg`;

                div.append(img);
                div.onclick = () => {parts[p].variant = i; drawAll()};
                document.getElementById(`${p}-gallery`).append(div);
            }

        }


        const settings = [0, 1, 2].map(num => document.getElementById(`${p}${num}`));

        if (settings[0]) {  // Slider for Y-displacement

            createSlider(settings[0], `arrows/up.svg`, `arrows/down.svg`, p, 1);
        }

        if (settings[1]) { // Slider for X-displacement
            createSlider(settings[1], `arrows/in.svg`, `arrows/out.svg`, p, 0);
        }

        if (settings[2]) {  // Change color

            const color = parts[p].color.slice(1);

            const img = document.createElement('img');
            img.src = `/assets/paint.svg`;

            const button = document.createElement('div');
            button.classList.add('color');
            button.style.backgroundColor = color;

            const card = document.createElement('div');
            card.classList.add('color-card', 'book', 'hide');

            if (settings[2].classList.contains('bottom'))
                card.classList.add('bottom-card');

            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 7;
            input.spellcheck = false;
            input.value = color;
            input.addEventListener('input', () => { changeColor(event.target.value, p, input, button) });

            const inputBox = document.createElement('div');
            inputBox.classList.add('color-input');
            inputBox.append(input);

            if (p === 'face') {
                card.classList.add('skin');

                const skinSwatches = ['#f4d5b7', '#f8d2a6', '#febea4', '#fcc48a', '#fcab84', '#fcb768', '#ea9262', '#e0954e', '#dd7c3d', '#ae5629', '#8a401b', '#54361e'];

                const skinPalette = document.createElement('div');
                skinPalette.classList.add('palette', 'skin');

                for (let i = 0; i < skinSwatches.length; i++) {
                    const swatch = document.createElement('div');
                    swatch.style.backgroundColor = skinSwatches[i];
                    swatch.onclick = () => {
                        changeColor(skinSwatches[i], p, input, button);
                    }
                    skinPalette.append(swatch);
                }

                card.append(skinPalette);
            }


            const swatches = ['#ffffff', '#decdac', '#f5f497', '#cef498', '#b2eba3', '#7bdbad', '#98dcf9', '#cbbee2', '#f9c6d0', '#f0a292', '#b8b8b8', '#dfbb75', '#f3de7f', '#cbd466', '#93da3e', '#72bc9a', '#7eb7f1', '#e6b9ef', '#f67790', '#ff7560', '#76757a', '#cb9f45', '#f8e147', '#c2bc36', '#3fa719', '#47a4a4', '#81a1f1', '#a38fc3', '#af557d', '#e51c10', '#756e63', '#a65016', '#feb562', '#a09260', '#3c7802', '#1a615e', '#4250a0', '#815cb1', '#9a2037', '#ab140c', '#000000', '#5f390c', '#4b3d0b', '#5d6033', '#003b32', '#072c32', '#1e3164', '#461845', '#702f37', '#300901'];

            const palette = document.createElement('div');
            palette.classList.add('palette');
            for (let i = 0; i < 50; i++) {
                const swatch = document.createElement('div');
                swatch.style.backgroundColor = swatches[i];
                swatch.onclick = () => {
                    changeColor(swatches[i], p, input, button);
                }
                palette.append(swatch);
            }


            card.append(palette);
            card.append(inputBox);

            button.onclick = () => {card.classList.toggle('hide')};

            document.addEventListener('mousedown', () => {
                if (!(card.contains(event.target) || button.contains(event.target))) card.classList.add('hide');
            });

            settings[2].append(img, button, card);
        }

    }
}


function changeTabs(tab) {
    if (activeTab === tab) return;

    document.getElementById(activeTab).classList.remove('active');
    document.getElementById(`${activeTab}-content`).classList.add('hide');

    document.getElementById(tab).classList.add('active');
    document.getElementById(`${tab}-content`).classList.remove('hide');
    activeTab = tab;

    return;
}

function changeColor(hex, p, input, button) {

    const format = /^#?[0-9a-fA-F]{6}$/;

    if (format.test(hex)) {
        parts[p].color = (hex[0] == '#') ? hex : `#${hex}`;

        if (p === 'face') {
            parts['neck'].color = parts[p].color;
            parts['eyelids'].color = parts[p].color;
        }

        input.value = parts[p].color.slice(1);
        button.style.backgroundColor = parts[p].color;

        drawAll();
    }
}


function drawAll() {
    const ctx = canvas.getContext('2d');
    ctx.reset();

    for (const p of Object.keys(parts)) {
        if (p !== 'eyes')
            drawPart(p);
    }
}


function drawPart(p) {

    const part = parts[p];
    const ctx = canvas.getContext('2d');

    function draw(part) {

        ctx.save();

        // Get path info.
        const shape = data[p][part.variant];
        const path = new Path2D(shape.d);

        if (part.offset && p !== 'face') {

            let offset = [part.offset[0] + parts['face'].offset[0], part.offset[1] + parts['face'].offset[1]];

            if (part.family) {

                part.family.forEach((i) => { offset[0] += parts[i].offset[0]; offset[1] += parts[i].offset[1]; });
            }

            ctx.translate(-1 * offset[0], offset[1]);

        }


        ctx.fillStyle = part.color;
        ctx.fill(path);

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

        ctx.restore();
    }

    draw(part);
    if (part.mirrored) {
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        draw(part);
        ctx.restore;
    }
    return;
}
