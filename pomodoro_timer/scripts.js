function pad2(n) { return n.toString().padStart(2,'0'); }

function scheduleClock() {
  const now = new Date();
  updateDateTime();
  const delay = 1000 - now.getMilliseconds();
  setTimeout(() => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
  }, delay);
}
function updateDateTime() {
  const now = new Date();
  document.getElementById('dt-time').textContent =
    `${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`;
  const day  = pad2(now.getDate()),
        mon  = pad2(now.getMonth()+1),
        yr   = now.getFullYear();
  const weekdays = [
    'Воскресенье',
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота'
  ];
  document.getElementById('dt-daydate').textContent =
    `${weekdays[now.getDay()]} | ${day}.${mon}.${yr}`;
}
scheduleClock();

let workDurationMin   = parseInt(localStorage.getItem('workDuration'))  || 25,
    breakDurationMin  = parseInt(localStorage.getItem('breakDuration')) || 5,
    timerSoundEnabled = localStorage.getItem('timerSound') === 'true',
    btnSoundEnabled   = localStorage.getItem('btnSound')   === 'true',
    timerVolume       = parseFloat(localStorage.getItem('timerVolume')) || 1,
    btnVolume         = parseFloat(localStorage.getItem('btnVolume'))   || 1,
    loopEnabled       = localStorage.getItem('loopEnabled') === 'true',
    savedCycles       = localStorage.getItem('cycleCount') || '',
    syncEnabled       = localStorage.getItem('syncEnabled') === 'true';

let WORK_DURATION  = workDurationMin * 60,
    BREAK_DURATION = breakDurationMin * 60,
    timeLeft       = WORK_DURATION,
    isRunning      = false,
    isWorkPhase    = true,
    timerInterval, initialTimeout,
    hasStarted     = false,
    cyclesLeft     = 1,
    totalCycles    = 0;

const minutesEl       = document.getElementById('minutes'),
      secondsEl       = document.getElementById('seconds'),
      timerEl         = document.querySelector('.timer'),
      timerBlock      = document.querySelector('.timer-block'),
      cycleLabel      = document.getElementById('cycle-label'),
      skipBtn         = document.getElementById('skip-btn'),
      progressBar     = document.getElementById('progress-bar'),
      btn             = document.getElementById('start-pause'),
      settingsBtn     = document.getElementById('settings-btn'),
      resetBtn        = document.getElementById('reset-btn'),
      modal           = document.getElementById('settings-modal'),
      workInput       = document.getElementById('work-minutes-input'),
      breakInput      = document.getElementById('break-minutes-input'),
      loopCheckbox    = document.getElementById('loop-checkbox'),
      cycleCountInput = document.getElementById('cycle-count-input'),
      syncCheckbox    = document.getElementById('sync-checkbox'),
      saveBtn         = document.getElementById('save-settings-btn'),
      cancelBtn       = document.getElementById('cancel-settings-btn'),
      startSound      = document.getElementById('start-sound'),
      endSound        = document.getElementById('end-sound'),
      btnSound        = document.getElementById('btn-sound'),
      timerCheckbox   = document.getElementById('timer-sound-checkbox'),
      btnCheckbox     = document.getElementById('btn-sound-checkbox'),
      timerSlider     = document.getElementById('timer-volume'),
      btnSlider       = document.getElementById('btn-volume');

function initSettings() {
  workInput.value       = workDurationMin;
  breakInput.value      = breakDurationMin;
  timerCheckbox.checked = timerSoundEnabled;
  btnCheckbox.checked   = btnSoundEnabled;
  timerSlider.value     = timerVolume;
  btnSlider.value       = btnVolume;
  loopCheckbox.checked  = loopEnabled;
  cycleCountInput.value = savedCycles;
  syncCheckbox.checked  = syncEnabled;
  startSound.volume = endSound.volume = timerVolume;
  btnSound.volume   = btnVolume;
}
initSettings();

function updateCycleLabel() {
  if (loopCheckbox.checked) {
    if (totalCycles === Infinity) {
      cycleLabel.innerHTML = '<i class="fas fa-infinity"></i>';
    } else {
      const current = totalCycles - cyclesLeft + 1;
      cycleLabel.textContent = `${current}/${totalCycles}`;
    }
  } else {
    cycleLabel.textContent = '';
  }
}

function initCycles() {
  if (loopCheckbox.checked) {
    if (cycleCountInput.value) {
      totalCycles = parseInt(cycleCountInput.value, 10);
      cyclesLeft = totalCycles;
    } else {
      totalCycles = Infinity;
      cyclesLeft = Infinity;
    }
  } else {
    totalCycles = 0;
    cyclesLeft = 1;
  }
  updateCycleLabel();
  skipBtn.disabled = true;
}
initCycles();

function updateProgress() {
  const total = isWorkPhase ? WORK_DURATION : BREAK_DURATION;
  progressBar.style.width = ((total - timeLeft) / total) * 100 + '%';
}

function updateDisplay() {
  const m = Math.floor(timeLeft / 60),
        s = timeLeft % 60;
  minutesEl.textContent = pad2(m);
  secondsEl.textContent = pad2(s);
  updateProgress();
}

