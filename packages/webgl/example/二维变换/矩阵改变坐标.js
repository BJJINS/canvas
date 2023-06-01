const vertexShaderSource = `
      attribute vec2 a_position;
      uniform mat3 u_matrix;
      void main() { 
        gl_Position = vec4((u_matrix * vec3(a_position, 1)).xy, 0, 1);
      }`;
const fragmentShaderSource = `
      precision mediump float;
      uniform vec4 u_color;
      void main(){
          gl_FragColor = u_color; 
      }`;
const { program, gl } = initProgram(
  "canvas",
  vertexShaderSource,
  fragmentShaderSource
);

const positionLocation = gl.getAttribLocation(program, "a_position");
const colorLocation = gl.getUniformLocation(program, "u_color");
const matrixLocation = gl.getUniformLocation(program, "u_matrix");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
setGeometry(gl);

const translation = [100, 150];
let angleInRadians = 0;
const scale = [1, 1];
const color = [Math.random(), Math.random(), Math.random(), 1];

drawScene();

webglLessonsUI.setupSlider("#x", {
  value: translation[0],
  slide: updatePosition(0),
  max: gl.canvas.width,
});
webglLessonsUI.setupSlider("#y", {
  value: translation[1],
  slide: updatePosition(1),
  max: gl.canvas.height,
});
webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
webglLessonsUI.setupSlider("#scaleX", {
  value: scale[0],
  slide: updateScale(0),
  min: -5,
  max: 5,
  step: 0.01,
  precision: 2,
});
webglLessonsUI.setupSlider("#scaleY", {
  value: scale[1],
  slide: updateScale(1),
  min: -5,
  max: 5,
  step: 0.01,
  precision: 2,
});

function updatePosition(index) {
  return function (event, ui) {
    translation[index] = ui.value;
    drawScene();
  };
}

function updateAngle(event, ui) {
  var angleInDegrees = 360 - ui.value;
  angleInRadians = (angleInDegrees * Math.PI) / 180;
  drawScene();
}

function updateScale(index) {
  return function (event, ui) {
    scale[index] = ui.value;
    drawScene();
  };
}

function drawScene() {
  gl.enableVertexAttribArray(positionLocation);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
  gl.uniform4fv(colorLocation, color);

  let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
  matrix = m3.rotate(matrix, angleInRadians);
  matrix = m3.scale(matrix, scale[0], scale[1]);
  matrix = m3.translate(matrix, translation[0], translation[1]);

  clear(gl);

  // 设置矩阵
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  // 绘制图形
  gl.drawArrays(gl.TRIANGLES, 0, 18);
}

function setGeometry(gl) {
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([
      0, 0, 30, 0, 0, 150, 0, 150, 30, 0, 30, 150, 30, 0, 100, 0, 30, 30, 30,
      30, 100, 0, 100, 30, 30, 60, 67, 60, 30, 90, 30, 90, 67, 60, 67, 90,
    ]),
    gl.STATIC_DRAW
  );
}
