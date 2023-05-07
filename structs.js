// Circle class
class Circle {
    constructor(pos, color, radius) {
        this.pos = pos;
        this.color = color;
        this.radius = radius;
    }
}

// Collection of circles
class CircleArray {
    points = 1000;

    constructor() {
        this.circles = [];
    }

    newCircle(pos) {
        const radius = 100;
        const color = {
            r: Math.random(),
            g: Math.random(),
            b: Math.random()
        };
        this.circles.push(new Circle(pos, color, radius));
    }

    draw(gl) {
        // Set up vertex buffer
        let vertices = [];
        for (let i=0; i<this.circles.length; i++) {
            const cur = this.circles[i];
            for (let j=0; j<this.points; j++) {
                const r = 2 * Math.PI * j / this.points;
                const x = cur.pos.x + cur.radius * Math.cos(r);
                const y = cur.pos.y + cur.radius * Math.sin(r);

                // Scale to clip space
                const clipX = x / gl.canvas.width * 2 - 1;
                const clipY = y / gl.canvas.height * -2 + 1;
                vertices.push(clipX, clipY);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Draw
        gl.clear(gl.COLOR_BUFFER_BIT);
        for (let i=0; i<this.circles.length; i++) {
            const cur = this.circles[i];
            const colorLocation = gl.getUniformLocation(program, "color");
            gl.uniform4fv(colorLocation, [cur.color.r, cur.color.g, cur.color.b, 1.0]);
            gl.drawArrays(gl.LINE_LOOP, i*this.points, this.points);
        }
    }
}