window.onload = function () {

    window.colors = colorNameList.reduce((o, {name, hex}) => Object.assign(o, {[name]: hex}), {});
    window.nearest = nearestColor.from(colors);

    console.log('Globals: nearest(hex), colorNamedList[17530] and colors{17530}');

    let downFlag = false;
    let canvas = document.querySelector('#canvas');
    let cursor = document.querySelector('#cursor');
    let button = document.querySelector('#chooseBtn');
    let Hex = document.querySelector('#Hex');
    let R = document.querySelector('#R');
    let G = document.querySelector('#G');
    let B = document.querySelector('#B');
    let H = document.querySelector('#H');
    let S = document.querySelector('#S');
    let V = document.querySelector('#V');
    let C = document.querySelector('#C');
    let M = document.querySelector('#M');
    let Y = document.querySelector('#Y');
    let K = document.querySelector('#K');
    let Name = document.querySelector('.card-title');
    let colorView = document.querySelector('#colorView');
    let img = new Image();

    button.onchange = function () {
        if (this.files.length === 0)
            img.src = 'assets/default.jpg';
        else
            img.src = URL.createObjectURL(this.files[0]);

        img.onload = function () {
            canvas.width = this.width;
            canvas.height = this.height;
            let ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);

            let getColor = function (e) {
                let rect = canvas.getBoundingClientRect();
                let relX = e.pageX - (rect.left + window.scrollX);
                let relY = e.pageY - (rect.top + window.scrollY);
                relX /= rect.width / canvas.width;
                relY /= rect.height / canvas.height;
                return canvas.getContext('2d').getImageData(relX, relY, 1, 1).data
            };

            canvas.onpointerenter = function () {
                cursor.style.opacity = '1';
            };

            canvas.onpointerleave = function () {
                cursor.style.opacity = '0';
            };

            canvas.onpointermove = function (e) {
                // Update cursor element position
                cursor.style.left = e.pageX - (cursor.offsetWidth / 2) + 'px';
                cursor.style.top = e.pageY - (cursor.offsetHeight / 2) + 'px';

                let cursorData = getColor(e);
                cursor.style.borderColor = 'rgba(' + cursorData[0] + ',' + cursorData[1] + ',' + cursorData[2] + ',' + (cursorData[3] / 255) + ')';

                if (downFlag)
                    updatePanel(cursorData)
            };

            canvas.onpointerdown = function (e) {
                cursor.style.left = e.pageX - (cursor.offsetWidth / 2) + 'px';
                cursor.style.top = e.pageY - (cursor.offsetHeight / 2) + 'px';
                cursor.classList.toggle('touched');
                downFlag = true
            };

            canvas.onpointerup = function (e) {
                cursor.classList.toggle('touched');
                downFlag = false;
                let cursorData = getColor(e);
                updatePanel(cursorData)
            }


        };
    };

    let event = new Event('change');
    button.dispatchEvent(event);

    function updatePanel(cursorData) {
        let hex = rgb2hex(cursorData);
        Hex.innerText = hex;

        Name.innerText = nearest('#' + hex).name;

        R.innerText = cursorData[0];
        G.innerText = cursorData[1];
        B.innerText = cursorData[2];

        let hsv = toHSV(cursorData);
        H.innerText = hsv.h;
        S.innerText = hsv.s;
        V.innerText = hsv.v;

        if (hsv.v > 90)
            Name.style.color = '#000';
        else
            Name.style.color = '#fff';

        let cmyk = toCMYK(cursorData);
        C.innerText = cmyk.c;
        M.innerText = cmyk.m;
        Y.innerText = cmyk.y;
        K.innerText = cmyk.k;
        colorView.style.backgroundColor = '#' + hex;
    }

    function rgb2hex(cursorData) {
        return ("0" + cursorData[0].toString(16)).slice(-2) + ("0" + cursorData[1].toString(16)).slice(-2) + ("0" + cursorData[2].toString(16)).slice(-2);
    }
};

// Adapted from https://gist.github.com/felipesabino/5066336

function toHSV(cursorData) {
    let result = {};

    let r = cursorData[0] / 255;
    let g = cursorData[1] / 255;
    let b = cursorData[2] / 255;

    let minVal = Math.min(r, g, b);
    let maxVal = Math.max(r, g, b);
    let delta = maxVal - minVal;

    result.v = maxVal;

    if (delta === 0) {
        result.h = 0;
        result.s = 0;
    } else {
        result.s = delta / maxVal;
        let del_R = (((maxVal - r) / 6) + (delta / 2)) / delta;
        let del_G = (((maxVal - g) / 6) + (delta / 2)) / delta;
        let del_B = (((maxVal - b) / 6) + (delta / 2)) / delta;

        if (r === maxVal) {
            result.h = del_B - del_G;
        } else if (g === maxVal) {
            result.h = (1 / 3) + del_R - del_B;
        } else if (b === maxVal) {
            result.h = (2 / 3) + del_G - del_R;
        }

        if (result.h < 0) {
            result.h += 1;
        }
        if (result.h > 1) {
            result.h -= 1;
        }
    }

    result.h = Math.round(result.h * 360);
    result.s = Math.round(result.s * 100);
    result.v = Math.round(result.v * 100);

    return result;
}

function toCMYK(cursorData) {
    let result = {};

    let r = cursorData[0] / 255;
    let g = cursorData[1] / 255;
    let b = cursorData[2] / 255;

    result.k = Math.min(1 - r, 1 - g, 1 - b);
    result.c = (1 - r - result.k) / (1 - result.k);
    result.m = (1 - g - result.k) / (1 - result.k);
    result.y = (1 - b - result.k) / (1 - result.k);

    result.c = Math.round(result.c * 100);
    result.m = Math.round(result.m * 100);
    result.y = Math.round(result.y * 100);
    result.k = Math.round(result.k * 100);

    return result;
}

