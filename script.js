var simonButtons = document.getElementsByClassName('square');
var startButton = document.getElementById('startButton');
var round = document.getElementById('round');
var timerDisplay = document.getElementById('timer');
var userName = '';

function Simon(simonButtons, startButton, round) {
  this.round = 0;
  this.userPosition = 0;
  this.totalRounds = 9999; 
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
  this.penalty = 5; 
  this.startTime = null; 
  this.penaltyPerSecond = 0.1; 

  // Recuperar el récord almacenado en localStorage si existe
  var storedHighestRound = localStorage.getItem('highestRound');
  if (storedHighestRound) {
    this.highestRound = parseInt(storedHighestRound, 10);
  }

  // Mostrar el récord en el elemento con id 'record'
  document.getElementById('record').textContent = 'Récord: ' + this.highestRound;
}

// Función para validar el nombre de usuario ingresado
function validateUserName(name) {
  return name.length >= 3;
}

// Inicialización del juego Simon
Simon.prototype.init = function() {
  var self = this;
  this.display.startButton.onclick = function() {
    // Solicitar y validar el nombre de usuario
    userName = prompt('Por favor, ingresa tu nombre de usuario:');
    if (validateUserName(userName)) {
      self.startGame();
    } else {
      alert('El nombre de usuario debe tener al menos 3 letras.');
    }
  };
};

// Función para iniciar el juego
Simon.prototype.startGame = function() {
  var self = this;
  this.display.startButton.classList.add('hidden');
  this.display.startButton.disabled = true;
  this.updateRound(0); 
  this.userPosition = 0;
  this.sequence = this.createSequence();
  this.buttons.forEach(function(element, i) {
    element.classList.remove('winner');
    element.onclick = function() {
      self.buttonClick(i);
    };
  });
  this.showSequence(); 
  this.startTimer(); 
  this.updateScoreDisplay(); 
};

// Función para actualizar el número de ronda mostrado
Simon.prototype.updateRound = function(value) {
  this.round = value;
  this.display.round.textContent = 'Round ' + this.round;
};

// Función para crear una nueva secuencia de colores
Simon.prototype.createSequence = function() {
  var self = this;
  // Generar una secuencia de colores aleatorios con la longitud total de rondas
  return Array.apply(null, new Array(this.totalRounds)).map(function() {
    return self.getRandomColor();
  });
};

// Función para obtener un color aleatorio
Simon.prototype.getRandomColor = function() {
  return Math.floor(Math.random() * 4);
};

// Función para manejar el clic en un botón de color
Simon.prototype.buttonClick = function(value) {
  if (!this.blockedButtons) {
    this.validateChosenColor(value);
  }
};

// Función para validar si el color elegido es correcto
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

// Función para mostrar el puntaje actual
Simon.prototype.updateScoreDisplay = function() {
  var scoreDisplay = document.getElementById('score');
  scoreDisplay.style.display = 'block';
  scoreDisplay.textContent = 'Puntaje: ' + this.score;
};

// Función para ocultar el puntaje
Simon.prototype.hideScoreDisplay = function() {
  var scoreDisplay = document.getElementById('score');
  scoreDisplay.style.display = 'none';
};

// Función para verificar si el juego ha terminado
Simon.prototype.isGameOver = function() {
  if (this.round === this.totalRounds) {
    this.gameWon(); 
  } else {
    this.userPosition = 0; 
    this.showSequence(); 
  }
};

// Función para mostrar la secuencia de colores
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

// Función para alternar el estilo de un botón (cambiar de color)
Simon.prototype.toggleButtonStyle = function(button) {
  button.classList.toggle('active');
};

// gameover
Simon.prototype.gameLost = function() {
  this.display.startButton.classList.remove('hidden');
  this.display.startButton.disabled = false;
  this.blockedButtons = true;
  this.stopTimer();
  this.timerCount = 0;
  this.updateTimerDisplay();

  // Actualizar el récord si el puntaje actual es mayor que el récord almacenado
  if (this.round > this.highestRound) {
    this.highestRound = this.round;
    localStorage.setItem('highestRound', this.highestRound.toString());
    document.getElementById('record').textContent = 'Récord: ' + this.highestRound;
  }

  // Calcular el puntaje final teniendo en cuenta el tiempo transcurrido
  var timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
  var scoreWithPenalty = this.score - timeElapsed * this.penaltyPerSecond;
  var finalScore = scoreWithPenalty >= 0 ? scoreWithPenalty : 0;

  // Mostrar el modal de gameover con el puntaje y opciones para reiniciar o salir
  var gameOverModal = document.getElementById('gameOverModal');
  gameOverModal.style.display = 'block';

  document.getElementById('modalRound').textContent = 'Ronda: ' + this.round;
  document.getElementById('modalScore').textContent = 'Puntaje: ' + finalScore;
  document.getElementById('modalTimer').textContent = 'Tiempo: ' + timeElapsed + 's';

  var restartButton = document.getElementById('restartButton');
  var self = this;
  restartButton.addEventListener('click', function() {
    gameOverModal.style.display = 'none';
    self.resetGame(); 
  });

  // Guardar los datos del juego en el historial de partidas
  var gameData = {
    username: userName,
    score: finalScore,
    round: this.round,
    datetime: getCurrentDateTime(), 
  };
  saveGameData(gameData);
};

// Función para obtener la fecha y hora actual en formato "YYYY-MM-DD HH:mm:ss"
function getCurrentDateTime() {
  var now = new Date();
  var year = now.getFullYear();
  var month = String(now.getMonth() + 1).padStart(2, '0');
  var day = String(now.getDate()).padStart(2, '0');
  var hours = String(now.getHours()).padStart(2, '0');
  var minutes = String(now.getMinutes()).padStart(2, '0');
  var seconds = String(now.getSeconds()).padStart(2, '0');
  return year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
}

