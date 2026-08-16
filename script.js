// State Management
let currentMode = 'breathe'; // 'breathe', 'stretch', 'relax'
let totalSeconds = 180;      // Default 3 min
let remainingSeconds = 180;
let isRunning = false;
let timerInterval = null;

// Mode durations mapping
const durations = {
    breathe: 180,
    stretch: 600,
    relax: 180
};

// Breathing cycle variables (4-4-4)
let breathePhase = 0; // 0: Inhale, 1: Hold, 2: Exhale
let breatheTimer = 4;

// Stretch exercise sequence
const stretchSteps = [
    { title: "Neck Rolls", sub: "Slowly roll your neck from side to side." },
    { title: "Shoulder Rolls", sub: "Roll your shoulders backward slowly." },
    { title: "Side Stretch", sub: "Reach overhead and gently lean to one side." },
    { title: "Forward Fold", sub: "Relax your upper body and breathe." },
    { title: "Chest Opener", sub: "Open your chest and draw your shoulders back." }
];

// Relax prompt sequence
const relaxSteps = [
    { title: "Release your shoulders", sub: "Let the tension melt away." },
    { title: "Unclench your jaw", sub: "Soften your face." },
    { title: "Slow your breathing", sub: "Breathe slowly and naturally." },
    { title: "Relax your hands", sub: "Let your fingers become loose." },
    { title: "Notice your body", sub: "Feel supported and comfortable." }
];

function initSegments() {
    const track = document.getElementById('segmentTrack');
    track.innerHTML = '';
    const count = 12;
    for (let i = 0; i < count; i++) {
        const seg = document.createElement('div');
        seg.className = 'progress-segment';
        if (i < 4) seg.classList.add('active');
        track.appendChild(seg);
    }
}

function switchMode(mode) {
    pauseTimer();
    currentMode = mode;
    totalSeconds = durations[mode];
    remainingSeconds = totalSeconds;

    // Update UI active card & selector
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    document.querySelectorAll('.rec-card').forEach(card => {
        card.classList.remove('active-card');
    });
    document.getElementById(`card${mode.charAt(0).toUpperCase() + mode.slice(1)}`).classList.add('active-card');

    // Update Center Icon & Instructions
    const centerIcon = document.getElementById('centerIcon');
    const phaseSection = document.getElementById('phaseProgressSection');

    if (mode === 'breathe') {
        centerIcon.innerText = "🫁";
        phaseSection.style.display = 'flex';
        initSegments();
        updateBreatheDisplay();
    } else if (mode === 'stretch') {
        centerIcon.innerText = "🧘";
        phaseSection.style.display = 'none';
        document.getElementById('instructionMain').innerText = "Stretch & Release";
        document.getElementById('instructionSub').innerText = "Follow the guided mobility flow.";
    } else if (mode === 'relax') {
        centerIcon.innerText = "🌙";
        phaseSection.style.display = 'none';
        document.getElementById('instructionMain').innerText = "Deep Relaxation";
        document.getElementById('instructionSub').innerText = "Calm your mind and release tension.";
    }

    updateDisplay();
}

function selectCardMode(mode) {
    switchMode(mode);
}

function setDuration(mode, seconds, btnElement) {
    durations[mode] = seconds;
    const parent = btnElement.parentElement;
    parent.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');

    if (currentMode === mode) {
        pauseTimer();
        totalSeconds = seconds;
        remainingSeconds = seconds;
        updateDisplay();
    }
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (remainingSeconds <= 0) {
        remainingSeconds = totalSeconds;
    }
    isRunning = true;
    document.getElementById('startBtn').innerText = "⏸ Pause";

    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            
            if (currentMode === 'breathe') {
                updateBreatheCycle();
            } else if (currentMode === 'stretch' || currentMode === 'relax') {
                updateStepSequence();
            }

            updateDisplay();
        } else {
            completeSession();
        }
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    document.getElementById('startBtn').innerText = "▶ Start";
}

function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    document.getElementById('timerDisplay').innerText = `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;

    // Update Circular Progress Ring
    const circle = document.getElementById('progressRing');
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;
    circle.style.strokeDasharray = circumference;
    
    const progress = remainingSeconds / totalSeconds;
    const offset = circumference - (progress * circumference);
    circle.style.strokeDashoffset = offset;
}

function updateBreatheCycle() {
    breatheTimer--;
    if (breatheTimer <= 0) {
        breathePhase = (breathePhase + 1) % 3;
        breatheTimer = 4;
    }
    updateBreatheDisplay();
}

function updateBreatheDisplay() {
    const main = document.getElementById('instructionMain');
    const sub = document.getElementById('instructionSub');
    const labels = document.getElementById('phaseLabels');

    let phaseName = "";
    if (breathePhase === 0) {
        phaseName = "Inhale";
        sub.innerText = "Breathe in slowly...";
    } else if (breathePhase === 1) {
        phaseName = "Hold";
        sub.innerText = "Keep your breath steady...";
    } else {
        phaseName = "Exhale";
        sub.innerText = "Release gently...";
    }

    main.innerText = phaseName;

    // Highlight active label
    labels.innerHTML = `
        <span class="${breathePhase === 0 ? 'highlight' : ''}">4s Inhale</span>
        <span>•</span>
        <span class="${breathePhase === 1 ? 'highlight' : ''}">4s Hold</span>
        <span>•</span>
        <span class="${breathePhase === 2 ? 'highlight' : ''}">4s Exhale</span>
    `;

    // Update Segment Blocks
    const segments = document.querySelectorAll('.progress-segment');
    const activeCount = Math.floor((breatheTimer / 4) * 4) + (breathePhase * 4);
    segments.forEach((seg, idx) => {
        seg.classList.toggle('active', idx <= activeCount);
    });
}

function updateStepSequence() {
    const elapsed = totalSeconds - remainingSeconds;
    const stepsList = currentMode === 'stretch' ? stretchSteps : relaxSteps;
    const stepDuration = Math.max(5, Math.floor(totalSeconds / stepsList.length));
    const currentIndex = Math.min(Math.floor(elapsed / stepDuration), stepsList.length - 1);

    document.getElementById('instructionMain').innerText = stepsList[currentIndex].title;
    document.getElementById('instructionSub').innerText = stepsList[currentIndex].sub;
}

function completeSession() {
    pauseTimer();
    document.getElementById('instructionMain').innerText = "✨ Session Complete";
    document.getElementById('instructionSub').innerText = "You made time to recover.";
    document.getElementById('startBtn').innerText = "↻ Start Again";
    remainingSeconds = totalSeconds;
}

// Initial Setup
initSegments();
updateDisplay();
