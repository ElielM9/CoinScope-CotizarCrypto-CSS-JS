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

  // Limpiar el HTML previo
  clearPreviousResults();

  // Crear el contenedor de resultados
  const resultsCard = document.createElement(`div`);
  resultsCard.classList.add(`results-card`);
  quoteForm.parentElement.appendChild(resultsCard);

  // Crear el HTML para mostrar la cotización
  const price = document.createElement(`p`);
  price.classList.add(`results-card__text`);
  price.innerHTML = `Precio: <span class="results-card__highlight">${PRICE}</span>`;

  const highPrice = document.createElement(`p`);
  highPrice.classList.add(`results-card__text`);
  highPrice.innerHTML = `Precio más alto del día: <span class="results-card__highlight">${HIGHDAY}</span>`;

  const lowPrice = document.createElement(`p`);
  lowPrice.classList.add(`results-card__text`);
  lowPrice.innerHTML = `Precio más bajo del día: <span class="results-card__highlight">${LOWDAY}</span>`;

  const lastHours = document.createElement(`p`);
  lastHours.classList.add(`results-card__text`);
  lastHours.innerHTML = `Últimas 24 horas: <span class="results-card__highlight">${CHANGEPCT24HOUR}%</span>`;

  const lastUpdate = document.createElement(`p`);
  lastUpdate.classList.add(`results-card__text`);
  lastUpdate.innerHTML = `Última actualización: <span class="results-card__highlight">${LASTUPDATE}</span>`;

  // Agregar los elementos al contenedor de resultados
  resultsCard.appendChild(price);
  resultsCard.appendChild(highPrice);
  resultsCard.appendChild(lowPrice);
  resultsCard.appendChild(lastHours);
  resultsCard.appendChild(lastUpdate);
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

/* Funcion para borrar resultados anteriores */
function clearPreviousResults() {
  const existingResults = document.querySelector(`.results-card`);
  if (existingResults) {
    existingResults.remove();
  }
}

function showSpinner() {
  clearPreviousResults();

  const resultsCard = document.createElement(`div`);
  resultsCard.classList.add(`results-card`);
  quoteForm.parentElement.appendChild(resultsCard);

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
