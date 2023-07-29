// Obtener referencias a los elementos del formulario
var form = document.getElementById('contactForm');
var nameInput = document.getElementById('name');
var emailInput = document.getElementById('email');
var messageInput = document.getElementById('message');

// Función para validar el nombre
function validateName(name) {
  return /^[a-zA-Z0-9\s]{3,}$/.test(name); // Validar que el nombre contenga al menos 3 caracteres alfanuméricos
}

// Función para validar el correo electrónico
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // Validar el formato del correo electrónico
}

// Función para validar el mensaje
function validateMessage(message) {
  return message.length >= 5; // Validar que el mensaje tenga al menos 5 caracteres
}

// Agregar el evento "submit" al formulario para realizar la validación y enviar el correo
form.addEventListener('submit', function(event) {
  event.preventDefault(); 

  // Obtener los valores ingresados por el usuario
  var nameValue = nameInput.value.trim();
  var emailValue = emailInput.value.trim();
  var messageValue = messageInput.value.trim();

  // Validar los campos del formulario
  var isValidName = validateName(nameValue);
  var isValidEmail = validateEmail(emailValue);
  var isValidMessage = validateMessage(messageValue);

  // Mostrar mensajes de alerta si algún campo no es válido
  if (!isValidName) {
    alert('Por favor, ingresa un nombre válido (al menos 3 caracteres alfanuméricos).');
    return;
  }

  if (!isValidEmail) {
    alert('Por favor, ingresa un correo electrónico válido.');
    return;
  }

  if (!isValidMessage) {
    alert('Por favor, ingresa un mensaje con al menos 5 caracteres.');
    return;
  }

  // Si todos los campos son válidos, abrir el cliente de correo electrónico predeterminado
  var subject = 'Mensaje de contacto';
  var body = 'Nombre: ' + nameValue + '\nCorreo electrónico: ' + emailValue + '\nMensaje: ' + messageValue;
  var mailtoLink = 'mailto:' + encodeURIComponent('correo@tudominio.com') + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);

  window.location.href = mailtoLink;
});
