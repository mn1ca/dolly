export let parts = {

    'background': {
        'variant': 0,
        'color': '#ffeba3',
        'color2': '#fffee8',
        'img': '',
        'src': ''
    },

    'outline': {
        'variant': 1,
        'color': '#ffffff',
        'scale': 1,
    },

    'hairBack': {
        'variant': 0,
        'color': '#756e63',
        'excludeTransform': true
    },

    'neck': {
        'variant': 0,
        'color': '#b8b8b8',
        'excludeTransform': true
    },

    'clothes': {
        'variant': 0,
        'color': '#969696',
        'excludeTransform': true
    },

    'ears': {
        'variant': 0,
        'variant': 0,
        'color': '#b8b8b8',
        'mirrored': true,

        'matchPart': 'face',
        'excludeTransform': true
    },

    'hairAhoge': {
        'variant': 0,
        'color': '#756e63',
        'offset': [0, 0],
        'excludeTransform': true
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

        'heterochromia': false,
        'color': '#000000',
        'color2': '#756e63',

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

    'eyelashes': {
        'variant': 1,
        'color': '#000000',
        'offset': [0, 0],
        'mirrored': true,

        'transform': 10,

        'family': ['eyes']
    },

    'eyebrows': {
       'variant': 4,
        'color': '#756e63',
        'offset': [0, 0],
        'mirrored': true,

        'transform': 10,
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
        'scaleFactor': .76
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
        'color': '#756e63',
        'excludeTransform': true
    },

    'accessoryHead': {
        'variant': 0,
        'color': '#8f8f8f',
        'offset': [0, 0],

        'transform': 30,
        'excludeTransform': true
    },

    'animation': {
        'variant': 'angry',
        'color': '#c1331c',
        'frame': 0,
    },

};


document.addEventListener('DOMContentLoaded', () => {

    let stored = localStorage.getItem('parts');
    if (stored)
        parts = JSON.parse(stored);

    // parts.animation.variant = 'none';
    parts.animation.frame = 0;
});
