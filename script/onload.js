import data from '/assets/parts/data.json' with { type: 'json' };
import {parts, resetParts} from '/script/state.js';
import {colorSettings, changeColor} from '/script/color.js';
import {drawAll} from '/script/draw.js';
import {previewAnimation} from '/script/animate.js';

let activeTab = 'face';
let idVariant;

const today = new Date().toDateString();
const lastOpened = localStorage.getItem('opened');
const openedToday = (today === lastOpened);

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('canvas');
    await onload();
    drawAll();
});


// Loads all the stuff
async function onload() {

    if (!openedToday)
        localStorage.setItem('opened', today);

    if (parts.background.src && parts.background.variant === -1)
            parts.background.img = await loadImage(parts.background.src);

    hideNarrowNotice();
    imageInput();
    populateParts();
    loadingScreen();
    resetCharacter();
    toggleDownloadFormat();

    // Add tab change functionality
    const tabs = ['face', 'hair', 'eyebrows', 'eyes', 'nose', 'accessory', 'background', 'about'];
    for (const c of tabs) {
        document.getElementById(c).onclick = () => {changeTabs(c)};
    }

    document.getElementById('clear').addEventListener('click', () => {
        localStorage.clear();
        location.reload();
    });

    document.getElementById('download-button').addEventListener('click', () => {window.location.href = '/download';});

    // Tooltips
    tippy('.tooltip', {
        content(reference) {
            if (reference.classList.contains('flip')) {
              return 'flip';
            }

            else if (reference.classList.contains('mirror')) {
              return 'mirror';
            }

            else if (reference.classList.contains('hc')) {
                return 'heterochromia';
            }

            else if (reference.classList.contains('upload')) {
                return 'upload image';
            }
        },

        theme: 'dolly',
        appendTo: () => document.body,
      });

    tippy('.buttons img', {
        content(reference) {
            if (reference.classList.contains('me')) {
              return 'i made this!';
            }

            else if (reference.classList.contains('site')) {
              return 'link this site!';
            }

            else if (reference.classList.contains('coffee')) {
              return 'i panhandle!';
            }
        },

        theme: 'about'
      });
}


// Clear grid background for print view
window.addEventListener('beforeprint', () => {
    const ctx = canvas.getContext('2d');
    ctx.reset();
    drawAll();

    const colors = ['cf5fa4', 'f491b0', 'f37576', 'c6805d', 'fcb772', 'f9d565', 'b1c949', '59b7a5', '4bbde9', '9190c6', 'ac62a7', '829ab9']

    rollID();
    document.getElementById('idcard').src = `assets/id/${idVariant}.svg`;
    const chance = (idVariant === 11) ? ' 1/144' : ` ${idVariant + 1 }/11`;
    document.getElementById('roll').textContent = chance;
    document.getElementById('idcard').style.borderColor = canvas.style.borderColor = colors[idVariant];
});

window.addEventListener('afterprint', () => {canvas.style.borderColor = 'var(--e)'})


function sameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
}


function loadingScreen() {

    // Force people to look at the loading animation cause I spent a lot of time on it!
    const timeout = (openedToday) ? 100 : 2300;
    setTimeout( () => {

        const tabs = document.getElementById('tabs');
        tabs.style.display = 'flex';

        const cover = document.getElementById('cover');
        const slideaway = (openedToday) ? /*200*/0 : 4000;

        cover.style.transitionDuration = `${slideaway / 1000}s`;
        cover.style.left = '-2500px';
        setTimeout(() => {cover.remove();}, slideaway);

    }, timeout);
}


// Allows closing functionality for the narrow screen size notice
function hideNarrowNotice() {

    if (localStorage.getItem('seenNotice') && openedToday) {
        document.getElementById('narrow-notice').style.display = 'none';
        document.getElementById('narrow-notice').remove;
        document.body.style.overflow = 'auto';
        return;
    }

    const noticeChoice = document.getElementById('notice-choice');
    noticeChoice.onclick = () => {
        document.getElementById('narrow-notice').classList.add('pointer-lock');
        document.getElementById('notice-response').classList.toggle('show');
        setTimeout(() => {
            document.getElementById('narrow-notice').classList.toggle('remove');
        }, 400);
        document.getElementById('narrow-notice').remove;
        document.body.style.overflow = 'auto';
        localStorage.setItem('seenNotice', JSON.stringify(true));
    };
}


function resetCharacter() {

    const reset = document.getElementById('reset-button');
    const resetBubble = document.getElementById('reset-bubble');

    reset.addEventListener('click', () => {
        document.getElementById('reset-bubble').classList.remove('hide');
        document.getElementById('download-button').classList.add('pointer-lock');
        reset.classList.add('hovered');
    });

    function closeReset() {
        resetBubble.classList.add('hide');
        reset.classList.remove('hovered');
        document.getElementById('download-button').classList.remove('pointer-lock');
    }

    document.addEventListener('mousedown', () => {
        if (!(reset.contains(event.target) || resetBubble.contains(event.target)))
            closeReset();
    });

    document.getElementById('reset-yes').addEventListener('click', () => {resetParts(); drawAll(); closeReset();});
    document.getElementById('reset-no').addEventListener('click', closeReset);
}


function toggleDownloadFormat() {

    parts.animation.format = 'png';
    const png = document.getElementById('png');
    const gif = document.getElementById('gif');

    png.addEventListener('change', () => {
        gif.checked = !png.checked;
        parts.animation.format = (png.checked) ? 'png' : 'gif';
    });

    gif.addEventListener('change', () => {
        png.checked = !gif.checked;
        parts.animation.format = (gif.checked) ? 'gif' : 'png';
        previewAnimation();
    });
}


