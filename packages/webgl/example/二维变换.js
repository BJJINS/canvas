const vertexShaderSource = `
        attribute vec2 a_position;
        uniform mat3 u_matrix;
         void main(){
           vec2 position = (u_matrix * vec3(a_position,1.0)).xy;
           gl_Position = vec4(position,0.0,1.0);
         }
        `;
const fragmentShaderSource = `
        precision mediump float;
        uniform vec4 u_color;
        void main(){
            gl_FragColor = u_color; 
        }
      `;
const {program, gl} = initProgram(
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
let angleInRadians = 90 * Math.PI / 180;
const scale = [1, 1];
const color = [Math.random(), Math.random(), Math.random(), 1];


drawScene();

webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width});
webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
webglLessonsUI.setupSlider("#scaleX", {
    value: scale[0],
    slide: updateScale(0),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2
});
webglLessonsUI.setupSlider("#scaleY", {
    value: scale[1],
    slide: updateScale(1),
    min: -5,
    max: 5,
    step: 0.01,
    precision: 2
});

function updatePosition(index) {
    return function (event, ui) {
        translation[index] = ui.value;
        drawScene();
    };
}


function updateAngle(event, ui) {
    const angleInDegrees = ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
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
    // const translationMatrix = m3.translation(translation[0], translation[1]);
    const rotationMatrix = m3.rotation(angleInRadians);
    // const scaleMatrix = m3.scale(scale[0], scale[1]);
    // let matrix = m3.multiply(translationMatrix, rotationMatrix);
    // matrix = m3.multiply(scaleMatrix, matrix);
    clear(gl);
    console.log(rotationMatrix);
    gl.uniformMatrix3fv(matrixLocation, false, rotationMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

}

function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(transformVec2(gl, [
            gl.canvas.width / 2, gl.canvas.height / 2,
            gl.canvas.width / 2 + 100, gl.canvas.height / 2,
            gl.canvas.width / 2, gl.canvas.height / 2 + 100,

            gl.canvas.width / 2, gl.canvas.height / 2 + 100,
            gl.canvas.width / 2 + 100, gl.canvas.height / 2,
            gl.canvas.width / 2 + 100, gl.canvas.height / 2 + 100,
        ])),
        gl.STATIC_DRAW
    )
    ;
}


















