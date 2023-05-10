// -----------------
// Helper functions
// -----------------
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hslToRgb(h, s, l) {
    // Code taken from https://www.30secondsofcode.org/js/s/hsl-to-rgb/
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    
    return {
        r: 255 * f(0),
        g: 255 * f(8),
        b: 255 * f(4)
    }
}


// Circle class
class Circle {
    constructor(pos, color, radius, speed) {
        this.pos = pos;
        this.color = color;
        this.radius = radius;
        this.speed = speed;
    }

    distance(other) {
        return Math.sqrt(Math.pow(this.pos.x - other.pos.x, 2) + Math.pow(this.pos.y - other.pos.y, 2));
    }

    checkIntersection(other) {
        const dist = this.distance(other);

        // Handle degenerate cases
        if (dist == 0) {
            const prev_radius = this.radius - this.speed;
            const prev_other_radius = other.radius - other.speed;
            return this.radius == other.radius ||
                (prev_radius < prev_other_radius && this.radius > other.radius) ||
                (prev_radius > prev_other_radius && this.radius < other.radius);
        }

        if (dist <= this.radius - other.radius)
            return false; // other is inside this
        if (dist <= other.radius - this.radius)
            return false; // this is inside other
        return dist <= this.radius + other.radius;
    }
}

// Collection of circles
class CircleArray {
    points = 1000;

    constructor() {
        this.circles = [];
    }

    newCircle(pos) {
        const radius = 1;

        // color
        const HSL = {
            h: randInt(0, 360),
            s: 100,
            l: randInt(0, 50)
        };
        // convert to RGB
        const RGB = hslToRgb(HSL.h, HSL.s, HSL.l);

        const speed = Math.random() * 0.5 + 1;
        this.circles.push(new Circle(pos, RGB, radius, speed));
    }

    tick(player) {
        // Keep track of which circles have already collided
        let hasCollision = [];
        for (let i = 0; i < this.circles.length; i++) {
            hasCollision.push(false);
        }

        // Create copy and increase radius by the speed
        let cpy = this.circles.slice();
        for (let i = 0; i < cpy.length; i++) {
            cpy[i].radius += cpy[i].speed;
        }

        for (let i = 0; i < cpy.length; i++) {
            let c1 = cpy[i];

            // check for collision with edge of canvas
            if (c1.pos.x - c1.radius < 0 || c1.pos.x + c1.radius > gl.canvas.width ||
                c1.pos.y - c1.radius < 0 || c1.pos.y + c1.radius > gl.canvas.height) {
                hasCollision[i] = true;
                continue;
            }

            // check for collision with other circles
            for (let j = i + 1; j < cpy.length; j++) {
                let c2 = cpy[j];
                if (c1.checkIntersection(c2)) {
                    hasCollision[i] = true;
                    hasCollision[j] = true;
                }
            }
        }

        // Update circles
        for (let i = 0; i < this.circles.length; i++) {
            // check for collision, then update radius
            if (hasCollision[i]) {
                // reverse speed growth
                this.circles[i].speed *= -1;
                // play sound
                player.playSound(this.circles[i].radius);
            }
            this.circles[i].radius += this.circles[i].speed;

            // handle degenerate case
            if (this.circles[i].radius < 0) {
                this.circles[i].radius = 0;
                this.circles[i].speed *= -1;
            }
        }
    }

    draw(gl) {
        // Set up vertex buffer
        let vertices = [];
        for (let i = 0; i < this.circles.length; i++) {
            const cur = this.circles[i];
            for (let j = 0; j < this.points; j++) {
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
        for (let i = 0; i < this.circles.length; i++) {
            const cur = this.circles[i];
            const colorLocation = gl.getUniformLocation(program, "color");
            gl.uniform4fv(colorLocation, [cur.color.r, cur.color.g, cur.color.b, 1.0]);
            gl.drawArrays(gl.LINE_LOOP, i * this.points, this.points);
        }
    }
}

class SoundPlayer {
    constructor(height, width) {
        this.SOUNDS = 12;
        this.MAX_RADIUS = Math.min(height, width) / 2;
        this.sounds = ["A", "As", "B", "C", "Cs", "D", "Ds", "E", "F", "Fs", "G", "Gs"];
    }

    quantize(radius) {
        return Math.floor(radius / this.MAX_RADIUS * this.SOUNDS);
    }

    getSoundFile(q) {
        return "notes/" + this.sounds[q] + ".mp3";
    }

    // Given the current radius of a circle which has collided with another circle,
    // quantize it and play the corresponding sound.
    playSound(radius) {
        const q = this.quantize(radius);
        const file = this.getSoundFile(q);
        const audio = new Audio(file);
        audio.play();
    }
}