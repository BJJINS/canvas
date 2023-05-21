function resizeCanvasToDisplaySize(canvas, multiplier) {
    multiplier = multiplier || 1;
    const width = (canvas.clientWidth * multiplier) | 0;
    const height = (canvas.clientHeight * multiplier) | 0;
    if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.error(`创建 shader 失败：`, gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.error("创建 program 失败：", gl.getProgramInfoLog(program)
    )
    ;
    gl.deleteProgram(program);
}

function initProgram(canvasId, vertexShaderSource, fragmentShaderSour) {
    /**@type {HTMLCanvasElement} */
    const dom = document.getElementById(canvasId);
    const gl = dom.getContext("webgl");
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSour
    );
    const program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(program);
    resizeCanvasToDisplaySize(dom);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    clear(gl);
    return {
        program,
        gl,
    };
}

function clear(gl) {
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}


function setRectangle(gl, x, y, w, h) {
    const x1 = x;
    const x2 = x + w;
    const y1 = y;
    const y2 = y + h;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW)
}

/**
 * @param { WebGLRenderingContext } gl
 */
function createAndSetupTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // 设置材质，这样我们可以对任意大小的图像进行像素操作
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}

const m3 = {
    translation: (tx, ty) => {
        return [
            1, 0, 0,
            0, 1, 0,
            tx, ty, 1,
        ]
    },
    rotation: (angleInRadians) => {
        const cos = +Math.cos(angleInRadians).toFixed(15);
        const sin = +Math.sin(angleInRadians).toFixed(15);
        return [
            cos, sin, 0,
            -sin, cos, 0,
            0, 0, 1
        ]
    },
    scale: (sx, sy) => {
        return [
            sx, 0, 0,
            0, sy, 0,
            0, 0, 1
        ]
    },
    multiply: (ma, mb) => {
        const ma00 = ma[0 * 3 + 0];
        const ma01 = ma[0 * 3 + 1];
        const ma02 = ma[0 * 3 + 2];

        const ma10 = ma[1 * 3 + 0];
        const ma11 = ma[1 * 3 + 1];
        const ma12 = ma[1 * 3 + 2];

        const ma20 = ma[2 * 3 + 0];
        const ma21 = ma[2 * 3 + 1];
        const ma22 = ma[2 * 3 + 2];

        const mb00 = mb[0 * 3 + 0];
        const mb01 = mb[0 * 3 + 1];
        const mb02 = mb[0 * 3 + 2];

        const mb10 = mb[1 * 3 + 0];
        const mb11 = mb[1 * 3 + 1];
        const mb12 = mb[1 * 3 + 2];

        const mb20 = mb[2 * 3 + 0];
        const mb21 = mb[2 * 3 + 1];
        const mb22 = mb[2 * 3 + 2];


        return [
            ma00 * mb00 + ma01 * mb10 + ma02 * mb20,
            ma00 * mb01 + ma01 * mb11 + ma02 * mb21,
            ma00 * mb02 + ma01 * mb12 + ma02 * mb22,

            ma10 * mb00 + ma11 * mb10 + ma12 * mb20,
            ma10 * mb01 + ma11 * mb11 + ma12 * mb21,
            ma10 * mb02 + ma11 * mb12 + ma12 * mb22,

            ma20 * mb00 + ma21 * mb10 + ma22 * mb20,
            ma20 * mb01 + ma21 * mb11 + ma22 * mb21,
            ma20 * mb02 + ma21 * mb12 + ma22 * mb22,
        ]
    }
};

/**
 * canvas 坐标转成 webgl坐标. 旋转时图形会变形？
 * @param {WebGLRenderingContext} gl
 * @param {number[]} arr
 * @return {number[]}
 */

function transformVec2(gl, arr) {
    const halfWidth = gl.canvas.clientWidth / 2;
    const halfHeight = gl.canvas.clientHeight / 2;
    const res = [];
    for (let i = 0; i < arr.length; i++) {
        const x = (arr[i] - halfWidth) / halfWidth;
        const y = -(arr[i + 1] - halfHeight) / halfHeight;
        res.push(...[x, y]);
        i++;
    }
    return res;
}

