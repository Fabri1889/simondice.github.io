// Obtiene referencias a los elementos del DOM
var round = document.getElementById('round');
var simonButtons = document.getElementsByClassName('square');
var startButton = document.getElementById('startButton');
var timerDisplay = document.getElementById('timer');
var userName = '';

function Simon(simonButtons, startButton, round) {
  this.round = 0;
  this.userPosition = 0;
  this.totalRounds = 999;
  this.sequence = [];
  this.speed = 1000;
  this.blockedButtons = true;
  this.buttons = Array.prototype.slice.call(simonButtons);
  this.display = {
    startButton: startButton,
    round: round
  };
  this.timerInterval = null;
  this.timerCount = 0;
  this.highestRound = 0;
  this.score = 0; 

  // Obtenemos el record más alto almacenado en el localstorage
  var storedHighestRound = localStorage.getItem('highestRound');
  if (storedHighestRound) {
    this.highestRound = parseInt(storedHighestRound, 10);
  }

  // Mostramos el record más alto en el elemento de visible
  var recordDisplay = document.getElementById('record');
  recordDisplay.textContent = 'Récord: ' + this.highestRound;
}


// Agregar la función para abrir el formulario de contacto
function openContactForm() {
  var contactFormSection = document.getElementById('contacto');
  contactFormSection.style.display = 'block';

  var overlay = document.getElementById('overlay');
  overlay.style.display = 'block'; 
}

var contactLink = document.querySelector('a[href="#contacto"]');
contactLink.addEventListener('click', function(event) {
  event.preventDefault();
  openContactForm();
});

// Agregar la función para cerrar el formulario de contacto
function closeContactForm() {
  var contactFormSection = document.getElementById('contacto');
  contactFormSection.style.display = 'none';

  var overlay = document.getElementById('overlay');
  overlay.style.display = 'none'; 
}

// Cerrar el formulario de contacto al hacer clic en el botón "Enviar"
var contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', function(event) {
  event.preventDefault();
  if (validateForm()) {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;
    var message = document.getElementById('message').value;
    var mailtoLink = 'mailto:tu_correo@example.com' + '?subject=Contacto desde la página web&body=' + encodeURIComponent('Nombre: ' + name + '\nCorreo electrónico: ' + email + '\nMensaje: ' + message);
    window.location.href = mailtoLink;

    
    closeContactForm();
  }
});

// Función para validar el formulario de contacto
function validateForm() {
  var name = document.getElementById('name').value;
  var email = document.getElementById('email').value;
  var message = document.getElementById('message').value;
  var errorMessage = document.getElementById('errorMessage');

  if (!name.trim() || !email.trim() || !message.trim()) {
    errorMessage.textContent = 'Por favor, complete todos los campos.';
    errorMessage.style.display = 'block';
    return false;
  } else if (!isValidEmail(email)) {
    errorMessage.textContent = 'Por favor, ingrese una dirección de correo electrónico válida.';
    errorMessage.style.display = 'block';
    return false;
  } else if (message.length < 5) {
    errorMessage.textContent = 'El mensaje debe contener al menos 5 caracteres.';
    errorMessage.style.display = 'block';
    return false;
  }

  errorMessage.style.display = 'none';
  return true;
}

