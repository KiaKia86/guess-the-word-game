// Load words from JSON
let words = [];
fetch('words.json')
  .then(response => response.json())
  .then(data => {
    words = data.words;
    startGame(); // Start the game after words are loaded
  })
  .catch(error => console.error('Error loading words:', error));

let currentWord = {};
let attempts = 0;
let score = 0;
let timer;
const maxAttempts = 5;
const timeLimit = 30; // 30 seconds per guess

// DOM Elements
const hintElement = document.getElementById('hint');
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const restartButton = document.getElementById('restart-button');
const feedbackElement = document.getElementById('feedback');
const attemptsElement = document.getElementById('attempts');
const timerElement = document.getElementById('timer');
const scoreElement = document.getElementById('score');
const difficultySelect = document.getElementById('difficulty');
const correctSound = document.getElementById('correct-sound');
const wrongSound = document.getElementById('wrong-sound');
const timeoutSound = document.getElementById('timeout-sound');

// Start the game
function startGame() {
  const difficulty = difficultySelect.value;
  const filteredWords = words.filter(word => word.difficulty === difficulty);

  if (filteredWords.length === 0) {
    console.error('No words found for the selected difficulty.');
    return;
  }

  currentWord = filteredWords[Math.floor(Math.random() * filteredWords.length)];
  hintElement.textContent = `Hint: ${currentWord.hint}`; // Display the hint
  attempts = 0;
  score = 0;
  updateAttemptsDisplay();
  updateScoreDisplay();
  startTimer();
  guessInput.value = '';
  feedbackElement.textContent = '';
  guessInput.disabled = false;
  submitButton.disabled = false;
}

// Update attempts display
function updateAttemptsDisplay() {
  attemptsElement.textContent = `Attempts: ${attempts}/${maxAttempts}`;
}

// Update score display
function updateScoreDisplay() {
  scoreElement.textContent = `Score: ${score}`;
}

// Start the timer
function startTimer() {
  let timeLeft = timeLimit;
  timerElement.textContent = `Time Left: ${timeLeft}s`;
  clearInterval(timer); // Clear any existing timer
  timer = setInterval(() => {
    timeLeft--;
    timerElement.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
      clearInterval(timer);
      timeoutSound.play();
      feedbackElement.textContent = `Time’s up! The word was "${currentWord.word}".`;
      endGame();
    }
  }, 1000);
}

// End the game
function endGame() {
  guessInput.disabled = true;
  submitButton.disabled = true;
  clearInterval(timer);
}

// Check the guess
submitButton.addEventListener('click', () => {
  const guess = guessInput.value.trim().toLowerCase();
  if (!guess) return;

  attempts++;
  updateAttemptsDisplay();

  if (guess === currentWord.word) {
    correctSound.play();
    feedbackElement.textContent = 'Congratulations! You guessed the word!';
    score += 10;
    updateScoreDisplay();
    endGame();
    setTimeout(startGame, 2000); // Restart game after 2 seconds
  } else {
    wrongSound.play();
    const similarity = calculateSimilarity(guess, currentWord.word);
    if (similarity >= 0.8) {
      feedbackElement.textContent = 'Very close! Getting warmer...';
    } else if (similarity >= 0.5) {
      feedbackElement.textContent = 'Close, but not quite. Warmer...';
    } else {
      feedbackElement.textContent = 'Cold. Try again.';
    }

    if (attempts >= maxAttempts) {
      feedbackElement.textContent = `Out of attempts! The word was "${currentWord.word}".`;
      endGame();
      setTimeout(startGame, 2000); // Restart game after 2 seconds
    }
  }
});

// Restart the game
restartButton.addEventListener('click', () => {
  startGame();
});

// Calculate similarity between two words
function calculateSimilarity(guess, target) {
  const guessLetters = new Set(guess);
  const targetLetters = new Set(target);
  const intersection = new Set([...guessLetters].filter(letter => targetLetters.has(letter)));
  return intersection.size / targetLetters.size;
}

