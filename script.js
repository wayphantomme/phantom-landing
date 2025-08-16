document.addEventListener("DOMContentLoaded", () => {
  const greetBtn = document.getElementById("greetBtn");
  const nameInput = document.getElementById("nameInput");
  const greetMessage = document.getElementById("greetMessage");
  const typewriterToggle = document.getElementById("typewriterToggle");
  const darkModeToggle = document.getElementById("darkModeToggle");
  const greetHistoryEl = document.getElementById("greetHistory");
  const confettiCanvas = document.getElementById("confettiCanvas");
  const htmlEl = document.documentElement;

  // ====== THEME PERSISTENCE ======
  const savedTheme = localStorage.getItem("phantom_theme") || "light";
  if (savedTheme === "dark") {
    htmlEl.classList.add("dark");
    darkModeToggle.checked = true;
  }

  darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
      htmlEl.classList.add("dark");
      localStorage.setItem("phantom_theme", "dark");
    } else {
      htmlEl.classList.remove("dark");
      localStorage.setItem("phantom_theme", "light");
    }
  });

  // ====== NAME PERSISTENCE ======
  const savedName = localStorage.getItem("phantom_name");
  if (savedName) nameInput.value = savedName;

  // ====== GREET HISTORY ======
  function loadHistory() {
    try {
      return JSON.parse(localStorage.getItem("phantom_greet_history") || "[]");
    } catch { return []; }
  }
  function saveHistory(arr) {
    localStorage.setItem("phantom_greet_history", JSON.stringify(arr.slice(0,3)));
  }
  function renderHistory() {
    const arr = loadHistory();
    greetHistoryEl.innerHTML = "";
    arr.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      greetHistoryEl.appendChild(li);
    });
  }
  renderHistory();

  // ====== MESSAGE ANIMATIONS ======
  function resetMessage() {
    greetMessage.classList.remove("fade-up", "type-cursor");
    greetMessage.textContent = "";
  }
  function typeWriter(text, speed = 22) {
    resetMessage();
    greetMessage.classList.add("type-cursor");
    let i = 0;
    const id = setInterval(() => {
      greetMessage.textContent = text.slice(0, i + 1);
      i++;
      if (i >= text.length) {
        clearInterval(id);
        greetMessage.classList.remove("type-cursor");
      }
    }, speed);
  }
  function fadeMessage(text) {
    resetMessage();
    greetMessage.textContent = text;
    void greetMessage.offsetWidth; // reflow
    greetMessage.classList.add("fade-up");
  }

  // ====== CONFETTI (no library) ======
  function launchConfetti(durationMs = 1200, count = 140) {
    const ctx = confettiCanvas.getContext("2d");
    const dpi = window.devicePixelRatio || 1;
    const resize = () => {
      confettiCanvas.width = Math.floor(window.innerWidth * dpi);
      confettiCanvas.height = Math.floor(window.innerHeight * dpi);
      confettiCanvas.style.display = "block";
    };
    resize();

    const colors = ["#f94144","#f3722c","#f8961e","#90be6d","#43aa8b","#577590","#4c8eff","#a66cff"];
    const pieces = Array.from({ length: count }).map(() => ({
      x: Math.random() * confettiCanvas.width,
      y: -Math.random() * confettiCanvas.height * 0.2,
      r: 3 + Math.random() * 5,
      c: colors[(Math.random() * colors.length) | 0],
      vx: (-0.5 + Math.random()) * 2 * dpi,
      vy: (1 + Math.random() * 3) * dpi,
      rot: Math.random() * Math.PI,
      vr: (-0.1 + Math.random() * 0.2)
    }));

    let start = null;
    function frame(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

      for (const p of pieces) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        // Simple gravity
        p.vy += 0.02 * dpi;

        // Wrap horizontally
        if (p.x < 0) p.x = confettiCanvas.width;
        if (p.x > confettiCanvas.width) p.x = 0;

        // Draw
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2 * (0.6 + Math.sin(p.rot) * 0.2));
        ctx.restore();
      }

      if (elapsed < durationMs) {
        requestAnimationFrame(frame);
      } else {
        confettiCanvas.style.display = "none";
      }
    }
    requestAnimationFrame(frame);

    // clean on resize
    let rid;
    const onResize = () => { cancelAnimationFrame(rid); resize(); };
    window.addEventListener("resize", onResize, { once: true });
  }

  // ====== MAIN ACTION ======
  greetBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) {
      fadeMessage("Please enter your name first 🙂");
      return;
    }

    localStorage.setItem("phantom_name", name);
    const text = `Hello ${name}! Welcome to my Web3 journey 🚀`;

    if (typewriterToggle.checked) typeWriter(text);
    else fadeMessage(text);

    // update history
    const hist = loadHistory();
    hist.unshift(text);
    saveHistory(hist);
    renderHistory();

    // party time 🎉
    launchConfetti();
  });
});
