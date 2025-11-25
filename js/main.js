document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const characterCards = document.querySelectorAll('.character-card');
  const userForm = document.getElementById('user-form');
  const usernameInput = document.getElementById('username-input');
  const usernameInfo = document.getElementById('username-info');
  const anonymousCheckbox = document.getElementById('anonymous-checkbox');
  const anonymousInfo = document.getElementById('anonymous-info');
  const validationMessage = document.getElementById('validation-message');
  const startButton = document.getElementById('btn-start-game');
  const loadingContainer = document.getElementById('loading-container');

  // State
  let selectedCharacter = null;
  let isAnonymous = false;
  let isFormValid = false;

  // Reset form setiap halaman dimuat
  function resetForm() {
    usernameInput.value = '';
    anonymousCheckbox.checked = false;
    anonymousInfo.style.display = 'none';
    usernameInput.disabled = false;
    usernameInput.setAttribute('required', '');
    usernameInput.style.background = 'white';
    validationMessage.textContent = '';
    validationMessage.className = 'validation-message';

    // Reset character selection
    characterCards.forEach((card) => {
      card.classList.remove('selected', 'anonymous-selected');
    });

    // Auto-select first character by default
    if (characterCards.length > 0) {
      characterCards[0].click();
    }

    isAnonymous = false;
    validateForm();
  }

  // Character Selection
  characterCards.forEach((card) => {
    card.addEventListener('click', function () {
      // Remove previous selection
      characterCards.forEach((c) =>
        c.classList.remove('selected', 'anonymous-selected')
      );

      // Add selection to clicked card
      this.classList.add('selected');
      if (isAnonymous) {
        this.classList.add('anonymous-selected');
      }
      selectedCharacter = this.dataset.character;

      // Validate form
      validateForm();

      // Play selection sound effect
      playSelectionSound();
    });
  });

  // Form submission
  userForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (isFormValid) {
      startGame();
    }
  });

  // Anonymous Checkbox
  anonymousCheckbox.addEventListener('change', function () {
    isAnonymous = this.checked;

    if (isAnonymous) {
      // Anonymous mode
      usernameInput.disabled = true;
      usernameInput.removeAttribute('required');
      usernameInput.value = '';
      anonymousInfo.style.display = 'block';

      // Add anonymous style to selected character
      characterCards.forEach((card) => {
        if (card.classList.contains('selected')) {
          card.classList.add('anonymous-selected');
        }
      });
    } else {
      // Normal mode
      usernameInput.disabled = false;
      usernameInput.setAttribute('required', '');
      usernameInput.value = '';
      anonymousInfo.style.display = 'none';

      // Remove anonymous style
      characterCards.forEach((card) => {
        card.classList.remove('anonymous-selected');
      });

      // Focus on username input
      setTimeout(() => {
        usernameInput.focus();
      }, 300);
    }

    validateForm();
  });

  // Username Input validation
  usernameInput.addEventListener('input', function () {
    validateForm();

    // Real-time validation feedback
    if (!isAnonymous) {
      const username = this.value.trim();

      if (username.length === 0) {
        showValidationMessage('Nama tidak boleh kosong', 'error');
      } else if (username.length > 15) {
        showValidationMessage('Nama maksimal 15 karakter', 'error');
      } else {
        showValidationMessage('Nama tersedia', 'success');
      }
    }
  });

  // Username Input blur for additional validation
  usernameInput.addEventListener('blur', function () {
    if (!isAnonymous) {
      const username = this.value.trim();
      if (username.length > 0 && username.length <= 15) {
        this.style.borderColor = '#5662e7';
        this.style.background = '#f0fff4';
      } else {
        this.style.borderColor = '#e9ecef';
        this.style.background = 'white';
      }
    }
  });

  // Function untuk update input style
  function updateInputStyle() {
    if (usernameInput.disabled) {
      usernameInput.classList.remove(
        'username-input-focused',
        'username-input-valid',
        'username-input-invalid'
      );
      usernameInput.classList.add('username-input-disabled');
    } else if (document.activeElement === usernameInput) {
      usernameInput.classList.remove(
        'username-input-valid',
        'username-input-invalid',
        'username-input-disabled'
      );
      usernameInput.classList.add('username-input-focused');
    } else {
      const username = usernameInput.value.trim();
      usernameInput.classList.remove(
        'username-input-focused',
        'username-input-disabled'
      );

      if (username.length > 0 && username.length <= 15) {
        usernameInput.classList.add('username-input-valid');
        usernameInput.classList.remove('username-input-invalid');
      } else {
        usernameInput.classList.add('username-input-invalid');
        usernameInput.classList.remove('username-input-valid');
      }
    }
  }

  // Event listeners
  usernameInput.addEventListener('focus', function () {
    updateInputStyle();
  });

  usernameInput.addEventListener('blur', function () {
    updateInputStyle();
  });

  usernameInput.addEventListener('input', function () {
    updateInputStyle();
    validateForm();
  });

  anonymousCheckbox.addEventListener('change', function () {
    isAnonymous = this.checked;

    if (isAnonymous) {
      usernameInput.disabled = true;
      usernameInput.value = '';
      anonymousInfo.style.display = 'block';
    } else {
      usernameInput.disabled = false;
      usernameInput.value = '';
      anonymousInfo.style.display = 'none';
      setTimeout(() => {
        usernameInput.focus();
        updateInputStyle();
      }, 300);
    }

    updateInputStyle();
    validateForm();
  });

  // Check focus state periodically (fallback)
  setInterval(() => {
    updateInputStyle();
  }, 100);

  // Start Button
  startButton.addEventListener('click', function () {
    userForm.requestSubmit();
  });

  function validateForm() {
    const username = usernameInput.value.trim();

    // Check character selection
    if (!selectedCharacter) {
      isFormValid = false;
      showValidationMessage('Pilih karakter terlebih dahulu', 'error');
      return;
    }

    // Check username based on anonymous mode
    if (isAnonymous) {
      isFormValid = true;
      showValidationMessage('Siap bermain sebagai anonymous!', 'success');
    } else {
      if (username.length === 0) {
        isFormValid = false;
        showValidationMessage('Nama tidak boleh kosong', 'error');
      } else if (username.length > 15) {
        isFormValid = false;
        showValidationMessage('Nama maksimal 15 karakter', 'error');
      } else {
        isFormValid = true;
        showValidationMessage('Form valid, siap bermain!', 'success');
      }
    }

    updateStartButtonState();
  }

  function showValidationMessage(message, type) {
    validationMessage.textContent = message;
    validationMessage.className = 'validation-message';

    if (type === 'error') {
      validationMessage.classList.add('validation-error');
    } else if (type === 'success') {
      validationMessage.classList.add('validation-success');
    }
  }

  function updateStartButtonState() {
    if (isFormValid) {
      startButton.disabled = false;

      const finalUsername = isAnonymous
        ? 'Petualang FeSmart'
        : usernameInput.value.trim();
      usernameInfo.innerHTML = `${finalUsername}`;
    } else {
      startButton.disabled = true;
      startButton.textContent = 'Mulai Petualangan';
    }
  }

  function playSelectionSound() {
    // Optional: Add sound effect for character selection
  }

  function startGame() {
    if (!isFormValid || !selectedCharacter) return;

    // Show loading animation
    loadingContainer.classList.add('show');

    // Get form data
    const formData = new FormData(userForm);
    const isAnonymous = formData.get('anonymous') === 'on';
    const username = isAnonymous
      ? 'Petualang FeSmart'
      : formData.get('username').trim();

    // Prepare data for localStorage/API
    const userData = {
      username: username,
      character: selectedCharacter, // 'siti' atau 'sari'
      characterName: getCharacterName(selectedCharacter), // Nama karakter
      characterImage: getCharacterImage(selectedCharacter, 'murung'), // Path gambar
      isAnonymous: isAnonymous,
      startTime: new Date().toISOString(),
      progress: {
        hari1: { completed: false, score: 0, knowledge: 0, compliance: 0 },
        hari2: { completed: false, score: 0, knowledge: 0, compliance: 0 },
        hari3: { completed: false, score: 0, knowledge: 0, compliance: 0 },
        hari4: { completed: false, score: 0, knowledge: 0, compliance: 0 },
        hari5: { completed: false, score: 0, knowledge: 0, compliance: 0 },
        hari6: { completed: false, score: 0, knowledge: 0, compliance: 0 },
        hari7: { completed: false, score: 0, knowledge: 0, compliance: 0 },
      },
      totalKnowledge: 0,
      totalCompliance: 0,
      achievements: [],
    };

    // Save to localStorage
    localStorage.setItem('fesmart_user', JSON.stringify(userData));

    // Simulate API call
    simulateAPICall(userData)
      .then(() => {
        setTimeout(() => {
          window.location.href = 'hari-1.html';
        }, 1000);
      })
      .catch((error) => {
        console.error('Error saving user data:', error);
        showValidationMessage('Gagal menyimpan data. Coba lagi.', 'error');
        loadingContainer.classList.remove('show');
      });
  }

  function getCharacterName(characterId) {
    const characterNames = {
      siti: 'Siti',
      sari: 'Sari',
    };
    return characterNames[characterId] || 'Karakter';
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
      characterImages[characterId]?.['normal'] ||
      'assets/images/characters/default.png'
    );
  }

  function simulateAPICall(userData) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() > 0.05) {
          resolve({ success: true, data: userData });
        } else {
          reject(new Error('Network error'));
        }
      }, 500);
    });
  }

  // Initialize form - RESET SETIAP KALI LOAD
  resetForm();

  // Optional: Add reset button
  // addResetButton();

  // Add interactive effects
  usernameInput.addEventListener('focus', function () {
    if (!isAnonymous) {
      this.parentElement.style.transform = 'scale(1.02)';
    }
  });

  usernameInput.addEventListener('blur', function () {
    this.parentElement.style.transform = 'scale(1)';
  });

});
