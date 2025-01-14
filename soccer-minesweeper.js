/* eslint-disable no-unused-vars */
/*
  Enhanced Soccer-Themed Minesweeper
  -----------------------------------
  Combines features from Microsoft Minesweeper (timer, best times, etc.)
  and new analytics (wins, losses, difficulty modes, optional hints, etc.)
*/

let rows = 8;
let cols = 8;
let mineCount = 10;
let extraLife = true;
let usedExtraLife = false;
let maxHints = 3;
let hintsUsed = 0;

let gameOver = false;
let board = [];
let wins = 0;
let losses = 0;
let gamesPlayed = 0;
let timerInterval = null;
let startTime = 0;

const bestTimes = {
  beginner: Infinity,
  intermediate: Infinity,
  expert: Infinity,
};

const difficulties = {
  beginner:     { rows: 8,  cols: 8,  mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert:       { rows: 24, cols: 24, mines: 99 },
};

window.onload = () => {
  initGame();
};

function initGame() {
  clearInterval(timerInterval);
  startTime = Date.now();
  startTimer();

  gameOver = false;
  usedExtraLife = false;
  hintsUsed = 0;
  board = [];

  const gameContainer = document.getElementById('game');
  gameContainer.innerHTML = '';

  // create board data
  for (let r = 0; r < rows; r++) {
    board[r] = [];
    for (let c = 0; c < cols; c++) {
      board[r][c] = {
        mine: false,
        revealed: false,
        flagged: false,
        adjacentMines: 0,
        row: r,
        col: c,
      };
    }
  }

  // place mines
  let minesPlaced = 0;
  while (minesPlaced < mineCount) {
    const randR = Math.floor(Math.random() * rows);
    const randC = Math.floor(Math.random() * cols);
    if (!board[randR][randC].mine) {
      board[randR][randC].mine = true;
      minesPlaced++;
    }
  }

  // calc adjacent
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine) {
        let adjacent = 0;
        for (let rr = -1; rr <= 1; rr++) {
          for (let cc = -1; cc <= 1; cc++) {
            const nr = r + rr;
            const nc = c + cc;
            if (
              nr >= 0 &&
              nr < rows &&
              nc >= 0 &&
              nc < cols &&
              board[nr][nc].mine
            ) {
              adjacent++;
            }
          }
        }
        board[r][c].adjacentMines = adjacent;
      }
    }
  }

  // render
  for (let r = 0; r < rows; r++) {
    const rowDiv = document.createElement('div');
    rowDiv.style.display = 'flex';
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.setAttribute('data-row', r);
      cell.setAttribute('data-col', c);

      cell.addEventListener('click', handleCellClick);
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameOver) return;
        toggleFlag(r, c);
      });

      rowDiv.appendChild(cell);
    }
    gameContainer.appendChild(rowDiv);
  }

  revealInitialSafeSquares(5);
  updateScore();
  gamesPlayed++;
  updateStatsDisplay();
  // reset hint button text
  document.getElementById('hint-button').textContent = `Use Hint (${maxHints - hintsUsed} left)`;
}

function handleCellClick(e) {
  if (gameOver) return;
  const row = parseInt(e.target.getAttribute('data-row'));
  const col = parseInt(e.target.getAttribute('data-col'));
  revealCellWithDelay(row, col);
}

function toggleFlag(r, c) {
  const cellData = board[r][c];
  const cellDiv = getCellDiv(r, c);
  if (cellData.revealed) return;

  cellData.flagged = !cellData.flagged;
  if (cellData.flagged) {
    cellDiv.classList.add('flagged');
    cellDiv.textContent = '⚑';
  } else {
    cellDiv.classList.remove('flagged');
    cellDiv.textContent = '';
  }
}

function revealCellWithDelay(r, c) {
  const cellData = board[r][c];
  const cellDiv = getCellDiv(r, c);
  if (cellData.flagged || cellData.revealed) return;

  cellData.revealed = true;
  cellDiv.classList.add('revealed');

  if (cellData.mine) {
    if (extraLife && !usedExtraLife) {
      usedExtraLife = true;
      cellDiv.textContent = '⚽ (Life Used!)';
      cellDiv.classList.add('mine');
      setTimeout(() => {
        cellDiv.textContent = '';
        cellDiv.classList.remove('mine');
        cellDiv.classList.remove('revealed');
        cellData.revealed = false;
      }, 1200);
      return;
    }
    // game over
    cellDiv.textContent = '⚽';
    cellDiv.classList.add('mine');
    losses++;
    gameOver = true;
    alert('Game Over! You clicked on a soccer ball!');
    revealAllMines();
    updateScore();
    stopTimer();
    return;
  } else if (cellData.adjacentMines > 0) {
    cellDiv.textContent = cellData.adjacentMines;
  } else {
    // reveal neighbors
    for (let rr = -1; rr <= 1; rr++) {
      for (let cc = -1; cc <= 1; cc++) {
        const nr = r + rr;
        const nc = c + cc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          setTimeout(() => revealCellWithDelay(nr, nc), 100);
        }
      }
    }
  }

  // check win
  if (checkWinCondition()) {
    wins++;
    gameOver = true;
    revealAllMines();
    stopTimer();
    alert('Congratulations! You win!');
    updateScore();
  }
}

function revealAllMines() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].mine) {
        const cellDiv = getCellDiv(r, c);
        cellDiv.textContent = '⚽';
        cellDiv.classList.add('mine');
      }
    }
  }
}

function revealInitialSafeSquares(count) {
  let revealed = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!board[r][c].mine && !board[r][c].revealed && revealed < count) {
        revealCellWithDelay(r, c);
        revealed++;
      }
    }
  }
}

function checkWinCondition() {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cellData = board[r][c];
      if (!cellData.mine && !cellData.revealed) {
        return false;
      }
    }
  }
  return true;
}

function getCellDiv(r, c) {
  return document.querySelector(`[data-row='${r}'][data-col='${c}']`);
}

function updateScore() {
  const scoreElement = document.getElementById('score');
  if (!scoreElement) return;
  scoreElement.textContent = `Wins: ${wins} | Losses: ${losses}`;
}

// timer
function startTimer() {
  const timerEl = document.getElementById('timer');
  if (!timerEl) return;

  timerEl.textContent = '0';
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    timerEl.textContent = elapsed.toString();
  }, 1000);
}
function stopTimer() {
  clearInterval(timerInterval);
}

// Stats
function updateStatsDisplay() {
  const statsEl = document.getElementById('stats');
  if (!statsEl) return;

  statsEl.innerHTML = `
    <h3>Game Stats</h3>
    <p>Games Played: ${gamesPlayed}</p>
    <p>Hints Used: ${hintsUsed}/${maxHints}</p>
  `;
}

// difficulty
function setDifficulty(level) {
  if(!difficulties[level]) return;
  rows = difficulties[level].rows;
  cols = difficulties[level].cols;
  mineCount = difficulties[level].mines;
  initGame();
}

function useHint() {
  if(hintsUsed >= maxHints || gameOver) return;

  let candidates = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      if(!cell.mine && !cell.revealed && !cell.flagged) {
        candidates.push({ r, c });
      }
    }
  }
  if(candidates.length === 0) return;

  const randIndex = Math.floor(Math.random() * candidates.length);
  const { r, c } = candidates[randIndex];
  revealCellWithDelay(r, c);

  hintsUsed++;
  document.getElementById('hint-button').textContent = `Use Hint (${maxHints - hintsUsed} left)`;
  updateStatsDisplay();
}

// Initialize game on page load
window.onload = () => {
    initGame();
};

