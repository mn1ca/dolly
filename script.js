import data from '/assets/parts/data.json' with { type: 'json' };

let activeTab = 'face';

let parts = {

    'background': {
        'variant': 0,
        'color': '#c1331c',
    },

    'outline': {
        'variant': 1,
        'color': '#ffffff',
        'scale': 1,
    },

    'hairBack': {
        'variant': 0,
        'color': '#756e63'
    },

    'hairAhoge': {
        'variant': 0,
        'color': '#756e63',
        'offset': [0, 0]
    },

    'neck': {
        'variant': 0,
        'color': '#b8b8b8',
    },

    'ears': {
        'variant': 0,
        'variant': 0,
        'color': '#b8b8b8',
        'mirrored': true,

        'matchPart': 'face'
    },

    'face': {
        'variant': 0,
        'color': '#b8b8b8',
        'offset': [0, 0],
    },

    'faceMarkings': {
        'variant': 0,
        'color': '#ab140c',
        'offset': [0, 0],
        'mirrored': true,
    },


    'eyes': {
        'offset': [0, 0],
        'transform': 8,
    },

    'pupils': {
        'variant': 0,
        'color': '#000000',
        'offset': [0, 0],
        'mirrored': true,

        'family': ['eyes']
    },

    'sparkles': {
        'variant': 1,
        'color': '#ffffff',
        'offset': [0, 0],
        'mirrored': true,

        'transform': 20,

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
       'variant': 4,
        'color': '#756e63',
        'offset': [0, 0],
        'mirrored': true,

        'transform': 10,
    },

    'eyelashes': {
        'variant': 1,
        'color': '#000000',
        'offset': [0, 0],
        'mirrored': true,

        'transform': 10,

        'family': ['eyes']
    },

    'mouth': {
        'variant': 1,
        'color': '#702f37',
        'offset': [0, 0],

        'transform': 10,
    },

    'nose': {
        'variant': 1,
        'color': '#000000',
        'offset': [0, 0],

        'transform': 10,
        'scale': 1,
        'scaleFactor': 4/5
    },

    'accessoryFace': {
        'variant': 0,
        'color': '#57514a',
        'offset': [0, 0]
    },

    'hair': {
        'color': '#756e63',
    },

    'hairFront': {
        'variant': 0,
        'color': '#756e63'
    },

    'accessoryHead': {
        'variant': 0,
        'color': '#57514a',
        'offset': [0, 0],

        'transform': 30,
        'excludeTransform': true
    }


}


document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('canvas');
    formStuff();
    onload();
    hsvToHex(hexToHSV('#c1331c'));

    drawAll();
    /*
    const img = canvas.toDataURL('image/png');
    document.write('<img src="'+img+'"/>');*/

    // Force people to look at the loading animation cause I spent a lot of time on it!
    const timeout = 0 //3200;
    setTimeout( () => {

        const tabs = document.getElementById('tabs');
        tabs.style.display = 'flex';

        const cover = document.getElementById('cover');
        cover.style.transitionDuration = '4s';
        cover.style.left = '-2500px';
        setTimeout(() => {cover.remove();}, timeout);

    }, timeout);
});


