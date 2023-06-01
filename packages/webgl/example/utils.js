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
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
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

  console.error("创建 program 失败：", gl.getProgramInfoLog(program));
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
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );
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
  translation: function (tx, ty) {
    return [1, 0, 0, 0, 1, 0, tx, ty, 1];
  },

  rotation: function (angleInRadians) {
    const c = Math.cos(angleInRadians);
    const s = Math.sin(angleInRadians);
    return [c, s, 0, -s, c, 0, 0, 0, 1];
  },

  scaling: function (sx, sy) {
    return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
  },

  multiply: function (a, b) {
    const a00 = a[0 * 3 + 0];
    const a01 = a[0 * 3 + 1];
    const a02 = a[0 * 3 + 2];
    const a10 = a[1 * 3 + 0];
    const a11 = a[1 * 3 + 1];
    const a12 = a[1 * 3 + 2];
    const a20 = a[2 * 3 + 0];
    const a21 = a[2 * 3 + 1];
    const a22 = a[2 * 3 + 2];
    const b00 = b[0 * 3 + 0];
    const b01 = b[0 * 3 + 1];
    const b02 = b[0 * 3 + 2];
    const b10 = b[1 * 3 + 0];
    const b11 = b[1 * 3 + 1];
    const b12 = b[1 * 3 + 2];
    const b20 = b[2 * 3 + 0];
    const b21 = b[2 * 3 + 1];
    const b22 = b[2 * 3 + 2];
    return [
      b00 * a00 + b01 * a10 + b02 * a20,
      b00 * a01 + b01 * a11 + b02 * a21,
      b00 * a02 + b01 * a12 + b02 * a22,
      b10 * a00 + b11 * a10 + b12 * a20,
      b10 * a01 + b11 * a11 + b12 * a21,
      b10 * a02 + b11 * a12 + b12 * a22,
      b20 * a00 + b21 * a10 + b22 * a20,
      b20 * a01 + b21 * a11 + b22 * a21,
      b20 * a02 + b21 * a12 + b22 * a22,
    ];
  },
  identity: function () {
    return [1, 0, 0, 0, 1, 0, 0, 0, 1];
  },
  translate: function (m, tx, ty) {
    return m3.multiply(m, m3.translation(tx, ty));
  },

  rotate: function (m, angleInRadians) {
    return m3.multiply(m, m3.rotation(angleInRadians));
  },

  scale: function (m, sx, sy) {
    return m3.multiply(m, m3.scaling(sx, sy));
  },
  projection: function (width, height) {
    return [2 / width, 0, 0, 0, -2 / height, 0, -1, 1, 0];
  },
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

const m4 = {
  translation: function (tx, ty, tz) {
    return [
      1, 0, 0, 0, 
      0, 1, 0, 0, 
      0, 0, 1, 0, 
      tx, ty, tz, 1
    ];
  },

  xRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      1, 0, 0, 0, 
      0, c, s, 0, 
      0, -s, c, 0, 
      0, 0, 0, 1
    ];
  },

  yRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, 0, -s, 0, 
      0, 1, 0, 0, 
      s, 0, c, 0, 
      0, 0, 0, 1
    ];
  },

  zRotation: function (angleInRadians) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return [
      c, s, 0, 0, 
      -s, c, 0, 0, 
      0, 0, 1, 0, 
      0, 0, 0, 1
    ];
  },

  scaling: function (sx, sy, sz) {
    return [
      sx, 0, 0, 0, 
      0, sy, 0, 0, 
      0, 0, sz, 0, 
      0, 0, 0, 1
    ];
  },
};
