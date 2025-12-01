document.addEventListener('DOMContentLoaded', function () {
  // --- Global Setup ---
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  // Current State
  let currentDay = 3; // Start from Day 3
  let currentEnergy = 55;
  let currentKnowledge = userData.totalKnowledge || 0;
  let complianceBonus = 0; // Compliance points from Fe intake (from Hari 2 logic)

  // Game Elements
  const containerOpening = document.querySelector('.container-opening');
  const sceneOpening = document.querySelector('.scene-opening');
  const scenePilihMenu = document.querySelector('.scene-pilih-menu');
  const sceneAktivitas = document.querySelector('.scene-aktivitas');
  const sceneKuisHarian = document.getElementById('scene-kuis-harian');
  const sceneHasil = document.querySelector('.scene-hasil');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');
  const hariTitle = document.getElementById('hari-title');
  const currentDayBtn = document.getElementById('current-day-btn');
  const finishDayBtn = document.getElementById('finish-day-btn');

  // Audio setup (Reusing global functions from previous files)
  const bgMusic = document.getElementById('background-music');
  const soundClick = document.getElementById('sound-click');
  const soundCoolClick = document.getElementById('cool-click');
  const soundGameClick = document.getElementById('game-click');
  let isSoundOn =
    localStorage.getItem('fesmart_sound') === 'off' ? false : true;

  // --- Utility Functions (Replicated from hari1.js/hari2.js for consistency) ---
  window.playCoolClickSound = () => {
    if (isSoundOn && soundCoolClick) {
      soundCoolClick.currentTime = 0;
      soundCoolClick.play().catch((e) => console.log('Click failed:', e));
    }
  };
  window.playGameClickSound = () => {
    if (isSoundOn && soundGameClick) {
      soundGameClick.currentTime = 0;
      soundGameClick.play().catch((e) => console.log('Click failed:', e));
    }
  };
  window.playBackgroundMusic = () => {
    if (isSoundOn && bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.5;
      bgMusic.play().catch((e) => console.log('BGM blocked:', e));
    }
  };
  window.toggleSound = () => {
    isSoundOn = !isSoundOn;
    localStorage.setItem('fesmart_sound', isSoundOn ? 'on' : 'off');
    const soundBtn = document.querySelector(
      '.control-btn[onclick="toggleSound()"]'
    );
    if (soundBtn) soundBtn.innerHTML = isSoundOn ? '🔊 Sound' : '🔇 Sound';
    if (isSoundOn) playBackgroundMusic();
    else if (bgMusic) bgMusic.pause();
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
  function updateCharacterElements() {
    const mainCharacterImg = document.getElementById('main-character-img');
    mainCharacterImg.src = getCharacterImage(userData.character, 'normal');
    mainCharacterImg.alt = userData.characterName;
    document.getElementById('aktivitas-character-name').textContent =
      userData.characterName;
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

  // --- Game Data ---
  const menuGameData = [
    { name: 'Hati Ayam', icon: '🍗', category: 'zat-besi' },
    { name: 'Bayam', icon: '🍃', category: 'zat-besi' },
    { name: 'Daging Sapi', icon: '🥩', category: 'zat-besi' },
    { name: 'Teh', icon: '🍵', category: 'penghambat' },
    { name: 'Kopi', icon: '☕', category: 'penghambat' },
    { name: 'Junk Food', icon: '🍔', category: 'penghambat' },
  ].sort(() => Math.random() - 0.5); // Shuffle options

  const dailyKuisData = {
    3: {
      soal: 'Mengapa Vitamin C penting saat mengonsumsi makanan/suplemen zat besi?',
      opsi: [
        'Membuat rasa tablet Fe lebih enak',
        'Membantu penyerapan zat besi menjadi lebih efektif',
        'Mencegah efek samping pusing',
        'Tidak ada hubungannya sama sekali',
      ],
      jawaban: 1,
      score: 1,
    },
    4: {
      soal: 'Aktivitas fisik berlebihan dapat menyebabkan tubuh membutuhkan lebih banyak zat besi. Makanan apa yang paling cepat memulihkan energi dan zat besi?',
      opsi: [
        'Mie instan',
        'Minuman soda',
        'Hati ayam dan sayuran hijau',
        'Permen karet',
      ],
      jawaban: 2,
      score: 1,
    },
    5: {
      soal: 'Jika kamu minum Fe dengan teh/kopi, apa dampaknya?',
      opsi: [
        'Zat besi lebih cepat diserap tubuh',
        'Zat besi akan sulit diserap tubuh',
        'Meningkatkan kadar gula darah',
        'Tidak ada dampak',
      ],
      jawaban: 1,
      score: 1,
    },
  };

  const activityData = {
    3: {
      title: 'Simulasi Olahraga Ringan',
      message: `${userData.characterName} baru saja selesai olahraga. Energi kamu terasa turun!`,
      energyChange: -20,
      rewardMessage: `Energi kembali! +1 poin kepatuhan karena memilih makanan kaya Fe.`,
    },
    4: {
      title: 'Simulasi Belajar Kelompok Malam',
      message: `${userData.characterName} begadang semalam suntuk untuk belajar kelompok. Kamu butuh dorongan energi sehat!`,
      energyChange: -15,
      rewardMessage: `Energi stabil! +1 poin kepatuhan karena memilih sumber energi sehat.`,
    },
    5: {
      title: 'Simulasi Perjalanan Jauh',
      message: `${userData.characterName} baru pulang dari perjalanan jauh dan terasa lelah. Pilih makanan untuk pulihkan energi!`,
      energyChange: -25,
      rewardMessage: `Pemulihan sempurna! +1 poin kepatuhan karena pemulihan energi yang bijak.`,
    },
  };

  const dailyFoodOptions = [
    { name: 'Hati Ayam', icon: '🍗', energy: +30, type: 'positive' },
    { name: 'Susu Cokelat', icon: '🥛', energy: +10, type: 'negative' }, // Contains calcium/lactose
  ];

  // --- Initialisation ---
  initGame();

  function initGame() {
    updateCharacterElements();
    loadDayState(currentDay);

    setTimeout(() => {
      containerOpening.style.transform = 'translateY(-100vh)';
      containerOpening.style.transition = 'transform 1.5s ease';
      setTimeout(() => {
        sceneOpening.style.opacity = '1';
        startOpeningScene();
      }, 1600);
    }, 2000);
  }

  function loadDayState(day) {
    hariTitle.textContent = `Hari - ${day}`;
    currentDayBtn.textContent = day;
    finishDayBtn.textContent = day;
    document.getElementById(
      'aktivitas-header-title'
    ).textContent = `🏃 Aktivitas Harian - Hari ${day}`;
    document.getElementById(
      'kuis-harian-title'
    ).textContent = `📚 Kuis Harian - Hari ${day}`;
    document.getElementById(
      'final-result-title'
    ).textContent = `🎉 Selamat! Hari ${day} Selesai`;

    // Ambil data progres dari localStorage
    const dayProgress = userData.progress[`hari${day}`];
    if (dayProgress) {
      currentEnergy = dayProgress.energy || 55;
      currentKnowledge = userData.totalKnowledge || 0;
    } else {
      // Reset state jika belum ada data hari ini
      currentEnergy = 55;
      currentKnowledge = userData.totalKnowledge || 0;
      complianceBonus = 0;
    }
  }

  // --- Opening Scene Logic ---
  function startOpeningScene() {
    setTimeout(() => {
      document.getElementById('character-main').classList.add('slide-main');
      document.getElementById('character-teman').classList.add('slide-teman');
    }, 500);

    setTimeout(() => {
      showDialog();
    }, 1500);

    setTimeout(() => {
      btnStart.classList.remove('btn-hidden');
      btnStart.style.opacity = '1';
      btnStart.style.transition = 'opacity 0.8s ease';
      document.getElementById('btn-kembali').classList.remove('btn-hidden');
      document.getElementById('btn-kembali').style.opacity = '1';
      document.getElementById('btn-kembali').onclick = () =>
        (window.location.href = 'hari2.html');
    }, 15000);
  }

  function showDialog() {
    const dialogLines = [
      `TEMAN: "Hai ${userData.characterName}, hari ini kita fokus ke pola makan yang benar. Bukan cuma minum Fe, makanan juga penentu!"`,
      `${userData.characterName.toUpperCase()}: "Oh, jadi ada makanan yang mempercepat dan menghambat penyerapan zat besi ya?"`,
      'TEMAN: "Betul sekali! Coba kamu buktikan pengetahuanmu di mini-game ini!"',
    ];
    typeWriterMultiple(dialogLines, 40, 800);
  }

  // --- Mini Game "Pilih Menu" Logic ---
  btnStart.addEventListener('click', startMiniGame);

  function startMiniGame() {
    playGameClickSound();
    sceneOpening.style.opacity = '0';
    setTimeout(() => {
      sceneOpening.style.display = 'none';
      scenePilihMenu.style.display = 'block';
      loadMenuGame();
    }, 800);
  }

  function loadMenuGame() {
    const characterMenuImg = document.getElementById('main-character-menu-img');
    if (characterMenuImg) {
      characterMenuImg.src = getCharacterImage(userData.character, 'normal');
    }
    const optionsContainer = document.getElementById('menu-options-container');
    optionsContainer.innerHTML = '';
    document.getElementById('drop-penghambat').innerHTML = '';
    document.getElementById('drop-zat-besi').innerHTML = '';
    document.getElementById('menu-game-feedback').textContent = '';
    document.getElementById('btn-submit-menu').disabled = false;
    document.getElementById('btn-submit-menu').textContent =
      'Cek Hasil Pilihan';

    menuGameData.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'menu-card';
      card.draggable = true;
      card.dataset.name = item.name;
      card.dataset.category = item.category;
      card.id = `menu-card-${index}`;
      card.innerHTML = `<span>${item.icon}</span>${item.name}`;

      // Drag events
      card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.style.opacity = '0.5';
      });
      card.addEventListener('dragend', (e) => {
        e.target.style.opacity = '1';
      });

      optionsContainer.appendChild(card);
    });

    // Drop events
    document.querySelectorAll('.drop-area').forEach((area) => {
      area.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(data);
        const targetCategory = e.target.closest('.drop-area').dataset.category;

        if (
          draggedElement &&
          draggedElement.dataset.category === targetCategory
        ) {
          playCoolClickSound();
          const droppedItemContainer = e.target
            .closest('.drop-area')
            .querySelector('.dropped-items');
          const droppedItem = document.createElement('span');
          droppedItem.className = `dropped-item ${
            targetCategory === 'zat-besi' || targetCategory === 'zat-besi-plus'
              ? 'positive'
              : 'negative'
          }`;
          droppedItem.textContent = draggedElement.dataset.name;
          droppedItemContainer.appendChild(droppedItem);
          draggedElement.remove(); // Remove from options
        } else if (draggedElement) {
          // Wrong drop
          playGameClickSound();
          document.getElementById('menu-game-feedback').textContent =
            '⚠️ Menu tidak cocok! Coba lagi.';
          document.getElementById('menu-game-feedback').className =
            'game-feedback error';
        }
      });
    });

    document.getElementById('btn-submit-menu').onclick = checkMenuGame;
  }

  function checkMenuGame() {
    playGameClickSound();
    document.getElementById('btn-submit-menu').disabled = true;
    const characterMenuImg = document.getElementById('main-character-menu-img');
    let emotion = 'normal';
    let correctPicks = 0;
    let totalItems = 0;

    const itemsZatBesi = document
      .getElementById('drop-zat-besi')
      .querySelectorAll('.dropped-item');
    const itemsPenghambat = document
      .getElementById('drop-penghambat')
      .querySelectorAll('.dropped-item');

    // Check all original positive/negative items
    menuGameData.forEach((item) => {
      if (item.category === 'zat-besi' || item.category === 'penghambat') {
        totalItems++;
        const isCorrectlyPlaced =
          (item.category === 'zat-besi' &&
            Array.from(itemsZatBesi).some(
              (e) => e.textContent === item.name
            )) ||
          (item.category === 'penghambat' &&
            Array.from(itemsPenghambat).some(
              (e) => e.textContent === item.name
            ));

        if (isCorrectlyPlaced) {
          correctPicks++;
        }
      }
    });

    // Add bonus logic for special items (e.g. Jeruk is Fe+Vit C, so it's positive)
    menuGameData
      .filter((item) => item.category === 'zat-besi-plus')
      .forEach((item) => {
        totalItems++;
        if (Array.from(itemsZatBesi).some((e) => e.textContent === item.name)) {
          correctPicks++;
        }
      });

    let scorePilihMenu =
      correctPicks > 0 ? Math.floor((correctPicks / totalItems) * 2) : 0; // Max 2 points

    // Update total knowledge for temporary feedback
    currentKnowledge += scorePilihMenu;

    let feedback = '';
    if (scorePilihMenu >= 2) {
      feedback = `✅ Hebat! Kamu dapat +${scorePilihMenu} Poin Pengetahuan.`;
      document.getElementById('menu-game-feedback').className =
        'game-feedback success';
      emotion = 'senang';
    } else {
      feedback = `❌ Sayang sekali. Coba pelajari lagi tentang zat besi dan penghambat. Kamu dapat +${scorePilihMenu} Poin Pengetahuan.`;
      document.getElementById('menu-game-feedback').className =
        'game-feedback error';
      emotion = 'murung';
    }

    if (characterMenuImg) {
      characterMenuImg.src = getCharacterImage(userData.character, emotion);
    }
    document.getElementById('menu-game-feedback').textContent = feedback;

    // Next step
    setTimeout(startAktivitasSimulasi, 2500);
  }

  // --- Simulasi Aktivitas Harian Logic ---
  function startAktivitasSimulasi() {
    scenePilihMenu.style.display = 'none';
    sceneAktivitas.style.display = 'block';

    const activity = activityData[currentDay];
    currentEnergy = Math.max(0, currentEnergy + activity.energyChange);

    document.getElementById('daily-action-card').innerHTML = `
      <h3>${activity.title}</h3>
      <p>${activity.message} **Energi turun ${Math.abs(
      activity.energyChange
    )}!**</p>
      <div class="food-options-small" id="food-options-small">
        ${dailyFoodOptions
          .map(
            (food, index) => `
          <div class="food-card-small" data-food-id="${index}" data-energy="${
              food.energy
            }" data-name="${food.name}" data-type="${food.type}" >
            ${food.icon} ${food.name} <div class="energy-change">${
              food.energy > 0 ? `+${food.energy}` : food.energy
            } Energy</div>
          </div>
        `
          )
          .join('')}
      </div>
      <p id="simulasi-feedback" style="margin-top: 20px; font-weight: bold;"></p>
    `;

    updateDailyStats();

    // Add food selection logic
    document.querySelectorAll('.food-card-small').forEach((card) => {
      card.onclick = handleFoodSelection;
    });

    document.getElementById('btn-next-step').onclick = startKuisHarian;
    document.getElementById('btn-next-step').disabled = true; // Disable until food is selected/skipped
  }

  function updateDailyStats() {
    const energyElement = document.getElementById('aktivitas-energy-value');
    energyElement.textContent = `${currentEnergy}%`;
    energyElement
      .closest('.daily-stat-item')
      .classList.remove('energy-low', 'energy-ok');

    if (currentEnergy < 30) {
      energyElement.closest('.daily-stat-item').classList.add('energy-low');
    } else if (currentEnergy > 70) {
      energyElement.closest('.daily-stat-item').classList.add('energy-ok');
    }

    document.getElementById('knowledge-value').textContent = currentKnowledge;
  }

  function handleFoodSelection() {
    playCoolClickSound();
    const card = this;
    const energyChange = parseInt(card.dataset.energy);
    const isPositive = card.dataset.type === 'positive';
    const simulasiFeedback = document.getElementById('simulasi-feedback');

    document
      .querySelectorAll('.food-card-small')
      .forEach((c) => c.classList.remove('selected-food'));
    card.classList.add('selected-food');

    currentEnergy = Math.min(100, currentEnergy + energyChange);

    if (isPositive) {
      complianceBonus = 1; // 1 point for good choice
      simulasiFeedback.textContent = activityData[currentDay].rewardMessage;
      simulasiFeedback.style.color = '#4cd964';
    } else {
      complianceBonus = 0; // No compliance bonus
      simulasiFeedback.textContent = `❌ Pilihan kurang optimal. ${card.dataset.name} bukan yang terbaik untuk pulihkan Fe.`;
      simulasiFeedback.style.color = '#ff3b30';
    }

    updateDailyStats();
    document.getElementById('btn-next-step').disabled = false;
  }

  // --- Kuis Harian Logic ---
  function startKuisHarian() {
    playGameClickSound();
    sceneAktivitas.style.display = 'none';
    sceneKuisHarian.style.display = 'block';

    const mainCharacterKuisImg = document.getElementById(
      'main-character-kuis-img'
    );
    if (mainCharacterKuisImg) {
      // Mengatur src gambar. 'berpikir' adalah pose yang cocok untuk kuis.
      mainCharacterKuisImg.src = getCharacterImage(
        userData.character,
        'berpikir'
      );
      mainCharacterKuisImg.alt = `${userData.characterName} Berpikir`;
    }

    const kuis = dailyKuisData[currentDay];
    const kuisContent = document.getElementById('kuis-harian-content');

    // Reset Kuis UI
    document.getElementById('kuis-progress-fill').style.width = '100%';
    document.getElementById('kuis-progress-text').textContent = '1/1';
    document.getElementById('btn-check-answer').style.display = 'block';
    document.getElementById('btn-finish-day').style.display = 'none';

    kuisContent.innerHTML = `
      <div class="soal-kuis slide-up">
        <h3>${kuis.soal}</h3>
        <div class="opsi-jawaban">
          ${kuis.opsi
            .map(
              (opsi, i) => `
            <label>
              <input type="radio" name="jawaban" value="${i}">
              <span class="opsi-text">${String.fromCharCode(
                65 + i
              )}. ${opsi}</span>
            </label>
          `
            )
            .join('')}
        </div>
        <p id="kuis-feedback" style="margin-top: 20px; font-weight: bold; min-height: 20px;"></p>
      </div>
    `;

    document.getElementById('btn-check-answer').onclick = checkKuisAnswer;
    document.getElementById('btn-finish-day').onclick = showHasilAkhir;
  }

  function checkKuisAnswer() {
    playGameClickSound();
    const selectedAnswer = document.querySelector(
      'input[name="jawaban"]:checked'
    );
    const kuisFeedback = document.getElementById('kuis-feedback');
    const kuis = dailyKuisData[currentDay];

    if (!selectedAnswer) {
      alert('Pilih jawaban terlebih dahulu!');
      return;
    }

    document.getElementById('btn-check-answer').style.display = 'none';
    document.getElementById('btn-finish-day').style.display = 'block';

    const isCorrect = parseInt(selectedAnswer.value) === kuis.jawaban;
    if (isCorrect) {
      currentKnowledge += kuis.score;
      kuisFeedback.textContent = `✅ Jawaban Benar! +${kuis.score} Poin Pengetahuan.`;
      kuisFeedback.style.color = '#4cd964';
      emotion = 'senang';
    } else {
      kuisFeedback.textContent = `❌ Jawaban Salah. Jawaban yang benar adalah: ${
        kuis.opsi[kuis.jawaban]
      }.`;
      kuisFeedback.style.color = '#ff3b30';
      emotion = 'murung';
    }

    const mainCharacterKuisImg = document.getElementById(
      'main-character-kuis-img'
    );
    if (mainCharacterKuisImg) {
      mainCharacterKuisImg.src = getCharacterImage(userData.character, emotion);
    }

    // Disable all options after checking
    document
      .querySelectorAll('input[name="jawaban"]')
      .forEach((input) => (input.disabled = true));
    updateDailyStats();
  }

  // --- Hasil Akhir Logic ---
  function showHasilAkhir() {
    playGameClickSound();
    sceneKuisHarian.style.display = 'none';
    sceneHasil.style.display = 'block';

    // Total Score for the Day
    const totalDayScore = currentKnowledge + complianceBonus;

    // Save Progress to localStorage
    userData.progress[`hari${currentDay}`] = {
      completed: true,
      score: totalDayScore,
      knowledge: currentKnowledge,
      compliance: complianceBonus,
      energy: currentEnergy,
    };
    userData.totalKnowledge = currentKnowledge;
    localStorage.setItem('fesmart_user', JSON.stringify(userData));

    // Update UI
    const hasilMessage = document.getElementById('hasil-message');
    hasilMessage.innerHTML = `
      <div class="score-detail">
        <div class="score-item-detail">
          <span class="score-label">Skor Mini Game & Kuis:</span>
          <span class="score-value">${currentKnowledge}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Skor Kepatuhan Harian:</span>
          <span class="score-value">${complianceBonus}</span>
        </div>
        <div class="score-item-detail total-item">
          <span class="score-label">Total Skor Hari ${currentDay}:</span>
          <span class="score-value total-value">${totalDayScore}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Energi Akhir:</span>
          <span class="score-value">${currentEnergy}%</span>
        </div>
      </div>
    `;

    // Feedback
    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';

    const characterHasilAkhir = document.getElementById(
      'main-character-hasil-img'
    );
    characterHasilAkhir.src = getCharacterImage(userData.character, 'normal');

    if (totalDayScore >= 3 && currentEnergy >= 70) {
      feedbackMessage.innerHTML =
        '🎉 <strong>Luar biasa!</strong> Pola makan dan pengetahuanmu sangat baik hari ini!';
      feedbackMessage.style.color = '#4CD964';
      characterHasilAkhir.src = getCharacterImage(userData.character, 'senang');
    } else if (totalDayScore >= 2) {
      feedbackMessage.innerHTML =
        '👍 <strong>Bagus!</strong> Perhatikan lagi kombinasi makanan dan aktivitasmu.';
      feedbackMessage.style.color = '#FF9500';
    } else {
      feedbackMessage.innerHTML =
        '💪 <strong>Tingkatkan!</strong> Pilih menu yang tepat untuk menjaga energimu.';
      feedbackMessage.style.color = '#FF3B30';
      characterHasilAkhir.src = getCharacterImage(userData.character, 'murung');
    }

    hasilMessage.appendChild(feedbackMessage);

    // Button Next Day Logic
    const btnNextDay = document.getElementById('btn-next-day');
    if (currentDay < 5) {
      btnNextDay.textContent = `Lanjut ke Hari ${currentDay + 1}`;
      btnNextDay.onclick = () => {
        playGameClickSound();
        currentDay++;
        loadNextDay();
      };
    } else {
      btnNextDay.textContent = 'Selesaikan Tahap 3-5';
      btnNextDay.onclick = () => {
        playGameClickSound();
        window.location.href = 'hari6.html';
      };
    }
  }

  function loadNextDay() {
    loadDayState(currentDay);
    // Reset UI state for the new day
    sceneHasil.style.display = 'none';
    containerOpening.style.transform = 'translateY(0)';
    containerOpening.style.transition = 'none';
    sceneOpening.style.opacity = '0';
    sceneOpening.style.display = 'block';

    // Force reload day content
    setTimeout(() => {
      containerOpening.style.transition = 'transform 1.5s ease';
      containerOpening.style.transform = 'translateY(-100vh)';
      setTimeout(() => {
        sceneOpening.style.opacity = '1';
        startOpeningScene();
      }, 1600);
    }, 100);
  }

  // --- Pengetahuan Auto-Lupa (Future Feature based on prompt) ---
  // Pengetahuan tinggi -> karakter otomatis lebih sering "ingat minum Fe" (Compliance logic in hari2/hari6-7)
  // Pengetahuan rendah -> karakter sering lupa -> kepatuhan turun (Will be simulated in final phase)
});