function onload() {

    // Show screen size notice for narrow displays
    const noticeChoice = document.getElementById('notice-choice');
    noticeChoice.onclick = () => {
        document.getElementById('narrow-notice').style.pointerEvents = 'none';
        document.getElementById('notice-response').classList.toggle('show');
        setTimeout(() => {
            document.getElementById('narrow-notice').classList.toggle('remove');
        }, 400);
        document.getElementById('narrow-notice').remove;
        document.body.style.overflow = 'auto';
    };



    const tabs = ['face', 'hair', 'eyebrows', 'eyes', 'nose', 'accessory', 'background', 'about', 'gallery'];
    for (const c of tabs) {
        document.getElementById(c).onclick = () => {changeTabs(c)};
    }

    function createSetting(setting, left = '', right = '', p, axis) {

        let input;

         // Flip
        if (axis === 2) {

            input = document.createElement('label');
            input.classList.add('switch');
            input.classList.add('flip', 'tooltip');

            const toggle = document.createElement('input');
            toggle.type = 'checkbox';

            toggle.addEventListener('change', () => {
                parts[p].flip = toggle.checked;
                drawAll();

                const images = document.querySelectorAll(`#${p}-gallery img`);
                images.forEach(i => i.classList.toggle('flipped'));
            });

            const slider = document.createElement('span');
            slider.classList.add('slider');

            input.append(toggle);
            input.append(slider);

        // Mirror
        } else if (axis === 3) {

            input = document.createElement('input');
            input.type = 'checkbox';
            input.classList.add('mirror', 'tooltip');

            input.addEventListener('change', () => {
                parts[p].mirrored = input.checked;
                drawAll();
            });

        // Scale
        } else if (axis === 4) {
            input = document.createElement('input');

            input.type = 'range';
            input.step = 0.02;
            input.value = 1;
            input.min = 1;
            input.max = 1.65;

            input.addEventListener('input', (event) => {
                parts[p].scale = parseFloat(event.target.value);
                drawAll();
            });

        // X/Y-axis displacement
        } else {
            input = document.createElement('input');
            const value = (parts[p].transform) ? parts[p].transform : 15;

            input.type = 'range';
            input.step = 1;
            input.value = 0;
            input.min = -1 * value;
            input.max = value;

            input.addEventListener('input', (event) => {
                parts[p].offset[axis] = parseInt(event.target.value);
                drawAll();
            });
        }

        const imgLeft = document.createElement('img');
        imgLeft.src = `/assets/${left}`;

        setting.append(imgLeft, input);

        if (right) {
            const imgRight = document.createElement('img');
            imgRight.src = `/assets/${right}`;
            setting.append(imgRight);
        }
    }

    // Add in all parts
    for (const p of Object.keys(parts)) {

        if (document.getElementById(`${p}-gallery`)) {
            // Add in all part variants
            for (let i = 0; i < Object.keys(data[p]).length; i++) {
                const div = document.createElement('div');
                const img = document.createElement('img');
                img.src = `/assets/parts/${p}/${i}.svg`;

                // Stop the none option preview from getting flipped by the toggle
                if (i === 0) img.classList.add('unflippable');

                div.append(img);
                div.onclick = () => {
                    parts[p].variant = i;

                    // Hide color button if option is not colorable
                    const colorButton = document.getElementById(`${p}-color`);
                    if (colorButton) {
                        if (data[p][i].mustMatch)
                            colorButton.classList.add('hide');
                        else
                            colorButton.classList.remove('hide');
                    }

                    drawAll();
                };
                document.getElementById(`${p}-gallery`).append(div);
            }

        }

        const settingTypes = ['x', 'y', 'flip', 'mirror', 'scale', 'color'];
        const settings = Object.fromEntries(settingTypes.map(s => [s, document.getElementById(`${p}-${s}`)]));

        if (settings.x) {  // Slider for X-displacement
            createSetting(settings.x, `arrows/in.svg`, `arrows/out.svg`, p, 0);
        }

        if (settings.y) { // Slider for Y-displacement
            createSetting(settings.y, `arrows/up.svg`, `arrows/down.svg`, p, 1);
        }

        if (settings.flip) { // Toggle for left/right position
            createSetting(settings.flip, `arrows/left.svg`, `arrows/right.svg`, p, 2);
        }

        if (settings.mirror) { // Toggle for mirroring
            createSetting(settings.mirror, `arrows/flip.svg`, ``, p, 3);
        }

        if (settings.scale) { // Slider for size
            createSetting(settings.scale, `arrows/small.svg`, `arrows/big.svg`, p, 4);
        }

        if (settings.color) {  // Change color
            colorSettings(p, settings);

        }

    }

    // Tooltips
    tippy('.tooltip', {
        content(reference) {
            if (reference.classList.contains('flip')) {
              return 'flip';
            }

            else if (reference.classList.contains('mirror')) {
              return 'mirror';
            }

            else if (reference.classList.contains('pencil')) {
                return 'i look like a pencil!';
            }
        },

        theme: 'dolly',
      });

    tippy('.about-tooltip', {
        content(reference) {
            if (reference.classList.contains('me')) {
              return 'i made this!';
            }
        },

        theme: 'about'
      });
}


