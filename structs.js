// Circle class
class Circle {
    constructor(pos, color, radius, speed) {
        this.pos = pos;
        this.color = color;
        this.radius = radius;
        this.speed = speed;
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
        const speed = Math.random() * 3;
        this.circles.push(new Circle(pos, color, radius, speed));
    }

    tick() {
        // Each circle should grow and once it hits the wall, it should shrink.
        // Then, once it hits a certain size, it should start growing again.
        for (let i=0; i<this.circles.length; i++) {
            const cur = this.circles[i];
            cur.radius += cur.speed;

            // If circle hits the wall, start shrinking
            if (cur.pos.x + cur.radius > gl.canvas.width || cur.pos.x - cur.radius < 0 ||
                cur.pos.y + cur.radius > gl.canvas.height || cur.pos.y - cur.radius < 0) {
                cur.speed *= -1;
            }

            // If circle degenerates to a point, start growing again
            if (cur.radius <= 0) {
                cur.speed *= -1;
            }
        }
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