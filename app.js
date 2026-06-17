(() => {
  const display = document.getElementById('display');
  const startBtn = document.getElementById('startBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const lapBtn = document.getElementById('lapBtn');
  const resetBtn = document.getElementById('resetBtn');
  const lapsList = document.getElementById('lapsList');

  let startTime = 0;
  let elapsedBeforePause = 0; // ms
  let rafId = null;
  let running = false;
  let laps = [];

  function formatTime(ms) {
    const totalCentis = Math.floor(ms / 10);
    const centis = totalCentis % 100;
    const totalSeconds = Math.floor(totalCentis / 100);
    const seconds = totalSeconds % 60;
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const hours = Math.floor(totalSeconds / 3600);

    const hh = hours > 0 ? String(hours).padStart(2, '0') + ':' : '';
    return `${hh}${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(centis).padStart(2,'0')}`;
  }

  function update() {
    const now = performance.now();
    const elapsed = elapsedBeforePause + (now - startTime);
    display.textContent = formatTime(elapsed);
    rafId = requestAnimationFrame(update);
  }

  function start() {
    if (running) return;
    startTime = performance.now();
    running = true;
    startBtn.disabled = true;
    pauseBtn.disabled = false;
    lapBtn.disabled = false;
    resetBtn.disabled = false;
    rafId = requestAnimationFrame(update);
  }

  function pause() {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
    elapsedBeforePause += performance.now() - startTime;
    startBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function reset() {
    running = false;
    cancelAnimationFrame(rafId);
    startTime = 0;
    elapsedBeforePause = 0;
    laps = [];
    display.textContent = '00:00.00';
    lapsList.innerHTML = '';
    startBtn.disabled = false;
    pauseBtn.disabled = true;
    lapBtn.disabled = true;
    resetBtn.disabled = true;
  }

  function lap() {
    const nowElapsed = elapsedBeforePause + (running ? (performance.now() - startTime) : 0);
    const lapTime = nowElapsed;
    const lapIndex = laps.length + 1;
    const prev = laps.length ? laps[laps.length-1].time : 0;
    const diff = lapTime - prev;
    const li = document.createElement('li');
    li.innerHTML = `<span>Lap ${lapIndex}</span><span>${formatTime(lapTime)} <small style="color:var(--muted);margin-left:8px">(+${formatTime(diff)})</small></span>`;
    lapsList.prepend(li);
    laps.push({time: lapTime});
  }

  startBtn.addEventListener('click', start);
  pauseBtn.addEventListener('click', pause);
  resetBtn.addEventListener('click', reset);
  lapBtn.addEventListener('click', lap);

  // keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (running) pause(); else start();
    }
    if (e.key.toLowerCase() === 'l') {
      if (!lapBtn.disabled) lap();
    }
    if (e.key.toLowerCase() === 'r') reset();
  });

  // Expose for debugging
  window.stopwatch = { start, pause, reset, lap };

})();
