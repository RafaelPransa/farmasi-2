document.addEventListener('DOMContentLoaded', function () {
  // --- Global Setup ---
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));


  // Current State
  let currentDay = 3; // Start from Day 3
  let currentEnergy = 55;
  // Ambil total pengetahuan dari hari sebelumnya, JANGAN diakumulasi di sini
  let currentKnowledge = userData.totalKnowledge || 0;
  let complianceBonus = 0;
  let scorePilihMenu = 0; // BARU: Tambahkan variabel untuk menyimpan skor mini game

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

  window.playClickSound = function () {
    if (isSoundOn && soundClick) {
      soundClick.currentTime = 0; // Memastikan suara dapat diputar cepat
      soundClick
        .play()
        .catch((e) => console.log('Click sound failed to play:', e));
    }
  };
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
  window.playBackgroundMusic = function () {
    if (isSoundOn && bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.5;
      bgMusic
        .play()
        .catch((e) => console.log('Background music auto-play blocked:', e));
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
        capeOlahraga: 'assets/images/characters/siti-cape-olahraga.png',
        senangOlahraga: 'assets/images/characters/siti-senang-olahraga.png',
      },
      sari: {
        normal: 'assets/images/characters/sari-normal.png',
        murung: 'assets/images/characters/sari-murung.png',
        senang: 'assets/images/characters/sari-senang.png',
        berpikir: 'assets/images/characters/sari-berpikir.png',
        capeOlahraga: 'assets/images/characters/sari-cape-olahraga.png',
        senangOlahraga: 'assets/images/characters/sari-senang-olahraga.png',
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

  // Diperbarui: 5 soal kuis harian
  const masterDailyKuis = [
    {
      soal: '1. Apa penyebab utama anemia pada remaja putri?',
      opsi: [
        'Kurang minum air putih',
        'Kekurangan zat besi', // Jawaban Benar (Indeks 1)
        'Terlalu sering olahraga',
        'Kebanyakan tidur',
      ],
      jawaban: 1,
      score: 1,
    },
    {
      soal: '2. Kebiasaan makan apa yang dapat meningkatkan risiko anemia?',
      opsi: [
        'Jarang makan sumber protein hewani', // Jawaban Benar (Indeks 0)
        'Sering makan sayuran hijau',
        'Minum jus buah setiap hari',
        'Makan tiga kali sehari',
      ],
      jawaban: 0,
      score: 1,
    },
    {
      soal: '3. Kondisi fisiologis apa yang membuat remaja putri lebih berisiko anemia?',
      opsi: [
        'Pertumbuhan rambut',
        'Menstruasi', // Jawaban Benar (Indeks 1)
        'Suhu tubuh menurun',
        'Tidak suka olahraga',
      ],
      jawaban: 1,
      score: 1,
    },
    {
      soal: '4. Sikap mana yang dapat menyebabkan anemia?',
      opsi: [
        'Mengabaikan pola makan seimbang', // Jawaban Benar (Indeks 0)
        'Mengonsumsi tablet Fe sesuai anjuran',
        'Rajin makan makanan tinggi zat besi',
        'Olahraga teratur',
      ],
      jawaban: 0,
      score: 1,
    },
    {
      soal: '5. Mengapa minum teh setelah makan dapat meningkatkan risiko anemia?',
      opsi: [
        'Karena teh membuat kantuk',
        'Karena teh menghambat penyerapan zat besi', // Jawaban Benar (Indeks 1)
        'Karena teh membuat perut kembung',
        'Karena teh menambah nafsu makan',
      ],
      jawaban: 1,
      score: 1,
    },
  ];

  const dailyKuisData = {
    3: masterDailyKuis,
    4: masterDailyKuis,
    5: masterDailyKuis,
  };

  // Variabel untuk melacak kuis (karena sekarang ada 5 soal per hari)
  let currentKuisIndex = 0; // Index soal kuis harian (0-4)
  let kuisScoreHarian = 0; // Skor yang didapat dari 5 soal kuis hari ini

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
    { name: 'Hati Ayam', icon: '🍗', energy: +55, type: 'positive' },
    { name: 'Junk Food', icon: '🍔', energy: -20, type: 'negative' },
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
      // FIX 1: Pastikan elemen karakter utama dan teman didefinisikan di sini jika diperlukan
      const characterMain = document.getElementById('character-main');
      const teman = document.getElementById('character-teman');
      if (characterMain)
        characterMain.classList.add('character-idle-breathing');
      if (teman) teman.classList.add('character-idle-breathing');
    }, 2000);

    setTimeout(() => {
      showDialog();
    }, 1500);

    setTimeout(() => {
      btnStart.classList.remove('btn-hidden');
      btnStart.style.opacity = '1';
      btnStart.style.transition = 'opacity 0.8s ease';
    }, 15000);
  }

  function showDialog() {
    const dialogLines = [
      `TEMAN ${userData.characterName.toUpperCase()}: "Hai ${
        userData.characterName
      }, hari ini kita fokus ke pola makan yang benar. Bukan cuma minum Fe, makanan juga penentu!"`,
      `${userData.characterName.toUpperCase()}: "Oh, jadi ada makanan yang mempercepat dan menghambat penyerapan zat besi ya?"`,
      `TEMAN ${userData.characterName.toUpperCase()}: "Betul sekali! Coba kamu buktikan pengetahuanmu di mini-game ini!"`,
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
    // FIX 2: Clear drop areas properly
    const dropZatBesi = document.getElementById('drop-zat-besi');
    const dropPenghambat = document.getElementById('drop-penghambat');
    if (dropZatBesi) dropZatBesi.innerHTML = '';
    if (dropPenghambat) dropPenghambat.innerHTML = '';
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
      // Menghapus listener lama sebelum menambahkan yang baru
      area.removeEventListener('drop', handleDrop);
      area.removeEventListener('dragover', preventDefault);

      area.addEventListener('drop', handleDrop);
      area.addEventListener('dragover', preventDefault);
    });

    document.getElementById('btn-submit-menu').onclick = checkMenuGame;
  }

  // Fungsi pembantu untuk Drop (agar bisa dihapus event listenernya)
  function preventDefault(e) {
    e.preventDefault();
  }

  function handleDrop(e) {
    e.preventDefault();
    const data = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(data);
    const targetDropArea = e.target.closest('.drop-area');

    if (!targetDropArea) return; // Pastikan drop di area yang benar

    const targetCategory = targetDropArea.dataset.category;

    if (draggedElement && draggedElement.dataset.category === targetCategory) {
      playClickSound();
      const droppedItemsContainer =
        targetDropArea.querySelector('.dropped-items');

      // Buat item baru untuk visual di area drop
      const droppedItem = document.createElement('span');
      droppedItem.className = `dropped-item ${
        targetCategory === 'zat-besi' || targetCategory === 'zat-besi-plus'
          ? 'positive'
          : 'negative'
      }`;
      droppedItem.textContent = draggedElement.dataset.name;

      droppedItemsContainer.appendChild(droppedItem);
      draggedElement.remove(); // Hapus dari options

      document.getElementById('menu-game-feedback').textContent = ''; // Hapus feedback error jika berhasil
    } else if (draggedElement) {
      // Wrong drop
      playGameClickSound();
      document.getElementById('menu-game-feedback').textContent =
        '⚠️ Menu tidak cocok! Coba lagi.';
      document.getElementById('menu-game-feedback').className =
        'game-feedback error';
    }
  }

  function checkMenuGame() {
    playGameClickSound();
    document.getElementById('btn-submit-menu').disabled = true;
    const characterMenuImg = document.getElementById('main-character-menu-img');
    let emotion = 'normal';
    let correctPicks = 0;
    let totalItems = 0;

    // FIX 3: Gunakan dropped-items container untuk query
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

    // Menghitung skor mini game
    scorePilihMenu =
      correctPicks > 0 ? Math.floor((correctPicks / totalItems) * 2) : 0; // Max 2 points

    // Pengetahuan harian belum diakumulasi, hanya skor mini game yang didapat.
    // Akumulasi total knowledge dilakukan di showHasilAkhir.

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

    const characterSimulasiImg = document.getElementById(
      'main-character-simulasi-img'
    );
    if (characterSimulasiImg) {
      characterSimulasiImg.src = getCharacterImage(
        userData.character,
        'capeOlahraga'
      );
      characterSimulasiImg.classList.add('fade-in'); // Tambahkan animasi jika perlu
    }

    document.getElementById('daily-action-card').innerHTML = `
      <h3>${activity.title}</h3>
      <p>${activity.message} **Energi turun ${Math.abs(
      activity.energyChange
    )}!**</p>
      <div class="food-options-small" id="food-options-small">
        ${dailyFoodOptions
          .map((food, index) => {
            const energyText =
              food.energy > 0 ? `+${food.energy}` : food.energy;
            const energyColorClass = food.energy < 0 ? 'negative-energy' : '';

            return `
              <div class="food-card-small" data-food-id="${index}" data-energy="${food.energy}" data-name="${food.name}" data-type="${food.type}" >
                ${food.icon} ${food.name}
              </div>
            `;
          })
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

    // FIX 4: Update knowledge score setelah mini game
    document.getElementById('knowledge-value').textContent =
      currentKnowledge + scorePilihMenu + kuisScoreHarian;
  }

  function handleFoodSelection() {
    playClickSound();
    const card = this;
    const energyChange = parseInt(card.dataset.energy);
    const isPositive = card.dataset.type === 'positive';
    const characterSimulasiImg = document.getElementById(
      'main-character-simulasi-img'
    );
    let emotion = 'capeOlahraga';

    document
      .querySelectorAll('.food-card-small')
      .forEach((c) => c.classList.remove('selected-food'));
    card.classList.add('selected-food');

    // FIX 5: Pastikan energy tidak diakumulasi lebih dari sekali
    // Hanya tambahkan energy jika belum pernah dipilih sebelumnya, atau jika kita hanya mengizinkan satu pilihan
    // Jika hanya satu pilihan yang diizinkan, kita harus menghitung ulang.

    // Asumsi: Hanya 1 pilihan, dan energy dihitung dari 55 (start of day) - penalty (activity) + food.
    // Karena logic di sini hanya menambahkan, kita biarkan saja, tapi pastikan hanya satu kali klik yang dihitung.
    if (!card.classList.contains('handled')) {
      currentEnergy = Math.min(100, currentEnergy + energyChange);
      card.classList.add('handled');
    }

    const simulasiFeedback = document.getElementById('simulasi-feedback');

    if (isPositive) {
      complianceBonus = 1; // 1 point for good choice
      simulasiFeedback.textContent = activityData[currentDay].rewardMessage;
      simulasiFeedback.style.color = '#4cd964';
      emotion = 'senangOlahraga';
    } else {
      complianceBonus = 0; // No compliance bonus
      simulasiFeedback.textContent = `❌ Pilihan kurang optimal. ${card.dataset.name} bukan yang terbaik untuk pulihkan Fe.`;
      simulasiFeedback.style.color = '#ff3b30';
      emotion = 'murung'; // Mengubah dari 'capeOlahraga' menjadi 'murung'
    }

    if (characterSimulasiImg) {
      characterSimulasiImg.src = getCharacterImage(userData.character, emotion);
    }

    updateDailyStats();
    document.getElementById('btn-next-step').disabled = false;
  }

  // --- Kuis Harian Logic (5 Soal) ---
  function startKuisHarian() {
    playGameClickSound();
    sceneAktivitas.style.display = 'none';
    sceneKuisHarian.style.display = 'block';

    const mainCharacterKuisImg = document.getElementById(
      'main-character-kuis-img'
    );
    if (mainCharacterKuisImg) {
      mainCharacterKuisImg.src = getCharacterImage(
        userData.character,
        'berpikir'
      );
      mainCharacterKuisImg.alt = `${userData.characterName} Berpikir`;
    }

    // Reset kuis state untuk hari baru
    currentKuisIndex = 0;
    kuisScoreHarian = 0;

    // FIX 6: Memanggil fungsi yang benar
    loadSoalKuisHarian(currentKuisIndex);
  }

  // Fungsi untuk memuat soal kuis per index (berhasil)
  function loadSoalKuisHarian(index) {
    const kuisArray = dailyKuisData[currentDay];
    const kuis = kuisArray[index];
    const totalSoal = kuisArray.length;

    const progress = ((index + 1) / totalSoal) * 100;

    // Update progress
    document.getElementById('kuis-progress-fill').style.width = `${progress}%`;
    document.getElementById('kuis-progress-text').textContent = `${
      index + 1
    }/${totalSoal}`;

    const kuisContent = document.getElementById('kuis-harian-content');

    // Reset Kuis UI
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

    // FIX 7: Pastikan checkKuisAnswer dipanggil dengan index dan kuis yang benar
    document.getElementById('btn-check-answer').onclick = () =>
      checkKuisAnswerLogic(index, kuis);

    document.getElementById('btn-finish-day').onclick = nextKuisOrFinish;
    document.getElementById('btn-finish-day').textContent =
      index === totalSoal - 1 ? 'Selesaikan Hari Ini' : 'Soal Berikutnya ➡';

    // suara ketika user pilih jawaban
    document.querySelectorAll('input[name="jawaban"]').forEach((radio) => {
      radio.addEventListener('change', window.playClickSound);
    });
  }

  // FIX 8: Ganti nama fungsi menjadi checkKuisAnswerLogic
  function checkKuisAnswerLogic(index, kuis) {
    playGameClickSound();
    const selectedAnswer = document.querySelector(
      'input[name="jawaban"]:checked'
    );
    const kuisFeedback = document.getElementById('kuis-feedback');

    if (!selectedAnswer) {
      alert('Pilih jawaban terlebih dahulu!');
      return;
    }

    document.getElementById('btn-check-answer').style.display = 'none';
    document.getElementById('btn-finish-day').style.display = 'block';

    const isCorrect = parseInt(selectedAnswer.value) === kuis.jawaban;
    let emotion = 'normal';

    if (isCorrect) {
      kuisScoreHarian += kuis.score; // Tambah skor harian
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
  }

  // Fungsi untuk pindah ke soal berikutnya atau selesai
  function nextKuisOrFinish() {
    playGameClickSound();
    currentKuisIndex++;

    const totalSoal = dailyKuisData[currentDay].length;

    if (currentKuisIndex < totalSoal) {
      // Lanjut ke soal berikutnya
      loadSoalKuisHarian(currentKuisIndex);
    } else {
      // Kuis selesai, lanjut ke hasil akhir
      showHasilAkhir();
    }
  }

  // --- Hasil Akhir Logic ---
  function showHasilAkhir() {
    playGameClickSound();
    sceneKuisHarian.style.display = 'none';
    sceneHasil.style.display = 'block';

    // Total Score for the Day
    const totalDayScore = scorePilihMenu + kuisScoreHarian + complianceBonus;
    // Pengetahuan yang sudah terkumpul sebelum hari ini
    const knowledgeSebelumHariIni = userData.totalKnowledge || 0;

    // Pengetahuan Harian (Mini Game + Kuis Harian)
    const knowledgeHarian = scorePilihMenu + kuisScoreHarian;

    // Save Progress to localStorage
    userData.progress[`hari${currentDay}`] = {
      completed: true,
      score: totalDayScore,
      knowledge: knowledgeHarian, // Hanya skor kuis/mini game HARI INI
      compliance: complianceBonus,
      energy: currentEnergy,
    };

    // Akumulasi total knowledge
    userData.totalKnowledge = knowledgeSebelumHariIni + knowledgeHarian;
    // Akumulasi total compliance (jika complianceBonus adalah tambahan harian)
    userData.totalCompliance =
      (userData.totalCompliance || 0) + complianceBonus;

    localStorage.setItem('fesmart_user', JSON.stringify(userData));

    // Update UI
    const hasilMessage = document.getElementById('hasil-message');
    hasilMessage.innerHTML = `
      <div class="score-detail">
        <div class="score-item-detail">
          <span class="score-label">Skor Kuis Harian:</span>
          <span class="score-value">${kuisScoreHarian}/${dailyKuisData[currentDay].length}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Skor Mini Game:</span>
          <span class="score-value">${scorePilihMenu}/2</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Skor Kepatuhan Harian:</span>
          <span class="score-value">${complianceBonus}/1</span>
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

    // FIX 9: Logika untuk Hari 3-5 hanya akan redirect ke hari 6 setelah Hari 3 selesai
    btnNextDay.textContent = `Lanjut ke Hari 6`;
    btnNextDay.onclick = () => {
      playGameClickSound();
      // Cek apakah ada data Hb level yang perlu dikirim
      if (userData.progress['hari2'] && userData.progress['hari2'].hbLevel) {
        userData.initialHb = userData.progress['hari2'].hbLevel;
        localStorage.setItem('fesmart_user', JSON.stringify(userData));
      }
      window.location.href = 'hari6.html';
    };
  }

  // Responsif
  function checkWindowSize() {
    const containerBtnStartDekstop = document.querySelector(
      '.container-teks-opening'
    );
    const containerBtnStartMobile = document.getElementById(
      'container-btn-mobile'
    );

    if (window.innerWidth <= 768) {
      if (btnStart.parentNode === containerBtnStartDekstop) {
        containerBtnStartMobile.append(btnStart);
      }
    } else {
      if (btnStart.parentNode === containerBtnStartMobile) {
        containerBtnStartDekstop.append(btnStart);
      }
    }
  }

  playBackgroundMusic();

  checkWindowSize();
  window.addEventListener('resize', checkWindowSize);
});
