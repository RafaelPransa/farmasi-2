document.addEventListener('DOMContentLoaded', function () {
  // --- Global Setup & Data Retrieval ---
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  // DOM Elements
  const containerOpening = document.querySelector('.container-opening');
  const sceneOpening = document.querySelector('.scene-opening');
  const sceneKuis = document.getElementById('scene-kuis-akhir');
  const sceneDashboard = document.getElementById('scene-hasil-dashboard');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');

  const mainCharacter = {
    id: userData.character,
    name: userData.characterName,
  };
  let finalKuisScore = 0;
  let currentKuisIndex = 0;

  // --- Helpers (Reused from previous files) ---
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

  // Master kuis pool (Gabungkan semua soal dari hari 1, 2, 3-5, 6)
  const masterKuisPool = [
    // Hari 1
    {
      soal: 'Apa penyebab utama anemia?',
      opsi: [
        'Kurang olahraga',
        'Kekurangan zat besi',
        'Terlalu banyak tidur',
        'Kebanyakan main game',
      ],
      jawaban: 1,
    },
    // Hari 2
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
    // Hari 3
    {
      soal: 'Mengapa Vitamin C penting saat mengonsumsi makanan/suplemen zat besi?',
      opsi: [
        'Membuat rasa tablet Fe lebih enak',
        'Membantu penyerapan zat besi menjadi lebih efektif',
        'Mencegah efek samping pusing',
        'Tidak ada hubungannya sama sekali',
      ],
      jawaban: 1,
    },
    // Hari 6
    {
      soal: 'Apa efek jangka panjang jika kadar Hb terus-menerus rendah?',
      opsi: [
        'Kekebalan tubuh meningkat',
        'Wajah menjadi lebih cerah',
        'Gangguan pertumbuhan dan perkembangan kognitif',
        'Tinggi badan bertambah',
      ],
      jawaban: 2,
    },
    {
      soal: 'Siapa yang paling berisiko tinggi terkena anemia di sekolah?',
      opsi: [
        'Remaja putra',
        'Guru laki-laki',
        'Remaja putri yang sedang menstruasi',
        'Semua siswa memiliki risiko yang sama',
      ],
      jawaban: 2,
    },
    // Soal baru (tambahan)
    {
      soal: 'Pola makan seperti apa yang disarankan untuk mencegah anemia?',
      opsi: [
        'Hanya makan makanan cepat saji',
        'Konsumsi makanan kaya zat besi (hati, bayam, daging) dan Vitamin C',
        'Menghindari semua sayuran hijau',
        'Hanya minum air mineral',
      ],
      jawaban: 1,
    },
  ];

  // Ambil 5 soal acak
  const finalKuisData = masterKuisPool
    .sort(() => 0.5 - Math.random())
    .slice(0, 5);
  const totalSoal = finalKuisData.length;

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
    document.getElementById('character-main').classList.add('slide-main');
    document.getElementById('character-guru').classList.add('slide-guru');

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
      'GURU UKS: "Selamat! Ini adalah hari terakhir perjalanan FeSmart. Saatnya kamu membuktikan semua yang telah kamu pelajari."',
      `${mainCharacter.name.toUpperCase()}: "Saya siap, Bu Guru! Saya sudah merasa jauh lebih berenergi dan punya banyak pengetahuan baru!"`,
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
      document.getElementById('main-character-kuis-img').src =
        getCharacterImage(mainCharacter.id, 'berpikir');
      loadSoalKuis(0);
    }, 800);
  }

  function loadSoalKuis(index) {
    const soal = finalKuisData[index];
    const progress = ((index + 1) / totalSoal) * 100;

    // Update progress
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `${
      index + 1
    }/${totalSoal}`;

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
      index === totalSoal - 1 ? 'Selesaikan Tes' : 'Selanjutnya';

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
        parseInt(selectedAnswer.value) ===
        finalKuisData[currentKuisIndex].jawaban;
      if (isCorrect) {
        finalKuisScore++;
      }
    }

    currentKuisIndex += direction;

    if (currentKuisIndex < totalSoal) {
      loadSoalKuis(currentKuisIndex);
    } else {
      // Move to dashboard scene
      showFinalDashboard();
    }
  }

  // --- Final Dashboard Logic ---
  function showFinalDashboard() {
    playGameClickSound();
    sceneKuis.style.display = 'none';
    sceneDashboard.style.display = 'block';

    // 1. Ambil Data Akhir
    const totalKnowledgePoints = userData.totalKnowledge + finalKuisScore;
    const finalComplianceScore = userData.totalKepatuhan;
    const maxCompliance = 20;
    const maxKnowledge = masterKuisPool.length + 5; //
    const scorePengetahuan = totalKnowledgePoints;
    const maxKepatuhan = 70;

    // 2. Update Dashboard UI
    document.getElementById(
      'score-pengetahuan-akhir'
    ).textContent = `${scorePengetahuan}/${maxKnowledge}`;
    document.getElementById(
      'score-kepatuhan-akhir'
    ).textContent = `${finalComplianceScore}`;

    // 3. Tampilkan Pesan Akhir
    const finalMessage = document.getElementById('final-message');
    finalMessage.textContent =
      'Semakin tinggi pengetahuanmu, semakin patuh kamu menjaga kesehatan darahmu!';

    // 4. Update Karakter
    document.getElementById('main-character-hasil-img').src = getCharacterImage(
      mainCharacter.id,
      'senang'
    );

    // 5. Simulasikan Grafik (menggunakan Chart.js)
    const ctx = document.getElementById('xyChart').getContext('2d');
    const xyChart = new Chart(ctx, {
      type: 'line', // Gunakan garis untuk menunjukkan tren
      data: {
        labels: ['Pengetahuan (X)', 'Kepatuhan (Y)'],
        datasets: [
          {
            label: 'Skor Akhir',
            data: [scorePengetahuan, finalComplianceScore],
            backgroundColor: [
              'rgba(255, 165, 0, 0.5)',
              'rgba(76, 217, 100, 0.5)',
            ],
            borderColor: ['rgb(255, 165, 0)', 'rgb(76, 217, 100)'],
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: Math.max(scorePengetahuan, finalComplianceScore, 50),
            title: {
              display: true,
              text: 'Skor',
            },
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: false,
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

  playBackgroundMusic();
});
