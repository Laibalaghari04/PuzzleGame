let puzzle = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 0],
];

let solutionSteps = 0;
let autoPlayInterval = null;

const statusEl = document.getElementById('status');
const nextBtn = document.getElementById('nextBtn');
const autoBtn = document.getElementById('autoBtn');

function renderPuzzle() {
  const tiles = document.querySelectorAll('button.tile');
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      const val = puzzle[i][j];
      const tile = tiles[i * 3 + j];
      tile.textContent = val === 0 ? '' : val;
      tile.classList.toggle('empty', val === 0);
    }
  }
}

function swapTiles(r1, c1, r2, c2) {
  const temp = puzzle[r1][c1];
  puzzle[r1][c1] = puzzle[r2][c2];
  puzzle[r2][c2] = temp;
}

function findBlank() {
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      if (puzzle[i][j] === 0) return [i, j];
}

function canMove(r1, c1, r2, c2) {
  return (
    (r1 === r2 && Math.abs(c1 - c2) === 1) ||
    (c1 === c2 && Math.abs(r1 - r2) === 1)
  );
}

function shufflePuzzle() {
  // Do 100 random valid moves
  for (let k = 0; k < 100; k++) {
    let [br, bc] = findBlank();
    let moves = [];
    if (br > 0) moves.push([br - 1, bc]);
    if (br < 2) moves.push([br + 1, bc]);
    if (bc > 0) moves.push([br, bc - 1]);
    if (bc < 2) moves.push([br, bc + 1]);
    let [nr, nc] = moves[Math.floor(Math.random() * moves.length)];
    swapTiles(br, bc, nr, nc);
  }
  renderPuzzle();
  statusEl.textContent = 'Puzzle shuffled.';
  nextBtn.disabled = true;
  autoBtn.disabled = true;
  stopAutoPlay();
  resetSolution();
}

function resetSolution() {
  solutionSteps = 0;
}

function tileClicked(e) {
  if (autoPlayInterval) return; // Disable manual moves during autoplay
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  let [br, bc] = findBlank();

  if (canMove(row, col, br, bc)) {
    swapTiles(row, col, br, bc);
    renderPuzzle();
    statusEl.textContent = '';
  }
}

async function solvePuzzle() {
  statusEl.textContent = 'Solving...';
  stopAutoPlay();

  const response = await fetch('/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ state: puzzle }),
  });
  const data = await response.json();

  if (response.ok) {
    solutionSteps = data.steps;
    statusEl.textContent = `Solution found with ${solutionSteps} steps. Use Next Step or Auto Play.`;
    nextBtn.disabled = false;
    autoBtn.disabled = false;
  } else {
    statusEl.textContent = data.error || 'Error solving puzzle.';
  }
}

async function nextStep() {
  const response = await fetch('/next');
  const data = await response.json();

  if (data.done) {
    statusEl.textContent = 'Solution completed!';
    nextBtn.disabled = true;
    autoBtn.disabled = true;
    stopAutoPlay();
  } else {
    puzzle = data.state;
    renderPuzzle();
    statusEl.textContent = `Step ${solutionSteps - (solutionSteps - (solutionSteps - 1))} of ${solutionSteps}`;
  }
}

function stopAutoPlay() {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval);
    autoPlayInterval = null;
  }
}

function autoPlay() {
  stopAutoPlay();
  nextBtn.disabled = true;
  autoBtn.disabled = true;

  autoPlayInterval = setInterval(async () => {
    const response = await fetch('/next');
    const data = await response.json();

    if (data.done) {
      statusEl.textContent = 'Solution completed!';
      nextBtn.disabled = true;
      autoBtn.disabled = true;
      stopAutoPlay();
    } else {
      puzzle = data.state;
      renderPuzzle();
    }
  }, 700);
}

function resetPuzzle() {
  stopAutoPlay();
  puzzle = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 0],
  ];
  renderPuzzle();
  statusEl.textContent = 'Puzzle reset.';
  nextBtn.disabled = true;
  autoBtn.disabled = true;
  fetch('/reset', { method: 'POST' });
  resetSolution();
}

document.getElementById('shuffleBtn').addEventListener('click', shufflePuzzle);
document.getElementById('solveBtn').addEventListener('click', solvePuzzle);
nextBtn.addEventListener('click', nextStep);
autoBtn.addEventListener('click', autoPlay);
document.getElementById('resetBtn').addEventListener('click', resetPuzzle);

document.querySelectorAll('button.tile').forEach((btn) =>
  btn.addEventListener('click', tileClicked)
);

// Initial render
renderPuzzle();
