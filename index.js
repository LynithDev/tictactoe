// Theme
const colors = {
    accent: '#306BAC',
    accent_faded: '#6c9fd5',
    bg: '#040A0F',
    fg: '#F2F2F2',
};

Object.entries(colors).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
});

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext("2d");

let game;

class TicTacToe {
    constructor(size, checks) {
        this.size = size;
        this.checks = checks;

        this.cellSize = 50;
        this.borderSize = 5;

        this.freeCells = size * size;
        this.grid = create2dArray(size, undefined);
        this.turn = "x";

        this.selected = [];
        this.keyboard_focused = false;

    }

    start() {
        document.getElementById("config_screen").classList.add("hidden");
        document.getElementById("game").classList.add("visible");
        this._setTurn("x");

        requestAnimationFrame(this._gameLoop.bind(this));
    }

    _gameLoop(time) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this._draw();

        requestAnimationFrame(this._gameLoop.bind(this));
    }

    placeMarker(x, y, marker) {
        if (x === undefined || y === undefined || marker === undefined) 
            return false;

        // Check if the marker can be placed
        if (this.grid[x][y] !== undefined) 
            return false;

        // Check if marker is valid
        if (marker !== "x" && marker !== "o") 
            return false;

        // Check if x and y are not out of bounds
        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) 
            return false;

        this.grid[x][y] = marker;
        this._setTurn(marker === "x" ? "o" : "x");
        this.freeCells--;
        this._checkWinCondition(x, y, marker);
    }

    _setTurn(marker) {
        this.turn = marker;
        document.getElementById("current-turn").innerText = marker.toUpperCase();
    }

    gameOver(state) {
        document.getElementById("config_screen").classList.remove("hidden");
        document.getElementById("game").classList.remove("visible");

        const message = {
            "tie": "It's a tie!",
            "x": "X won!",
            "o": "O won!"
        }[state];

        if (message) {
            document.getElementById("subheader").innerText = message;
        }
        game = undefined;
    }

    _checkWinCondition(startX, startY, marker) {
        console.log(this.freeCells);
        if (this.freeCells <= 0) {
            this.gameOver("tie");
            return;
        }

        if (startX === undefined || startY === undefined || marker === undefined) 
            return;

        if (startX < 0 || startX > this.size - 1 || startY < 0 || startY > this.size - 1)
            return;

        if (marker !== "x" && marker !== "o") 
            return;

        let win = false;

        // Check horizontal
        let horizontal = 0;
        for (let x = startX; x < this.size; x++) {
            if (this.grid[x][startY] !== marker) {
                break;
            }
            horizontal++;
        }

        for (let x = startX - 1; x >= 0; x--) {
            if (this.grid[x][startY] !== marker) {
                break;
            }
            horizontal++;
        }

        if (horizontal >= this.checks) {
            win = true;
        }

        // Check vertical
        let vertical = 0;
        for (let y = startY; y < this.size; y++) {
            if (this.grid[startX][y] !== marker) {
                break;
            }
            vertical++;
        }

        for (let y = startY - 1; y >= 0; y--) {
            if (this.grid[startX][y] !== marker) {
                break;
            }
            vertical++;
        }

        if (vertical >= this.checks) {
            win = true;
        }

        // Check diagonal
        let diagonal = 0;
        for (let x = startX, y = startY; x < this.size && y < this.size; x++, y++) {
            if (this.grid[x][y] !== marker) {
                break;
            }
            diagonal++;
        }

        for (let x = startX - 1, y = startY - 1; x >= 0 && y >= 0; x--, y--) {
            if (this.grid[x][y] !== marker) {
                break;
            }
            diagonal++;
        }

        if (diagonal >= this.checks) {
            win = true;
        }

        // Check diagonal opposite
        let diagonalOpposite = 0;
        for (let x = startX, y = startY; x >= 0 && y < this.size; x--, y++) {
            if (this.grid[x][y] !== marker) {
                break;
            }
            diagonalOpposite++;
        }

        for (let x = startX + 1, y = startY - 1; x < this.size && y >= 0; x++, y--) {
            if (this.grid[x][y] !== marker) {
                break;
            }
            diagonalOpposite++;
        }

        if (diagonalOpposite >= this.checks) {
            win = true;
        }

        if (win) {
            this.gameOver(marker);
        }
    }

    keydown(e) {
        const keys = {
            "w": [0, -1],
            "a": [-1, 0],
            "s": [0, 1],
            "d": [1, 0],
            "arrowup": [0, -1],
            "arrowleft": [-1, 0],
            "arrowdown": [0, 1],
            "arrowright": [1, 0],
            " ": () => {
                this.placeMarker(this.selected[0], this.selected[1], this.turn)
            }
        };

        const key = keys[e.key.toLowerCase()];
        if (!key) return;

        e.preventDefault();
        this.keyboard_focused = true;

        if (typeof key === "function") {
            key();
            return;
        }

        if (this.selected.length <= 0) {
            this.selected = [0, 0]
        } else {
            this.selected = [
                clamp(this.selected[0] + key[0], 0, this.size - 1),
                clamp(this.selected[1] + key[1], 0, this.size - 1)
            ];
        }
    }

    click(e) {
        this.keyboard_focused = false;
        
        const mouseX = Math.ceil(e.clientX - canvas.getBoundingClientRect().left);
        const mouseY = Math.ceil(e.clientY - canvas.getBoundingClientRect().top);
        
        const x = Math.floor((mouseX - (canvas.getBoundingClientRect().width / 2) + ((this.size * this.cellSize) / 2) + this.borderSize / 2) / this.cellSize);
        const y = Math.floor((mouseY - (canvas.getBoundingClientRect().width / 2) + ((this.size * this.cellSize) / 2) + this.borderSize / 2) / this.cellSize);

        if (x < 0 || x > this.size - 1 || y < 0 || y > this.size - 1) return;

        this.placeMarker(x, y, this.turn);
    }

    _draw() {
        ctx.save();
        ctx.beginPath();

        // Draw from the center of the canvas offset by half the size of the grid
        ctx.translate(
            (canvas.width / 2) - ((this.size * this.cellSize) / 2) - this.borderSize / 2, 
            (canvas.height / 2) - ((this.size * this.cellSize) / 2) - this.borderSize / 2
        );
        
        this._drawGrid();
        this._drawMarkers();

        // Draw the selected cell
        if (this.keyboard_focused && this.selected) {
            ctx.beginPath();
            ctx.strokeStyle = colors.fg;
            ctx.lineWidth = this.borderSize + 1;
            ctx.strokeRect(
                (this.selected[0] * this.cellSize) + (this.borderSize / 2) + 0.1,
                (this.selected[1] * this.cellSize) + (this.borderSize / 2) + 0.1,
                this.cellSize - (this.borderSize / 2),
                this.cellSize - (this.borderSize / 2)
            );
        }

        ctx.restore();
    }

    _drawGrid() {
        // Vertical lines
        for (let x = 0; x < this.size - 1 % this.cellSize; x++) {
            ctx.fillStyle = colors.accent;
            ctx.fillRect(
                (x * this.cellSize) + (this.cellSize) - (this.borderSize / 4),
                this.cellSize - this.cellSize,
                this.borderSize, 
                this.cellSize * (this.size)
            );
        }

        // Horizontal lines
        for (let y = 0; y < this.size - 1 % this.cellSize; y++) {
            ctx.fillStyle = colors.accent;
            ctx.fillRect(
                this.cellSize - this.cellSize,
                (y * this.cellSize) + (this.cellSize) - (this.borderSize / 4),
                this.cellSize * (this.size), 
                this.borderSize
            );
        }
    }

    _drawMarkers() {
        for (let x = 0; x < this.size; x++) {
            for (let y = 0; y < this.size; y++) {
                const marker = this.grid[x][y];
                if (marker === undefined) continue;

                switch(marker) {
                    case "x": {
                        const width = this.cellSize / 2;
                        const height = this.cellSize / 2;
                        
                        ctx.strokeStyle = colors.fg;
                        ctx.lineWidth = 5;

                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(
                            (x * this.cellSize) + (this.cellSize / 2) - (width / 2) + (this.borderSize / 2),
                            (y * this.cellSize) + (this.cellSize / 2) - (height / 2) + (this.borderSize / 2)
                        );
                        ctx.lineTo(
                            (x * this.cellSize) + (this.cellSize / 2) + (width / 2) + (this.borderSize / 2),
                            (y * this.cellSize) + (this.cellSize / 2) + (height / 2) + (this.borderSize / 2)
                        );
                        ctx.stroke();

                        ctx.beginPath();
                        ctx.moveTo(
                            (x * this.cellSize) + (this.cellSize / 2) + (width / 2) + (this.borderSize / 2),
                            (y * this.cellSize) + (this.cellSize / 2) - (height / 2) + (this.borderSize / 2)
                        );
                        ctx.lineTo(
                            (x * this.cellSize) + (this.cellSize / 2) - (width / 2) + (this.borderSize / 2),
                            (y * this.cellSize) + (this.cellSize / 2) + (height / 2) + (this.borderSize / 2)
                        );
                        ctx.stroke();
                        ctx.restore();
                        break;
                    }
                    case "o": {
                        const radius = this.cellSize / 4;
                        ctx.strokeStyle = colors.fg;
                        ctx.lineWidth = 5;
                        
                        ctx.beginPath();
                        ctx.arc(
                            (x * this.cellSize) + (this.cellSize / 2) + (this.borderSize / 2) - 1,
                            (y * this.cellSize) + (this.cellSize / 2) + (this.borderSize / 2),
                            radius,
                            0,
                            toRadians(360)
                        );
                        ctx.stroke();
                        break;
                    
                    }
                }
            }
        }
    }
}

