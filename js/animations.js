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
  }, 200);

  // Animasi karakter masuk
  setTimeout(() => {
    nisa.classList.add('slide-nisa');
    guru.classList.add('slide-guru');
    teksOpening.classList.add('slide-guru');
  }, 1700);

  function typeWriterMultiple(lines, speed = 30, lineDelay = 1000) {
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
  }, 2700);

  setTimeout(() => {
    btnStart.style.display = 'block';
  }, 15000);
});
