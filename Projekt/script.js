let BASISPUNKTE = 10;
let BONUS_RICHTIGER_TIPP = 100;
let STRAFE_FALSCHER_TIPP = 50;

let zeitlimit = 15;
let untereGrenze = 1;
let obereGrenze = 100;

let geheimeZahl = 0;
let punktestand = 0;
let durchlauf = 1;
let aktuelleRunde = 1;

let timerInterval;
let verbleibendeSekunden = 0;
let vergleichszahlGlobal = 0;
let minMaxZahl1 = 0, minMaxZahl2 = 0;
let aktuelleBereiche = [];

function zeigeScreen(screenId) {
    if (screenId === 'main-menu') {
        document.getElementById('main-menu').classList.add('active');
        document.getElementById('popup-overlay').classList.remove('active');
    } else {
        document.getElementById('main-menu').classList.remove('active');
        document.getElementById('popup-overlay').classList.add('active');
        
        document.querySelectorAll('.game-box').forEach(box => box.style.display = 'none');
        document.getElementById(screenId).style.display = 'block';
    }
}

function starteSpielVorbereitung() {
    punktestand = 0;
    durchlauf = 1;
    zeigeScreen('setup-screen');
}

function geheimenZahlenWaehlenScreen() {
    zeitlimit = parseInt(document.getElementById('schwierigkeit').value);
    untereGrenze = parseInt(document.getElementById('untere-grenze').value);
    obereGrenze = parseInt(document.getElementById('obere-grenze').value);

    if (obereGrenze <= untereGrenze) {
        alert("Die obere Grenze muss größer als die untere sein!");
        return;
    }

    neueGeheimeZahlenErzeugen();
    zeigeScreen('secret-choice-screen');
}

let generierteZahlen = [];
function neueGeheimeZahlenErzeugen() {
    let zahlA = zufallszahl(untereGrenze, obereGrenze);
    let zahlB = zufallszahl(untereGrenze, obereGrenze);
    while (zahlB === zahlA) zahlB = zufallszahl(untereGrenze, obereGrenze);
    
    let zahlC = zufallszahl(untereGrenze, obereGrenze);
    while (zahlC === zahlA || zahlC === zahlB) zahlC = zufallszahl(untereGrenze, obereGrenze);

    generierteZahlen = [zahlA, zahlB, zahlC];
}

function waehleGeheimeZahl(auswahl) {
    geheimeZahl = generierteZahlen[auswahl - 1];
    punkteStadAktualisieren();
    starteHauptspiel();
}

function definiereRunde(rundenNummer) {
    aktuelleRunde = rundenNummer;
    aktualisiereHeader();
    starteTimer();

    const container = document.getElementById('frage-container');
    container.innerHTML = '';

    if (rundenNummer === 1) {
        container.innerHTML = `
            <p style="margin-bottom:10px;"><strong>RUNDE 1 - GERADE ODER UNGERADE</strong></p>
            <p>Ist deine unbekannte Zahl gerade oder ungerade?</p>
            <button class="action-btn" onclick="werteRunde1(1)">1 - Gerade</button>
            <button class="action-btn" onclick="werteRunde1(2)">2 - Ungerade</button>
        `;
    } else if (rundenNummer === 2) {
        vergleichszahlGlobal = zufallszahl(untereGrenze, obereGrenze);
        while (vergleichszahlGlobal === geheimeZahl) {
            vergleichszahlGlobal = zufallszahl(untereGrenze, obereGrenze);
        }
        container.innerHTML = `
            <p style="margin-bottom:10px;"><strong>RUNDE 2 - HÖHER ODER TIEFER</strong></p>
            <p>Ist deine Zahl höher oder tiefer als <strong>${vergleichszahlGlobal}</strong>?</p>
            <button class="action-btn" onclick="werteRunde2(1)">1 - Höher</button>
            <button class="action-btn" onclick="werteRunde2(2)">2 - Tiefer</button>
        `;
    } else if (rundenNummer === 3) {
        minMaxZahl1 = zufallszahl(untereGrenze, obereGrenze);
        minMaxZahl2 = zufallszahl(untereGrenze, obereGrenze);
        while (minMaxZahl1 === minMaxZahl2) minMaxZahl2 = zufallszahl(untereGrenze, obereGrenze);

        let min = Math.min(minMaxZahl1, minMaxZahl2);
        let max = Math.max(minMaxZahl1, minMaxZahl2);
        minMaxZahl1 = min; minMaxZahl2 = max;

        container.innerHTML = `
            <p style="margin-bottom:10px;"><strong>RUNDE 3 - DAZWISCHEN ODER AUSSERHALB</strong></p>
            <p>Liegt deine Zahl zwischen <strong>${min}</strong> und <strong>${max}</strong>?</p>
            <button class="action-btn" onclick="werteRunde3(1)">1 - Dazwischen</button>
            <button class="action-btn" onclick="werteRunde3(2)">2 - Außerhalb</button>
        `;
    } else if (rundenNummer === 4) {
        let gesamtbereich = obereGrenze - untereGrenze + 1;
        let bereichsGroesse = Math.ceil(gesamtbereich / 4.0);
        aktuelleBereiche = [];

        let html = `<p style="margin-bottom:10px;"><strong>RUNDE 4 - ZAHLENBEREICH</strong></p><p>In welchem Bereich liegt deine Zahl?</p>`;
        for (let i = 0; i < 4; i++) {
            let start = untereGrenze + (i * bereichsGroesse);
            let ende = Math.min(start + bereichsGroesse - 1, obereGrenze);
            aktuelleBereiche.push({start, ende});
            html += `<button class="action-btn" onclick="werteRunde4(${i})">${i + 1} - ${start} bis ${ende}</button>`;
        }
        container.innerHTML = html;
    }

    zeigeScreen('game-screen');
}

