document.addEventListener('DOMContentLoaded', () => {

    // --- 0. WAVY TITLE ANIMATION LOGIC ---
    const wavyTitle = document.getElementById('wavy-title');
    if (wavyTitle) {
        const text = wavyTitle.innerText;
        wavyTitle.innerHTML = '';
        for (let i = 0; i < text.length; i++) {
            let span = document.createElement('span');
            span.innerText = text[i] === ' ' ? '\u00A0' : text[i];
            span.style.animationDelay = (i * 0.05) + 's';
            wavyTitle.appendChild(span);
        }
    }

    // --- 1. DRAGGABLE DESKTOP ICONS ---
    const desktopIcons = document.querySelectorAll('.desktop-icon');
    let draggedIcon = null;
    let offset = { x: 0, y: 0 };

    desktopIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            if (icon.getAttribute('data-just-dragged') === 'true') {
                icon.setAttribute('data-just-dragged', 'false');
                return;
            }
            openWindow(icon.getAttribute('data-target'));
        });

        icon.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            draggedIcon = icon;
            const iconRect = icon.getBoundingClientRect();
            offset.x = e.clientX - iconRect.left;
            offset.y = e.clientY - iconRect.top;
            highestZIndex++;
            draggedIcon.style.zIndex = highestZIndex;
            e.preventDefault();
        });
    });

    document.addEventListener('mousemove', (e) => {
        if (!draggedIcon) return;
        draggedIcon.setAttribute('data-just-dragged', 'true');
        const desktopArea = document.getElementById('os-desktop');
        const desktopRect = desktopArea.getBoundingClientRect();

        let newX = e.clientX - desktopRect.left - offset.x;
        let newY = e.clientY - desktopRect.top - offset.y;

        newX = Math.max(0, Math.min(newX, desktopRect.width - draggedIcon.offsetWidth));
        newY = Math.max(0, Math.min(newY, desktopRect.height - draggedIcon.offsetHeight));

        draggedIcon.style.left = newX + 'px';
        draggedIcon.style.top = newY + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (draggedIcon) {
            draggedIcon = null;
        }
    });

    // --- 2. DRAGGABLE WINDOWS LOGIC ---
    const windows = document.querySelectorAll('.window-element');
    let highestZIndex = 50;

    windows.forEach(win => {
        const titleBar = win.querySelector('.win-title-bar');

        win.addEventListener('mousedown', () => {
            highestZIndex++;
            win.style.zIndex = highestZIndex;
        });

        if (titleBar) {
            let isDragging = false;
            let currentX, currentY, initialX, initialY;
            let xOffset = 0, yOffset = 0;

            titleBar.addEventListener("mousedown", dragStart);
            titleBar.addEventListener("touchstart", dragStart, {passive: true});

            function dragStart(e) {
                if (win.classList.contains('maximized')) return;
                if (e.type === "touchstart") {
                    initialX = e.touches[0].clientX - xOffset;
                    initialY = e.touches[0].clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }
                if (e.target.tagName.toLowerCase() !== 'button') {
                    isDragging = true;
                }
            }

            document.addEventListener("mouseup", dragEnd);
            document.addEventListener("touchend", dragEnd);

            function dragEnd(e) {
                initialX = currentX;
                initialY = currentY;
                isDragging = false;
            }

            document.addEventListener("mousemove", drag);
            document.addEventListener("touchmove", drag, {passive: false});

            function drag(e) {
                if (isDragging) {
                    e.preventDefault();
                    if (e.type === "touchmove") {
                        currentX = e.touches[0].clientX - initialX;
                        currentY = e.touches[0].clientY - initialY;
                    } else {
                        currentX = e.clientX - initialX;
                        currentY = e.clientY - initialY;
                    }
                    xOffset = currentX;
                    yOffset = currentY;
                    setTranslate(currentX, currentY, win);
                }
            }

            function setTranslate(xPos, yPos, el) {
                el.style.transform = "translate3d(" + xPos + "px, " + yPos + "px, 0)";
            }
        }
    });

    // --- 3. MAXIMIZE / RESTORE WINDOW LOGIC ---
    const maxButtons = document.querySelectorAll('.max-btn');

    maxButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-max');
            const targetWindow = document.getElementById(targetId);

            if (targetWindow) {
                if (targetWindow.classList.contains('maximized')) {
                    targetWindow.classList.remove('maximized');
                    targetWindow.style.transform = targetWindow.getAttribute('data-original-transform') || 'translate(0,0)';
                    btn.innerText = '□';
                } else {
                    targetWindow.setAttribute('data-original-transform', targetWindow.style.transform);
                    targetWindow.classList.add('maximized');
                    targetWindow.style.transform = 'none';
                    btn.innerText = '❐';
                    highestZIndex++;
                    targetWindow.style.zIndex = highestZIndex;
                }
            }
        });
    });

    // --- 4. CLOSE/OPEN WINDOWS & TASKBAR ---
    const taskbarItems = document.querySelectorAll('.taskbar-item');
    taskbarItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetId = item.getAttribute('data-target');
            if(targetId) openWindow(targetId);
        });
    });

    const closeBtns = document.querySelectorAll('.close-btn');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = btn.getAttribute('data-close');
            const targetWindow = document.getElementById(targetId);
            if(targetWindow) {
                targetWindow.style.display = 'none';
                targetWindow.classList.remove('maximized');
                targetWindow.style.transform = targetWindow.getAttribute('data-original-transform') || 'translate(0,0)';
                const maxBtn = targetWindow.querySelector('.max-btn');
                if(maxBtn) maxBtn.innerText = '□';
            }
        });
    });

    function openWindow(targetId) {
        if(!targetId) return;
        const targetWindow = document.getElementById(targetId);
        if(targetWindow) {
            targetWindow.style.display = 'flex';
            highestZIndex++;
            targetWindow.style.zIndex = highestZIndex;
        }
    }

    // --- 5. OS Clock for Taskbar ---
    function updateOSClock() {
        const timeDisplay = document.getElementById('os-time');
        if (timeDisplay) {
            const options = { hour: '2-digit', minute: '2-digit', hour12: true };
            timeDisplay.innerText = new Date().toLocaleTimeString('en-US', options);
        }
    }
    setInterval(updateOSClock, 1000);
    updateOSClock();

    // --- 6. Smooth Scroll ---
    document.querySelectorAll('.smooth-scroll').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementsByName(targetId)[0];
            const contentArea = document.getElementById('resume-content');

            if (targetElement && contentArea) {
                contentArea.scrollTo({
                    top: targetElement.offsetTop - 50,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- 7. Hit Counter ---
    const hitCounter = document.getElementById('hit-counter');
    if(hitCounter) {
        let hits = 1355;
        if(localStorage.getItem('cyberHomeHits')) {
            hits = parseInt(localStorage.getItem('cyberHomeHits')) + 1;
        }
        localStorage.setItem('cyberHomeHits', hits);
        hitCounter.innerText = String(hits).padStart(6, '0');
    }

    // --- 8. Typewriter Effect ---
    const phrases = [
        "LOADING COORDINATION_MANAGER.EXE...",
        "INITIALIZING GBC_STUDENT.BAT...",
        "EXECUTING DATA_ENGINEERING.SYS...",
        "VERIFYING CISCO_CCST_CERT.DLL...",
        "CONNECTING TO GLOBAL_HACKATHON_TOP5..."
    ];
    let pIdx = 0, charIdx = 0, isDeleting = false;
    const typeTarget = document.getElementById('typewriter');

    function handleType() {
        if(!typeTarget) return;
        const fullTxt = phrases[pIdx];
        typeTarget.textContent = isDeleting
            ? fullTxt.substring(0, charIdx - 1)
            : fullTxt.substring(0, charIdx + 1);

        charIdx = isDeleting ? charIdx - 1 : charIdx + 1;
        let speed = isDeleting ? 20 : 60;

        if (!isDeleting && charIdx === fullTxt.length) {
            isDeleting = true;
            speed = 2000;
        } else if (isDeleting && charIdx === 0) {
            isDeleting = false;
            pIdx = (pIdx + 1) % phrases.length;
            speed = 300;
        }
        setTimeout(handleType, speed);
    }
    handleType();

    // --- 9. Floating Pastel Icons (GSAP) ---
    const canvas = document.getElementById('botanical-canvas');
    if (canvas && typeof gsap !== 'undefined') {
        const retroShapes = ['✦', '★', '♥', '☾', '✿'];
        for (let i = 0; i < 35; i++) {
            let item = document.createElement('div');
            item.innerHTML = retroShapes[Math.floor(Math.random() * retroShapes.length)];
            item.style.position = 'absolute';
            item.style.left = Math.random() * 100 + 'vw';
            item.style.top = Math.random() * 100 + 'vh';
            item.style.fontSize = (Math.random() * 20 + 15) + 'px';
            const colors = ['#ffffff', '#ffb7b2', '#e1bee7', '#f8bbd0'];
            item.style.color = colors[Math.floor(Math.random() * colors.length)];
            item.style.opacity = Math.random() * 0.6 + 0.2;
            canvas.appendChild(item);

            gsap.to(item, {
                x: "random(-150, 150)",
                y: "random(-150, 150)",
                rotation: "random(-360, 360)",
                duration: "random(15, 35)",
                repeat: -1, yoyo: true, ease: "sine.inOut"
            });
        }
    }

    // --- 10. SECURELOG SCANNER DEMO ---
    const startSentinelBtn = document.getElementById('start-sentinel-btn');
    const rawLogScreen = document.getElementById('raw-log-screen');
    const threatLogScreen = document.getElementById('threat-log-screen');
    const scanStatus = document.getElementById('scan-status');
    const mockLogs = [
        "10:01:22 INFO: User 'admin' logged in",
        "10:01:45 SYS: Backup initiated.",
        "10:02:11 WARN: High mem usage",
        "10:03:05 ERR: Failed pass IP:10.0.0.5",
        "10:03:15 CRIT: Brute-Force IP:10.0.0.5",
        "10:05:33 ERR: Invalid token IP:172.16.0.4",
        "10:06:01 SYS: Check complete."
    ];

    if(rawLogScreen && startSentinelBtn) {
        rawLogScreen.innerHTML = '';
        mockLogs.forEach(log => { rawLogScreen.innerHTML += `${log}<br>`; });
        startSentinelBtn.addEventListener('click', () => {
            startSentinelBtn.disabled = true;
            startSentinelBtn.innerText = "Scanning...";
            threatLogScreen.innerHTML = '';
            scanStatus.innerText = "Status: SCANNING MEMORY BANKS...";

            let index = 0;
            let threatsFound = 0;
            const scanInterval = setInterval(() => {
                if (index < mockLogs.length) {
                    const text = mockLogs[index];
                    if (text.includes('ERR') || text.includes('CRIT')) {
                        threatsFound++;
                        threatLogScreen.innerHTML += `> <span style="color: #ff007f;">FOUND:</span> ${text}<br>`;
                        threatLogScreen.scrollTop = threatLogScreen.scrollHeight;
                    }
                    index++;
                } else {
                    clearInterval(scanInterval);
                    scanStatus.innerText = `Scan Complete. ${threatsFound} threats isolated.`;
                    startSentinelBtn.disabled = false;
                    startSentinelBtn.innerText = "Run Scan.exe Again";
                }
            }, 250);
        });
    }

    // --- 11. SENTINEL SNAKE GAME ---
    class SentinelSnakeGame {
        constructor() {
            this.board = document.getElementById('snake-board');
            this.log = document.getElementById('snake-log');
            this.startBtn = document.getElementById('start-snake-btn');
            if (!this.board || !this.log || !this.startBtn) return;

            this.tileSize = 25;
            this.gridSize = 350 / this.tileSize;
            this.snake = [{ x: 7, y: 7 }];
            this.food = { x: 3, y: 3 };
            this.dx = 1; this.dy = 0;
            this.score = 0;
            this.gameInterval = null;
            this.isRunning = false;

            document.addEventListener('keydown', this.handleInput.bind(this));
            this.startBtn.addEventListener('click', () => {
                if(!this.isRunning) { this.startGame(); this.board.focus(); }
            });
            this.reset();
        }
        logAction(msg) {
            this.log.innerHTML += `> ${msg}<br>`;
            this.log.scrollTop = this.log.scrollHeight;
        }
        reset() {
            if(this.gameInterval) { clearInterval(this.gameInterval); this.gameInterval = null; }
            this.snake = [{ x: 7, y: 7 }];
            this.dx = 1; this.dy = 0;
            this.score = 0;
            this.isRunning = false;
            this.startBtn.style.display = "inline-block";
            this.placeFood();
            this.draw();
            this.logAction("SNAKE_ENGINE v3.0 READY.");
            this.logAction("Click START GAME button to play.");
        }
        placeFood() {
            this.food = { x: Math.floor(Math.random() * this.gridSize), y: Math.floor(Math.random() * this.gridSize) };
        }
        draw() {
            this.board.innerHTML = '';
            const foodEl = document.createElement('div');
            foodEl.className = 'retro-sprite food-part';
            foodEl.innerHTML = '★';
            foodEl.style.width = this.tileSize + 'px'; foodEl.style.height = this.tileSize + 'px';
            foodEl.style.left = (this.food.x * this.tileSize) + 'px'; foodEl.style.top = (this.food.y * this.tileSize) + 'px';
            this.board.appendChild(foodEl);

            this.snake.forEach((part, index) => {
                const partEl = document.createElement('div');
                partEl.className = `retro-sprite snake-part`;
                if(index === 0) partEl.classList.add('snake-head');
                partEl.style.width = this.tileSize + 'px'; partEl.style.height = this.tileSize + 'px';
                partEl.style.left = (part.x * this.tileSize) + 'px'; partEl.style.top = (part.y * this.tileSize) + 'px';
                this.board.appendChild(partEl);
            });
        }
        handleInput(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (!this.isRunning) return;
            let newDx = this.dx, newDy = this.dy;
            const key = e.key.toLowerCase();

            if (key === 'w' && this.dy === 0) { newDx = 0; newDy = -1; }
            else if (key === 's' && this.dy === 0) { newDx = 0; newDy = 1; }
            else if (key === 'a' && this.dx === 0) { newDx = -1; newDy = 0; }
            else if (key === 'd' && this.dx === 0) { newDx = 1; newDy = 0; }
            else { return; }

            if(['w','a','s','d'].includes(key)) e.preventDefault();
            this.dx = newDx; this.dy = newDy;
        }
        startGame() {
            this.snake = [{ x: 7, y: 7 }];
            this.dx = 1; this.dy = 0; this.score = 0; this.isRunning = true;
            this.startBtn.style.display = "none";
            this.placeFood();
            this.logAction("GAME INITIATED. COLLECT STARS!");
            this.logAction("USE W, A, S, D TO MOVE.");
            if(this.gameInterval) clearInterval(this.gameInterval);
            this.gameInterval = setInterval(this.tick.bind(this), 250);
        }
        tick() {
            const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
            if (head.x < 0 || head.x >= this.gridSize || head.y < 0 || head.y >= this.gridSize) { this.gameOver("Hit a wall!"); return; }
            for (let i = 1; i < this.snake.length; i++) {
                if (this.snake[i].x === head.x && this.snake[i].y === head.y) { this.gameOver("Bit your own tail!"); return; }
            }
            this.snake.unshift(head);
            if (head.x === this.food.x && head.y === this.food.y) {
                this.logAction(`<font color="#ff3399">★ STAR COLLECTED ★</font>`);
                this.score += 10; this.placeFood();
            } else { this.snake.pop(); }
            this.draw();
        }
        gameOver(reason) {
            this.isRunning = false;
            this.logAction(`<span style="color:#d81b60; font-weight:bold;">GAME OVER: ${reason}</span>`);
            this.logAction(`Total Stars Score: ${this.score}`);
            this.logAction("---");
            this.reset();
        }
    }
    new SentinelSnakeGame();

    // --- 12. ADVANCED MUSIC PLAYER LOGIC (PLAYLIST) ---
    const bgMusic = document.getElementById('bg-music');
    const winampText = document.getElementById('winamp-text');
    const btnPlay = document.getElementById('btn-play');
    const btnPause = document.getElementById('btn-pause');
    const btnStop = document.getElementById('btn-stop');
    const btnNext = document.getElementById('btn-next');
    const btnPrev = document.getElementById('btn-prev');

    const playlist = [
        { name: "sarkim.mp3", src: "assets/music/sarkim.mp3" },
        { name: "sarkim2.mp3", src: "assets/music/sarkim2.mp3" },
        { name: "sarkim3.mp3", src: "assets/music/sarkim3.mp3" },
        { name: "sarkim4.mp3", src: "assets/music/sarkim4.mp3" },
        { name: "sarkim5.mp3", src: "assets/music/sarkim5.mp3" },
        { name: "sarkim6.mp3", src: "assets/music/sarkim6.mp3" },
        { name: "sarkim7.mp3", src: "assets/music/sarkim7.mp3" },
        { name: "sarkim8.mp3", src: "assets/music/sarkim8.mp3" },
        { name: "sarkim9.mp3", src: "assets/music/sarkim9.mp3" },
        { name: "sarkim10.mp3", src: "assets/music/sarkim10.mp3" }
    ];
    let currentTrackIndex = 0;

    if (bgMusic && btnPlay) {
        bgMusic.volume = 0.4;
        const loadTrack = (index) => { bgMusic.src = playlist[index].src; bgMusic.load(); };

        btnPlay.addEventListener('click', () => {
            bgMusic.play();
            winampText.innerText = `▶ PLAYING: ${playlist[currentTrackIndex].name}`;
            winampText.style.color = '#00ff00';
        });
        btnPause.addEventListener('click', () => {
            bgMusic.pause();
            winampText.innerText = '⏸ PAUSED';
            winampText.style.color = '#ffcc00';
        });
        btnStop.addEventListener('click', () => {
            bgMusic.pause();
            bgMusic.currentTime = 0;
            winampText.innerText = '⏹ STOPPED';
            winampText.style.color = '#ff0000';
        });
        btnNext.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex); bgMusic.play();
            winampText.innerText = `▶ PLAYING: ${playlist[currentTrackIndex].name}`; winampText.style.color = '#00ff00';
        });
        btnPrev.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadTrack(currentTrackIndex); bgMusic.play();
            winampText.innerText = `▶ PLAYING: ${playlist[currentTrackIndex].name}`; winampText.style.color = '#00ff00';
        });
        bgMusic.addEventListener('ended', () => { btnNext.click(); });
    }

    // --- 13. RETRO MENU BAR DROPDOWNS ---
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.menu-dropdown').forEach(dropdown => {
                if (dropdown.id !== item.getAttribute('data-dropdown')) { dropdown.classList.remove('show'); }
            });
            const dropdownId = item.getAttribute('data-dropdown');
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                const rect = item.getBoundingClientRect();
                const parentRect = item.parentElement.getBoundingClientRect();
                dropdown.style.left = (rect.left - parentRect.left) + 'px';
                dropdown.classList.toggle('show');
            }
        });
    });
    document.addEventListener('click', () => {
        document.querySelectorAll('.menu-dropdown').forEach(dropdown => { dropdown.classList.remove('show'); });
    });

    // --- 14. CYBER PET INTERACTIONS (FIXED) ---
    const petFace = document.getElementById('pet-face');
    const petStatus = document.getElementById('pet-status');
    const btnFeed = document.getElementById('btn-feed');
    const btnPet = document.getElementById('btn-pet');
    let petTimeout;

    if(btnFeed && btnPet && petFace) {
        const standardFace = "\n  /\\_/\\\n ( o.o )\n  > ^ <";
        btnFeed.addEventListener('click', () => {
            clearTimeout(petTimeout);
            petFace.innerText = "\n  /\\_/\\\n ( >.^ ) <*Yummy*";
            petStatus.innerText = "Status: Fed! (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧";
            petTimeout = setTimeout(() => { petFace.innerText = standardFace; petStatus.innerText = "Status: Happy! ✨"; }, 3000);
        });
        btnPet.addEventListener('click', () => {
            clearTimeout(petTimeout);
            petFace.innerText = "\n  /\\_/\\\n ( ^3^ ) <*Hearts*";
            petStatus.innerText = "Status: Loved! 💕";
            petTimeout = setTimeout(() => { petFace.innerText = standardFace; petStatus.innerText = "Status: Happy! ✨"; }, 3000);
        });
    }

    // --- 15. CYBER SEC PASSWORD ANALYZER ---
    const passInput = document.getElementById('cyber-pass');
    const passMeter = document.getElementById('pass-meter-fill');
    const passStatus = document.getElementById('pass-status');
    if(passInput && passMeter && passStatus) {
        passInput.addEventListener('input', (e) => {
            const val = e.target.value;
            let strength = 0;
            if(val.length > 5) strength += 25;
            if(val.length > 10) strength += 25;
            if(/[A-Z]/.test(val)) strength += 25;
            if(/[0-9!@#$%^&*]/.test(val)) strength += 25;
            passMeter.style.width = strength + '%';
            if(val.length === 0) {
                passMeter.style.background = 'red'; passStatus.innerText = 'WAITING FOR INPUT...'; passStatus.style.color = '#d81b60';
            } else if(strength <= 25) {
                passMeter.style.background = 'red'; passStatus.innerText = 'WEAK: EASILY CRACKED'; passStatus.style.color = 'red';
            } else if(strength <= 75) {
                passMeter.style.background = '#ffcc00'; passStatus.innerText = 'MODERATE: ENCRYPTING...'; passStatus.style.color = '#ccaa00';
            } else {
                passMeter.style.background = '#00ff00'; passStatus.innerText = 'SECURE: MILITARY GRADE'; passStatus.style.color = '#00cc00';
            }
        });
    }

    // --- 16. WORKING EMAIL FORM (AJAX FORMSUBMIT) ---
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitBtn.innerText = "Sending Data...";
            submitBtn.disabled = true;
            const formData = new FormData(contactForm);
            fetch('https://formsubmit.co/ajax/denizccan06@gmail.com', {
                method: 'POST', headers: { 'Accept': 'application/json' }, body: formData
            })
                .then(response => response.json())
                .then(data => {
                    formMessage.style.display = 'block';
                    contactForm.reset();
                    submitBtn.innerText = "Submit to Database";
                    submitBtn.disabled = false;
                })
                .catch(error => {
                    submitBtn.innerText = "Error. Try Again.";
                    submitBtn.disabled = false;
                });
        });
    }

    // --- 17. FIXED MATRIX TERMINAL (HARDCODED DIMENSIONS) ---
    const matrixCanvas = document.getElementById('matrix-canvas');
    if (matrixCanvas) {
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = 450;
        matrixCanvas.height = 200;
        const matrixChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%".split("");
        const fontSize = 12;
        const columns = matrixCanvas.width / fontSize;
        const drops = [];
        for (let x = 0; x < columns; x++) { drops[x] = 1; }

        function drawMatrix() {
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            ctx.fillStyle = "#0F0";
            ctx.font = fontSize + "px 'Courier New'";
            for (let i = 0; i < drops.length; i++) {
                const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) { drops[i] = 0; }
                drops[i]++;
            }
        }
        setInterval(drawMatrix, 40);
    }

    // --- 18. TETRIS GAME IMPLEMENTATION ---
    const tetrisCanvas = document.getElementById('tetris-game-canvas');
    if (tetrisCanvas) {
        const ctx = tetrisCanvas.getContext('2d');
        const scoreElement = document.getElementById('tetris-score');
        const startTetrisBtn = document.getElementById('start-tetris-clone');

        const ROWS = 20, COLS = 10, BLOCK_SIZE = 20;
        let board = [], score = 0, animationId, dropCounter = 0, dropInterval = 1000, lastTime = 0, isPlaying = false;

        const colors = [null, '#ff0055', '#00ffcc', '#ffcc00', '#cc00ff', '#00ff55', '#ff5500', '#0055ff'];
        const pieces = [
            [], [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]], [[2,0,0], [2,2,2], [0,0,0]],
            [[0,0,3], [3,3,3], [0,0,0]], [[4,4], [4,4]], [[0,5,5], [5,5,0], [0,0,0]],
            [[0,6,0], [6,6,6], [0,0,0]], [[7,7,0], [0,7,7], [0,0,0]]
        ];
        let player = { pos: {x: 0, y: 0}, matrix: null };

        function createMatrix(w, h) {
            const matrix = [];
            while (h--) matrix.push(new Array(w).fill(0));
            return matrix;
        }

        function drawMatrix(matrix, offset) {
            matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        ctx.fillStyle = colors[value];
                        ctx.fillRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                        ctx.strokeStyle = '#222';
                        ctx.strokeRect((x + offset.x) * BLOCK_SIZE, (y + offset.y) * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
                    }
                });
            });
        }

        function draw() {
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
            drawMatrix(board, {x: 0, y: 0});
            drawMatrix(player.matrix, player.pos);
        }

        function merge(board, player) {
            player.matrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) board[y + player.pos.y][x + player.pos.x] = value;
                });
            });
        }

        function collide(board, player) {
            const m = player.matrix, o = player.pos;
            for (let y = 0; y < m.length; ++y) {
                for (let x = 0; x < m[y].length; ++x) {
                    if (m[y][x] !== 0 && (board[y + o.y] && board[y + o.y][x + o.x]) !== 0) return true;
                }
            }
            return false;
        }

        function playerDrop() {
            player.pos.y++;
            if (collide(board, player)) {
                player.pos.y--;
                merge(board, player);
                playerReset();
                arenaSweep();
            }
            dropCounter = 0;
        }

        function playerMove(dir) {
            player.pos.x += dir;
            if (collide(board, player)) player.pos.x -= dir;
        }

        function playerRotate() {
            const pos = player.pos.x;
            let offset = 1;
            rotate(player.matrix);
            while (collide(board, player)) {
                player.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > player.matrix[0].length) {
                    rotate(player.matrix, -1);
                    player.pos.x = pos;
                    return;
                }
            }
        }

        function rotate(matrix, dir = 1) {
            for (let y = 0; y < matrix.length; ++y) {
                for (let x = 0; x < y; ++x) {
                    [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
                }
            }
            if (dir > 0) matrix.forEach(row => row.reverse());
            else matrix.reverse();
        }

        function playerReset() {
            const types = [1, 2, 3, 4, 5, 6, 7];
            player.matrix = pieces[types[Math.floor(Math.random() * types.length)]];
            player.pos.y = 0;
            player.pos.x = Math.floor(COLS / 2) - Math.floor(player.matrix[0].length / 2);

            if (collide(board, player)) {
                board = createMatrix(COLS, ROWS);
                score = 0;
                scoreElement.innerText = score;
                isPlaying = false;
                startTetrisBtn.style.display = "inline-block";
                startTetrisBtn.innerText = "Game Over - Restart";
                cancelAnimationFrame(animationId);
            }
        }

        function arenaSweep() {
            let rowCount = 1;
            outer: for (let y = board.length - 1; y > 0; --y) {
                for (let x = 0; x < board[y].length; ++x) {
                    if (board[y][x] === 0) continue outer;
                }
                const row = board.splice(y, 1)[0].fill(0);
                board.unshift(row);
                ++y;
                score += rowCount * 100;
                rowCount *= 2;
            }
            scoreElement.innerText = score;
        }

        function update(time = 0) {
            if(!isPlaying) return;
            const deltaTime = time - lastTime;
            lastTime = time;
            dropCounter += deltaTime;
            if (dropCounter > dropInterval) playerDrop();
            draw();
            animationId = requestAnimationFrame(update);
        }

        tetrisCanvas.addEventListener('keydown', e => {
            if(!isPlaying) return;
            if([37, 38, 39, 40].includes(e.keyCode)) e.preventDefault();
            if (e.keyCode === 37) playerMove(-1);
            else if (e.keyCode === 39) playerMove(1);
            else if (e.keyCode === 40) playerDrop();
            else if (e.keyCode === 38) playerRotate();
        });

        startTetrisBtn.addEventListener('click', () => {
            board = createMatrix(COLS, ROWS);
            score = 0;
            scoreElement.innerText = score;
            playerReset();
            isPlaying = true;
            startTetrisBtn.style.display = "none";
            tetrisCanvas.focus();
            update();
        });

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, tetrisCanvas.width, tetrisCanvas.height);
    }

    // --- 19. HIRE ME CLICK CTA ---
    const hireMeCta = document.querySelector('.wavy-hire-me');
    if(hireMeCta) {
        hireMeCta.addEventListener('click', () => {
            window.location.href = 'mailto:denizccan06@gmail.com?subject=I%20saw%20your%20Cyber%20Portfolio%20and%20I%20want%20to%20hire%20you!';
        });
    }
});