// Add in color settings
function colorSettings(p, settings) {

    const color = parts[p].color.slice(1);

    const img = document.createElement('img');
    img.src = `/assets/paint.svg`;

    const button = document.createElement('div');
    button.classList.add('color');
    button.style.backgroundColor = color;
    button.id = `${p}-color-button`;

    const card = document.createElement('div');
    card.classList.add('color-card', 'book', 'hide');

    // For color settings at the bottom, move card popup upwards
    if (settings.color.classList.contains('bottom'))
        card.classList.add('bottom-card');

    // Manual hex code input
    const input = document.createElement('input');
    input.id = `${p}-color-input`;
    input.type = 'text';
    input.maxLength = 7;
    input.spellcheck = false;
    input.value = color;

    // Color sliders
    const sliderBox = document.createElement('div');
    sliderBox.classList.add('color-sliders');

    const values = hexToHSV(color);
    const hsv = ['hue', 'saturation', 'value'];
    for (let i = 0; i < hsv.length; i++) {
        const slider = document.createElement('input');
        slider.classList.add(hsv[i]);
        slider.id = `${p}-${hsv[i]}-slider`;
        slider.type = 'range';
        slider.min = 0;
        slider.max = 1;
        slider.step = .01;
        slider.value = values[i];

        slider.addEventListener('input', () => {
            const sliders = hsv.map(x => document.getElementById(`${p}-${x}-slider`));
            const c = hsvToHex(sliders.map(x => x.value));
            if (c !== `#${color}`) changeColor(c, p, false);
        });

        sliderBox.append(slider);
    }

    input.addEventListener('input', () => { changeColor(event.target.value, p) });

    const inputBox = document.createElement('div');
    inputBox.classList.add('color-input');
    inputBox.append(input);


    // Add skintone preset swatches
    if (p === 'face') {
        card.classList.add('skin');

        const skinSwatches =
        ['#f2cfb6', '#f8d2a6', '#febea4', '#ebbd94', '#fcab84', '#fac593',
         '#d4987f', '#dea571', '#db9770', '#ad6749', '#8a401b', '#54361e'];

        const skinPalette = document.createElement('div');
        skinPalette.classList.add('palette', 'skin');

        for (let i = 0; i < skinSwatches.length; i++) {
            const swatch = document.createElement('div');
            swatch.style.backgroundColor = skinSwatches[i];
            swatch.onclick = () => { changeColor(skinSwatches[i], p); }
            skinPalette.append(swatch);
        }

        card.append(skinPalette);
    }

    // Add general preset swatches
    const swatches =
    ['#ffffff', '#decdac', '#f5f497', '#cef498', '#b2eba3', '#7bdbad', '#98dcf9', '#cbbee2', '#f5b3bd', '#fa9775',

    '#b8b8b8', '#dfbb75', '#f3de7f', '#cbd466', '#93da3e', '#72bc9a', '#7eb7f1', '#e6b9ef', '#f67790', '#ff7560',

    '#76757a', '#cb9f45', '#f8e147', '#c2bc36', '#3fa719', '#47a4a4', '#81a1f1', '#a38fc3', '#af557d', '#e51c10',

    '#756e63', '#a65016', '#feb562', '#a09260', '#3c7802', '#1a615e', '#4250a0', '#815cb1', '#9a2037', '#ab140c',

    '#000000', '#5f390c', '#4b3d0b', '#5d6033', '#003b32', '#072c32', '#1e3164', '#461845', '#702f37', '#300901'];

    const palette = document.createElement('div');
    palette.classList.add('palette');
    for (let i = 0; i < 50; i++) {
        const swatch = document.createElement('div');
        swatch.style.backgroundColor = swatches[i];
        swatch.onclick = () => {
            changeColor(swatches[i], p);
        }
        palette.append(swatch);
    }

    card.append(palette);

    const spacer = document.createElement('div');
    spacer.classList.add('spacer');
    spacer.append(inputBox);
    spacer.append(sliderBox);
    card.append(spacer);

    // Clicking on the paint button alternately opens/closes color card depending on current state
    button.onclick = () => {card.classList.toggle('hide');};

    // Clicking outside of the color card closes it
    document.addEventListener('mousedown', () => {
        if (!(card.contains(event.target) || button.contains(event.target))) card.classList.add('hide');
    });

    settings.color.append(img, button, card);
}


// Change page to active tab
function changeTabs(tab) {
    if (activeTab === tab) return;

    document.getElementById(activeTab).classList.remove('active');
    document.getElementById(`${activeTab}-content`).classList.add('hide');

    document.getElementById(tab).classList.add('active');
    document.getElementById(`${tab}-content`).classList.remove('hide');
    activeTab = tab;

    return;
}


