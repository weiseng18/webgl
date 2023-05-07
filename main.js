let gl, program, buffer;

const shaders = {
    vertex: `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0, 1.0);
        gl_PointSize = 10.0;
    }
    `,
    fragment: `
    precision mediump float;
    uniform vec4 color;
    void main() {
        gl_FragColor = color;
    }    
    `
}

// Code taken from webgl-by-example
function getRenderingContext() {
    const canvas = document.querySelector("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        document.getElementById("container").innerHTML =
            "Failed to get WebGL context." +
            "Your browser or device may not support WebGL.";
        return null;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return gl;
}

function cleanup() {
    gl.useProgram(null);
    if (buffer)
        gl.deleteBuffer(buffer);
    if (program)
        gl.deleteProgram(program);
}

function setup(e) {
    window.removeEventListener(e.type, setup, false);
    if (!(gl = getRenderingContext()))
        return;

    // Set up shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, shaders.vertex);
    gl.compileShader(vertexShader);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, shaders.fragment);
    gl.compileShader(fragmentShader);

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const linkErrLog = gl.getProgramInfoLog(program);
        cleanup();
        console.log("Shader program did not link successfully. " +
            "Error log: " + linkErrLog)
    }

    gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, 1);

    // Set up vertex buffer
    gl.enableVertexAttribArray(0);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    // Attach event listener
    document.querySelector("canvas").addEventListener("click", click, false);
}

function click(e) {
    // Get the position of the click relative to the canvas
    const pos = {
        x: e.pageX - this.offsetLeft,
        y: e.pageY - this.offsetTop
    };

    // Set up vertices
    const radius = 100;
    let vertices = [];
    const points = 1000;
    for (let i = 0; i < points; i++) {
        const r = 2 * Math.PI * i / points;
        const x = pos.x + radius * Math.cos(r);
        const y = pos.y + radius * Math.sin(r);

        // Scale to clip space
        const clipX = x / this.width * 2 - 1;
        const clipY = y / this.height * -2 + 1;
        vertices.push(clipX, clipY);
    }

    // Set color
    const color = {
        r: Math.random(),
        g: Math.random(),
        b: Math.random()
    };
    const colorLocation = gl.getUniformLocation(program, "color");
    gl.uniform4fv(colorLocation, [color.r, color.g, color.b, 1.0]);
    
    // Set up vertex buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Draw
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.LINE_LOOP, 0, points);
}

(function() {
    window.addEventListener("load", setup, false);
})();