document.addEventListener('DOMContentLoaded', function () {
  // --- Global Setup & Data Retrieval ---
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));

  // Load total score yang sudah terakumulasi
  const totalKnowledge = userData.totalKnowledge || 0;
  const totalCompliance = userData.totalCompliance || 0;
  // Ambil HB terakhir yang tercatat dari Hari 6 atau nilai default 12
  let currentHbLevel = userData.progress?.['hari6']?.hbLevel || 12;

  // --- DOM Elements ---
  const containerOpening = document.querySelector('.container-opening');
  const sceneOpening = document.querySelector('.scene-opening');

  // FIX: Kita asumsikan #scene-kuis-akhir akan dijadikan kontainer game.
  const sceneGame = document.getElementById('scene-puzzle-game');
  const sceneDashboard = document.getElementById('scene-hasil-dashboard');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');

  const mainCharacter = {
    id: userData.character,
    name: userData.characterName,
  };

  // --- Puzzle Game State ---
  const GRID_SIZE = 4;
  // Item: Tablet Fe (Fe), Makanan Fe, Vit C (Peningkat Serapan), Junk Food (Penghambat)
  const ITEMS = ['💊', '🥩', '🍊', '🍔'];
  let gameGrid = [];
  let selectedTile = null;
  let score = 0;
  let movesLeft = 10; // Batas gerakan
  const HB_TARGET = 15; // Target Hb
  const HB_INCREMENT_PER_MATCH = 0.2; // HB naik per Match-3 dasar
  const HB_COMBO_BONUS = 0.6; // Bonus HB per Fe + Vit C Match
  const MATCH_SCORE = 10;
  const PENALTY_SCORE = 15; // Penalty Match Junk Food

  // --- Helper Functions (Sound, Image, Typewriter - Reused) ---
  const bgMusic = document.getElementById('background-music');
  const soundClick = document.getElementById('sound-click');
  const soundCoolClick = document.getElementById('cool-click');
  const soundGameClick = document.getElementById('game-click');
  let isSoundOn =
    localStorage.getItem('fesmart_sound') === 'off' ? false : true;

  // Sound helpers (didefinisikan ulang agar mandiri)
  window.playClickSound = function () {
    if (isSoundOn && soundClick) {
      soundClick.currentTime = 0;
      soundClick.play().catch((e) => console.log('Click failed:', e));
    }
  };
  window.playCoolClickSound = function () {
    if (isSoundOn && soundCoolClick) {
      soundCoolClick.currentTime = 0;
      soundCoolClick.play().catch((e) => console.log('Cool click failed:', e));
    }
  };
  window.playGameClickSound = function () {
    if (isSoundOn && soundGameClick) {
      soundGameClick.currentTime = 0;
      soundGameClick.play().catch((e) => console.log('Game click failed:', e));
    }
  };

  window.playBackgroundMusic = function () {
    if (isSoundOn && bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.5;
      bgMusic.play().catch((e) => console.log('Background music failed:', e));
    }
  };

  function getCharacterImage(characterId, emotion = 'normal') {
    const characterImages = {
      siti: {
        normal: 'assets/images/characters/siti-normal.png',
        murung: 'assets/images/characters/siti-murung.png',
        senang: 'assets/images/characters/siti-senang.png',
        berpikir: 'assets/images/characters/siti-berpikir.png',
      },
      sari: {
        normal: 'assets/images/characters/sari-normal.png',
        murung: 'assets/images/characters/sari-murung.png',
        senang: 'assets/images/characters/sari-senang.png',
        berpikir: 'assets/images/characters/sari-berpikir.png',
      },
    };
    return (
      characterImages[characterId]?.[emotion] ||
      characterImages[characterId]?.['normal'] ||
      'assets/images/characters/default.png'
    );
  }

  function typeWriterMultiple(lines, speed = 40, lineDelay = 800) {
    let lineIndex = 0;
    let charIndex = 0;
    teksOpening.innerHTML = '';
    function typeLine() {
      if (lineIndex < lines.length) {
        if (charIndex === 0 && lineIndex > 0) teksOpening.innerHTML += '<br>';
        if (charIndex < lines[lineIndex].length) {
          const currentChar = lines[lineIndex].charAt(charIndex);
          if (charIndex === 0) teksOpening.innerHTML += '<strong>';
          if (charIndex % 3 === 0) playCoolClickSound();
          teksOpening.innerHTML += currentChar;
          if (currentChar === ':' && charIndex < 10)
            teksOpening.innerHTML += '</strong>';
          charIndex++;
          setTimeout(typeLine, speed);
        } else {
          lineIndex++;
          charIndex = 0;
          setTimeout(typeLine, lineDelay);
        }
      }
    }
    typeLine();
  }

  // --- Initialisation ---
  initGame();

  function initGame() {
    // Set karakter di opening
    document.getElementById('main-character-img').src = getCharacterImage(
      mainCharacter.id,
      'berpikir'
    );

    // Opening animation sequence
    setTimeout(() => {
      containerOpening.style.transform = 'translateY(-100vh)';
      containerOpening.style.transition = 'transform 1.5s ease';

      setTimeout(() => {
        sceneOpening.style.opacity = '1';
        startOpeningScene();
      }, 1600);
    }, 2000);
  }

  function startOpeningScene() {
    document.getElementById('character-main').classList.add('slide-main');
    document.getElementById('character-guru').classList.add('slide-guru');

    // Dialog Ganti ke tema Puzzle Match
    const dialogLines = [
      'GURU UKS: "Selamat! Ini adalah tantangan terakhir FeSmart. Tujuanmu: pulihkan HB mu ke level optimal!"',
      `${mainCharacter.name.toUpperCase()}: "Saya siap, Bu! Saya akan gunakan semua pengetahuan Fe + Vitamin C saya!"`,
    ];
    typeWriterMultiple(dialogLines, 40, 800);

    setTimeout(() => {
      btnStart.classList.remove('btn-hidden');
      btnStart.style.opacity = '1';
      btnStart.style.transition = 'opacity 0.8s ease';
      btnStart.textContent = 'Mulai Puzzle Iron Match';
    }, 12000);
  }

  // --- Game Logic ---
  btnStart.addEventListener('click', startPuzzleGame);

  // BARU: Menyuntikkan UI Game ke dalam scene-kuis-akhir
  function injectGameUI() {
    sceneGame.innerHTML = `
        <div class="puzzle-container">
            <div class="puzzle-header">
                <h2>🧩 Iron Match: Pulihkan HB!</h2>
            </div>
            <div class="puzzle-stats">
                <div class="stat-item">
                    <span class="stat-label">HB Level:</span>
                    <span class="stat-value hb-value" id="hb-level-display">12.0 g/dL</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Gerakan Tersisa:</span>
                    <span class="stat-value" id="moves-left-display">30</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Skor Game:</span>
                    <span class="stat-value" id="score-display">0</span>
                </div>
            </div>
            <div class="game-grid" id="game-grid">
                </div>
            <p id="game-feedback" class="game-feedback"></p>
        </div>
        <div class="character-game-puzzle">
            <img id="main-character-game-img" src="${getCharacterImage(
              mainCharacter.id,
              'berpikir'
            )}" alt="Karakter Fokus" />
        </div>
    `;
  }

  function startPuzzleGame() {
    playGameClickSound();
    sceneOpening.style.opacity = '0';

    setTimeout(() => {
      sceneOpening.style.display = 'none';
      sceneGame.style.display = 'flex';

      injectGameUI();

      // Set initial stats
      document.getElementById(
        'hb-level-display'
      ).textContent = `${currentHbLevel.toFixed(1)} g/dL`;
      document.getElementById('moves-left-display').textContent = movesLeft;
      document.getElementById('score-display').textContent = score;

      initializeGrid();
      drawGrid();
    }, 800);
  }

  // Helper untuk mendapatkan item random
  function getRandomItem() {
    return ITEMS[Math.floor(Math.random() * ITEMS.length)];
  }

  // Inisialisasi grid (memastikan tidak ada match awal)
  function initializeGrid() {
    gameGrid = [];
    for (let r = 0; r < GRID_SIZE; r++) {
      gameGrid[r] = [];
      for (let c = 0; c < GRID_SIZE; c++) {
        let newItem;
        // Simple check to prevent initial 3 match
        do {
          newItem = getRandomItem();
        } while (
          (r >= 2 &&
            gameGrid[r - 1][c] === newItem &&
            gameGrid[r - 2][c] === newItem) ||
          (c >= 2 &&
            gameGrid[r][c - 1] === newItem &&
            gameGrid[r][c - 2] === newItem)
        );
        gameGrid[r][c] = newItem;
      }
    }
  }

  // Menggambar grid ke HTML
  function drawGrid() {
    const gridContainer = document.getElementById('game-grid');
    if (!gridContainer) return;

    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;

    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        const tile = document.createElement('div');
        tile.className = 'game-tile';
        tile.dataset.row = r;
        tile.dataset.col = c;
        tile.textContent = gameGrid[r][c];
        tile.addEventListener('click', handleTileClick);
        gridContainer.appendChild(tile);
      }
    }
    updateGameStats();
  }

  function updateGameStats() {
    document.getElementById(
      'hb-level-display'
    ).textContent = `${currentHbLevel.toFixed(1)} g/dL`;
    document.getElementById('moves-left-display').textContent = movesLeft;
    document.getElementById('score-display').textContent = score;

    // Cek Game Over
    if (currentHbLevel >= HB_TARGET) {
      endGame(
        true,
        'Target HB Optimal Tercapai! Pengetahuan nutrisi terbukti!'
      );
    } else if (movesLeft <= 0) {
      endGame(
        false,
        'Gerakan Habis. Skor HB: ' + currentHbLevel.toFixed(1) + ' g/dL.'
      );
    }
  }

  function handleTileClick(event) {
    playClickSound();
    const tile = event.target;
    const r = parseInt(tile.dataset.row);
    const c = parseInt(tile.dataset.col);

    if (selectedTile) {
      const selectedR = parseInt(selectedTile.dataset.row);
      const selectedC = parseInt(selectedTile.dataset.col);

      // Cek apakah petak berdekatan
      if (Math.abs(r - selectedR) + Math.abs(c - selectedC) === 1) {
        // Swap Tiles
        swapTiles(r, c, selectedR, selectedC);

        // Cek Match setelah swap
        let matchedTiles = checkMatches();
        if (matchedTiles.length > 0) {
          movesLeft--;
          processMatches(matchedTiles);
        } else {
          // Jika tidak ada match, kembalikan swap
          swapTiles(r, c, selectedR, selectedC);
          document.getElementById('game-feedback').textContent =
            'Tidak ada match. Coba langkah lain!';
        }

        // Reset selection
        selectedTile.classList.remove('selected');
        selectedTile = null;
        updateGameStats();
      } else {
        // Pilih tile baru
        selectedTile.classList.remove('selected');
        selectedTile = tile;
        selectedTile.classList.add('selected');
      }
    } else {
      // Pilih tile pertama
      selectedTile = tile;
      selectedTile.classList.add('selected');
    }
  }

  function swapTiles(r1, c1, r2, c2) {
    [gameGrid[r1][c1], gameGrid[r2][c2]] = [gameGrid[r2][c2], gameGrid[r1][c1]];
    drawGrid();
  }

  // Implementasi sederhana checkMatches (hanya horizontal dan vertikal)
  function checkMatches() {
    let matches = [];

    // Cek Horizontal
    for (let r = 0; r < GRID_SIZE; r++) {
      // Loop hanya sampai GRID_SIZE - 2
      for (let c = 0; c < GRID_SIZE - 2; c++) {
        // PENTING: Pastikan item tidak null sebelum dibandingkan (walaupun harusnya sudah dicek di gravity)
        if (
          gameGrid[r][c] !== null &&
          gameGrid[r][c] === gameGrid[r][c + 1] &&
          gameGrid[r][c] === gameGrid[r][c + 2]
        ) {
          // Tambahkan koordinat awal match
          matches.push({ r: r, c: c, item: gameGrid[r][c], direction: 'H' });
        }
      }
    }

    // Cek Vertikal
    for (let c = 0; c < GRID_SIZE; c++) {
      // Loop hanya sampai GRID_SIZE - 2
      for (let r = 0; r < GRID_SIZE - 2; r++) {
        if (
          gameGrid[r][c] !== null &&
          gameGrid[r][c] === gameGrid[r + 1][c] &&
          gameGrid[r][c] === gameGrid[r + 2][c]
        ) {
          // Tambahkan koordinat awal match
          matches.push({ r: r, c: c, item: gameGrid[r][c], direction: 'V' });
        }
      }
    }
    return matches;
  }

  function processMatches(matches) {
    let tilesToRemove = new Set();
    let hbChange = 0;
    let comboCount = 0;

    matches.forEach((match) => {
      // Tandai ubin yang akan dihapus
      for (let i = 0; i < 3; i++) {
        // Menggunakan Set untuk menghindari duplikasi match
        if (match.direction === 'H')
          tilesToRemove.add(`${match.r},${match.c + i}`);
        if (match.direction === 'V')
          tilesToRemove.add(`${match.r + i},${match.c}`);
      }

      // LOGIKA SKOR DAN HB
      score += MATCH_SCORE;

      const isFe = match.item === '💊' || match.item === '🥩';
      const isVitC = match.item === '🍊';
      const isJunk = match.item === '🍔';

      if (isFe || isVitC) {
        hbChange += HB_INCREMENT_PER_MATCH;
        document.getElementById('game-feedback').textContent = `Match ${
          match.item
        }! HB naik +${HB_INCREMENT_PER_MATCH.toFixed(1)}!`;
        comboCount++;
      } else if (isJunk) {
        score -= PENALTY_SCORE;
        hbChange -= HB_INCREMENT_PER_MATCH;
        document.getElementById(
          'game-feedback'
        ).textContent = `Match Junk Food! HB turun -${HB_INCREMENT_PER_MATCH.toFixed(
          1
        )}!`;
      } else {
        document.getElementById('game-feedback').textContent = `Match Biasa.`;
      }
    });

    // LOGIKA COMBO (Fe + Vit C)
    // Jika ada match Fe DAN Vit C dalam 1 gerakan (comboCount > 1), berikan bonus
    if (comboCount > 1) {
      hbChange += HB_COMBO_BONUS;
      document.getElementById(
        'game-feedback'
      ).textContent += ` KEKUATAN KOMBO Fe + Vit C! HB Bonus +${HB_COMBO_BONUS.toFixed(
        1
      )}!`;
    }

    currentHbLevel = Math.max(
      8,
      Math.min(HB_TARGET + 1, currentHbLevel + hbChange)
    ); // Batasi HB min 8

    // Hapus ubin dan terapkan gravitasi
    applyGravityAndRefill(tilesToRemove);

    // Cek match berturut-turut (cascading)
    // Cek match berturut-turut (cascading)
    setTimeout(() => {
      let cascadeMatches = checkMatches();
      if (cascadeMatches.length > 0) {
        processMatches(cascadeMatches); // Rekursi
      } else {
        drawGrid(); // Gambar ulang setelah semua cascade selesai
      }
    }, 200);
  }

  function applyGravityAndRefill(tilesToRemove) {
    // 1. Ganti item yang dihapus dengan item null
    tilesToRemove.forEach((pos) => {
      const [r, c] = pos.split(',').map(Number);
      gameGrid[r][c] = null;
    });

    // 2. Terapkan Gravitasi (Ubin jatuh ke bawah)
    for (let c = 0; c < GRID_SIZE; c++) {
      let writeRow = GRID_SIZE - 1; // Baris terendah yang tersedia untuk diisi
      // Loop dari bawah ke atas
      for (let r = GRID_SIZE - 1; r >= 0; r--) {
        if (gameGrid[r][c] !== null) {
          if (r !== writeRow) {
            // Pindahkan item ke baris terendah yang tersedia (writeRow)
            gameGrid[writeRow][c] = gameGrid[r][c];
            gameGrid[r][c] = null; // Kosongkan posisi lama
          }
          writeRow--; // Pindah ke baris di atasnya untuk item berikutnya
        }
      }
    }

    // 3. Isi ulang dari atas (Baris yang sekarang null akan diisi item baru)
    for (let c = 0; c < GRID_SIZE; c++) {
      for (let r = 0; r < GRID_SIZE; r++) {
        if (gameGrid[r][c] === null) {
          gameGrid[r][c] = getRandomItem();
        }
      }
    }
  }

  // --- Final Dashboard Logic ---
  function showFinalDashboard(finalScore, win) {
    playGameClickSound();
    sceneGame.style.display = 'none';
    sceneDashboard.style.display = 'block';

    // Pengetahuan yang didapat di hari 7 (simbolis, berdasarkan win/loss)
    const knowledgeHariIni = win ? 5 : 2;
    const finalHb = currentHbLevel.toFixed(1);

    // TOTAL AKUMULASI DARI SEMUA HARI
    const totalKnowledgePoints = totalKnowledge + knowledgeHariIni;
    const finalComplianceScore = totalCompliance;

    // Simpan progres Hari 7 (final)
    userData.progress['hari7'] = {
      completed: true,
      score: finalScore,
      knowledge: knowledgeHariIni,
      hbLevel: finalHb,
    };
    userData.totalKnowledge = totalKnowledgePoints;
    userData.finalHb = finalHb;
    localStorage.setItem('fesmart_user', JSON.stringify(userData));

    // Update UI Dashboard
    document.getElementById(
      'score-pengetahuan-akhir'
    ).textContent = `${totalKnowledgePoints} Poin`;
    document.getElementById(
      'score-kepatuhan-akhir'
    ).textContent = `${finalComplianceScore} Poin`;

    const finalMessageElement = document.getElementById('final-message');
    let message = '';
    let emotion = 'normal';

    if (win) {
      message = `🎉 Luar Biasa! Kamu berhasil mencapai HB Level ${finalHb} g/dL! Pengetahuan nutrisi dan Fe terbukti maksimal!`;
      emotion = 'senang';
    } else if (currentHbLevel >= 12) {
      message = `👍 Selamat! Meskipun target belum tercapai, HB Levelmu tetap sehat (${finalHb} g/dL). Terus pertahankan!`;
      emotion = 'normal';
    } else {
      message = `⚠️ Jangan Menyerah! HB Levelmu (${finalHb} g/dL) masih rendah. Ingat, kombinasi Fe dan Vitamin C adalah kunci!`;
      emotion = 'murung';
    }

    finalMessageElement.innerHTML = `<strong>${message}</strong>`;

    document.getElementById('main-character-hasil-img').src = getCharacterImage(
      mainCharacter.id,
      emotion
    );

    // Simulasikan Grafik (menggunakan Chart.js)
    const ctx = document.getElementById('xyChart').getContext('2d');
    const xyChart = new Chart(ctx, {
      type: 'bar', // Menggunakan bar chart lebih jelas untuk perbandingan akhir
      data: {
        labels: ['Pengetahuan Kumulatif', 'Kepatuhan Kumulatif'],
        datasets: [
          {
            label: 'Skor Akhir',
            data: [totalKnowledgePoints, finalComplianceScore],
            backgroundColor: [
              'rgba(255, 165, 0, 0.7)',
              'rgba(76, 217, 100, 0.7)',
            ],
            borderColor: ['rgb(255, 165, 0)', 'rgb(76, 217, 100)'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(totalKnowledgePoints, finalComplianceScore, 50),
            title: {
              display: true,
              text: 'Poin Total',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `HB Akhir: ${finalHb} g/dL`,
          },
        },
      },
    });

    document.querySelector('.message-chart-placeholder').style.display = 'none';

    document.getElementById('btn-selesai').onclick = () => {
      // Hapus data pengguna untuk memulai game baru
      localStorage.removeItem('fesmart_user');
      window.location.href = 'index.html';
    };
  }

  // --- Fungsi Tambahan: Responsive dan Init ---
  function checkWindowSize() {
    // ... (Logika responsive button)
  }

  playBackgroundMusic();
  checkWindowSize();
  window.addEventListener('resize', checkWindowSize);
});