// Events
document.getElementById("start").addEventListener("click", () => {
    const size = parseInt(document.getElementById("size").value) || 3;
    const checks = parseInt(document.getElementById("checks").value) || 3;

    if (size < 3 || size > 10) {
        setErrorMessage("Size must be between 3 and 10");
        return;
    }

    if (checks < 3 || checks > size) {
        setErrorMessage("Checks must be between 3 and the size");
        return;
    }

    setErrorMessage("");

    game = new TicTacToe(size, checks);
    game.start();
});

canvas.addEventListener("click", (e) => {
    if (game) {
        game.click(e);
    }
});

window.addEventListener("keydown", (e) => {
    if (game && !e.repeat) {
        game.keydown(e);
    }
});

window.addEventListener("load", () => {
    document.body.classList.remove("notransitions");
});

document.getElementById("back_btn").addEventListener("click", () => {
    if (game) {
        game.gameOver();
    }
});

// #################
// ###   Utils   ###
// #################
function setErrorMessage(message) {
    document.getElementById("error_message").innerText = message;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function create2dArray(size, defaultValue) {
    const arr = [];
    for (let i = 0; i < size; i++) {
        arr.push([]);
        for (let j = 0; j < size; j++) {
            arr[i][j] = defaultValue;
        }
    }
    return arr;
}
