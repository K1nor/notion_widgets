// ——————————————
// ДИНАМИЧЕСКИЕ ЧАСЫ
// ——————————————

function pad2(n){ return n.toString().padStart(2,'0'); }

function updateDateTime() {
  const now = new Date();
  const h = pad2(now.getHours()), m = pad2(now.getMinutes()), s = pad2(now.getSeconds());
  document.getElementById('dt-time').textContent = `${h}:${m}:${s}`;

  const day = pad2(now.getDate()), month = pad2(now.getMonth()+1), year = now.getFullYear();
  document.getElementById('dt-date').textContent = `${day}.${month}.${year}`;

  const weekdays = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
  document.getElementById('dt-weekday').textContent = weekdays[now.getDay()];
}

setInterval(updateDateTime, 1000);
updateDateTime();


// ——————————————
// JS ПОМОДОРО
// ——————————————

let workDurationMin  = parseInt(localStorage.getItem('workDuration'))  || 25;
let breakDurationMin = parseInt(localStorage.getItem('breakDuration')) || 5;
let WORK_DURATION  = workDurationMin*60;
let BREAK_DURATION = breakDurationMin*60;
let timeLeft    = WORK_DURATION;
let isRunning   = false;
let isWorkPhase = true;
let timerInterval;

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
  const pct     = ((total - timeLeft) / total) * 100;
  progressBar.style.width = pct + '%';
}

function updateDisplay() {
  const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
  minutesEl.textContent = pad2(m);
  secondsEl.textContent = pad2(s);
  updateProgress();
}

function applyPhaseClasses() {
  timerEl.classList.remove('work','break');
  progressBar.classList.remove('work','break');
  timerEl.classList.add(isWorkPhase ? 'work' : 'break');
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

settingsBtn.addEventListener('click', () => modal.style.display = 'flex');
resetBtn.addEventListener('click', resetTimer);
btn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
saveBtn.addEventListener('click', () => {
  const w = parseInt(workInput.value, 10), b = parseInt(breakInput.value, 10);
  if (w > 0 && b > 0) {
    workDurationMin = w;
    breakDurationMin = b;
    localStorage.setItem('workDuration', w);
    localStorage.setItem('breakDuration', b);
    WORK_DURATION = w * 60;
    BREAK_DURATION = b * 60;
    resetTimer();
  }
  modal.style.display = 'none';
});
cancelBtn.addEventListener('click', () => modal.style.display = 'none');
modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

// Инициализация
updateDisplay();
