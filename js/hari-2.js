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
      },
      sari: {
        normal: 'assets/images/characters/sari-normal.png',
        murung: 'assets/images/characters/sari-murung.png',
        senang: 'assets/images/characters/sari-senang.png',
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
    image: getCharacterImage(userData.character, 'normal'),
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
      soal: 'Kapan waktu yang tepat untuk minum tablet Fe?',
      opsi: [
        'Pagi hari sebelum makan',
        'Sesudah makan siang atau malam',
        'Tengah malam sebelum tidur',
        'Kapan saja tidak ada aturan',
      ],
      jawaban: 1,
    },
    {
      soal: 'Apa yang harus dihindari setelah minum tablet Fe?',
      opsi: [
        'Minum air putih',
        'Minum teh atau kopi',
        'Makan buah-buahan',
        'Berolahraga ringan',
      ],
      jawaban: 1,
    },
    {
      soal: 'Berapa frekuensi minum tablet Fe yang dianjurkan untuk remaja putri?',
      opsi: [
        'Setiap hari',
        'Seminggu sekali',
        'Bulan sekali',
        'Hanya saat menstruasi',
      ],
      jawaban: 1,
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

    document.getElementById('btn-kembali').onclick = kembaliKeHari1;
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
      btnBack.classList.remove('btn-hidden');
      btnBack.style.opacity = '1';
      btnBack.style.transition = 'opacity 0.8s ease';
    }, 15000);
  }

  function showDialog() {
    const dialogLines = [
      `TEMAN ${mainCharacter.name.toUpperCase()}: "Hai ${
        mainCharacter.name
      }, aku lihat kamu masih sering lesu. Aku dulu juga gitu lho!"`,
      `${mainCharacter.name.toUpperCase()}: "Iya nih, gimana caranya kamu bisa lebih berenergi sekarang?"`,
      `TEMAN ${mainCharacter.name.toUpperCase()}: "Aku rutin minum tablet Fe setiap minggu di sekolah. Coba kamu ikutan. Tapi harus tahu aturan minumnya ya, biar efektif!"`,
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
    sceneOpening.style.opacity = '0';

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
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    btnPrev.style.display = index === 0 ? 'none' : 'block';
    btnPrev.classList.toggle('btn-hidden', index === 0);

    btnNext.textContent =
      index === kuisData.length - 1 ? 'Selesai 🎉' : 'Selanjutnya ➡';

    // Add event listeners for navigation
    btnPrev.onclick = () => navigateKuis(-1);
    btnNext.onclick = () => navigateKuis(1);
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

    // Show continue button setelah popup (tunggu 3 detik)
    setTimeout(() => {
      // Cek dulu apakah popup masih ada atau sudah ditutup user
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn-primary';
      continueBtn.textContent = 'Lanjutkan';
      continueBtn.onclick = showHasilAkhir;

      const buttonContainer = document.querySelector('.simulasi-content');

      // Hapus tombol lanjutkan sebelumnya jika ada
      const existingBtn = buttonContainer.querySelector(
        '.btn-primary[onclick="showHasilAkhir()"]'
      );
      if (existingBtn) {
        existingBtn.remove();
      }

      buttonContainer.appendChild(continueBtn);
    }, 3000);
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

    // Show continue button setelah popup
    setTimeout(() => {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn-primary';
      continueBtn.textContent = 'Lanjutkan';
      continueBtn.onclick = showHasilAkhir;

      const buttonContainer = document.querySelector('.simulasi-content');

      // Hapus tombol lanjutkan sebelumnya jika ada
      const existingBtn = buttonContainer.querySelector(
        '.btn-primary[onclick="showHasilAkhir()"]'
      );
      if (existingBtn) {
        existingBtn.remove();
      }

      buttonContainer.appendChild(continueBtn);
    }, 3000);
  }

  function updateStatsDisplay() {
    document.getElementById('kepatuhan-value').textContent = kepatuhan;
    document.getElementById('hb-value').textContent = `${hbLevel} g/dL`;
  }

  function showEdukasiPopup(message) {
    // Create popup element (gunakan fungsi yang sama dari hari-1)
    const popup = document.createElement('div');
    popup.className = 'edukasi-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-header">
          <span class="popup-icon">💡</span>
          <h3>Fakta Penting!</h3>
        </div>
        <div class="popup-message">
          <p>${message}</p>
        </div>
        <button class="popup-close">Mengerti</button>
      </div>
    `;

    document.body.appendChild(popup);

    // Add event listener untuk close button
    const closeBtn = popup.querySelector('.popup-close');
    closeBtn.addEventListener('click', function () {
      popup.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 300);
    });

    // Click outside to close
    popup.addEventListener('click', function (e) {
      if (e.target === popup) {
        popup.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(popup);
        }, 300);
      }
    });
  }

  function showHasilAkhir() {
    sceneSimulasi.style.display = 'none';
    sceneHasil.style.display = 'block';

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
    } else if (totalScore >= 8) {
      feedbackMessage.innerHTML =
        '👍 <strong>Bagus!</strong> Terus tingkatkan kepatuhan minum Fe!';
      feedbackMessage.style.color = '#FF9500';
    } else {
      feedbackMessage.innerHTML =
        '💪 <strong>Jangan menyerah!</strong> Ingat selalu minum Fe tepat waktu!';
      feedbackMessage.style.color = '#FF3B30';
    }

    hasilMessage.appendChild(feedbackMessage);

    // Button event listeners
    document.getElementById('btn-restart').onclick = lanjutKeHari3;
    document.getElementById('btn-kembali').onclick = kembaliKeHari1;
  }

  function lanjutKeHari3() {
    // Redirect ke halaman hari 3
    window.location.href = 'hari-3.html';
  }

  function kembaliKeHari1() {
    // Redirect kembali ke hari 1
    window.location.href = 'index.html';
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
      <button class="fe-popup-close">Mengerti</button>
    </div>
  `;

    document.body.appendChild(popup);

    // Auto-hide setelah 10 detik
    const autoHideTimer = setTimeout(() => {
      hidePopup(popup);
    }, 10000);

    // Event listener untuk close button
    const closeBtn = popup.querySelector('.fe-popup-close');
    closeBtn.addEventListener('click', function () {
      clearTimeout(autoHideTimer);
      hidePopup(popup);
      // Tambahkan continue button setelah popup ditutup manual
      addContinueButton();
    });

    // Click outside to close
    popup.addEventListener('click', function (e) {
      if (e.target === popup) {
        clearTimeout(autoHideTimer);
        hidePopup(popup);
        // Tambahkan continue button setelah popup ditutup manual
        addContinueButton();
      }
    });

    // Auto-add continue button setelah popup auto-close
    setTimeout(() => {
      addContinueButton();
    }, 10000);

    return popup;
  }

  // Function tambahan untuk menambah continue button
  function addContinueButton() {
    const buttonContainer = document.querySelector('.simulasi-content');
    const existingBtn = buttonContainer.querySelector(
      '.btn-primary[onclick="showHasilAkhir()"]'
    );

    if (!existingBtn) {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'btn-primary';
      continueBtn.textContent = 'Lanjutkan';
      continueBtn.onclick = showHasilAkhir;
      buttonContainer.appendChild(continueBtn);
    }
  }

  function hidePopup(popup) {
    popup.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => {
      if (popup.parentNode) {
        document.body.removeChild(popup);
      }
    }, 500);
  }
});
