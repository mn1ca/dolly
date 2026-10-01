import data from '/assets/parts/data.json' with { type: 'json' };
import {parts} from '/script/state.js';
import {colorSettings, changeColor} from '/script/color.js';
import {drawAll} from '/script/draw.js';

let activeTab = 'face';
//let activeAccessory = 1;


document.addEventListener('DOMContentLoaded', () => {

    const canvas = document.getElementById('canvas');
    onload();
    drawAll(true);

    /*const img = canvas.toDataURL('image/png');
    document.write('<img src="'+img+'"/>');*/
});


// Clear grid background for print view
window.addEventListener('beforeprint', () => {
    const ctx = canvas.getContext('2d');
    ctx.reset();
    drawAll(true);
});


function loadingScreen() {
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
}


// Allows closing functionality for the narrow screen size notice
function showNarrowNotice() {
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
}


// Add event handler for background image input
function imageInput() {
    const imageInput = document.getElementById('image-input');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    imageInput.addEventListener('change',  function(e) {

        const file = e.target.files[0];
        if (!file) return;

        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(img.src);
            parts.background.variant = -1;
            parts.background.img = img;
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

            input.addEventListener('change', () => {
                parts[p].mirrored = input.checked;
                drawAll();
            });
            break;

        case 4: // Scale
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
            break;

        default: // X/Y displacement
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


// Loads all the stuff
function onload() {

    showNarrowNotice();
    imageInput();
    populateParts();
    loadingScreen();

    // Add tab change functionality
    const tabs = ['face', 'hair', 'eyebrows', 'eyes', 'nose', 'accessory', 'background', 'about'];
    for (const c of tabs) {
        document.getElementById(c).onclick = () => {changeTabs(c)};
    }

    /*
    const pageTurn = document.querySelectorAll('.page-turner');
    for (const p of pageTurn) {
        p.onclick = changePage;
    }*/

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



// Change page to active tab
function changeTabs(tab) {
    if (activeTab === tab) return;

    /* // Change page within accessory tab
    if (tab === 'accessory') {
        document.getElementById('right-page').style.backgroundImage = 'url(assets/pagination/page.svg)';
        document.getElementById('right-page').style.backgroundColor = 'rgba(0,0,0,0)';
    } else {
        document.getElementById('right-page').style.backgroundImage = 'none';
        document.getElementById('right-page').style.backgroundColor = 'var(--a)';
    }*/

    document.getElementById(activeTab).classList.remove('active');
    document.getElementById(`${activeTab}-content`).classList.add('hide');

    document.getElementById(tab).classList.add('active');
    document.getElementById(`${tab}-content`).classList.remove('hide');
    activeTab = tab;

    return;
}


/*
// Change pages within tab
function changePage() {
    document.getElementById(`accessory-page1`).classList.toggle('hide');
    document.getElementById(`accessory-page2`).classList.toggle('hide');
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
}*/
