// State Management
let currentMode = 'breathe';
let durations = { breathe: 3, stretch: 10, relax: 3 }; // in minutes
let totalSeconds = durations[currentMode] * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;
let timerInterval = null;

// Breathing specific cycle states (4s Inhale, 4s Hold, 4s Exhale)
const breathePhases = [
    { name: "Inhale", sub: "Breathe in slowly...", duration: 4 },
    { name: "Hold", sub: "Keep it steady...", duration: 4 },
    { name: "Exhale", sub: "Release gently...", duration: 4 }
];
let currentPhaseIndex = 0;
let phaseSecondsRemaining = breathePhases[0].duration;

// DOM Elements
const timerDisplay = document.getElementById('timerDisplay');
const instructionMain = document.getElementById('instructionMain');
const instructionSub = document.getElementById('instructionSub');
const centerIcon = document.getElementById('centerIcon');
const startBtn = document.getElementById('startBtn');
const progressRing = document.getElementById('progressRing');
const phaseProgressSection = document.getElementById('phaseProgressSection');
const segmentTrack = document.getElementById('segmentTrack');
const phaseLabels = document.getElementById('phaseLabels');

const CIRCLE_CIRCUMFERENCE = 326.72; // 2 * pi * 52

function init() {
    progressRing.style.strokeDasharray = CIRCLE_CIRCUMFERENCE;
    resetTimer();
}

function switchMode(mode) {
    currentMode = mode;
    stopTimer();
    
    // Update active tab buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.querySelectorAll('.rec-card').forEach(card => {
        card.classList.remove('active-card');
    });
    const targetCard = document.getElementById(`card-${mode}`);
    if (targetCard) targetCard.classList.add('active-card');

    // Update Headings & Icons
    const config = {
        breathe: { title: "Recovery Mode", sub: "Slow down. Let your body recover.", icon: "🫁" },
        stretch: { title: "Mobility Flow", sub: "Release tension and open up.", icon: "🧘‍♀️" },
        relax: { title: "Deep Calm", sub: "Settle your mind and rest.", icon: "🌙" }
    };

    document.getElementById('widgetTitle').innerText = config[mode].title;
    document.getElementById('widgetSubtitle').innerText = config[mode].sub;
    document.getElementById('headerIconSymbol').innerText = config[mode].icon;
    centerIcon.innerText = config[mode].icon;

    totalSeconds = durations[mode] * 60;
    remainingSeconds = totalSeconds;

    if (mode === 'breathe') {
        phaseProgressSection.style.display = 'flex';
        currentPhaseIndex = 0;
        phaseSecondsRemaining = breathePhases[0].duration;
        setupBreatheSegments();
    } else {
        phaseProgressSection.style.display = 'none';
    }

    updateDisplay();
}

function selectCard(mode) {
    switchMode(mode);
}

function setDuration(mode, mins, event) {
    event.stopPropagation();
    durations[mode] = mins;
    
    // Update button active state within that card
    const card = document.getElementById(`card-${mode}`);
    card.querySelectorAll('.dur-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.includes(`${mins} MIN`)) {
            btn.classList.add('active');
        }
    });

    if (currentMode === mode) {
        totalSeconds = mins * 60;
        remainingSeconds = totalSeconds;
        stopTimer();
        updateDisplay();
    }
}

function setupBreatheSegments() {
    segmentTrack.innerHTML = '';
    breathePhases.forEach((phase, idx) => {
        for (let i = 0; i < phase.duration; i++) {
            const seg = document.createElement('div');
            seg.className = `progress-segment ${idx === 0 && i === 0 ? 'active' : ''}`;
            seg.id = `seg-${idx}-${i}`;
            segmentTrack.appendChild(seg);
        }
    });
}

function toggleTimer() {
    if (isRunning) {
        stopTimer();
        startBtn.innerText = "START";
    } else {
        startTimer();
        startBtn.innerText = "PAUSE";
    }
}

function startTimer() {
    if (remainingSeconds <= 0) {
        remainingSeconds = totalSeconds;
    }
    isRunning = true;
    timerInterval = setInterval(() => {
        if (remainingSeconds > 0) {
            remainingSeconds--;
            
            if (currentMode === 'breathe') {
                updateBreatheCycle();
            }
            
            updateDisplay();
        } else {
            stopTimer();
            startBtn.innerText = "START";
            instructionMain.innerText = "Complete!";
            instructionSub.innerText = "Well done.";
        }
    }, 1000);
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.innerText = "START";
}

function resetTimer() {
    stopTimer();
    remainingSeconds = totalSeconds;
    if (currentMode === 'breathe') {
        currentPhaseIndex = 0;
        phaseSecondsRemaining = breathePhases[0].duration;
        setupBreatheSegments();
    }
    updateDisplay();
}

function updateBreatheCycle() {
    phaseSecondsRemaining--;
    if (phaseSecondsRemaining <= 0) {
        currentPhaseIndex = (currentPhaseIndex + 1) % breathePhases.length;
        phaseSecondsRemaining = breathePhases[currentPhaseIndex].duration;
    }

    instructionMain.innerText = breathePhases[currentPhaseIndex].name;
    instructionSub.innerText = breathePhases[currentPhaseIndex].sub;

    // Highlight active small segments
    let globalIndex = 0;
    breathePhases.forEach((p, pIdx) => {
        for (let i = 0; i < p.duration; i++) {
            const seg = document.getElementById(`seg-${pIdx}-${i}`);
            if (seg) {
                if (pIdx < currentPhaseIndex || (pIdx === currentPhaseIndex && i <= (p.duration - phaseSecondsRemaining))) {
                    seg.classList.add('active');
                } else {
                    seg.classList.remove('active');
                }
            }
            globalIndex++;
        }
    });
}

function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDisplay.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // Update Circular Ring Progress (shrinking smooth circle as time decreases)
    const progressFraction = remainingSeconds / totalSeconds;
    const dashOffset = CIRCLE_CIRCUMFERENCE * (1 - progressFraction);
    progressRing.style.strokeDashoffset = dashOffset;

    if (currentMode !== 'breathe') {
        instructionMain.innerText = `${Math.ceil(remainingSeconds / 60)} min left`;
        instructionSub.innerText = "Stay focused & steady";
    }
}

// Initialize on load
init();
