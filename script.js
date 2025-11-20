const legalTerms = {
  indemnity: 'https://en.wikipedia.org/wiki/Indemnity',
  liability: 'https://en.wikipedia.org/wiki/Liability_(law)',
  arbitration: 'https://en.wikipedia.org/wiki/Arbitration',
  confidentiality: 'https://en.wikipedia.org/wiki/Confidentiality',
  jurisdiction: 'https://en.wikipedia.org/wiki/Jurisdiction',
  breach: 'https://en.wikipedia.org/wiki/Breach_of_contract',
  termination: 'https://en.wikipedia.org/wiki/Termination_of_contract',
  waiver: 'https://en.wikipedia.org/wiki/Waiver',
  consideration: 'https://en.wikipedia.org/wiki/Consideration_(law)',
  'force majeure': 'https://en.wikipedia.org/wiki/Force_majeure',
  severability: 'https://en.wikipedia.org/wiki/Severability',
  assignment: 'https://en.wikipedia.org/wiki/Assignment_(law)',
  'governing law': 'https://en.wikipedia.org/wiki/Choice_of_law',
  warranty: 'https://en.wikipedia.org/wiki/Warranty',
  damages: 'https://en.wikipedia.org/wiki/Damages',
  indemnification: 'https://en.wikipedia.org/wiki/Indemnity',
  covenant: 'https://en.wikipedia.org/wiki/Covenant_(law)',
  subrogation: 'https://en.wikipedia.org/wiki/Subrogation',
  injunction: 'https://en.wikipedia.org/wiki/Injunction',
  'limitation of liability': 'https://en.wikipedia.org/wiki/Limitation_of_liability_clause',
};

if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const fileInput = document.getElementById('fileInput');
const contractContent = document.getElementById('contractContent');
const tldrBox = document.getElementById('tldr');
const themeToggle = document.getElementById('themeToggle');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const statusMessage = document.getElementById('statusMessage');
const readButton = document.getElementById('readButton');
const stopButton = document.getElementById('stopButton');

let currentText = '';
let speechUtterance;

fileInput.addEventListener('change', handleFileUpload);
contractContent.addEventListener('scroll', updateProgress);
themeToggle.addEventListener('change', handleThemeToggle);
readButton.addEventListener('click', startTTS);
stopButton.addEventListener('click', stopTTS);

document.addEventListener('DOMContentLoaded', () => {
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeToggle.checked = prefersDark;
  applyTheme(prefersDark ? 'dark' : 'light');
});

function handleThemeToggle() {
  const mode = themeToggle.checked ? 'dark' : 'light';
  applyTheme(mode);
}

function applyTheme(mode) {
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(mode);
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  statusMessage.textContent = 'Processing document...';
  readButton.disabled = true;
  stopButton.disabled = true;
  contractContent.scrollTop = 0;

  try {
    const text = await extractText(file);
    currentText = text;
    renderContract(text);
    renderTLDR(text);
    statusMessage.textContent = 'Contract ready. Terms are linked to definitions.';
    readButton.disabled = false;
  } catch (error) {
    console.error(error);
    statusMessage.textContent = 'Unable to read this file. Please try another document.';
  }
}

async function extractText(file) {
  const ext = file.name.toLowerCase();

  if (ext.endsWith('.pdf')) {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i += 1) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      text += strings.join(' ') + '\n';
    }
    return text;
  }

  if (ext.endsWith('.docx')) {
    const arrayBuffer = await file.arrayBuffer();
    const { value } = await window.mammoth.extractRawText({ arrayBuffer });
    return value;
  }

  throw new Error('Unsupported file type');
}

function escapeHTML(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function hyperlinkLegalTerms(text) {
  let linkedText = escapeHTML(text);
  Object.entries(legalTerms).forEach(([term, url]) => {
    const pattern = new RegExp(`\\b${term.replace(/ /g, '\\s+')}\\b`, 'gi');
    linkedText = linkedText.replace(
      pattern,
      (match) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${match}</a>`
    );
  });
  return linkedText;
}

function renderContract(text) {
  const linked = hyperlinkLegalTerms(text);
  const paragraphs = linked
    .split(/\n+/)
    .filter((p) => p.trim().length)
    .map((p) => `<p>${p.trim()}</p>`) // wrap in paragraph tags
    .join('');
  contractContent.innerHTML = paragraphs || '<p class="placeholder">No readable text found in this document.</p>';
  updateProgress();
}

function renderTLDR(text) {
  const sentences = text.match(/[^.!?]+[.!?]/g) || [];
  const summary = sentences.slice(0, 3).join(' ').trim();
  const highlighted = summary || 'No summary available. Please scroll through the contract.';
  tldrBox.textContent = `TLDR: ${highlighted}`;
}

function updateProgress() {
  const { scrollTop, scrollHeight, clientHeight } = contractContent;
  if (scrollHeight <= clientHeight) {
    progressFill.style.width = '100%';
    progressPercent.textContent = '100%';
    return;
  }

  const scrolled = Math.min((scrollTop / (scrollHeight - clientHeight)) * 100, 100);
  const percent = Number.isFinite(scrolled) ? Math.round(scrolled) : 0;
  progressFill.style.width = `${percent}%`;
  progressPercent.textContent = `${percent}%`;
}

function startTTS() {
  if (!currentText) return;

  if (!('speechSynthesis' in window)) {
    statusMessage.textContent = 'Text-to-speech not supported in this browser.';
    return;
  }

  speechSynthesis.cancel();
  speechUtterance = new SpeechSynthesisUtterance(currentText);
  speechUtterance.lang = 'en-US';
  speechUtterance.rate = 1;
  speechUtterance.pitch = 1;
  speechSynthesis.speak(speechUtterance);

  statusMessage.textContent = 'Playing text-to-speech...';
  readButton.disabled = true;
  stopButton.disabled = false;

  speechUtterance.onend = () => {
    statusMessage.textContent = 'Finished reading contract.';
    readButton.disabled = false;
    stopButton.disabled = true;
  };
}

function stopTTS() {
  if (speechUtterance) {
    speechSynthesis.cancel();
    statusMessage.textContent = 'Text-to-speech stopped.';
    readButton.disabled = false;
    stopButton.disabled = true;
  }
}
