const textDiv = document.getElementById('text');
const progressDiv = document.getElementById('progress-bar');
const timerDiv = document.getElementById('timer');
const inputArea = document.getElementById('textarea');
const resultDiv = document.getElementById('results');
const restartButton = document.getElementById('restart-button');
const resultText = document.getElementById('result-text');

let countdownFunction;
let timerRunning = false;
let WPM;

async function fetchRandomText() {
    try {
        var result = await fetch('https://baconipsum.com/api/?type=all-meat&sentences=1&start-with-lorem=1');
        var data = await result.json();
        return data[0];
    } catch (e) {
        console.error('Error:', e);
        return [];
    }
}

async function startGame() {
    clearInterval(countdownFunction);
    timerRunning = false;
    inputArea.disabled = false;
    resultDiv.style.display = 'none';
    inputArea.value = '';
    var originalText = await fetchRandomText();
    textDiv.innerHTML = originalText;
    var len = originalText.split(' ').length;
    var minTimeExpected = 3 * len;
    timerDiv.innerHTML = `Time left ${Math.floor(minTimeExpected / 60)}:${String(minTimeExpected % 60).padStart(2, '0')}`;

    inputArea.addEventListener('input', () => {
        if (!timerRunning) {
            timerRunning = true;
            updateTime(minTimeExpected, len);
            minTimeExpected--;
        }
        var checkedText = '';
        const inputValue = inputArea.value;

        for (var i = 0; i < originalText.length; i++) {
            if (i < inputValue.length) {
                if (inputValue[i] === originalText[i]) {
                    checkedText += '<span class="correct-letter">' + originalText[i] + '</span>';
                } else if (originalText[i] === ' ' && inputValue[i] != ' ') {
                    checkedText += '<span class="wrong-space">' + originalText[i] + '</span>';
                } else {
                    checkedText += '<span class="wrong-letter">' + originalText[i] + '</span>';
                }
            } else {
                checkedText += '<span>' + originalText[i] + '</span>';
            }
        }
        textDiv.innerHTML = checkedText;

        updateProgressBar(inputValue, originalText);

        if (inputValue.trim() === originalText.trim()) {
            clearInterval(countdownFunction);
            endGame();
        }
    });
}

function updateProgressBar(inputValue, originalText) {
    let correctChars = 0;
    for (let i = 0; i < inputValue.length; i++) {
        if (inputValue[i] === originalText[i]) {
            correctChars++;
        }
    }
    const progressPercentage = (correctChars / originalText.length) * 100;
    progressDiv.style.width = `${progressPercentage}%`;
}

function calculateWPM(now) {
    var inputValue = inputArea.value;
    var typedWords = inputValue.split(' ').length;
    var minute = now / 60;
    var netWPM = (typedWords) / minute;

    return Math.round(netWPM);
}

function updateTime(now, len) {
    countdownFunction = setInterval(() => {
        const minutes = Math.floor(now / 60);
        const seconds = now % 60;
        timerDiv.innerHTML = `Time left ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        WPM = calculateWPM(3 * len - now);
        now--;
        if (now < 0) {
            clearInterval(countdownFunction);
            endGame();
        }
    }, 1000);
}

function endGame() {
    resultText.innerHTML = 'Game Over!';
    resultDiv.style.display = 'flex';
    inputArea.disabled = true;
    resultText.innerHTML += `<br>Your final WPM: ${WPM}`;
}

restartButton.addEventListener('click', async() => {
    progressDiv.style.width = "0%";
    await startGame();
});

startGame();