// Converts image to base64 string
// https://stackoverflow.com/questions/22172604/convert-image-from-url-to-base64
function getBase64Image(img) {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const ctx_c = c.getContext('2d');
    ctx_c.drawImage(img, 0, 0);

    const dataURL = c.toDataURL('image/png');
    return dataURL;
}

// Converts base64 string to image
function loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
}


// Add event handler for background image input
function imageInput() {
    const imageInput = document.getElementById('image-input');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    imageInput.addEventListener('change',  function(e) {

        const file = e.target.files[0];
        if (!file) return;

        const size = Math.round(file.size / 1028); // kB
        console.log(file.size);
        if (size > 10280) { // > 10 mB
            alert('file too big ! :(');
            return;
        }

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            parts.background.variant = -1;
            parts.background.img = img;
            parts.background.src = getBase64Image(img);
            drawAll();
        };
    });
}


// Add settings/toggles for each part
function createSetting(setting, left = '', right = '', p, axis) {

    let input;

    switch(axis) {

        case 2: // Flip
            input = document.createElement('label');
            input.classList.add('switch');
            input.classList.add('flip', 'tooltip');

            const toggle = document.createElement('input');
            toggle.type = 'checkbox';
            toggle.checked = parts[p].flip;

            toggle.id = `${p}-flip-toggle`;

            if (toggle.checked) {
                const images = document.querySelectorAll(`#${p}-gallery img`);
                images.forEach(i => i.classList.toggle('flipped'));
            }

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
            break;

        case 3: // Mirror
            input = document.createElement('input');
            input.type = 'checkbox';
            input.classList.add('mirror', 'tooltip');
            input.checked = parts[p].mirrored;

            input.id = `${p}-mirror-toggle`;

            input.addEventListener('change', () => {
                parts[p].mirrored = input.checked;
                drawAll();
            });
            break;

        case 4: // Scale
            input = document.createElement('input');

            input.type = 'range';
            input.step = 0.02;
            input.min = 1;
            input.max = 1.65;
            input.value = parts[p].scale;

            input.id = `${p}-scale-slider`;

            input.addEventListener('input', (event) => {
                parts[p].scale = parseFloat(event.target.value);
                drawAll();
            });
            break;

        default: // X/Y displacement
            input = document.createElement('input');
            const value = (parts[p].transform) ? parts[p].transform : 15;
            const xy = (!axis) ? 'x' : 'y';

            input.type = 'range';
            input.step = 1;
            input.min = -1 * value;
            input.max = value;
            input.value = (!axis) ? parts[p].offset[0] : parts[p].offset[1];

            input.id = `${p}-${xy}-slider`;

            input.addEventListener('input', (event) => {
                parts[p].offset[axis] = parseInt(event.target.value);
                drawAll();
            });

            const variant = parts[p].variant;
            if (variant) {
                if (data[p][variant].preventOffset - 1 === axis) {
                    setting.classList.add('forbidden');
                    input.disabled = true;
                }
            }
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
function populateParts() {
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

                    // Disable displacement settings if necessary
                    const xSetting = document.getElementById(`${p}-x`);
                    const ySetting = document.getElementById(`${p}-y`);

                    if (xSetting || ySetting) {
                        if (data[p][i].preventOffset) {

                            const xy = (!(data[p][i].preventOffset - 1)) ? 'x' : 'y';
                            document.getElementById(`${p}-${xy}`).classList.add('forbidden');
                            const slider = document.getElementById(`${p}-${xy}-slider`);
                            slider.disabled = true;

                        } else {

                            if (xSetting) {
                                xSetting.classList.remove('forbidden');
                                document.getElementById(`${p}-x-slider`).disabled = false;
                            } else {
                                ySetting.classList.remove('forbidden');
                                document.getElementById(`${p}-y-slider`).disabled = false;
                            }
                        }
                    }

                    drawAll();
                };
                document.getElementById(`${p}-gallery`).append(div);
            }

        }

        const settingTypes = ['x', 'y', 'flip', 'mirror', 'scale', 'color'];
        const settings = Object.fromEntries(settingTypes.map(s => [s, document.getElementById(`${p}-${s}`)]));

        if (settings.x) {  // Slider for X-displacement
            createSetting(settings.x, `icons/arrows/in.svg`, `icons/arrows/out.svg`, p, 0);
        }

        if (settings.y) { // Slider for Y-displacement
            createSetting(settings.y, `icons/arrows/up.svg`, `icons/arrows/down.svg`, p, 1);
        }

        if (settings.flip) { // Toggle for left/right position
            createSetting(settings.flip, `icons/arrows/left.svg`, `icons/arrows/right.svg`, p, 2);
        }

        if (settings.mirror) { // Toggle for mirroring
            createSetting(settings.mirror, `icons/arrows/flip.svg`, ``, p, 3);
        }

        if (settings.scale) { // Slider for size
            createSetting(settings.scale, `icons/arrows/small.svg`, `icons/arrows/big.svg`, p, 4);
        }

        if (settings.color) {  // Change color
            colorSettings(p, settings);
        }
    }
}


function rollID() {
    const roll = Math.random();
    const lucky = 0.0069;

    if (roll < lucky)
        idVariant = 11;
    else
       idVariant = Math.floor(Math.random() * 11);

    localStorage.setItem('idVariant', idVariant);
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

