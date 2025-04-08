let scanningActive = false;
let currentScanLevel = 'row'; 
let rowTimer = null;
let colTimer = null;
let currentRowIndex = 0;
let currentColIndex = 0;
let activeRows = []; 
let selectedRow = null;

const ROW_INTERVAL = 1500;  // 列掃描間隔
const COL_INTERVAL = 1000;  // 鍵掃描間隔

let currentLayout = 'letters'; 
let caseState = 'upper';       

function getActiveKeyboard() {
  return (currentLayout === 'letters') ? document.getElementById('letters-keyboard')
                                        : document.getElementById('numbers-keyboard');
}

function getActiveRows() {
  let kb = getActiveKeyboard();
  let allRows = kb.querySelectorAll('.keyboard-row');
  return Array.from(allRows).filter(row => row.id !== "row4");
}

function highlightRow(rowElement) {
  let keys = rowElement.querySelectorAll('.key');
  keys.forEach(key => key.classList.add('highlight'));
}

function unhighlightRow(rowElement) {
  let keys = rowElement.querySelectorAll('.key');
  keys.forEach(key => key.classList.remove('highlight'));
}

function startRowScanning() {
  activeRows = getActiveRows();
  if (activeRows.length === 0) return;
  currentRowIndex = 0;
  activeRows.forEach(row => unhighlightRow(row));
  highlightRow(activeRows[currentRowIndex]);
  rowTimer = setInterval(() => {
    unhighlightRow(activeRows[currentRowIndex]);
    currentRowIndex = (currentRowIndex + 1) % activeRows.length;
    highlightRow(activeRows[currentRowIndex]);
  }, ROW_INTERVAL);
  currentScanLevel = 'row';
}

function stopRowScanning() {
  clearInterval(rowTimer);
  activeRows.forEach(row => unhighlightRow(row));
}

function startColScanning(rowElement) {
  let allKeys = Array.from(rowElement.querySelectorAll('.key'));
  let keys = allKeys.filter(key => key.innerText.trim() !== "Space");
  if (keys.length === 0) return;
  currentColIndex = 0;
  keys.forEach(key => key.classList.remove('highlight'));
  keys[currentColIndex].classList.add('highlight');
  colTimer = setInterval(() => {
    keys[currentColIndex].classList.remove('highlight');
    currentColIndex = (currentColIndex + 1) % keys.length;
    keys[currentColIndex].classList.add('highlight');
  }, COL_INTERVAL);
  currentScanLevel = 'col';
}

function stopColScanning(rowElement) {
  clearInterval(colTimer);
  let allKeys = Array.from(rowElement.querySelectorAll('.key'));
  let keys = allKeys.filter(key => key.innerText.trim() !== "Space");
  keys.forEach(key => key.classList.remove('highlight'));
}

document.addEventListener('keydown', function(e) {
  if (!scanningActive) return;
  if (e.keyCode === 32) { // 空白鍵作為控制按鍵
    e.preventDefault();
    if (currentScanLevel === 'row') {
      stopRowScanning();
      let index = (currentRowIndex) % activeRows.length;
      selectedRow = activeRows[index];
      startColScanning(selectedRow);
    } else if (currentScanLevel === 'col') {
      let allKeys = Array.from(selectedRow.querySelectorAll('.key')).filter(key => key.innerText.trim() !== "Space");
      let chosenKey = allKeys[currentColIndex];
      let outputElem = document.getElementById('typedText');
      outputElem.innerText += chosenKey.innerText;
      stopColScanning(selectedRow);
      startRowScanning();
    }
  }
});

document.getElementById('toggleScan').addEventListener('click', function() {
  if (!scanningActive) {
    scanningActive = true;
    this.innerText = "Stop Scanning Mode";
    startRowScanning();
  } else {
    scanningActive = false;
    this.innerText = "Start Scanning Mode";
    if (currentScanLevel === 'row') {
      stopRowScanning();
    } else if (currentScanLevel === 'col' && selectedRow) {
      stopColScanning(selectedRow);
    }
  }
});

document.getElementById('toggleKeyboard').addEventListener('click', function() {
  if (currentLayout === 'letters') {
    document.getElementById('letters-keyboard').style.display = "none";
    document.getElementById('numbers-keyboard').style.display = "block";
    currentLayout = 'numbers';
    this.innerText = "Switch to Letters";
  } else {
    document.getElementById('numbers-keyboard').style.display = "none";
    document.getElementById('letters-keyboard').style.display = "block";
    currentLayout = 'letters';
    this.innerText = "Switch to Numbers";
    if (caseState !== 'upper') {
      toggleCase(); 
    }
  }

  if (scanningActive) {
    if (currentScanLevel === 'row') stopRowScanning();
    else if (currentScanLevel === 'col' && selectedRow) stopColScanning(selectedRow);
    startRowScanning();
  }
});

document.getElementById('toggleCase').addEventListener('click', function() {
  if (currentLayout !== 'letters') return;
  toggleCase();
});

function toggleCase() {
  let letterKeys = document.querySelectorAll('#letters-keyboard .key');
  letterKeys.forEach(key => {
    if(key.innerText.trim() === "Space") return;
    key.innerText = (caseState === 'upper') ? key.innerText.toLowerCase() : key.innerText.toUpperCase();
  });
  caseState = (caseState === 'upper') ? 'lower' : 'upper';
}

document.querySelectorAll('.key').forEach(key => {
    key.addEventListener('click', () => {
      processKeyClick(key.innerText);
    });
  });
  
  function processKeyClick(value) {
    if (value.trim() === "Space") {
      value = " ";
    }
    document.getElementById('typedText').innerText += value;
  }
  