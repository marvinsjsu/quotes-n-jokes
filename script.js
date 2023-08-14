const getQuoteIconClass = 'fa-rotate-right';
const gettingQuoteIconClass = 'fa-rotate';
const pauseReadIconClass = 'fa-pause';
const playReadIconClass = 'fa-play';
const spinIconClass = 'spin';
const Ted_Lasso = 'Ted Lasso';
const readyStateIsReady = 4;
const qouteMaxLength = 170;

const tedLassoApiURL = 'https://tedlassoquotes.com/v1/quote';
const textToSpeechApiKey = '9587d249d20542c0bf5479dc309b2b25';

const quoteContainerEl = document.getElementById('quote-container');
const readQuoteIcon = document.getElementById('read-quote-icon');
const loadingImg = document.getElementById('loader-dancing-ted');
const readQuoteBtn = document.getElementById('read-quote-btn');
const getQuoteIcon = document.getElementById('get-quote-icon');
const getQuoteBtn = document.getElementById('get-quote-btn');
const quoteEl = document.getElementById('quote');
const audioEl = document.getElementById('audio');

const actions = {
  fetchNotStarted: 'fetchNotStarted',
  fetchStarted: 'fetchStarted',
  fetchSuccess: 'fetchSuccess',
  fetchError: 'fetchError',
};

let tedLassoQuote = "IT'S JUST A GROUP OF PEOPLE WHO CARE, ROY. NOT UNLIKE FOLKS AT A HIP-HOP CONCERT WHOSE HANDS ARE NOT IN THE AIR.";
let readingQuote = false;

async function getQuote() {
  showLoadingImg();
  try {
    const response = await fetch(tedLassoApiURL);
    const data = await response.json();

    if (shouldGetAnotherQuote(data)) {
      await getQuote();
    } else {
      setTimeout(() => {
        hideLoadingImg();
        tedLassoQuote = data.quote;
        displayQuote(data.quote);
      }, 1000);
    }
  } catch(error) {
    console.log(error);
  }
}

function showLoadingImg() {
  loadingImg.hidden = false;
  quoteEl.hidden = true;
  getQuoteBtn.disabled = true;
  readQuoteBtn.disabled = true;
  getQuoteIcon.classList.remove(getQuoteIconClass);
  getQuoteIcon.classList.add(gettingQuoteIconClass);
  getQuoteIcon.classList.add(spinIconClass);
}

function hideLoadingImg() {
  loadingImg.hidden = true;
  quoteEl.hidden = false;
  getQuoteBtn.disabled = false;
  getQuoteIcon.classList.remove(gettingQuoteIconClass);
  getQuoteIcon.classList.remove(spinIconClass);
  getQuoteIcon.classList.add(getQuoteIconClass);
}

function displayQuote(quote = tedLassoQuote) {
  setQuoteToBeRead();
  quoteEl.innerText = quote;
}

async function setQuoteToBeRead() {
  if (tedLassoQuote) {
    try {
      audioEl.src = '';
      await VoiceRSS.speech({
        key: textToSpeechApiKey,
        src: tedLassoQuote,
        hl: 'en-us',
        v: 'Mike',
        r: 0, 
        c: 'mp3',
        f: '44khz_16bit_stereo',
        ssml: false
      });
      readQuoteBtn.disabled = false;
    } catch(error) {
      console.log(error);
    }
  }
}

async function readQuote() {
  if (isReadyToRead()) {
    audioEl.play();
  }

  if (readingQuote) {
    audioEl.pause();
  }
}

function isReadyToRead() {
  return tedLassoQuote
    && !readingQuote
    && audioEl.currentSrc
    && audioEl.readyState === readyStateIsReady;
}

function shouldGetAnotherQuote(data) {
  return !(data?.quote
    && data.author === Ted_Lasso
    && data.quote.length < qouteMaxLength
    && data.quote.toUpperCase() !== tedLassoQuote.toUpperCase());
}

function showPauseIcon() {
  readingQuote = true;
  readQuoteIcon.classList.remove(playReadIconClass);
  readQuoteIcon.classList.add(pauseReadIconClass);
  getQuoteBtn.disabled = true;
}

function showPlayIcon() {
  readingQuote = false;
  readQuoteIcon.classList.remove(pauseReadIconClass);
  readQuoteIcon.classList.add(playReadIconClass);
  getQuoteBtn.disabled = false;
}

window.onload = async () => {
  displayQuote();

  audioEl.onplay = showPauseIcon;
  audioEl.onpause = showPlayIcon;
  audioEl.onended = showPlayIcon;

  getQuoteBtn.addEventListener('click', getQuote);
  readQuoteBtn.addEventListener('click', readQuote);
};