function starteHauptspiel() {
    definiereRunde(1);
}

function starteTimer() {
    clearInterval(timerInterval);
    verbleibendeSekunden = zeitlimit;
    aktualisiereHeader();

    timerInterval = setInterval(() => {
        verbleibendeSekunden--;
        aktualisiereHeader();
        if (verbleibendeSekunden <= 0) {
            clearInterval(timerInterval);
            spielBeenden("Zeit abgelaufen!");
        }
    }, 1000);
}

function rundeBeendet(richtig) {
    clearInterval(timerInterval);
    if (!richtig) {
        spielBeenden("Falsche Antwort!");
        return;
    }

    punkteVergeben();
    setTimeout(() => {
        zeigeBonusFrage();
    }, 800);
}

function werteRunde1(antwort) {
    let istGerade = (geheimeZahl % 2 === 0);
    let richtig = (istGerade && antwort === 1) || (!istGerade && antwort === 2);
    rundeBeendet(richtig);
}

function werteRunde2(antwort) {
    let hoeher = (geheimeZahl > vergleichszahlGlobal);
    let richtig = (hoeher && antwort === 1) || (!hoeher && antwort === 2);
    rundeBeendet(richtig);
}

function werteRunde3(antwort) {
    let dazwischen = (geheimeZahl > minMaxZahl1 && geheimeZahl < minMaxZahl2);
    let richtig = (dazwischen && antwort === 1) || (!dazwischen && antwort === 2);
    rundeBeendet(richtig);
}

function werteRunde4(index) {
    let bereich = aktuelleBereiche[index];
    let richtig = (geheimeZahl >= bereich.start && geheimeZahl <= bereich.ende);
    rundeBeendet(richtig);
}

function punkteVergeben() {
    let punkte = (BASISPUNKTE * durchlauf) + verbleibendeSekunden;
    punktestand += punkte;
    punkteStadAktualisieren();
}

function zeigeBonusFrage() {
    let buttonsDiv = document.getElementById('bonus-buttons');
    if (buttonsDiv) buttonsDiv.style.display = 'flex';
    
    let inputBereich = document.getElementById('tipp-input-bereich');
    if (inputBereich) inputBereich.style.display = 'none';
    
    let tippFeld = document.getElementById('user-tipp');
    if (tippFeld) tippFeld.value = '';

    zeigeScreen('bonus-screen');
}

function antwortBonus(ja) {
    if (!ja) {
        naechsteRundeOderDurchlauf();
    } else {
        let buttonsDiv = document.getElementById('bonus-buttons');
        if (buttonsDiv) buttonsDiv.style.display = 'none';

        let inputBereich = document.getElementById('tipp-input-bereich');
        if (inputBereich) inputBereich.style.display = 'block';
    }
}

function tippAbgeben() {
    let tipp = parseInt(document.getElementById('user-tipp').value);
    if (isNaN(tipp)) return;

    if (tipp === geheimeZahl) {
        punktestand += BONUS_RICHTIGER_TIPP;
        alert("*** RICHTIG GERATEN! ***\n+" + BONUS_RICHTIGER_TIPP + " Bonuspunkte");
        neueGeheimeZahlenErzeugen();
        geheimeZahl = generierteZahlen[0];
        durchlauf = 1;
        definiereRunde(1);
    } else {
        punktestand -= STRAFE_FALSCHER_TIPP;
        if (punktestand < 0) punktestand = 0;
        alert("Falsch geraten! -" + STRAFE_FALSCHER_TIPP + " Punkte.\nDas Spiel geht weiter.");
        naechsteRundeOderDurchlauf();
    }
}

