const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const playerScoreDisplay = document.getElementById("playerScore");
const computerScoreDisplay = document.getElementById("computerScore");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

// Game Variables
let gameRunning = false;
let playerScore = 0;
let computerScore = 0;

// Paddle Properties
const paddleWidth = 10;
const paddleHeight = 80;
const paddleSpeed = 6;

// Player Paddle (Left)
const playerPaddle = {
    x: 15,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Computer Paddle (Right)
const computerPaddle = {
    x: canvas.width - 25,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0
};

// Ball Properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    dx: 5,
    dy: 5,
    speed: 5
};

// Keyboard state
const keys = {};

// Event Listeners
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// Mouse movement for player paddle
canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    
    // Smooth paddle movement with mouse
    const targetY = mouseY - playerPaddle.height / 2;
    playerPaddle.y = Math.max(0, Math.min(canvas.height - playerPaddle.height, targetY));
});

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

function startGame() {
    gameRunning = true;
    startBtn.disabled = true;
    resetBtn.disabled = false;
    gameLoop();
}

function resetGame() {
    gameRunning = false;
    playerScore = 0;
    computerScore = 0;
    playerScoreDisplay.textContent = playerScore;
    computerScoreDisplay.textContent = computerScore;
    resetBall();
    startBtn.disabled = false;
    resetBtn.disabled = true;
    draw();
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * ball.speed;
    ball.dy = (Math.random() - 0.5) * ball.speed * 2;
}

function update() {
    if (!gameRunning) return;

    // Player Paddle Control with Arrow Keys
    if (keys["ArrowUp"]) {
        playerPaddle.y = Math.max(0, playerPaddle.y - paddleSpeed);
    }
    if (keys["ArrowDown"]) {
        playerPaddle.y = Math.min(canvas.height - playerPaddle.height, playerPaddle.y + paddleSpeed);
    }

    // Computer AI
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const ballCenter = ball.y;
    const difficulty = 4; // AI speed

    if (computerCenter < ballCenter - 35) {
        computerPaddle.y = Math.min(canvas.height - computerPaddle.height, computerPaddle.y + difficulty);
    } else if (computerCenter > ballCenter + 35) {
        computerPaddle.y = Math.max(0, computerPaddle.y - difficulty);
    }

    // Ball Movement
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.dx = Math.abs(ball.dx);
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (playerPaddle.y + playerPaddle.height / 2)) / (playerPaddle.height / 2);
        ball.dy += hitPos * 2;
        
        // Increase ball speed slightly
        ball.speed = Math.min(8, ball.speed + 0.1);
        ball.dx = ball.speed * (Math.random() > 0.5 ? 1 : 0.8);
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.dx = -Math.abs(ball.dx);
        ball.x = computerPaddle.x - ball.radius;
        
        // Add spin based on where ball hits paddle
        const hitPos = (ball.y - (computerPaddle.y + computerPaddle.height / 2)) / (computerPaddle.height / 2);
        ball.dy += hitPos * 2;
        
        // Increase ball speed slightly
        ball.speed = Math.min(8, ball.speed + 0.1);
        ball.dx = -ball.speed * (Math.random() > 0.5 ? 1 : 0.8);
    }

    // Scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        computerScoreDisplay.textContent = computerScore;
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        playerScoreDisplay.textContent = playerScore;
        resetBall();
    }
}

function draw() {
    // Clear canvas
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = "#444";
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#00ff88";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#00ff88";
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);
    ctx.shadowBlur = 0;

    // Draw ball
    ctx.fillStyle = "#ffaa00";
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ffaa00";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw game status
    if (!gameRunning && playerScore === 0 && computerScore === 0) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Press 'Start Game' to begin", canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    update();
    draw();

    if (gameRunning) {
        requestAnimationFrame(gameLoop);
    }
}

// Initial draw
draw();
