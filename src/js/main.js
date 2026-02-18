/* Constantes y selectores */
const cryptoSelect = document.querySelector(`#cryptocurrency`);
const currencySelect = document.querySelector(`#currency`);
const quoteForm = document.querySelector(`#quote-form`);

const objSearch = {
  cryptocurrency: ``,
  currency: ``,
};

/* Promises */
const getCryptocurrencies = (cryptocurrencies) =>
  new Promise((resolve) => {
    resolve(cryptocurrencies);
  });

/* Eventos */

document.addEventListener(`DOMContentLoaded`, () => {
  startApp();
});

function startApp() {
  fetchCryptocurrencies();

  quoteForm.addEventListener(`submit`, submitForm);
  cryptoSelect.addEventListener(`change`, readValue);
  currencySelect.addEventListener(`change`, readValue);
}

/* Funciones */

function fetchCryptocurrencies() {
  const API_URL = `https://min-api.cryptocompare.com/data/top/mktcapfull?limit=10&tsym=USD`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((result) => getCryptocurrencies(result.Data))
    .then((cryptocurrencies) => fillSelects(cryptocurrencies));
}

function fillSelects(cryptocurrencies) {
  cryptocurrencies.forEach((crypto) => {
    const { FullName, Name } = crypto.CoinInfo;

    const option = document.createElement(`option`);
    option.value = Name;
    option.textContent = FullName;

    cryptoSelect.appendChild(option);
  });
}

function readValue(e) {
  objSearch[e.target.name] = e.target.value;
}

function submitForm(e) {
  e.preventDefault();

  // Validar que ambos campos tengan algo seleccionado
  const VOID_VALUE = ``;
  const { cryptocurrency, currency } = objSearch;

  if (cryptocurrency === VOID_VALUE || currency === VOID_VALUE) {
    showAlert(`Ambos campos son obligatorios`);

    return;
  }

  // Mostrar el spinner por 3 segundos antes de consultar la API
  showSpinner();

  setTimeout(() => {
    consultAPI();
  }, 4000);
}

function consultAPI() {
  // Destructuring para obtener los valores de cryptocurrency y currency
  const { cryptocurrency, currency } = objSearch;

  const API_URL = `https://min-api.cryptocompare.com/data/pricemultifull?fsyms=${cryptocurrency}&tsyms=${currency}`;

  fetch(API_URL)
    .then((response) => response.json())
    .then((quote) => {
      showQuoteHTML(quote.DISPLAY[cryptocurrency][currency]);
    });
}

function showQuoteHTML(quote) {
  // Extraer los valores necesarios del objeto quote
  const { PRICE, HIGHDAY, LOWDAY, CHANGEPCT24HOUR, LASTUPDATE } = quote;

  // Crear el contenedor de resultados
  const resultsCard = prepareContainer();

  // Crear un arreglo de objetos para almacenar la informacion para mostrar
  const quoteData = [
    { label: `Precio`, value: PRICE },
    { label: `Precio más alto del día`, value: HIGHDAY },
    { label: `Precio más bajo del día`, value: LOWDAY },
    { label: `Últimas 24 horas`, value: `${CHANGEPCT24HOUR}%` },
    { label: `Última actualización`, value: LASTUPDATE },
  ];

  // Iterar sobre el arreglo de objetos para crear los elementos HTML de forma dinamica y evitar repetir codigo
  quoteData.forEach((item) => {
    const { label, value } = item;

    const paragraph = document.createElement(`p`);
    paragraph.classList.add(`results-card__text`);
    paragraph.innerHTML = `${label}: <span class="results-card__highlight">${value}</span>`;

    resultsCard.appendChild(paragraph);
  });
}

function showAlert(message) {
  const errorMessage = message;

  // Verificar si ya existe una alerta para evitar mostrar múltiples alertas
  const existingAlert = document.querySelector(`.alert`);

  // Prevenir que se muestren más de una alerta
  if (!existingAlert) {
    const alert = document.createElement(`p`);
    alert.classList.add(`alert`, `alert--error`);
    alert.textContent = errorMessage;

    quoteForm.appendChild(alert);

    // Eliminar la alerta después de 2 segundos
    setTimeout(() => {
      alert.remove();
    }, 2000);
  }
}

function prepareContainer() {
  let resultsCard = document.querySelector(`.results-card`);

  if (!resultsCard) {
    resultsCard = document.createElement(`div`);
    resultsCard.classList.add(`results-card`);
    quoteForm.parentElement.appendChild(resultsCard);

    return resultsCard;
  }

  clearHTML(resultsCard);

  return resultsCard;
}

/* Funcion para borrar el HTML previo */
function clearHTML(container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function showSpinner() {
  const resultsCard = prepareContainer();

  const spinner = document.createElement(`div`);
  spinner.classList.add(`sk-folding-cube`);
  spinner.innerHTML = `
      <div class="sk-cube1 sk-cube"></div>
      <div class="sk-cube2 sk-cube"></div>
      <div class="sk-cube4 sk-cube"></div>
      <div class="sk-cube3 sk-cube"></div>`;

  // Agregar el spinner al contenedor de resultados
  resultsCard.appendChild(spinner);
}
