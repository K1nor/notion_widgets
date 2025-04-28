// Загрузка сохранённых или дефолтных длительностей (минуты)
let workDurationMin  = parseInt(localStorage.getItem('workDuration'))  || 25;
let breakDurationMin = parseInt(localStorage.getItem('breakDuration')) || 5;

// Переводим в секунды
let WORK_DURATION  = workDurationMin  * 60;
let BREAK_DURATION = breakDurationMin * 60;

let timeLeft    = WORK_DURATION;
let isRunning   = false;
let isWorkPhase = true;
let timerInterval;

// Элементы интерфейса
const minutesEl   = document.getElementById('minutes');
const secondsEl   = document.getElementById('seconds');
const timerEl     = document.querySelector('.timer');
const progressBar = document.getElementById('progress-bar');
const btn         = document.getElementById('start-pause');
const settingsBtn = document.getElementById('settings-btn');
const resetBtn    = document.getElementById('reset-btn');
const modal       = document.getElementById('settings-modal');
const workInput   = document.getElementById('work-minutes-input');
const breakInput  = document.getElementById('break-minutes-input');
const saveBtn     = document.getElementById('save-settings-btn');
const cancelBtn   = document.getElementById('cancel-settings-btn');

function updateProgress() {
  const total   = isWorkPhase ? WORK_DURATION : BREAK_DURATION;
  const elapsed = total - timeLeft;
  const pct     = (elapsed / total) * 100;
  progressBar.style.width = pct + '%';
}

function updateDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  minutesEl.textContent = String(m).padStart(2, '0');
  secondsEl.textContent = String(s).padStart(2, '0');
  updateProgress();
}

function applyPhaseClasses() {
  // Для таймера
  timerEl.classList.remove('work', 'break');
  timerEl.classList.add(isWorkPhase ? 'work' : 'break');
  // Для прогресс-бара
  progressBar.classList.remove('work', 'break');
  progressBar.classList.add(isWorkPhase ? 'work' : 'break');
}

function switchPhase() {
  clearInterval(timerInterval);
  timerEl.classList.remove('paused');
  progressBar.classList.remove('paused');
  if (isWorkPhase) {
    isWorkPhase = false;
    timeLeft    = BREAK_DURATION;
    startTimer();
  } else {
    isWorkPhase = true;
    timeLeft    = WORK_DURATION;
    isRunning   = false;
    btn.innerHTML = '<i class="fas fa-play"></i>';
    btn.classList.remove('paused');
    timerEl.classList.remove('work','break','paused');
    progressBar.classList.remove('work','break','paused');
    updateDisplay();
  }
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
  } else {
    switchPhase();
  }
}

function startTimer() {
  isRunning = true;
  applyPhaseClasses();
  timerEl.classList.remove('paused');
  progressBar.classList.remove('paused');
  btn.innerHTML = '<i class="fas fa-pause"></i>';
  btn.classList.add('paused');
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  isRunning = false;
  btn.innerHTML = '<i class="fas fa-play"></i>';
  btn.classList.remove('paused');
  clearInterval(timerInterval);
  timerEl.classList.add('paused');
  progressBar.classList.add('paused');
}

function resetTimer() {
  pauseTimer();
  isWorkPhase = true;
  timeLeft    = WORK_DURATION;
  btn.innerHTML = '<i class="fas fa-play"></i>';
  btn.classList.remove('paused');
  timerEl.classList.remove('work','break','paused');
  progressBar.classList.remove('work','break','paused');
  progressBar.style.width = '0%';
  updateDisplay();
}

// Открытие/закрытие модального окна
function openSettings() {
  workInput.value  = workDurationMin;
  breakInput.value = breakDurationMin;
  modal.style.display = 'flex';
}
function closeSettings() {
  modal.style.display = 'none';
}
function saveSettings() {
  const w = parseInt(workInput.value, 10);
  const b = parseInt(breakInput.value, 10);
  if (w > 0 && b > 0) {
    workDurationMin  = w;
    breakDurationMin = b;
    localStorage.setItem('workDuration', w);
    localStorage.setItem('breakDuration', b);
    WORK_DURATION  = workDurationMin  * 60;
    BREAK_DURATION = breakDurationMin * 60;
    resetTimer();
  }
  closeSettings();
}

// Слушатели
btn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
settingsBtn.addEventListener('click', openSettings);
resetBtn.addEventListener('click', resetTimer);
saveBtn.addEventListener('click', saveSettings);
cancelBtn.addEventListener('click', closeSettings);
modal.addEventListener('click', e => { if (e.target === modal) closeSettings(); });

// Инициализация
updateDisplay();
