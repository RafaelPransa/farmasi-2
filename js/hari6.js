document.addEventListener('DOMContentLoaded', function () {
  // --- Global Setup & Helpers (Similar to hari1.js/hari2.js) ---
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  // DOM Elements
  const containerOpening = document.querySelector('.container-opening');
  const sceneOpening = document.querySelector('.scene-opening');
  const sceneKuis = document.getElementById('scene-kuis-menengah');
  const sceneSimulasi = document.getElementById('scene-simulasi-fe');
  const sceneHasil = document.getElementById('scene-hasil-akhir');
  const characterMain = document.getElementById('character-main');
  const guru = document.getElementById('character-guru');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');

  // Load initial scores and stats (from previous days, if available)
  const initialHb = userData.initialHb || 12; // Default to 12 if not set
  let totalKepatuhan = userData.totalKepatuhan || 0;
  let totalKnowledge = userData.totalKnowledge || 0;
  let currentHbLevel = initialHb;
  let kuisScore = 0;

  // Re-use sound functions and character image logic from previous files
  // NOTE: Assuming playCoolClickSound, playGameClickSound, getCharacterImage, typeWriterMultiple are globally available or defined here.
  // For this example, I'll define a necessary minimum.

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
  window.playCoolClickSound = function () {
    if (isSoundOn && soundCoolClick) {
      soundCoolClick.currentTime = 0;
      soundCoolClick.play().catch((e) => console.log('Click failed:', e));
    }
  };
  window.playGameClickSound = function () {
    if (isSoundOn && soundGameClick) {
      soundGameClick.currentTime = 0;
      soundGameClick.play().catch((e) => console.log('Click failed:', e));
    }
  };
  window.playBackgroundMusic = function () {
    if (isSoundOn && bgMusic && bgMusic.paused) {
      bgMusic.volume = 0.5;
      bgMusic.play().catch((e) => console.log('Background music failed:', e));
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

  const kuisData = [
    {
      soal: '1. Dampak anemia terhadap belajar adalah…',
      opsi: [
        'Meningkatkan fokus',
        'Mengurangi konsentrasi',
        'Membuat lebih semangat',
        'Mempercepat hafalan',
      ],
      jawaban: 1,
    },
    {
      soal: '2. Anemia yang tidak ditangani dalam jangka panjang dapat berdampak pada…',
      opsi: [
        'Peningkatan imunitas',
        'Gangguan pada perkembangan fisik dan kognitif',
        'Nafsu makan membaik',
        'Tidur lebih berkualitas',
      ],
      jawaban: 1,
    },
    {
      soal: '3. Pada remaja putri, anemia dapat memengaruhi siklus menstruasi melalui…',
      opsi: [
        'Produksi hormon yang stabil',
        'Siklus yang tidak teratur dan perdarahan lebih lama',
        'Menstruasi lebih singkat',
        'Tidak terjadi perubahan apapun',
      ],
      jawaban: 1,
    },
    {
      soal: '4. Dampak anemia terhadap aktivitas fisik terlihat pada…',
      opsi: [
        'Peningkatan stamina dan kekuatan otot',
        'Mudah lelah, sesak, dan detak jantung cepat saat beraktivitas',
        'Nafas lebih stabil',
        'Kekuatan otot meningkat',
      ],
      jawaban: 1,
    },
    {
      soal: '5. Jika anemia terjadi saat masa pertumbuhan, salah satu akibatnya adalah…',
      opsi: [
        'Pertumbuhan tinggi badan lebih cepat dari rata-rata',
        'Prestasi akademik dan perkembangan belajar menurun',
        'Produksi sel darah merah meningkat tanpa batas',
        'Nafsu tidur berlebihan tanpa gangguan lain',
      ],
      jawaban: 1,
    },
  ];

  let currentKuisIndex = 0;
  const mainCharacter = {
    id: userData.character,
    name: userData.characterName,
  };

  // --- Initialisation ---
  initGame();

  function initGame() {
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
    setTimeout(() => {
      characterMain.classList.add('slide-main');
      guru.classList.add('slide-guru');
    }, 500);

    setTimeout(() => {
      showDialog();
    }, 1500);

    setTimeout(() => {
      btnStart.classList.remove('btn-hidden');
      btnStart.style.opacity = '1';
      btnStart.style.transition = 'opacity 0.8s ease';
    }, 13000);
  }

  function showDialog() {
    const dialogLines = [
      'GURU UKS: "Selamat pagi, hari ini kita akan mengevaluasi pemahamanmu tentang pentingnya pencegahan anemia."',
      `${mainCharacter.name.toUpperCase()}: "Siap, Bu! Saya akan berusaha menjawab semua pertanyaan tentang pencegahan anemia."`,
    ];
    typeWriterMultiple(dialogLines, 40, 800);
  }

  // --- Kuis Logic ---
  btnStart.addEventListener('click', startKuis);

  function startKuis() {
    playGameClickSound();
    sceneOpening.style.opacity = '0';

    setTimeout(() => {
      sceneOpening.style.display = 'none';
      sceneKuis.style.display = 'block';
      const characterKuisImg = document.getElementById(
        'main-character-kuis-img'
      );
      if (characterKuisImg) {
        characterKuisImg.src = getCharacterImage(mainCharacter.id, 'berpikir');
        characterKuisImg.classList.add('fade-in');
      }
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
      index === kuisData.length - 1 ? 'Lanjut ke Simulasi' : 'Selanjutnya ➡';

    btnNext.onclick = () => {
      window.playCoolClickSound();
      navigateKuis(1);
    };

    // Add event listeners for sound
    document.querySelectorAll('input[name="jawaban"]').forEach((radio) => {
      radio.addEventListener('change', window.playClickSound);
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

    // Check answer if moving forward (only correct answers count)
    if (direction === 1 && selectedAnswer) {
      const isCorrect =
        parseInt(selectedAnswer.value) === kuisData[currentKuisIndex].jawaban;
      if (isCorrect) {
        kuisScore++;
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

  // --- Simulasi Logic ---
  function showSimulasiScene() {
    playGameClickSound();
    sceneKuis.style.display = 'none';
    sceneSimulasi.style.display = 'flex'; // Use flex for centering if needed
    document
      .getElementById('btn-ikut')
      .addEventListener('click', () => handleSimulasiPilihan('ikut'));
    document
      .getElementById('btn-tidak-ikut')
      .addEventListener('click', () => handleSimulasiPilihan('tidak-ikut'));

    document.getElementById('btn-lanjut-hari6').onclick = showHasilAkhir;

    // Show Guru UKS character for context
    document.getElementById('character-guru-simulasi').style.opacity = '1';
  }

  function handleSimulasiPilihan(pilihan) {
    playGameClickSound();
    const feedback = document.getElementById('simulasi-feedback');
    let emotion = 'normal';

    // Disable buttons after selection
    document.getElementById('btn-ikut').disabled = true;
    document.getElementById('btn-tidak-ikut').disabled = true;
    document.getElementById('btn-lanjut-hari6').classList.remove('btn-hidden');

    if (pilihan === 'ikut') {
      // +10 poin kepatuhan
      totalKepatuhan += 10;
      currentHbLevel = Math.min(15, currentHbLevel + 0.5); // Hb naik sedikit, maksimal 15
      feedback.textContent = `✅ Luar Biasa! Kamu mendapatkan +10 Poin Kepatuhan. Hb Levelmu naik menjadi ${currentHbLevel.toFixed(
        1
      )} g/dL.`;
      feedback.style.color = '#4CD964';
      emotion = 'senang';
    } else {
      // Energi dan Hb menurun
      currentHbLevel = Math.max(8, currentHbLevel - 0.5); // Hb turun, minimal 8
      feedback.textContent = `❌ Sayang sekali. Kepatuhanmu tidak tercatat. Hb Levelmu turun menjadi ${currentHbLevel.toFixed(
        1
      )} g/dL. Jangan ulangi lagi!`;
      feedback.style.color = '#FF3B30';
      emotion = 'murung';
    }

    // Update Guru UKS emotion (optional, but good for feedback)
    document
      .getElementById('character-guru-simulasi')
      .querySelector('img').src = getCharacterImage('sari', emotion); // Asumsi guru menggunakan emosi yang sama
  }

  // --- Hasil Akhir Logic ---
  function showHasilAkhir() {
    playGameClickSound();
    sceneSimulasi.style.display = 'none';
    sceneHasil.style.display = 'block';

    // Update total knowledge with score from this day
    totalKnowledge += kuisScore;

    // Calculate final score for the day
    const dayScore =
      kuisScore + (totalKepatuhan - (userData.totalKepatuhan || 0)); // Score kuis + perubahan kepatuhan

    // Save progress
    userData.progress['hari6'] = {
      completed: true,
      score: dayScore,
      knowledge: kuisScore,
      compliance: totalKepatuhan,
      hbLevel: currentHbLevel,
    };
    userData.totalKepatuhan = totalKepatuhan;
    userData.totalKnowledge = totalKnowledge;
    localStorage.setItem('fesmart_user', JSON.stringify(userData));

    // Update UI
    const hasilMessage = document.getElementById('hasil-message');
    hasilMessage.innerHTML = `
      <div class="score-detail">
        <div class="score-item-detail">
          <span class="score-label">Skor Kuis Hari Ini:</span>
          <span class="score-value">${kuisScore}/${kuisData.length}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Total Poin Kepatuhan:</span>
          <span class="score-value">${totalKepatuhan}</span>
        </div>
        <div class="score-item-detail total-item">
          <span class="score-label">Hb Level Akhir:</span>
          <span class="score-value total-value">${currentHbLevel.toFixed(
            1
          )} g/dL</span>
        </div>
      </div>
    `;

    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';

    if (currentHbLevel >= 12) {
      feedbackMessage.innerHTML =
        '🎉 <strong>Luar Biasa!</strong> Kebiasaanmu semakin membaik, Hb Levelmu stabil!';
      feedbackMessage.style.color = '#4CD964';
      document.getElementById('main-character-hasil-img').src =
        getCharacterImage(mainCharacter.id, 'senang');
    } else {
      feedbackMessage.innerHTML =
        '⚠️ <strong>Perhatian!</strong> Hb Levelmu masih rendah. Tingkatkan kepatuhan minum Fe!';
      feedbackMessage.style.color = '#FF3B30';
      document.getElementById('main-character-hasil-img').src =
        getCharacterImage(mainCharacter.id, 'murung');
    }

    hasilMessage.appendChild(feedbackMessage);

    document.getElementById('btn-next-day').onclick = lanjutKeHari7;
  }

  function lanjutKeHari7() {
    playGameClickSound();
    window.location.href = 'hari7.html';
  }

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
