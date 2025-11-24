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

  // Load user data dari localStorage
  const userData = JSON.parse(localStorage.getItem('fesmart_user'));
  if (!userData) {
    window.location.href = 'index.html';
    return;
  }

  // Character data berdasarkan pilihan user
  const mainCharacter = {
    id: userData.character,
    name: userData.characterName,
    image: userData.characterImage,
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
  let energy = 50;
  let selectedFood = null;
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
          teksOpening.innerHTML += '<br><br>';
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
      // Move to sarapan scene
      showSarapanScene();
    }
  }

  function showSarapanScene() {
    sceneKuis.style.display = 'none';
    sceneSarapan.style.display = 'block';
    updateEnergyBar();

    // Reset selection state
    selectedFood = null;
    jumlahPilihanSehat = 0;
    bonusPengetahuan = 0;

    // Add event listeners for food cards
    document.querySelectorAll('.food-card').forEach((card) => {
      card.addEventListener('click', function () {
        selectFood(this);
      });
    });
  }

  function selectFood(card) {
    // Toggle selection (bisa pilih multiple)
    card.classList.toggle('selected');
    selectedFood = card.dataset.food;

    const food = makananData[selectedFood];

    // Hitung ulang jumlah pilihan sehat
    jumlahPilihanSehat = document.querySelectorAll(
      '.food-card.selected[data-energy*="+"]'
    ).length;
    bonusPengetahuan = jumlahPilihanSehat;

    // Show result
    showFoodResult();
  }

  function showFoodResult() {
    // Hitung total energy dari semua makanan yang dipilih
    let totalEnergyChange = 0;
    document.querySelectorAll('.food-card.selected').forEach((card) => {
      const food = makananData[card.dataset.food];
      totalEnergyChange += food.energy;
    });

    // Update energy
    energy = Math.max(0, Math.min(100, energy + totalEnergyChange));
    updateEnergyBar();

    // Show message
    const resultMessage = document.getElementById('result-message');

    let message = '';
    if (jumlahPilihanSehat > 0) {
      message = `Pilihan bagus! Kamu memilih ${jumlahPilihanSehat} makanan sehat. Bonus +${bonusPengetahuan} pengetahuan!`;
      resultMessage.className = 'result-message result-positive';
    } else {
      message = 'Pilih makanan sehat untuk mendapatkan bonus pengetahuan!';
      resultMessage.className = 'result-message result-negative';
    }

    resultMessage.innerHTML = message;

    // Tampilkan popup edukasi untuk makanan terakhir yang dipilih
    if (selectedFood) {
      const food = makananData[selectedFood];
      showEdukasiPopup(food.popup);
    }

    // Show continue button
    const btnLanjut = document.getElementById('btn-lanjut');
    btnLanjut.classList.remove('btn-hidden');
    btnLanjut.style.opacity = '1';
    btnLanjut.style.transition = 'opacity 0.8s ease';

    btnLanjut.onclick = showHasilAkhir;
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

    if (totalPengetahuan >= 3 && energy > 70) {
      feedbackMessage.innerHTML =
        '🎉 <strong>Luar biasa!</strong> Kamu benar-benar memahami cara melawan anemia!';
      feedbackMessage.style.color = '#4CD964';
    } else if (totalPengetahuan >= 2) {
      feedbackMessage.innerHTML =
        '👍 <strong>Bagus!</strong> Terus belajar tentang anemia!';
      feedbackMessage.style.color = '#FF9500';
    } else {
      feedbackMessage.innerHTML =
        '💪 <strong>Jangan menyerah!</strong> Terus berusaha memahami anemia!';
      feedbackMessage.style.color = '#FF3B30';
    }

    hasilMessage.appendChild(feedbackMessage);

    // Ubah tombol restart menjadi lanjut ke hari 2
    const btnLanjut = document.getElementById('btn-restart');
    btnLanjut.textContent = 'Lanjut ke Tahap Berikutnya';
    btnLanjut.onclick = lanjutKeHari2;
  }

  // TAMBAH: Function untuk lanjut ke Hari 2
  function lanjutKeHari2() {
    // Redirect ke halaman hari 2
    window.location.href = 'hari-2.html';
  }

  // Redirect ke dashboard jika belum login
  document.addEventListener('DOMContentLoaded', function () {
    const userData = localStorage.getItem('fesmart_user');
    if (!userData) {
      window.location.href = 'index.html';
    }
  });
});
