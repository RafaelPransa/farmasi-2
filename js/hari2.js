document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const containerOpening = document.querySelector('.container-opening');
  const sceneOpening = document.querySelector('.scene-opening');
  const sceneKuis = document.querySelector('.scene-kuis');
  const sceneSimulasi = document.querySelector('.scene-simulasi');
  const sceneHasil = document.querySelector('.scene-hasil');

  const characterMain = document.getElementById('character-main');
  const teman = document.getElementById('character-teman');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');
  const btnBack = document.querySelector('.container-btn .btn-secondary');
  const containerBtn = document.querySelector(
    '.scene-opening .container-teks-opening .container-btn'
  );

  const bgMusic = document.getElementById('background-music');
  const soundClick = document.getElementById('sound-click');
  const soundCoolClick = document.getElementById('cool-click');
  const soundGameClick = document.getElementById('game-click');
  const teksOpeningSound = document.getElementById('teks-opening-sound');

  let isSoundOn =
    localStorage.getItem('fesmart_sound') === 'off' ? false : true;

  // Fungsi Global untuk Mengontrol Suara
  window.playClickSound = function () {
    if (isSoundOn && soundClick) {
      soundClick.currentTime = 0; // Memastikan suara dapat diputar cepat
      soundClick
        .play()
        .catch((e) => console.log('Click sound failed to play:', e));
    }
  };

  window.playCoolClickSound = function () {
    if (isSoundOn && soundCoolClick) {
      soundCoolClick.currentTime = 0; // Memastikan suara dapat diputar cepat
      soundCoolClick
        .play()
        .catch((e) => console.log('Click sound failed to play:', e));
    }
  };

  window.playGameClickSound = function () {
    if (isSoundOn && soundGameClick) {
      soundGameClick.currentTime = 0; // Memastikan suara dapat diputar cepat
      soundGameClick
        .play()
        .catch((e) => console.log('Click sound failed to play:', e));
    }
  };

  window.playTeksOpeningSound = function () {
    if (isSoundOn && teksOpeningSound) {
      teksOpeningSound.currentTime = 0; // Memastikan suara dapat diputar cepat
      teksOpeningSound
        .play()
        .catch((e) => console.log('Click sound failed to play:', e));
    }
  };

  window.playNotificationSound = function () {
    if (isSoundOn && notificationSound) {
      notificationSound.currentTime = 0; // Memastikan suara dapat diputar cepat
      notificationSound
        .play()
        .catch((e) => console.log('Click sound failed to play:', e));
    }
  };

  window.toggleSound = function () {
    isSoundOn = !isSoundOn;
    localStorage.setItem('fesmart_sound', isSoundOn ? 'on' : 'off');

    // Update ikon
    const soundBtn = document.querySelector(
      '.control-btn[onclick="toggleSound()"]'
    );
    if (soundBtn) {
      soundBtn.innerHTML = isSoundOn ? '🔊 Sound' : '🔇 Sound';
    }

    if (isSoundOn) {
      playBackgroundMusic();
    } else {
      if (bgMusic) bgMusic.pause();
    }
  };

  window.playBackgroundMusic = function () {
    if (isSoundOn && bgMusic && bgMusic.paused) {
      // Coba putar musik, ini mungkin gagal karena batasan browser (autoplay)
      bgMusic.volume = 0.5; // Atur volume agar tidak terlalu keras
      bgMusic
        .play()
        .catch((e) => console.log('Background music auto-play blocked:', e));
    }
  };

  // Load user data dari localStorage
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

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
      characterImages[characterId]?.['murung'] ||
      'assets/images/characters/default.png'
    );
  }

  const mainCharacter = {
    id: userData.character,
    name: userData.characterName,
    image: getCharacterImage(userData.character, 'murung'),
  };

  function updateCharacterElements() {
    // Update gambar karakter utama
    const mainCharacterImg = document.getElementById('main-character-img');
    mainCharacterImg.src = mainCharacter.image;
    mainCharacterImg.alt = mainCharacter.name;
  }

  // Data kuis hari 2
  const kuisData = [
    {
      soal: '1. Salah satu tanda umum anemia adalah…',
      opsi: [
        'Mudah lelah',
        'Nafsu makan meningkat',
        'Tidak bisa tidur',
        'Berat badan naik',
      ],
      jawaban: 0,
    },
    {
      soal: '2. Kulit pucat pada remaja putri dapat menjadi tanda…',
      opsi: ['Dehidrasi', 'Anemia', 'Kebanyakan tidur', 'Alergi makanan'],
      jawaban: 1,
    },
    {
      soal: '3. Sering merasa pusing saat berdiri bisa menjadi gejala…',
      opsi: ['Hipertensi', 'Anemia', 'Flu', 'Cacingan saja'],
      jawaban: 1,
    },
    {
      soal: '4. Detak jantung cepat pada siswi bisa terjadi karena…',
      opsi: ['Olahraga teratur', 'Kelebihan zat besi', 'Anemia', 'Tidur cukup'],
      jawaban: 2,
    },
    {
      soal: '5. Nafas terasa pendek dan mudah sesak merupakan tanda…',
      opsi: ['Anemia', 'Kekenyangan', 'Hiperaktif', 'Kejang otot'],
      jawaban: 0,
    },
  ];

  // State variables
  let currentKuisIndex = 0;
  let score = 0;
  let kepatuhan = 0;
  let hbLevel = 12;
  let timer;
  let timeLeft = 60;
  let gameCompleted = false;
  let continueButtonCreated = false; // ⚠️ BARU: Flag untuk cek tombol sudah dibuat

  // Initialize the game
  initGame();

  function initGame() {
    // Update karakter
    updateCharacterElements();

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
    // Animate characters entering
    setTimeout(() => {
      characterMain.classList.add('slide-main');
      teman.classList.add('slide-teman');
    }, 500);

    // Start dialog typewriter effect
    setTimeout(() => {
      showDialog();
    }, 1500);

    // Show start button after dialog
    setTimeout(() => {
      btnStart.classList.remove('btn-hidden');
      btnStart.style.opacity = '1';
      btnStart.style.transition = 'opacity 0.8s ease';
    }, 15000);
  }

  function showDialog() {
    const dialogLines = [
      `TEMAN ${mainCharacter.name.toUpperCase()}: "Hai ${
        mainCharacter.name
      }, aku lihat kamu masih sering lesu. Aku dulu juga gitu lho!"`,
      `${mainCharacter.name.toUpperCase()}: "Iya nih, gimana caranya kamu bisa lebih berenergi sekarang?"`,
      `TEMAN ${mainCharacter.name.toUpperCase()}: "Coba kamu minum tablet Feikutan. Tapi harus tahu aturan minumnya ya, biar efektif!"`,
    ];

    typeWriterMultiple(dialogLines, 40, 800);
  }

  function typeWriterMultiple(lines, speed = 40, lineDelay = 800) {
    let lineIndex = 0;
    let charIndex = 0;

    teksOpening.innerHTML = '';

    function typeLine() {
      if (lineIndex < lines.length) {
        if (charIndex === 0 && lineIndex > 0) {
          teksOpening.innerHTML += '<br>';
        }

        if (charIndex < lines[lineIndex].length) {
          const currentChar = lines[lineIndex].charAt(charIndex);

          // Add bold styling for character names
          if (charIndex === 0) {
            teksOpening.innerHTML += '<strong>';
          }

          if (charIndex % 3 === 0) {
            playCoolClickSound();
          }

          teksOpening.innerHTML += currentChar;

          if (currentChar === ':' && charIndex < 10) {
            teksOpening.innerHTML += '</strong>';
          }

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

  // Event Listeners
  btnStart.addEventListener('click', startKuis);

  function startKuis() {
    // Hide opening scene
    playGameClickSound();
    sceneOpening.style.opacity = '0';
    const characterKuisImg = document.getElementById('main-character-kuis-img');
    if (characterKuisImg) {
      characterKuisImg.src = getCharacterImage(mainCharacter.id, 'berpikir');
      characterKuisImg.classList.add('fade-in');
    }

    setTimeout(() => {
      sceneOpening.style.display = 'none';
      sceneKuis.style.display = 'block';
      loadSoalKuis(0);
    }, 800);
  }

  function loadSoalKuis(index) {
    const soal = kuisData[index];
    const progress = ((index + 1) / kuisData.length) * 100;

    // Update progress
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${index + 1}/${
      kuisData.length
    }`;

    // Create question HTML
    const kuisContent = document.getElementById('kuis-content');
    kuisContent.innerHTML = `
      <div class="soal-kuis slide-up">
        <h3>${soal.soal}</h3>
        <div class="opsi-jawaban">
          ${soal.opsi
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
      </div>
    `;

    // Update navigation buttons
    const btnNext = document.getElementById('btn-next');

    btnNext.textContent =
      index === kuisData.length - 1 ? 'Selesai 🎉' : 'Selanjutnya ➡';

    // Add event listeners for navigation
    btnNext.onclick = () => {
      window.playCoolClickSound();
      navigateKuis(1);
    };

    // suara ketika user pilih jawaban
    const radioButtons = document.querySelectorAll('input[name="jawaban"]');
    radioButtons.forEach((radio) => {
      radio.addEventListener('change', function () {
        window.playClickSound();
      });
    });
  }

  function navigateKuis(direction) {
    const selectedAnswer = document.querySelector(
      'input[name="jawaban"]:checked'
    );

    if (!selectedAnswer && direction === 1) {
      alert('Pilih jawaban terlebih dahulu!');
      return;
    }

    // Check answer if moving forward
    if (direction === 1 && selectedAnswer) {
      const isCorrect =
        parseInt(selectedAnswer.value) === kuisData[currentKuisIndex].jawaban;
      if (isCorrect) {
        score++;
      }
    }

    currentKuisIndex += direction;

    if (currentKuisIndex < kuisData.length) {
      loadSoalKuis(currentKuisIndex);
    } else {
      // Move to simulasi scene
      showSimulasiScene();
    }
  }

  function showSimulasiScene() {
    sceneKuis.style.display = 'none';
    sceneSimulasi.style.display = 'block';

    // Reset simulasi state
    timeLeft = 60;
    gameCompleted = false;
    continueButtonCreated = false; // ⚠️ BARU: Reset flag

    // Update stats display
    updateStatsDisplay();

    // Start the simulation
    startSimulasi();
  }

  function startSimulasi() {
    const timerText = document.getElementById('timer-text');
    const timerCircle = document.querySelector('.timer-circle');
    const clockDisplay = document.getElementById('clock-display');
    const btnMinumFe = document.getElementById('btn-minum-fe');
    const characterKuisImg = document.getElementById(
      'main-character-simulasi-img'
    );
    if (characterKuisImg) {
      characterKuisImg.src = getCharacterImage(mainCharacter.id, 'berpikir');
      characterKuisImg.classList.add('fade-in');
    }

    // Reset UI
    timerText.textContent = timeLeft;
    timerCircle.className = 'timer-circle';
    btnMinumFe.disabled = false;
    btnMinumFe.textContent = '💊 Minum Fe Sekarang';

    // Set clock to 15:59
    clockDisplay.textContent = '15:59';

    // Start countdown
    timer = setInterval(() => {
      timeLeft--;
      timerText.textContent = timeLeft;

      // Update visual warnings
      if (timeLeft <= 30 && timeLeft > 10) {
        timerCircle.classList.add('warning');
      } else if (timeLeft <= 10) {
        timerCircle.classList.remove('warning');
        timerCircle.classList.add('danger');
      }

      // Time's up
      if (timeLeft <= 0) {
        clearInterval(timer);
        timeUp();
      }
    }, 1000);

    // Add event listener for the button
    btnMinumFe.onclick = minumTabletFe;
  }

  function minumTabletFe() {
    playCoolClickSound();

    if (gameCompleted) return;

    clearInterval(timer);
    gameCompleted = true;

    const btnMinumFe = document.getElementById('btn-minum-fe');

    if (timeLeft > 0) {
      // Success - minum sebelum jam 16:00
      kepatuhan += 10;
      hbLevel += 0.5;

      // Tampilkan popup sukses
      const popupMessage = `
      Tepat waktu! Kamu berhasil minum tablet Fe sebelum jam 16:00  
      +10 Poin Kepatuhan  
      Hb meningkat menjadi ${hbLevel} g/dL
    `;

      showFePopup(popupMessage, 'success');
    } else {
      // Time's up - handle kasus terlambat
      hbLevel = Math.max(8, hbLevel - 0.5);

      // Tampilkan popup error
      const popupMessage = `
      Waktu habis! Kamu terlambat minum tablet Fe  
      Hb menurun menjadi ${hbLevel} g/dL  
      Ingat, minum sebelum jam 16:00 ya!
    `;

      showFePopup(popupMessage, 'error');
    }

    btnMinumFe.disabled = true;
    btnMinumFe.textContent = timeLeft > 0 ? '✅ Sudah diminum' : '⏰ Terlambat';

    // Update stats display setelah perubahan Hb
    updateStatsDisplay();
  }

  function timeUp() {
    gameCompleted = true;

    const btnMinumFe = document.getElementById('btn-minum-fe');

    // Penalty for being late
    hbLevel = Math.max(8, hbLevel - 0.5);

    // Tampilkan popup error
    const popupMessage = `
    Waktu habis! Kamu terlambat minum tablet Fe  
    Hb menurun menjadi ${hbLevel} g/dL  
    Ingat, minum sebelum jam 16:00 ya!
  `;

    showFePopup(popupMessage, 'error');

    btnMinumFe.disabled = true;
    btnMinumFe.textContent = '⏰ Terlambat';

    // Update stats
    updateStatsDisplay();
  }

  function updateStatsDisplay() {
    document.getElementById('kepatuhan-value').textContent = kepatuhan;
    document.getElementById('hb-value').textContent = `${hbLevel} g/dL`;
  }

  function showFePopup(message, type = 'success') {
    // Create popup element
    const popup = document.createElement('div');
    popup.className = 'fe-popup';

    const icon = type === 'success' ? '✅' : '❌';
    const title = type === 'success' ? 'Berhasil!' : 'Perhatian!';

    popup.innerHTML = `
    <div class="fe-popup-content">
      <div class="fe-popup-progress">
        <div class="fe-popup-progress-bar"></div>
      </div>
      <div class="fe-popup-header">
        <span class="fe-popup-icon">${icon}</span>
        <h3>${title}</h3>
      </div>
      <div class="fe-popup-message">
        ${message
          .split('\n')
          .map((line) => `<p>${line}</p>`)
          .join('')}
      </div>
      <button class="fe-popup-close">Lanjutkan</button>
    </div>
  `;

    document.body.appendChild(popup);

    // Start progress bar animation
    const progressBar = popup.querySelector('.fe-popup-progress-bar');
    setTimeout(() => {
      progressBar.style.width = '100%';
      progressBar.style.transition = 'width 5s linear';
    }, 100);

    // Auto continue setelah 5 detik
    const autoHideTimer = setTimeout(() => {
      if (popup.parentNode) {
        hidePopup(popup);
        showHasilAkhir();
      }
    }, 5000);

    // Event listener untuk close button
    const closeBtn = popup.querySelector('.fe-popup-close');
    closeBtn.addEventListener('click', function () {
      playCoolClickSound();
      clearTimeout(autoHideTimer);
      hidePopup(popup);
      showHasilAkhir();
    });

    // Click outside to close
    popup.addEventListener('click', function (e) {
      if (e.target === popup) {
        playCoolClickSound();
        clearTimeout(autoHideTimer);
        hidePopup(popup);
        showHasilAkhir();
      }
    });

    return popup;
  }

  function hidePopup(popup) {
    popup.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => {
      if (popup.parentNode) {
        document.body.removeChild(popup);
      }
    }, 500);
  }

  function showHasilAkhir() {
    sceneSimulasi.style.display = 'none';
    sceneHasil.style.display = 'block';
    const characterKuisImg = document.getElementById(
      'main-character-hasil-img'
    );

    // Calculate total score
    const totalScore = score + kepatuhan;

    // Tampilkan detail scoring
    const hasilMessage = document.getElementById('hasil-message');
    hasilMessage.innerHTML = `
      <div class="score-detail">
        <div class="score-item-detail">
          <span class="score-label">Skor Kuis:</span>
          <span class="score-value">${score}/${kuisData.length}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Skor Kepatuhan:</span>
          <span class="score-value">${kepatuhan}</span>
        </div>
        <div class="score-item-detail total-item">
          <span class="score-label">Total Skor:</span>
          <span class="score-value total-value">${totalScore}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Hb Akhir:</span>
          <span class="score-value">${hbLevel} g/dL</span>
        </div>
      </div>
    `;

    // Feedback
    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';

    if (totalScore >= 12 && hbLevel >= 12) {
      feedbackMessage.innerHTML =
        '🎉 <strong>Luar biasa!</strong> Kamu sangat patuh minum tablet Fe!';
      feedbackMessage.style.color = '#4CD964';
      if (characterKuisImg) {
        characterKuisImg.src = getCharacterImage(mainCharacter.id, 'senang');
        characterKuisImg.classList.add('fade-in');
      }
    } else if (totalScore >= 8) {
      feedbackMessage.innerHTML =
        '👍 <strong>Bagus!</strong> Terus tingkatkan kepatuhan minum Fe!';
      feedbackMessage.style.color = '#FF9500';
      if (characterKuisImg) {
        characterKuisImg.src = getCharacterImage(mainCharacter.id, 'normal');
        characterKuisImg.classList.add('fade-in');
      }
    } else {
      feedbackMessage.innerHTML =
        '💪 <strong>Jangan menyerah!</strong> Ingat selalu minum Fe tepat waktu!';
      feedbackMessage.style.color = '#FF3B30';
      if (characterKuisImg) {
        characterKuisImg.src = getCharacterImage(mainCharacter.id, 'murung');
        characterKuisImg.classList.add('fade-in');
      }
    }

    hasilMessage.appendChild(feedbackMessage);

    // Button event listeners
    document.getElementById('btn-restart').onclick = lanjutKeHari3;
    document.getElementById('btn-kembali-hasil').onclick = kembaliKeHari1;
  }

  function lanjutKeHari3() {
    playCoolClickSound();
    // Redirect ke halaman hari 3
    window.location.href = 'hari3-5.html';
  }

  function kembaliKeHari1() {
    // Redirect kembali ke hari 1
    playCoolClickSound();
    window.location.href = 'hari1.html';
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