// Función para validar el formato del correo electrónico
function isValidEmail(email) {
  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


function validateUserName(name) {
  if (name.length >= 3) {
    return true;
  } else {
    return false;
  }
}

// Inicializamos la instancia de Simon
Simon.prototype.init = function() {
  var self = this;
  
  this.display.startButton.onclick = function() {
    
    userName = prompt('Por favor, ingresa tu nombre de usuario:');
    
    
    if (validateUserName(userName)) {
      self.startGame();
    } else {
      alert('El nombre de usuario debe tener al menos 3 letras.');
    }
  };
};




var simon = new Simon(simonButtons, startButton, round);
simon.init();


Simon.prototype.startGame = function() {
  var self = this;
  
  this.display.startButton.classList.add('hidden');
  this.display.startButton.disabled = true;
  this.updateRound(0);
  this.userPosition = 0;
  this.sequence = this.createSequence();
  
  Array.prototype.forEach.call(this.buttons, function(element, i) {
    element.classList.remove('winner');
    element.onclick = function() {
      self.buttonClick(i);
    };
  });

  this.showSequence();
  this.startTimer();
  this.updateScoreDisplay();
};

// Actualizamos el numero de ronda en la pantalla
Simon.prototype.updateRound = function(value) {
  this.round = value;
  this.display.round.textContent = 'Round ' + this.round;
};

// Creamos una nueva secuencia de colores
Simon.prototype.createSequence = function() {
  var self = this;
  return Array.apply(null, new Array(this.totalRounds)).map(function() {
    return self.getRandomColor();
  });
};

// Obtenemos un color aleatorio
Simon.prototype.getRandomColor = function() {
  return Math.floor(Math.random() * 4);
};

// Manejamos el evento click en los botones de colores
Simon.prototype.buttonClick = function(value) {
  if (!this.blockedButtons) {
    this.validateChosenColor(value);
  }
};

// Validamos el color elegido por el usuario
Simon.prototype.validateChosenColor = function(value) {
  if (!this.blockedButtons) {
    if (this.sequence[this.userPosition] === value) {
      if (this.round === this.userPosition) {
        this.updateRound(this.round + 1);
        this.speed /= 1.02;
        this.isGameOver();
      } else {
        this.userPosition++;
      }
      this.score++;
      this.updateScoreDisplay();
    } else {
      this.gameLost();
    }
  }
};

// Actualiza la visualización del puntaje en el elemento del DOM correspondiente
Simon.prototype.updateScoreDisplay = function() {
  var scoreDisplay = document.getElementById('score');
  scoreDisplay.style.display = 'block'; 
  scoreDisplay.textContent = 'Puntaje: ' + this.score;
};

// Agregar una función para ocultar el puntaje al inicio
Simon.prototype.hideScoreDisplay = function() {
  var scoreDisplay = document.getElementById('score');
  scoreDisplay.style.display = 'none';
};

// Crea una instancia de la clase Simon y la inicializa
var simon = new Simon(simonButtons, startButton, round);
simon.init();
simon.hideScoreDisplay(); // Ocultar el puntaje al inicio

// Verificamos si el juego ha terminado
Simon.prototype.isGameOver = function() {
  if (this.round === this.totalRounds) {
    this.gameWon();
  } else {
    this.userPosition = 0;
    this.showSequence();
  }
};

// Muestra la secuencia de colores
Simon.prototype.showSequence = function() {
  var self = this;
  var sequenceIndex = 0;
  var timer = setInterval(function() {
    var button = self.buttons[self.sequence[sequenceIndex]];
    self.toggleButtonStyle(button);
    setTimeout(function() {
      self.toggleButtonStyle(button);
    }, self.speed / 2);
    sequenceIndex++;
    if (sequenceIndex > self.round) {
      self.blockedButtons = false;
      clearInterval(timer);
    }
  }, this.speed);
};

// Alterna el estilo del boton entre activo y desactivado
Simon.prototype.toggleButtonStyle = function(button) {
  button.classList.toggle('active');
};

// El juego se ha perdido
Simon.prototype.gameLost = function() {
  this.display.startButton.classList.remove('hidden');
  this.display.startButton.disabled = false;
  this.blockedButtons = true;
  this.stopTimer();
  this.timerCount = 0;
  this.updateTimerDisplay();
  this.score = 0;
  this.updateScoreDisplay();

  if (this.round > this.highestRound) {
    // Actualiza el récord más alto si la ronda actual es mayor que el récord anterior
    this.highestRound = this.round;

    localStorage.setItem('highestRound', this.highestRound.toString());

    var recordDisplay = document.getElementById('record');
    recordDisplay.textContent = 'Récord: ' + this.highestRound;
  }

  // Mostrar el modal de "Game Over" y permitir reiniciar el juego
  var gameOverModal = document.getElementById('gameOverModal');
  gameOverModal.style.display = 'block';

  var restartButton = document.getElementById('restartButton');
  var self = this;
  restartButton.addEventListener('click', function() {
    gameOverModal.style.display = 'none';
    self.resetGame();
  });
};

// Reinicia el juego
Simon.prototype.resetGame = function() {
  var self = this;
  this.updateRound(0);
  this.userPosition = 0;
  this.sequence = [];
  this.speed = 1000;
  this.blockedButtons = true;
  Array.prototype.forEach.call(this.buttons, function(element) {
    element.classList.remove('winner');
  });
};

// game won
Simon.prototype.gameWon = function() {
  this.display.startButton.disabled = false;
  this.blockedButtons = true;
  Array.prototype.forEach.call(this.buttons, function(element) {
    element.classList.add('winner');
  });
  this.stopTimer();
  this.timerCount = 0;
  this.updateTimerDisplay();
};

// Inicia el temporizador
Simon.prototype.startTimer = function() {
  var self = this;
  this.timerInterval = setInterval(function() {
    self.timerCount++;
    self.updateTimerDisplay();
  }, 1000);
};

// Detiene el temporizador
Simon.prototype.stopTimer = function() {
  clearInterval(this.timerInterval);
};

// Actualiza la visualizacion del temporizador
Simon.prototype.updateTimerDisplay = function() {
  var minutes = Math.floor(this.timerCount / 60);
  var seconds = this.timerCount % 60;
  timerDisplay.textContent = 'Time: ' + minutes + 'm ' + seconds + 's';
};

// Crea una instancia de la clase Simon y la inicializa
var simon = new Simon(simonButtons, startButton, round);
simon.init();

// Manejo de eventos del boton de configuracion, modal y modo oscuro
var configButton = document.getElementById('configIcon');
var modal = document.getElementById('modalContainer');
var closeButton = document.getElementsByClassName('close')[0];
var darkModeButton = document.getElementById('darkModeButton');
var body = document.body;

configButton.addEventListener('click', function() {
  modal.style.display = 'block';
});

closeButton.addEventListener('click', function() {
  modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
});

darkModeButton.addEventListener('click', function() {
  body.classList.toggle('dark-mode');
});

// Manejo de eventos del navar en celulares
var navbarToggle = document.getElementById('navbar-toggle');
var navbarMenu = document.getElementById('nav-menu');

navbarToggle.addEventListener('click', function() {
  navbarMenu.classList.toggle('show');
});

// Función para validar el nombre ingresado
function isValidName(name) {
  return name.length >= 3;
}




