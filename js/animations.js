document.addEventListener('DOMContentLoaded', function () {
  const firstOpening = document.querySelector('.container-opening');
  const nisa = document.getElementById('character-nisa');
  const guru = document.getElementById('character-guru');
  const teksOpening = document.querySelector('.teks-opening');
  const btnStart = document.getElementById('btn-start');

  // Animasi opening
  setTimeout(() => {
    firstOpening.style.transform = 'translateY(-100vh)';
    firstOpening.style.transition = 'transform 1500ms';
  }, 2000);

  // Animasi karakter masuk
  setTimeout(() => {
    nisa.classList.add('slide-nisa');
    guru.classList.add('slide-guru');
    teksOpening.classList.add('slide-guru');
  }, 3500);

  function typeWriterMultiple(lines, speed = 30, lineDelay = 500) {
    const element = document.querySelector('.teks-opening');
    let lineIndex = 0;
    let charIndex = 0;

    element.innerHTML = '';

    function typeLine() {
      if (lineIndex < lines.length) {
        if (charIndex < lines[lineIndex].length) {
          // Tambah line break sebelum dialog baru (kecuali line pertama)
          if (charIndex === 0 && lineIndex > 0) {
            element.innerHTML += '<br><br>';
          }
          element.innerHTML += lines[lineIndex].charAt(charIndex);
          charIndex++;
          setTimeout(typeLine, speed);
        } else {
          // Pindah ke line berikutnya
          lineIndex++;
          charIndex = 0;
          setTimeout(typeLine, lineDelay);
        }
      }
    }
    typeLine();
  }

  // Penggunaan - pisahkan dialog menjadi array
  const dialogLines = [
    `NISA: "Aduh... kepala pusing sekali. Kenapa ya aku sering merasa lemas dan sulit konsentrasi di sekolah?"`,
    `GURU UKS: "Nisa, gejala yang kamu alami seperti pucat, lemas, dan pusing bisa jadi tanda anemia. Yuk kita pelajari bersama!"`,
  ];

  // animasi teks opening
  setTimeout(() => {
    typeWriterMultiple(dialogLines, 40, 800);
  }, 5000);

  // btnStart.style.display = 'block';
  setTimeout(() => {
    btnStart.style.opacity = '1';
  }, 19000);

  btnStart.addEventListener('click', function () {
    guru.classList.remove('slide-guru');
    guru.classList.add('exit-guru');
  });

  // Data kuis dan simulasi
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

  const makananData = {
    'nasi-telur': {
      nama: 'Nasi + Telur',
      energy: +30,
      message: 'Pilihan bagus! Telur kaya zat besi dan protein 🥚',
      type: 'positive',
    },
    roti: {
      nama: 'Roti Gandum',
      energy: +15,
      message: 'Baik! Roti gandum memberikan energi stabil 🌾',
      type: 'positive',
    },
    'mie-instan': {
      nama: 'Mie Instan',
      energy: -20,
      message: 'Hati-hati! Mie instan kurang zat gizi penting 🚫',
      type: 'negative',
    },
  };

  // State management
  let currentKuisIndex = 0;
  let score = 0;
  let energy = 50;
  let selectedFood = null;

  // DOM Elements
  const sceneOpening = document.querySelector('.scene-opening');
  const sceneKuis = document.querySelector('.scene-kuis');
  const sceneSarapan = document.querySelector('.scene-sarapan');
  const kuisContent = document.getElementById('kuis-content');
  const progressFill = document.getElementById('progress-fill');
  const energyFill = document.getElementById('energy-fill');
  const energyText = document.getElementById('energy-text');
  const resultMessage = document.getElementById('result-message');
  const btnPrev = document.getElementById('btn-prev');
  const btnNext = document.getElementById('btn-next');
  const btnLanjut = document.getElementById('btn-lanjut');

  // Event Listener untuk tombol start yang sudah ada
  btnStart.addEventListener('click', function () {
    // Sembunyikan scene opening dengan animasi
    sceneOpening.style.opacity = '0';
    sceneOpening.style.transition = 'opacity 0.8s ease';

    setTimeout(() => {
      sceneOpening.style.display = 'none';
      // Tampilkan scene kuis
      showKuisScene();
    }, 800);
  });

  // Fungsi tampilkan scene kuis
  function showKuisScene() {
    sceneKuis.style.display = 'block';
    loadSoalKuis(0);
    updateProgressBar();
  }

  // Fungsi load soal kuis
  function loadSoalKuis(index) {
    const soal = kuisData[index];
    const progress = ((index + 1) / kuisData.length) * 100;

    progressFill.style.width = `${progress}%`;

    kuisContent.innerHTML = `
    <div class="soal-kuis">
      <h3>Soal ${index + 1}: ${soal.soal}</h3>
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
    btnPrev.style.display = index === 0 ? 'none' : 'block';
    btnNext.textContent =
      index === kuisData.length - 1 ? 'Selesai 🎉' : 'Selanjutnya ➡';

    // Add animation
    kuisContent.style.animation = 'none';
    setTimeout(() => {
      kuisContent.style.animation = 'slideUp 0.5s ease';
    }, 10);
  }

  // Fungsi update progress bar
  function updateProgressBar() {
    const progress = ((currentKuisIndex + 1) / kuisData.length) * 100;
    progressFill.style.width = `${progress}%`;
  }

  // Fungsi tampilkan scene sarapan
  function showSarapanScene() {
    sceneKuis.style.display = 'none';
    sceneSarapan.style.display = 'block';
    updateEnergyBar();

    // Add event listeners untuk food cards
    document.querySelectorAll('.food-card').forEach((card) => {
      card.addEventListener('click', function () {
        selectFood(this);
      });
    });
  }

  // Fungsi pilih makanan
  function selectFood(card) {
    // Reset selection
    document.querySelectorAll('.food-card').forEach((c) => {
      c.classList.remove('selected');
    });

    // Select current card
    card.classList.add('selected');
    selectedFood = card.dataset.food;

    // Show result immediately atau tunggu sampai confirm
    showFoodResult();
  }

  // Fungsi tampilkan hasil pilihan makanan
  function showFoodResult() {
    const food = makananData[selectedFood];
    const energyChange = food.energy;

    // Update energy
    energy = Math.max(0, Math.min(100, energy + energyChange));
    updateEnergyBar();

    // Show message
    resultMessage.textContent = food.message;
    resultMessage.className = `result-message result-${food.type}`;
    resultMessage.style.display = 'block';

    // Show continue button
    btnLanjut.style.display = 'block';

    // Add bounce animation to energy bar if positive
    if (energyChange > 0) {
      energyText.classList.add('bounce');
      setTimeout(() => {
        energyText.classList.remove('bounce');
      }, 1000);
    }
  }

  // Fungsi update energy bar
  function updateEnergyBar() {
    energyFill.style.width = `${energy}%`;
    energyText.textContent = `${energy}%`;

    // Update color based on energy level
    if (energy < 30) {
      energyFill.style.background = 'linear-gradient(90deg, #FF3B30, #FF9500)';
    } else if (energy < 70) {
      energyFill.style.background = 'linear-gradient(90deg, #FF9500, #FFCC00)';
    } else {
      energyFill.style.background = 'linear-gradient(90deg, #4CD964, #2E8B57)';
    }
  }

  // Event Listeners untuk navigasi kuis
  btnPrev.addEventListener('click', function () {
    if (currentKuisIndex > 0) {
      currentKuisIndex--;
      loadSoalKuis(currentKuisIndex);
    }
  });

  btnNext.addEventListener('click', function () {
    // Cek jika jawaban dipilih
    const selectedAnswer = document.querySelector(
      'input[name="jawaban"]:checked'
    );
    if (!selectedAnswer) {
      alert('Pilih jawaban terlebih dahulu!');
      return;
    }

    // Cek jawaban
    if (parseInt(selectedAnswer.value) === kuisData[currentKuisIndex].jawaban) {
      score++;
    }

    // Pindah ke soal berikutnya atau ke simulasi sarapan
    if (currentKuisIndex < kuisData.length - 1) {
      currentKuisIndex++;
      loadSoalKuis(currentKuisIndex);
    } else {
      // Kuis selesai, lanjut ke simulasi sarapan
      showSarapanScene();
    }
  });

  // Event Listener untuk tombol lanjut setelah simulasi sarapan
  btnLanjut.addEventListener('click', function () {
    // Tampilkan hasil akhir
    showFinalResults();
  });

  // Fungsi tampilkan hasil akhir
  function showFinalResults() {
    sceneSarapan.innerHTML = `
    <div class="kuis-container">
      <div class="soal-kuis" style="text-align: center;">
        <h2>🎉 Selamat! Hari 1 Selesai</h2>
        <div style="font-size: 1.2em; margin: 20px 0;">
          <p>Skor Kuis: <strong>${score}/${kuisData.length}</strong></p>
          <p>Energi Akhir: <strong>${energy}%</strong></p>
        </div>
        <p style="color: #667eea; font-weight: bold; margin: 20px 0;">
          ${
            score === kuisData.length
              ? 'Luar biasa! Pengetahuan anemia kamu sudah baik!'
              : 'Bagus! Terus belajar tentang anemia ya!'
          }
        </p>
        <button id="btn-hari-2" class="btn-primary">Lanjut ke Hari 2</button>
      </div>
    </div>
  `;

    document
      .getElementById('btn-hari-2')
      .addEventListener('click', function () {
        alert('Bersiap untuk petualangan Hari 2!');
        // Di sini bisa redirect ke halaman berikutnya
      });
  }

  // Inisialisasi
  updateProgressBar();
  updateEnergyBar();
});
