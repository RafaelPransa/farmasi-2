document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const containerOpening = document.querySelector('.container-opening');
  const sceneOpening = document.querySelector('.scene-opening');
  const sceneKuis = document.querySelector('.scene-kuis');
  const sceneSarapan = document.querySelector('.scene-sarapan');
  const sceneHasil = document.querySelector('.scene-hasil');
  const characterMain = document.getElementById('character-main'); // Ganti id
  const guru = document.getElementById('character-guru');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');
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
        berpikir: 'assets/images/characters/siti-berpikir.png', // Tambah emotion berpikir
      },
      sari: {
        normal: 'assets/images/characters/sari-normal.png',
        murung: 'assets/images/characters/sari-murung.png',
        senang: 'assets/images/characters/sari-senang.png',
        berpikir: 'assets/images/characters/sari-berpikir.png', // Tambah emotion berpikir
      },
    };
    return (
      characterImages[characterId]?.[emotion] ||
      characterImages[characterId]?.['normal'] ||
      'assets/images/characters/default.png'
    );
  }

  // Character data berdasarkan pilihan user
  const mainCharacter = {
    id: userData.character,
    name: userData.characterName,
    image: getCharacterImage(userData.character, 'murung'),
  };

  // Update semua elemen dengan nama karakter
  function updateCharacterElements() {
    // Update opening scene
    document.getElementById('main-character-name').textContent =
      mainCharacter.name;
    document.getElementById('sarapan-character-name').textContent =
      mainCharacter.name;
    document.getElementById('energy-character-name').textContent =
      mainCharacter.name;

    // Update gambar karakter utama
    const mainCharacterImg = document.getElementById('main-character-img');
    mainCharacterImg.src = mainCharacter.image;
    mainCharacterImg.alt = mainCharacter.name;
  }

  // Data kuis
  const kuisData = [
    {
      soal: 'Apa itu anemia?',
      opsi: [
        'Kekurangan sel darah putih',
        'Kekurangan sel darah merah atau hemoglobin',
        'Kelebihan gula dalam darah',
        'Infeksi pada saluran pernapasan',
      ],
      jawaban: 1,
    },
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
    {
      soal: 'Apa tanda-tanda anemia?',
      opsi: [
        'Wajah memerah dan energi berlebihan',
        'Lemas, pucat, dan sulit konsentrasi',
        'Berat badan naik drastis',
        'Tidak ada gejala sama sekali',
      ],
      jawaban: 1,
    },
  ];

  // Data makanan
  const makananData = {
    'nasi-telur': {
      nama: 'Nasi + Telur',
      energy: +30,
      givesBonus: true,
      message: `Pilihan bagus! 🥚 Telur kaya zat besi dan protein yang membantu melawan anemia`,
      type: 'positive',
      popup:
        'Anemia terjadi karena kekurangan zat besi. Yuk, mulai kenali penyebabnya!',
    },
    roti: {
      nama: 'Roti Gandum',
      energy: +15,
      givesBonus: true,
      message: `Baik! 🌾 Roti gandum memberikan energi stabil dan serat`,
      type: 'positive',
      popup:
        'Zat besi dari tumbuhan lebih sulit diserap tubuh. Konsumsi dengan vitamin C!',
    },
    'mie-instan': {
      nama: 'Mie Instan',
      energy: -20,
      givesBonus: false,
      message: `Hati-hati! 🚫 Mie instan kurang zat gizi penting untuk melawan anemia`,
      type: 'negative',
      popup: 'Makanan instan biasanya rendah zat besi. Pilih makanan alami!',
    },
  };

  // State variables
  let currentKuisIndex = 0;
  let score = 0;
  let energy = 55;
  let bonusPengetahuan = 0;
  let jumlahPilihanSehat = 0;

  // Initialize the game
  initGame();

  function initGame() {
    // Update karakter elements
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
      guru.classList.add('slide-guru');
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
    }, 12000);
  }

  function showDialog() {
    // Dialog dinamis berdasarkan karakter yang dipilih
    const dialogLines = [
      `${mainCharacter.name.toUpperCase()}: "Aduh... kepala pusing sekali. Kenapa ya aku sering merasa lemas dan sulit konsentrasi di sekolah?"`,
      'GURU UKS: "Hai, gejala yang kamu alami seperti pucat, lemas, dan pusing bisa jadi tanda anemia. Yuk kita pelajari bersama!"',
    ];

    typeWriterMultiple(dialogLines, 40, 1000);
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

          if (charIndex % 3 === 0) {
            // Contoh: Panggil hanya setiap 2 karakter
            window.playCoolClickSound();
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
  btnStart.addEventListener('click', function () {
    playGameClickSound();
    startKuis();
  });

  function startKuis() {
    // Hide opening scene
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

    btnPrev.onclick = () => {
      window.playCoolClickSound();
      navigateKuis(-1);
    };
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
      playCoolClickSound();
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
      // Move to sarapan scene
      showSarapanScene();
    }
  }

  function showSarapanScene() {
    sceneKuis.style.display = 'none';
    sceneSarapan.style.display = 'block';

    // Reset semua state dengan benar
    selectedFood = null;
    jumlahPilihanSehat = 0;
    bonusPengetahuan = 0;
    energy = 55; // Reset energy ke nilai default

    updateEnergyBar();

    // Reset semua seleksi makanan
    document.querySelectorAll('.food-card').forEach((card) => {
      card.classList.remove('selected');
    });

    // Reset result message
    const resultMessage = document.getElementById('result-message');
    resultMessage.style.display = 'none';

    // Sembunyikan tombol lanjut
    const btnLanjut = document.getElementById('btn-lanjut');
    btnLanjut.classList.add('btn-hidden');
    btnLanjut.style.opacity = '0';

    // Add event listeners untuk food cards
    document.querySelectorAll('.food-card').forEach((card) => {
      card.addEventListener('click', function () {
        selectFood(this);
        playClickSound();
      });
    });
    const characterKuisImg = document.getElementById(
      'main-character-sarapan-img'
    );
    if (characterKuisImg) {
      characterKuisImg.src = getCharacterImage(mainCharacter.id, 'berpikir');
      characterKuisImg.classList.add('fade-in');
    }
  }

  function selectFood(card) {
    const foodId = card.dataset.food;
    const food = makananData[foodId];

    // Toggle selection
    card.classList.toggle('selected');

    // Jika makanan dipilih (bukan di-unselect)
    if (card.classList.contains('selected')) {
      selectedFood = foodId;

      // Hitung ulang jumlah pilihan sehat HANYA jika makanan sehat
      if (food.energy > 0) {
        jumlahPilihanSehat++;
      }

      // Update energy
      energy = Math.max(0, Math.min(100, energy + food.energy));
      updateEnergyBar();

      // Show result untuk makanan ini saja
      showFoodResult(food);

      // Tampilkan popup edukasi
      showEdukasiPopup(food.popup);
    } else {
      // Jika makanan di-unselect, kurangi jumlah pilihan sehat jika makanan sehat
      if (food.energy > 0) {
        jumlahPilihanSehat = Math.max(0, jumlahPilihanSehat - 1);
      }

      // Kembalikan energy
      energy = Math.max(0, Math.min(100, energy - food.energy));
      updateEnergyBar();

      // Reset selectedFood
      selectedFood = null;
    }

    // Update bonus pengetahuan
    bonusPengetahuan = jumlahPilihanSehat;
  }

  function showFoodResult(food) {
    const resultMessage = document.getElementById('result-message');

    // Tampilkan pesan berdasarkan makanan yang baru dipilih
    if (food.energy > 0) {
      resultMessage.innerHTML = food.message;
      resultMessage.className = 'result-message result-positive';
    } else {
      resultMessage.innerHTML = food.message;
      resultMessage.className = 'result-message result-negative';
    }

    resultMessage.style.display = 'block';

    // Show continue button hanya jika ada makanan yang dipilih
    const btnLanjut = document.getElementById('btn-lanjut');
    const hasSelectedFood =
      document.querySelectorAll('.food-card.selected').length > 0;

    if (hasSelectedFood) {
      btnLanjut.classList.remove('btn-hidden');
      btnLanjut.style.opacity = '1';
      btnLanjut.style.transition = 'opacity 0.8s ease';
      btnLanjut.addEventListener('click', function () {
        playCoolClickSound();
        showHasilAkhir();
      });
    } else {
      btnLanjut.classList.add('btn-hidden');
      btnLanjut.style.opacity = '0';
    }
  }

  function showEdukasiPopup(message) {
    // Create popup element
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
      playCoolClickSound();
      popup.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(popup);
      }, 300);
    });

    // Click outside to close
    popup.addEventListener('click', function (e) {
      playCoolClickSound();
      if (e.target === popup) {
        popup.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
          document.body.removeChild(popup);
        }, 300);
      }
    });
  }

  function updateEnergyBar() {
    const energyFill = document.getElementById('energy-fill');
    const energyText = document.getElementById('energy-text');

    energyFill.style.width = `${energy}%`;
    energyText.textContent = `${energy}%`;

    // Update color based on energy
    if (energy < 30) {
      energyFill.style.background = 'linear-gradient(90deg, #FF3B30, #FF9500)';
    } else if (energy < 70) {
      energyFill.style.background = 'linear-gradient(90deg, #FF9500, #FFCC00)';
    } else {
      energyFill.style.background = 'linear-gradient(90deg, #4CD964, #2E8B57)';
    }
  }

  function showHasilAkhir() {
    sceneSarapan.style.display = 'none';
    sceneHasil.style.display = 'block';

    // HITUNG TOTAL PENGETAHUAN
    const totalPengetahuan = score + bonusPengetahuan;

    // Tampilkan detail scoring
    const hasilMessage = document.getElementById('hasil-message');
    hasilMessage.innerHTML = `
      <div class="score-detail">
        <div class="score-item-detail">
          <span class="score-label">Skor Kuis:</span>
          <span class="score-value">${score}/${kuisData.length}</span>
        </div>
        ${
          bonusPengetahuan > 0
            ? `
        <div class="score-item-detail bonus-item">
          <span class="score-label">Bonus Makanan Bergizi:</span>
          <span class="score-value bonus-value">+${bonusPengetahuan}</span>
        </div>
        `
            : ''
        }
        <div class="score-item-detail total-item">
          <span class="score-label">Total Pengetahuan:</span>
          <span class="score-value total-value">${totalPengetahuan}</span>
        </div>
        <div class="score-item-detail">
          <span class="score-label">Energi Tersisa:</span>
          <span class="score-value">${energy}%</span>
        </div>
      </div>
    `;

    // Feedback
    const feedbackMessage = document.createElement('div');
    feedbackMessage.className = 'feedback-message';
    const characterHasilAkhir = document.getElementById(
      'main-character-hasil-img'
    );

    if (totalPengetahuan >= 3 && energy > 70) {
      if (characterHasilAkhir) {
        characterHasilAkhir.src = getCharacterImage(mainCharacter.id, 'senang');
        characterHasilAkhir.classList.add('fade-in');
      }
      feedbackMessage.innerHTML =
        '🎉 <strong>Luar biasa!</strong> Kamu benar-benar memahami cara melawan anemia!';
      feedbackMessage.style.color = '#4CD964';
    } else if (totalPengetahuan >= 2) {
      feedbackMessage.innerHTML =
        '👍 <strong>Bagus!</strong> Terus belajar tentang anemia!';
      feedbackMessage.style.color = '#FF9500';
      if (characterHasilAkhir) {
        characterHasilAkhir.src = getCharacterImage(mainCharacter.id, 'normal');
        characterHasilAkhir.classList.add('fade-in');
      }
    } else {
      feedbackMessage.innerHTML =
        '💪 <strong>Jangan menyerah!</strong> Terus berusaha memahami anemia!';
      feedbackMessage.style.color = '#FF3B30';
      if (characterHasilAkhir) {
        characterHasilAkhir.src = getCharacterImage(mainCharacter.id, 'murung');
        characterHasilAkhir.classList.add('fade-in');
      }
    }

    hasilMessage.appendChild(feedbackMessage);

    // Ubah tombol restart menjadi lanjut ke hari 2
    const btnLanjut = document.getElementById('btn-restart');
    btnLanjut.textContent = 'Lanjut ke Tahap Berikutnya';
    btnLanjut.onclick = lanjutKeHari2;
  }

  // TAMBAH: Function untuk lanjut ke Hari 2
  function lanjutKeHari2() {
    playGameClickSound();
    window.location.href = 'hari2.html';
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
