// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Paddle properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Ball properties
const ballSize = 8;
const ballSpeedInitial = 5;

// Game objects
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

let ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: ballSpeedInitial,
    dy: ballSpeedInitial,
    size: ballSize,
    speed: ballSpeedInitial
};

// Game state
let gameRunning = true;
let keys = {};
let mouseY = 0;

// Event listeners
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key.toLowerCase() === 'r') {
        resetGame();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

// Initialize game
function init() {
    gameRunning = true;
    resetBall();
    gameLoop();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ballSpeedInitial;
    ball.dy = (Math.random() - 0.5) * ballSpeedInitial * 2;
}

// Reset entire game
function resetGame() {
    player.score = 0;
    computer.score = 0;
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    resetBall();
    updateScore();
}

// Update player paddle
function updatePlayer() {
    // Arrow keys or mouse movement
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.y -= paddleSpeed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.y += paddleSpeed;
    }

    // Mouse control - move paddle to mouse Y position
    if (mouseY) {
        const paddleCenter = player.y + paddleHeight / 2;
        const diff = mouseY - paddleCenter;
        if (Math.abs(diff) > paddleSpeed) {
            player.y += diff > 0 ? paddleSpeed : -paddleSpeed;
        }
    }

    // Boundary checking
    if (player.y < 0) player.y = 0;
    if (player.y + paddleHeight > canvas.height) {
        player.y = canvas.height - paddleHeight;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + paddleHeight / 2;
    const ballCenter = ball.y;
    const aiSpeed = 4;
    const reactionZone = 50;

    // Simple AI: follow ball with slight delay
    if (ballCenter < computerCenter - reactionZone) {
        computer.y -= aiSpeed;
    } else if (ballCenter > computerCenter + reactionZone) {
        computer.y += aiSpeed;
    }

    // Boundary checking
    if (computer.y < 0) computer.y = 0;
    if (computer.y + paddleHeight > canvas.height) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Player paddle collision
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (player.y + player.height / 2);
        ball.dy = (collidePoint / (player.height / 2)) * ball.speed;
    }

    // Computer paddle collision
    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computer.y + computer.height / 2);
        ball.dy = (collidePoint / (computer.height / 2)) * ball.speed;
    }

    // Scoring - ball out of bounds
    if (ball.x < 0) {
        computer.score++;
        updateScore();
        resetBall();
    } else if (ball.x > canvas.width) {
        player.score++;
        updateScore();
        resetBall();
    }
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = player.score;
    document.getElementById('computerScore').textContent = computer.score;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#667eea';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size + 3, 0, Math.PI * 2);
    ctx.stroke();
}

function drawCenterLine() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawGame() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    drawCenterLine();

    // Draw paddles and ball
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();
}

// Main game loop
function gameLoop() {
    updatePlayer();
    updateComputer();
    updateBall();
    drawGame();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Start the game
init();