// Changes color of selected part
function changeColor(hex, p, sliderChange = true) {

    const button = document.getElementById(`${p}-color-button`);
    const input = document.getElementById(`${p}-color-input`);
    const hsv = ['hue', 'saturation', 'value'];
    const sliders = hsv.map(x => document.getElementById(`${p}-${x}-slider`));


    const format = /^#?[0-9a-fA-F]{6}$/; // Accept hex codes with/without "#" in front

    if (format.test(hex)) {

        // Add "#" to hex if necessary
        hex = (hex[0] == '#') ? hex : `#${hex}`;

        // Recolor neck and eyelids to skintone
        if (p === 'face') {
            parts['neck'].color = parts['eyelids'].color = hex;

            // Recolor ears if they must match, or if they match the previous skintone
            if (data.ears[parts.ears.variant].mustMatch || parts.ears.color === parts[p].color)
                changeColor(hex, 'ears');

        // Recolor hair
        } else if (p === 'hair') {
            parts['hairFront'].color = parts['hairBack'].color = parts['hairAhoge'].color = hex;
        }

        parts[p].color = hex;

        // Update input and button to current hex/color
        input.value = parts[p].color.slice(1);
        button.style.backgroundColor = parts[p].color;

        // Update sliders
        if (sliderChange) {
            const values = hexToHSV(hex);
            for (let i = 0; i < sliders.length; i++) {
                sliders[i].value = values[i];
            }
        }

        drawAll();
    }
}


// Converts a hex code into HSV values
function hexToHSV(hex) {

    if (hex[0] === '#') hex = hex.slice(1);

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta) {
        if (max === r)
            h = ((g - b) / delta) % 6;
        else if (max === g)
            h = (b - r) / delta + 2;
        else
            h = (r - g) / delta + 4

        h = Math.round(h * 60);
        if (h < 0) h += 360;
    }

    const s = (max) ? delta / max : 0;
    const v = max;

    return ([h / 360, s, v].map(x => Math.trunc(x * 100) / 100));
}


// Converts HSV values into a hex code
// https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/
function hsvToHex(hsv) {

    let [h, s, v] = hsv;
    h *= 360;

    const f = (n) => {
        const k = (n + h / 60) % 6;
        const colorComponent = v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
        const rgbInt = Math.round(255 * colorComponent);

        // Convert to hex and pad with a leading zero if single-digit
        return rgbInt.toString(16).padStart(2, '0');
    };

    return `#${f(5)}${f(3)}${f(1)}`;
}


function drawAll() {
    const ctx = canvas.getContext('2d');
    ctx.reset();
    ctx.fillStyle = '#e1eaf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const forbidden = ['background', 'eyes', 'hair', 'outline'];  // Parts not meant to be drawn in normal process

    drawPart('background');

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

        draw(p, outline);
        ctx.restore();
    }

    return;
}


function draw(p, stroke = false) {

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

    if (stroke) {
        const outlineSettings = parts['outline'];
        ctx.lineWidth = 16 * outlineSettings.scale ** 2;
        ctx.strokeStyle = outlineSettings.color;
        ctx.lineJoin = ctx.lineCap = 'round';

        ctx.stroke(path);
        ctx.restore();
        return;

    } else {
        ctx.fillStyle = data[p][parts[p].variant].mustMatch ? parts[part.matchPart].color : part.color;
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


function formStuff() {
    document.getElementById('form').addEventListener('submit', function(e) {
        // Prevent page reload
        e.preventDefault();

        const submitBtn = document.getElementById('submitBtn');
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;

        // Package form data
        const formData = new FormData(this);
        // Tell the Google Script what website this request is coming from
        formData.append('origin', window.location.origin);

        // Send data to Google Sheets
        fetch('https://script.google.com/macros/s/AKfycbzzTPCLdyrA5758G0Rg0KZcpygtRLKbVEKCluSS1RAYXTI0sUY5ezp6clxLDdbd0e9P-A/exec', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if(data.status === 'success') {
                alert('Form submitted successfully!');
                document.getElementById('submissionForm').reset();
            } else {
                alert('Submission failed: ' + data.message);
            }
        })
        .catch(err => {
            alert('An error occurred. Please try again.');
            console.error(err);
        })
        .finally(() => {
            submitBtn.innerText = "Submit Form";
            submitBtn.disabled = false;
        });
    });
}