function applyPhaseClasses() {
  timerEl.classList.toggle('work', isWorkPhase);
  timerEl.classList.toggle('break', !isWorkPhase);
  progressBar.classList.toggle('work', isWorkPhase);
  progressBar.classList.toggle('break', !isWorkPhase);
}

function switchPhase(playEndSound = true) {
  clearInterval(timerInterval);
  clearTimeout(initialTimeout);
  timerEl.classList.remove('paused');
  progressBar.classList.remove('paused');
  if (playEndSound && timerCheckbox.checked) {
    endSound.currentTime = 0;
    endSound.play();
  }
  if (isWorkPhase) {
    isWorkPhase = false;
    timeLeft = BREAK_DURATION;
    startTimer();
  } else {
    cyclesLeft = (cyclesLeft === Infinity ? Infinity : cyclesLeft - 1);
    if (cyclesLeft > 0) {
      isWorkPhase = true;
      timeLeft = WORK_DURATION;
      startTimer();
    } else {
      isWorkPhase = true;
      timeLeft = WORK_DURATION;
      isRunning = false;
      cyclesLeft = totalCycles || 1;
      btn.innerHTML = '<i class="fas fa-play"></i>';
      btn.classList.remove('paused');
      timerEl.classList.remove('work','break','paused');
      progressBar.classList.remove('work','break','paused');
      updateDisplay();
    }
  }
  updateCycleLabel();
  skipBtn.disabled = !isRunning || cyclesLeft === 0;
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

  if (!hasStarted) {
    if (timerCheckbox.checked) {
      startSound.currentTime = 0;
      startSound.play();
    }
    hasStarted = true;
  } else if (btnCheckbox.checked) {
    btnSound.currentTime = 0;
    btnSound.play();
  }

  const begin = () => {
    tick();
    timerInterval = setInterval(tick, 1000);
  };
  if (syncCheckbox.checked) {
    const now = Date.now();
    const delay = 1000 - (now % 1000);
    initialTimeout = setTimeout(begin, delay);
  } else {
    begin();
  }

  skipBtn.disabled = cyclesLeft === 0;
}

function pauseTimer() {
  isRunning = false;
  btn.innerHTML = '<i class="fas fa-play"></i>';
  btn.classList.remove('paused');
  clearInterval(timerInterval);
  clearTimeout(initialTimeout);
  timerEl.classList.add('paused');
  progressBar.classList.add('paused');
  skipBtn.disabled = true;
}

function resetTimer() {
  pauseTimer();
  isWorkPhase = true;
  timeLeft = WORK_DURATION;
  hasStarted = false;
  initCycles();
  btn.innerHTML = '<i class="fas fa-play"></i>';
  btn.classList.remove('paused');
  timerEl.classList.remove('work','break','paused');
  progressBar.classList.remove('work','break','paused');
  progressBar.style.width = '0%';
  updateDisplay();
}

timerBlock.addEventListener('click', () => {
  if (isRunning) pauseTimer();
  else          startTimer();
});
btn.addEventListener('click', () => {
  if (isRunning) pauseTimer();
  else          startTimer();
});
skipBtn.addEventListener('click', () => {
  skipBtn.disabled = true;
  switchPhase(false);
});
settingsBtn.addEventListener('click', () => {
  if (btnCheckbox.checked) { btnSound.currentTime = 0; btnSound.play(); }
  initCycles(); modal.style.display = 'flex';
});
resetBtn.addEventListener('click', () => {
  if (btnCheckbox.checked) { btnSound.currentTime = 0; btnSound.play(); }
  resetTimer();
});
saveBtn.addEventListener('click', () => {
  if (btnCheckbox.checked) { btnSound.currentTime = 0; btnSound.play(); }
  const w = parseInt(workInput.value,10), b = parseInt(breakInput.value,10);
  if (w>0 && b>0) {
    workDurationMin  = w; breakDurationMin = b;
    localStorage.setItem('workDuration', w);
    localStorage.setItem('breakDuration', b);
    WORK_DURATION  = w*60; BREAK_DURATION = b*60;
    resetTimer();
  }
  modal.style.display = 'none';
});
cancelBtn.addEventListener('click', () => {
  if (btnCheckbox.checked) { btnSound.currentTime = 0; btnSound.play(); }
  modal.style.display = 'none';
});
timerCheckbox.addEventListener('change', () => localStorage.setItem('timerSound', timerCheckbox.checked));
btnCheckbox.addEventListener('change', () => localStorage.setItem('btnSound', btnCheckbox.checked));
timerSlider.addEventListener('input', e => localStorage.setItem('timerVolume', e.target.value));
btnSlider.addEventListener('input', e => localStorage.setItem('btnVolume', e.target.value));
loopCheckbox.addEventListener('change', () => { localStorage.setItem('loopEnabled', loopCheckbox.checked); initCycles(); });
cycleCountInput.addEventListener('input', () => localStorage.setItem('cycleCount', cycleCountInput.value));
syncCheckbox.addEventListener('change', () => localStorage.setItem('syncEnabled', syncCheckbox.checked));
modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });

updateDisplay();
