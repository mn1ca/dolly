import data from '/assets/parts/data.json' with { type: 'json' };
import {parts} from '/script/state.js';
import {drawAll} from '/script/draw.js';

// Add in color settings
export function colorSettings(p, settings) {

    const img = document.createElement('img');
    img.src = `/assets/icons/paint.svg`;

    // Creates button and attached color card
    function createButton(color, secondColor = false) {

        const second = (!secondColor) ? '' : '2';

        const button = document.createElement('div');
        button.classList.add('color');
        button.style.backgroundColor = color;
        button.id = `${p}-color-button${second}`;

        const card = document.createElement('div');
        card.classList.add('color-card', 'book', 'hide');

        // For color settings at the bottom, move card popup upwards
        if (settings.color.classList.contains('bottom'))
            card.classList.add('bottom-card');

        // Manual hex code input
        const input = document.createElement('input');
        input.id = `${p}-color-input${second}`;
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
            slider.id = `${p}-${hsv[i]}-slider${second}`;
            slider.type = 'range';
            slider.min = 0;
            slider.max = 1;
            slider.step = .01;
            slider.value = values[i];

            slider.addEventListener('input', () => {
                const sliders = hsv.map(x => document.getElementById(`${p}-${x}-slider${second}`));
                const c = hsvToHex(sliders.map(x => x.value));
                if (c !== `#${color}`) changeColor(c, p, false, secondColor);
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
            ['#f0ceb6', '#f7d3b2', '#facea5', '#f2c8b6', '#e6b5a1', '#ebbd94',
             '#d4987f', '#dea571', '#db9770', '#ad6749', '#8a401b', '#54361e'];

            const skinPalette = document.createElement('div');
            skinPalette.classList.add('palette', 'skin');

            for (let i = 0; i < skinSwatches.length; i++) {
                const swatch = document.createElement('div');
                swatch.style.backgroundColor = skinSwatches[i];
                swatch.onclick = () => { changeColor(skinSwatches[i], p, true, secondColor); }
                skinPalette.append(swatch);
            }

            card.append(skinPalette);
        }

        // Add general preset swatches
        const swatches =
        ['#ffffff', '#decdac', '#f5f497', '#cef498', '#b2eba3', '#7bdbad', '#98dcf9', '#cbbee2', '#f5b3bd', '#fa9775',

        '#b8b8b8', '#dfbb75', '#f3de7f', '#cbd466', '#93da3e', '#72bc9a', '#7eb7f1', '#e6b9ef', '#f67790', '#ff7560',

        '#76757a', '#cb9f45', '#f8e147', '#c2bc36', '#56a630', '#47a4a4', '#81a1f1', '#a38fc3', '#af557d', '#e51c10',

        '#756e63', '#a65016', '#feb562', '#a09260', '#53782e', '#1a615e', '#4c599e', '#815cb1', '#9a2037', '#ab140c',

        '#000000', '#5f390c', '#4b3d0b', '#5d6033', '#003b32', '#072c32', '#1e3164', '#461845', '#702f37', '#300901'];

        const palette = document.createElement('div');
        palette.classList.add('palette');
        for (let i = 0; i < 50; i++) {
            const swatch = document.createElement('div');
            swatch.style.backgroundColor = swatches[i];
            swatch.onclick = () => {
                changeColor(swatches[i], p, true, secondColor);
            }
            palette.append(swatch);
        }

        card.append(palette);

        const spacer = document.createElement('div');
        spacer.classList.add('spacer');

        const left = document.createElement('div');

        if (p === 'pupils') {
            const heterochromia = document.createElement('div');
            heterochromia.classList.add('heterochromia');

            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.classList.add('hc', 'tooltip');

            toggle.addEventListener('change', () => {
                parts[p].heterochromia = toggle.checked;
                const toggles = document.querySelectorAll(`.hc`);
            toggles.forEach(t => t.checked = toggle.checked);
                drawAll();
            });

            heterochromia.append(toggle);

            const icon = document.createElement('img');
            icon.src = `/assets/icons/heterochromia.svg`;
            heterochromia.append(icon);





            left.append(heterochromia);
        }

        left.append(inputBox);
        spacer.append(left);
        spacer.append(sliderBox);
        card.append(spacer);

        // Clicking on the paint button alternately opens/closes color card depending on current state
        button.onclick = () => {card.classList.toggle('hide');};

        // Clicking outside of the color card closes it
        document.addEventListener('mousedown', () => {
            if (!(card.contains(event.target) || button.contains(event.target))) card.classList.add('hide');
        });

        return [button, card];
    }

    const color = parts[p].color.slice(1);
    let [button, card] = createButton(color);
    settings.color.append(img, button, card);

    if (settings.color.classList.contains('double')) {
        const color2 = parts[p].color2.slice(1);
        [button, card] = createButton(color2, true);
        settings.color.append(button, card);
    }

}


// Change color of selected part
export function changeColor(hex, p, sliderChange = true, secondColor = false) {

    const second = (!secondColor) ? '' : '2';

    const button = document.getElementById(`${p}-color-button${second}`);
    const input = document.getElementById(`${p}-color-input${second}`);
    const hsv = ['hue', 'saturation', 'value'];
    const sliders = hsv.map(x => document.getElementById(`${p}-${x}-slider${second}`));


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

        // Recolor all hair parts
        } else if (p === 'hair') {
            parts['hairFront'].color = parts['hairBack'].color = parts['hairAhoge'].color = hex;
        }

        // Toggle heterochromia if second pupil color is selected
        if (p === 'pupils' && secondColor) {
            parts[p].heterochromia = true;
            const toggles = document.querySelectorAll(`.hc`);
            toggles.forEach(t => t.checked = true);
        }

        parts[p][`color${second}`] = hex;

        // Update input and button to current hex/color
        input.value = parts[p][`color${second}`].slice(1);
        button.style.backgroundColor = parts[p][`color${second}`];

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


// Converts HSV values into a hex code
// https://www.jameslmilner.com/posts/converting-rgb-hex-hsl-colors/
export function hsvToHex(hsv) {

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


// Converts a hex code into HSV values
export function hexToHSV(hex) {

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