function naechsteRundeOderDurchlauf() {
    if (aktuelleRunde < 4) {
        definiereRunde(aktuelleRunde + 1);
    } else {
        durchlauf++;
        definiereRunde(1);
    }
}

function spielBeenden(grund) {
    clearInterval(timerInterval);
    document.getElementById('game-over-text').innerHTML = `
        ${grund}<br><br>
        Deine geheime Zahl war: <strong>${geheimeZahl}</strong><br>
        Finaler Punktestand: <strong>${punktestand}</strong><br>
        Erreichter Durchlauf: <strong>${durchlauf}</strong>
    `;
    
    // Eingabefeld für Highscore anzeigen
    document.getElementById('highscore-save-bereich').style.display = 'block';
    document.getElementById('spieler-name').value = '';
    
    zeigeScreen('game-over-screen');
}

function highscoreSpeichern() {
    let name = document.getElementById('spieler-name').value.trim();
    if (!name) {
        alert("Bitte gib einen Namen ein!");
        return;
    }

    let highscores = JSON.parse(localStorage.getItem('zahlenmeister_highscores')) || [];
    highscores.push({ name: name, punkte: punktestand, durchlauf: durchlauf });
    
    // Nach Punkten absteigend sortieren
    highscores.sort((a, b) => b.punkte - a.punkte);
    
    // Nur die Top 5 behalten
    highscores = highscores.slice(0, 5);

    localStorage.setItem('zahlenmeister_highscores', JSON.stringify(highscores));

    alert("Highscore erfolgreich gespeichert!");
    document.getElementById('highscore-save-bereich').style.display = 'none';
    zeigeHighscore();
}

function punkteStadAktualisieren() {
    let elPunkte = document.getElementById('display-punkte');
    if (elPunkte) elPunkte.innerText = `PUNKTE: ${punktestand}`;
}

function aktualisiereHeader() {
    let elDurchlauf = document.getElementById('display-durchlauf');
    let elPunkte = document.getElementById('display-punkte');
    let elTimer = document.getElementById('display-timer');

    if (elDurchlauf) elDurchlauf.innerText = `DURCHLAUF ${durchlauf} (Runde ${aktuelleRunde}/4)`;
    if (elPunkte) elPunkte.innerText = `PUNKTE: ${punktestand}`;
    if (elTimer) elTimer.innerText = `Zeit: ${verbleibendeSekunden}s`;
}

function zufallszahl(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function zurueckZumMenue() {
    zeigeScreen('main-menu');
}

function zeigeHighscore() {
    document.getElementById('info-title').innerText = "Bestenliste (Highscore)";
    let highscores = JSON.parse(localStorage.getItem('zahlenmeister_highscores')) || [];
    
    let html = "";
    if (highscores.length === 0) {
        html = "<p>Noch keine Highscores gespeichert. Spiele eine Runde und trage dich ein!</p>";
    } else {
        html = `<table class="highscore-table">
                    <tr><th>Rang</th><th>Name</th><th>Punkte</th><th>Durchlauf</th></tr>`;
        highscores.gh = highscores.forEach((entry, index) => {
            html += `<tr><td>#${index + 1}</td><td>${entry.name}</td><td>${entry.punkte}</td><td>${entry.durchlauf}</td></tr>`;
        });
        html += `</table>`;
    }

    document.getElementById('info-content').innerHTML = html;
    zeigeScreen('info-screen');
}

function zeigeEinstellungen() {
    starteSpielVorbereitung();
}

function zeigeAnleitung() {
    document.getElementById('info-title').innerText = "Spielanleitung";
    document.getElementById('info-content').innerHTML = `
        <p>1. Wähle im Hauptmenü deinen Schwierigkeitsgrad und lege den Zahlenbereich fest.</p><br>
        <p>2. Wähle eine von drei geheimen Zahlen aus.</p><br>
        <p>3. Beantworte in der vorgegebenen Zeit die Fragen (Gerade/Ungerade, Höher/Tiefer, Dazwischen, Bereich).</p><br>
        <p>4. Nach jeder Runde kannst du versuchen, deine geheime Zahl direkt zu erraten, um massive Bonuspunkte zu erhalten!</p>
    `;
    zeigeScreen('info-screen');
}

window.onload = function() {
    zeigeScreen('main-menu');
};