// Función para guardar los datos del juego en el historial de partidas en localStorage
function saveGameData(gameData) {
  var gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');
  gameHistory.push(gameData);
  localStorage.setItem('gameHistory', JSON.stringify(gameHistory));
}

// Función para reiniciar el juego a su estado inicial
Simon.prototype.resetGame = function() {
  var self = this;
  this.updateRound(0);
  this.userPosition = 0;
  this.sequence = [];
  this.speed = 1000;
  this.blockedButtons = true;
  this.score = 0;
  this.buttons.forEach(function(element) {
    element.classList.remove('winner');
  });
  this.startGame(); 
};

// win
Simon.prototype.gameWon = function() {
  this.display.startButton.disabled = false;
  this.blockedButtons = true;
  this.buttons.forEach(function(element) {
    element.classList.add('winner');
  });
  this.stopTimer();
  this.timerCount = 0;
  this.updateTimerDisplay();
};

// Función para actualizar el temporizador y el puntaje mostrados
Simon.prototype.updateTimerAndScoreDisplay = function() {
  var minutes = Math.floor(this.timerCount / 60);
  var seconds = this.timerCount % 60;
  timerDisplay.textContent = 'Time: ' + minutes + 'm ' + seconds + 's';

  var timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
  var scoreWithPenalty = this.score - timeElapsed * this.penaltyPerSecond;

  var scoreDisplay = document.getElementById('score');
  scoreDisplay.style.display = 'block';
  scoreDisplay.textContent = 'Puntaje: ' + (scoreWithPenalty >= 0 ? scoreWithPenalty : 0);
};

// Función para iniciar el temporizador
Simon.prototype.startTimer = function() {
  var self = this;
  this.timerInterval = setInterval(function() {
    self.timerCount++;
    self.updateTimerAndScoreDisplay();
  }, 1000);
  this.startTime = Date.now();
};

// Función para detener el temporizador
Simon.prototype.stopTimer = function() {
  clearInterval(this.timerInterval);
};

// Función para actualizar el temporizador mostrado
Simon.prototype.updateTimerDisplay = function() {
  var minutes = Math.floor(this.timerCount / 60);
  var seconds = this.timerCount % 60;
  timerDisplay.textContent = 'Time: ' + minutes + 'm ' + seconds + 's';
};

// Crear una instancia de la clase Simon y comenzar el juego
var simon = new Simon(simonButtons, startButton, round);
simon.init();
simon.hideScoreDisplay();

// Agregar un manejador de eventos al elemento con id 'ranking' para mostrar el historial de partidas
var ranking = document.getElementById('ranking');
ranking.addEventListener('click', function() {
  showRanking();
});

// Función para mostrar el historial de partidas en un modal
function showRanking() {
  var rankingModal = document.getElementById('rankingModal');
  var rankingList = document.getElementById('rankingList');

  var gameHistory = JSON.parse(localStorage.getItem('gameHistory') || '[]');

  var sortBy = document.getElementById('sortBySelect').value;

  // Ordenar el historial de partidas
  if (sortBy === 'puntaje') {
    gameHistory.sort(function(a, b) {
      return b.score - a.score;
    });
  } else if (sortBy === 'fecha') {
    gameHistory.sort(function(a, b) {
      return new Date(b.datetime) - new Date(a.datetime);
    });
  }

  rankingList.innerHTML = '';

  for (var i = 0; i < gameHistory.length; i++) {
    var gameData = gameHistory[i];
    var listItem = document.createElement('li');
    listItem.textContent =
      'Jugador: ' +
      gameData.username +
      ', Puntaje: ' +
      gameData.score +
      ', Ronda: ' +
      gameData.round +
      ', Fecha: ' +
      gameData.datetime;
    rankingList.appendChild(listItem);
  }

  rankingModal.style.display = 'block'; 
};

// Agregar un manejador de eventos para cerrar el modal ranking
var ranking = document.getElementById('ranking');
var rankingModal = document.getElementById('rankingModal');
var rankingCloseButton = rankingModal.querySelector('.close');

ranking.addEventListener('click', function() {
  rankingModal.style.display = 'block';
});

rankingCloseButton.addEventListener('click', function() {
  rankingModal.style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === rankingModal) {
    rankingModal.style.display = 'none';
  }
});

// Crear un elemento select para permitir al usuario elegir entre puntaje o fecha
var sortBySelect = document.createElement('select');
sortBySelect.id = 'sortBySelect';
var sortByOptions = ['puntaje', 'fecha'];
for (var i = 0; i < sortByOptions.length; i++) {
  var option = document.createElement('option');
  option.value = sortByOptions[i];
  option.textContent = sortByOptions[i].charAt(0).toUpperCase() + sortByOptions[i].slice(1);
  sortBySelect.appendChild(option);
}

var rankingModalContent = rankingModal.querySelector('.modal-content');
rankingModalContent.insertBefore(sortBySelect, rankingModalContent.firstChild);

// Agregar un manejador de eventos al elemento select para actualizar al cambiar 
sortBySelect.addEventListener('change', function() {
  showRanking();
});

// Agregar manejadores de eventos para mostrar y ocultar el menú de configuración
var configButton = document.getElementById('configIcon');
var modal = document.getElementById('modalContainer');
var closeButton = document.getElementsByClassName('close')[0];

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

// Agregar un manejador de eventos para el botón de menú en celulares
var navbarToggle = document.getElementById('navbar-toggle');
var navbarMenu = document.getElementById('nav-menu');

navbarToggle.addEventListener('click', function() {
  navbarMenu.classList.toggle('show');
});
