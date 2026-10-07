"use strict";

/* =========================================================
   ZAHLENMEISTER
   ========================================================= */

let config = null;

let BASISPUNKTE = 10;
let BONUS_RICHTIGER_TIPP = 100;
let STRAFE_FALSCHER_TIPP = 50;
let HIGHscore_ANZAHL = 5;

let zeitlimit = 15;
let untereGrenze = 1;
let obereGrenze = 100;

let geheimeZahl = null;
let generierteZahlen = [];

let punktestand = 0;
let durchlauf = 1;
let aktuelleRunde = 1;

let timerInterval = null;
let rundenStartzeit = 0;
let verbleibendeSekunden = 0;

let vergleichszahlGlobal = 0;
let minMaxZahl1 = 0;
let minMaxZahl2 = 0;
let aktuelleBereiche = [];

let rundeGesperrt = false;
let scoreBereitsGespeichert = false;


/* =========================================================
   WICHTIG:
   BONUS-TIPP IST STANDARDMÄSSIG GESPERRT
   ========================================================= */

let bonusTippFreigeschaltet = false;


/* =========================================================
   HILFSFUNKTION
   ========================================================= */

function element(id) {
    return document.getElementById(id);
}


/* =========================================================
   DATEN LADEN
   ========================================================= */

async function ladeSpieldaten() {

    try {

        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error(
                "data.json konnte nicht geladen werden."
            );
        }

        config = await response.json();

        BASISPUNKTE =
            config.spiel.basisPunkte;

        BONUS_RICHTIGER_TIPP =
            config.spiel.bonusRichtigerTipp;

        STRAFE_FALSCHER_TIPP =
            config.spiel.strafeFalscherTipp;

        HIGHscore_ANZAHL =
            config.spiel.highscoreEintraege;


        /*
         * Bonusbereich beim Start IMMER sperren
         */

        sperreBonusTipp();


        zeigeScreen("main-menu");

    } catch (error) {

        console.error(error);

        document.body.innerHTML = `
            <main style="
                color:#ffb52e;
                background:#050608;
                min-height:100vh;
                display:grid;
                place-items:center;
                padding:30px;
                font-family:'Courier New',monospace;
                text-align:center;
            ">
                <div>
                    <h1>DATENFEHLER</h1>
                    <p>data.json konnte nicht geladen werden.</p>
                    <p>
                        Bitte starte die Website über Live Server oder Netlify.
                    </p>
                </div>
            </main>
        `;
    }
}


/* =========================================================
   SCREEN VERWALTUNG
   ========================================================= */

function zeigeScreen(screenId) {

    if (screenId === "main-menu") {

        stoppeTimer();

        element("main-menu").classList.add("active");

        element("popup-overlay").classList.remove("active");

        element("popup-overlay").setAttribute(
            "aria-hidden",
            "true"
        );


        document
            .querySelectorAll(".game-box")
            .forEach(box => {

                box.style.display = "none";
                box.hidden = true;

            });


        return;
    }


    element("main-menu").classList.remove("active");

    element("popup-overlay").classList.add("active");

    element("popup-overlay").setAttribute(
        "aria-hidden",
        "false"
    );


    document
        .querySelectorAll(".game-box")
        .forEach(box => {

            box.style.display = "none";
            box.hidden = true;

        });


    const screen =
        element(screenId);


    if (screen) {

        screen.style.display = "block";
        screen.hidden = false;
    }
}


/* =========================================================
   SPIELVORBEREITUNG
   ========================================================= */

function starteSpielVorbereitung() {

    stoppeTimer();

    punktestand = 0;

    durchlauf = 1;

    aktuelleRunde = 1;

    geheimeZahl = null;

    generierteZahlen = [];

    scoreBereitsGespeichert = false;

    bonusTippFreigeschaltet = false;


    sperreBonusTipp();


    element("setup-fehler").textContent = "";

    element("untere-grenze").value = 1;

    element("obere-grenze").value = 100;


    zeigeScreen("setup-screen");
}


/* =========================================================
   DREI GEHEIME ZAHLEN ERZEUGEN
   ========================================================= */

function geheimenZahlenWaehlenScreen() {

    const schwierigkeitsWert =
        parseInt(
            element("schwierigkeit").value,
            10
        );


    const min =
        Number(
            element("untere-grenze").value
        );


    const max =
        Number(
            element("obere-grenze").value
        );


    const fehler =
        pruefeSpielbereich(
            min,
            max
        );


    if (fehler) {

        element("setup-fehler").textContent =
            fehler;

        return;
    }


    zeitlimit =
        schwierigkeitsWert;

    untereGrenze =
        min;

    obereGrenze =
        max;


    element("setup-fehler").textContent =
        "";


    neueGeheimeZahlenErzeugen();


    /*
     * Bonus-Tipp sicherheitshalber zurücksetzen
     */

    bonusTippFreigeschaltet =
        false;


    sperreBonusTipp();


    zeigeScreen(
        "secret-choice-screen"
    );
}


/* =========================================================
   SPIELBEREICH PRÜFEN
   ========================================================= */

function pruefeSpielbereich(
    min,
    max
) {

    if (
        !Number.isInteger(min) ||
        !Number.isInteger(max)
    ) {

        return (
            "Bitte gib bei beiden Grenzen ganze Zahlen ein."
        );
    }


    if (max <= min) {

        return (
            "Die obere Grenze muss größer als die untere Grenze sein."
        );
    }


    const anzahlZahlen =
        max - min + 1;


    if (anzahlZahlen < 4) {

        return (
            "Der Zahlenbereich muss mindestens vier verschiedene Zahlen enthalten."
        );
    }


    return "";
}


/* =========================================================
   GEHEIME ZAHLEN ERZEUGEN
   ========================================================= */

function neueGeheimeZahlenErzeugen() {

    generierteZahlen = [];


    while (
        generierteZahlen.length < 3
    ) {

        const zahl =
            zufallszahl(
                untereGrenze,
                obereGrenze
            );


        if (
            !generierteZahlen.includes(
                zahl
            )
        ) {

            generierteZahlen.push(
                zahl
            );
        }
    }
}


/* =========================================================
   GEHEIME ZAHL AUSWÄHLEN
   ========================================================= */

function waehleGeheimeZahl(
    auswahl
) {

    const index =
        Number(auswahl) - 1;


    if (
        index < 0 ||
        index >= generierteZahlen.length
    ) {

        return;
    }


    /*
     * Der Spieler sieht den Wert NICHT.
     */

    geheimeZahl =
        generierteZahlen[index];


    punktestand = 0;

    durchlauf = 1;

    aktuelleRunde = 1;

    scoreBereitsGespeichert =
        false;


    bonusTippFreigeschaltet =
        false;


    sperreBonusTipp();


    starteHauptspiel();
}


/* =========================================================
   HAUPTSPIEL
   ========================================================= */

function starteHauptspiel() {

    definiereRunde(1);
}


/* =========================================================
   RUNDE DEFINIEREN
   ========================================================= */

function definiereRunde(
    rundenNummer
) {

    stoppeTimer();


    aktuelleRunde =
        rundenNummer;


    rundeGesperrt =
        false;


    aktualisiereHeader();


    const container =
        element("frage-container");


    const feedback =
        element("runden-feedback");


    container.innerHTML =
        "";


    feedback.textContent =
        "";


    const runde =
        config.runden[
            rundenNummer - 1
        ];


    if (
        rundenNummer === 1
    ) {

        erstelleRunde1(
            container,
            runde
        );

    } else if (
        rundenNummer === 2
    ) {

        erstelleRunde2(
            container,
            runde
        );

    } else if (
        rundenNummer === 3
    ) {

        erstelleRunde3(
            container,
            runde
        );

    } else if (
        rundenNummer === 4
    ) {

        erstelleRunde4(
            container,
            runde
        );
    }


    zeigeScreen(
        "game-screen"
    );


    starteTimer();
}


/* =========================================================
   RUNDE 1
   ========================================================= */

function erstelleRunde1(
    container,
    runde
) {

    container.innerHTML = `

        <h3>${runde.titel}</h3>

        <p>${runde.text}</p>

        <div class="answer-grid">

            <button
                class="answer-btn"
                onclick="werteRunde1(true)"
            >
                GERADE
            </button>

            <button
                class="answer-btn"
                onclick="werteRunde1(false)"
            >
                UNGERADE
            </button>

        </div>
    `;
}


/* =========================================================
   RUNDE 2
   ========================================================= */

function erstelleRunde2(
    container,
    runde
) {

    vergleichszahlGlobal =
        zufallszahl(
            untereGrenze,
            obereGrenze
        );


    while (
        vergleichszahlGlobal ===
        geheimeZahl
    ) {

        vergleichszahlGlobal =
            zufallszahl(
                untereGrenze,
                obereGrenze
            );
    }


    container.innerHTML = `

        <h3>${runde.titel}</h3>

        <p>
            ${runde.text}
            <strong>
                ${vergleichszahlGlobal}
            </strong>?
        </p>

        <div class="answer-grid">

            <button
                class="answer-btn"
                onclick="werteRunde2(true)"
            >
                HÖHER
            </button>

            <button
                class="answer-btn"
                onclick="werteRunde2(false)"
            >
                TIEFER
            </button>

        </div>
    `;
}


/* =========================================================
   RUNDE 3
   ========================================================= */

function erstelleRunde3(
    container,
    runde
) {

    minMaxZahl1 =
        zufallszahl(
            untereGrenze,
            obereGrenze
        );


    minMaxZahl2 =
        zufallszahl(
            untereGrenze,
            obereGrenze
        );


    while (
        minMaxZahl1 ===
        minMaxZahl2
    ) {

        minMaxZahl2 =
            zufallszahl(
                untereGrenze,
                obereGrenze
            );
    }


    const min =
        Math.min(
            minMaxZahl1,
            minMaxZahl2
        );


    const max =
        Math.max(
            minMaxZahl1,
            minMaxZahl2
        );


    minMaxZahl1 =
        min;

    minMaxZahl2 =
        max;


    container.innerHTML = `

        <h3>${runde.titel}</h3>

        <p>
            Liegt deine Zahl zwischen
            <strong>${min}</strong>
            und
            <strong>${max}</strong>?
        </p>

        <div class="answer-grid">

            <button
                class="answer-btn"
                onclick="werteRunde3(true)"
            >
                DAZWISCHEN
            </button>

            <button
                class="answer-btn"
                onclick="werteRunde3(false)"
            >
                AUSSERHALB
            </button>

        </div>
    `;
}


/* =========================================================
   RUNDE 4
   ========================================================= */

function erstelleRunde4(
    container,
    runde
) {

    const gesamtbereich =
        obereGrenze -
        untereGrenze +
        1;


    const bereichsGroesse =
        Math.ceil(
            gesamtbereich / 4
        );


    aktuelleBereiche = [];


    let html = `

        <h3>${runde.titel}</h3>

        <p>${runde.text}</p>

        <div class="answer-grid">
    `;


    for (
        let i = 0;
        i < 4;
        i++
    ) {

        const start =
            untereGrenze +
            i * bereichsGroesse;


        if (
            start > obereGrenze
        ) {

            break;
        }


        const ende =
            Math.min(
                start +
                bereichsGroesse -
                1,
                obereGrenze
            );


        aktuelleBereiche.push({
            start: start,
            ende: ende
        });


        html += `

            <button
                class="answer-btn"
                onclick="werteRunde4(${i})"
            >
                ${start} — ${ende}
            </button>

        `;
    }


    html += `
        </div>
    `;


    container.innerHTML =
        html;
}


/* =========================================================
   RUNDE 1 AUSWERTEN
   ========================================================= */

function werteRunde1(
    antwortIstGerade
) {

    const istGerade =
        geheimeZahl % 2 === 0;


    rundeBeendet(
        istGerade ===
        antwortIstGerade
    );
}


/* =========================================================
   RUNDE 2 AUSWERTEN
   ========================================================= */

function werteRunde2(
    antwortIstHoeher
) {

    const istHoeher =
        geheimeZahl >
        vergleichszahlGlobal;


    rundeBeendet(
        istHoeher ===
        antwortIstHoeher
    );
}


/* =========================================================
   RUNDE 3 AUSWERTEN
   ========================================================= */

function werteRunde3(
    antwortIstDazwischen
) {

    const istDazwischen =
        geheimeZahl >
        minMaxZahl1 &&
        geheimeZahl <
        minMaxZahl2;


    rundeBeendet(
        istDazwischen ===
        antwortIstDazwischen
    );
}


/* =========================================================
   RUNDE 4 AUSWERTEN
   ========================================================= */

function werteRunde4(
    index
) {

    const bereich =
        aktuelleBereiche[index];


    if (!bereich) {
        return;
    }


    const richtig =
        geheimeZahl >=
        bereich.start &&
        geheimeZahl <=
        bereich.ende;


    rundeBeendet(
        richtig
    );
}


/* =========================================================
   RUNDE BEENDET
   ========================================================= */

function rundeBeendet(
    richtig
) {

    if (rundeGesperrt) {
        return;
    }


    rundeGesperrt =
        true;


    stoppeTimer();


    if (!richtig) {

        spielBeenden(
            "Falsche Antwort!"
        );

        return;
    }


    punkteVergeben();


    element(
        "runden-feedback"
    ).textContent =
        "RICHTIG! Zeitbonus wurde berücksichtigt.";


    setTimeout(
        () => {

            zeigeBonusFrage();

        },
        650
    );
}


/* =========================================================
   PUNKTE
   ========================================================= */

function punkteVergeben() {

    const zeitbonus =
        Math.max(
            0,
            Math.ceil(
                verbleibendeSekunden
            )
        );


    const punkte =
        (
            BASISPUNKTE *
            durchlauf
        ) +
        zeitbonus;


    punktestand +=
        punkte;


    punkteStadAktualisieren();
}


/* =========================================================
   BONUS-TIPP SPERREN
   ========================================================= */

function sperreBonusTipp() {

    /*
     * Interner Status
     */

    bonusTippFreigeschaltet =
        false;


    const bonusButtons =
        element("bonus-buttons");


    const tippBereich =
        element("tipp-input-bereich");


    const tippInput =
        element("user-tipp");


    /*
     * JA/NEIN anzeigen
     */

    if (bonusButtons) {

        bonusButtons.style.display =
            "flex";

        bonusButtons.hidden =
            false;
    }


    /*
     * Eingabebereich KOMPLETT verstecken
     */

    if (tippBereich) {

        tippBereich.style.display =
            "none";

        tippBereich.hidden =
            true;
    }


    /*
     * Eingabefeld deaktivieren
     */

    if (tippInput) {

        tippInput.disabled =
            true;

        tippInput.value =
            "";
    }
}


/* =========================================================
   BONUSFRAGE ANZEIGEN
   ========================================================= */

function zeigeBonusFrage() {

    /*
     * GANZ WICHTIG:
     *
     * Bevor die Bonusfrage angezeigt wird,
     * wird der Tipp IMMER gesperrt.
     */

    sperreBonusTipp();


    element(
        "tipp-fehler"
    ).textContent =
        "";


    element(
        "bonus-feedback"
    ).textContent =
        "";


    zeigeScreen(
        "bonus-screen"
    );
}


/* =========================================================
   BONUSFRAGE – JA / NEIN
   ========================================================= */

function antwortBonus(
    ja
) {

    const bonusButtons =
        element("bonus-buttons");


    const tippBereich =
        element("tipp-input-bereich");


    const tippInput =
        element("user-tipp");


    /*
     * NEIN
     */

    if (!ja) {

        /*
         * Raten bleibt gesperrt.
         */

        sperreBonusTipp();


        naechsteRundeOderDurchlauf();


        return;
    }


    /*
     * JA
     *
     * ERST JETZT wird das Raten freigegeben.
     */

    bonusTippFreigeschaltet =
        true;


    /*
     * JA/NEIN ausblenden
     */

    if (bonusButtons) {

        bonusButtons.style.display =
            "none";

        bonusButtons.hidden =
            true;
    }


    /*
     * Tippbereich sichtbar machen
     */

    if (tippBereich) {

        tippBereich.style.display =
            "block";

        tippBereich.hidden =
            false;
    }


    /*
     * Eingabefeld aktivieren
     */

    if (tippInput) {

        tippInput.disabled =
            false;

        tippInput.min =
            untereGrenze;

        tippInput.max =
            obereGrenze;

        tippInput.value =
            "";

        tippInput.focus();
    }
}


/* =========================================================
   TIPP ABGEBEN
   ========================================================= */

function tippAbgeben() {

    /*
     * SICHERHEITSPRÜFUNG
     *
     * Ohne "JA, ICH RATE"
     * ist diese Funktion komplett gesperrt.
     */

    if (
        bonusTippFreigeschaltet !== true
    ) {

        console.warn(
            "Tipp blockiert: Der Spieler hat nicht 'JA, ICH RATE' gewählt."
        );

        return;
    }


    const feld =
        element("user-tipp");


    /*
     * Zusätzliche Sicherheitsprüfung
     */

    if (
        !feld ||
        feld.disabled
    ) {

        return;
    }


    const tipp =
        Number(
            feld.value
        );


    /*
     * Eingabe prüfen
     */

    if (
        !Number.isInteger(tipp) ||
        tipp < untereGrenze ||
        tipp > obereGrenze
    ) {

        element(
            "tipp-fehler"
        ).textContent =
            `Bitte gib eine ganze Zahl zwischen ${untereGrenze} und ${obereGrenze} ein.`;

        return;
    }


    element(
        "tipp-fehler"
    ).textContent =
        "";


    /*
     * RICHTIG
     */

    if (
        tipp ===
        geheimeZahl
    ) {

        punktestand +=
            BONUS_RICHTIGER_TIPP;


        punkteStadAktualisieren();


        element(
            "bonus-feedback"
        ).textContent =
            `RICHTIG! +${BONUS_RICHTIGER_TIPP} Bonuspunkte.`;


        /*
         * Raten sofort wieder sperren
         */

        sperreBonusTipp();


        setTimeout(
            () => {

                /*
                 * Neue drei unbekannte Zahlen
                 */

                neueGeheimeZahlenErzeugen();


                /*
                 * Geheime Zahl zurücksetzen
                 */

                geheimeZahl =
                    null;


                /*
                 * Neuer Durchlauf
                 */

                durchlauf =
                    1;


                aktuelleRunde =
                    1;


                /*
                 * Neue geheime Auswahl
                 */

                zeigeScreen(
                    "secret-choice-screen"
                );

            },
            850
        );


        return;
    }


    /*
     * FALSCH
     */

    punktestand =
        Math.max(
            0,
            punktestand -
            STRAFE_FALSCHER_TIPP
        );


    punkteStadAktualisieren();


    element(
        "bonus-feedback"
    ).textContent =
        `FALSCH! -${STRAFE_FALSCHER_TIPP} Punkte. Das Spiel geht weiter.`;


    /*
     * Raten wieder sperren
     */

    sperreBonusTipp();


    setTimeout(
        () => {

            naechsteRundeOderDurchlauf();

        },
        850
    );
}


/* =========================================================
   NÄCHSTE RUNDE / DURCHLAUF
   ========================================================= */

function naechsteRundeOderDurchlauf() {

    /*
     * Sicherheit:
     * Kein Bonus-Tipp mehr aktiv.
     */

    sperreBonusTipp();


    if (
        aktuelleRunde < 4
    ) {

        definiereRunde(
            aktuelleRunde + 1
        );

    } else {

        durchlauf++;


        definiereRunde(
            1
        );
    }
}


/* =========================================================
   TIMER STARTEN
   ========================================================= */

function starteTimer() {

    stoppeTimer();


    rundenStartzeit =
        performance.now();


    verbleibendeSekunden =
        zeitlimit;


    aktualisiereTimerAnzeige();


    timerInterval =
        setInterval(
            () => {

                verbleibendeSekunden =
                    Math.max(
                        0,
                        zeitlimit -
                        (
                            (
                                performance.now() -
                                rundenStartzeit
                            ) / 1000
                        )
                    );


                aktualisiereTimerAnzeige();


                if (
                    verbleibendeSekunden <= 0
                ) {

                    stoppeTimer();


                    if (
                        !rundeGesperrt
                    ) {

                        rundeGesperrt =
                            true;


                        spielBeenden(
                            "Zeit abgelaufen!"
                        );
                    }
                }

            },
            50
        );
}


/* =========================================================
   TIMER STOPPEN
   ========================================================= */

function stoppeTimer() {

    if (
        timerInterval !== null
    ) {

        clearInterval(
            timerInterval
        );


        timerInterval =
            null;
    }
}


/* =========================================================
   TIMER ANZEIGE
   ========================================================= */

function aktualisiereTimerAnzeige() {

    const timer =
        element(
            "display-timer"
        );


    const timerBar =
        element(
            "timer-bar"
        );


    if (!timer) {
        return;
    }


    timer.textContent =
        `${Math.max(
            0,
            verbleibendeSekunden
        ).toFixed(1)}s`;


    const prozent =
        Math.max(
            0,
            Math.min(
                100,
                (
                    verbleibendeSekunden /
                    zeitlimit
                ) * 100
            )
        );


    if (timerBar) {

        timerBar.style.width =
            `${prozent}%`;


        if (
            prozent <= 25
        ) {

            timerBar.style.background =
                "var(--red)";

        } else if (
            prozent <= 50
        ) {

            timerBar.style.background =
                "var(--orange-light)";

        } else {

            timerBar.style.background =
                "var(--green)";
        }
    }
}


/* =========================================================
   HEADER
   ========================================================= */

function aktualisiereHeader() {

    element(
        "display-durchlauf"
    ).textContent =
        durchlauf;


    element(
        "display-runde"
    ).textContent =
        `${aktuelleRunde} / 4`;


    element(
        "display-punkte"
    ).textContent =
        punktestand;


    element(
        "display-timer"
    ).textContent =
        `${zeitlimit.toFixed(1)}s`;
}


/* =========================================================
   PUNKTE ANZEIGEN
   ========================================================= */

function punkteStadAktualisieren() {

    element(
        "display-punkte"
    ).textContent =
        punktestand;
}


/* =========================================================
   GAME OVER
   ========================================================= */

function spielBeenden(
    grund
) {

    stoppeTimer();


    /*
     * Bonus-Tipp endgültig sperren
     */

    sperreBonusTipp();


    element(
        "game-over-text"
    ).innerHTML = `

        ${escapeHtml(grund)}

        <br>

        Dein Spiel ist beendet.

    `;


    /*
     * Jetzt darf die geheime Zahl
     * aufgedeckt werden.
     */

    element(
        "reveal-number"
    ).textContent =
        geheimeZahl;


    element(
        "final-punkte"
    ).textContent =
        punktestand;


    element(
        "final-durchlauf"
    ).textContent =
        durchlauf;


    element(
        "spieler-name"
    ).value =
        "";


    element(
        "highscore-fehler"
    ).textContent =
        "";


    scoreBereitsGespeichert =
        false;


    zeigeScreen(
        "game-over-screen"
    );
}


/* =========================================================
   HIGHSCORE SPEICHERN
   ========================================================= */

function highscoreSpeichern() {

    if (
        scoreBereitsGespeichert
    ) {

        return;
    }


    const name =
        element(
            "spieler-name"
        )
        .value
        .trim();


    if (!name) {

        element(
            "highscore-fehler"
        ).textContent =
            "Bitte gib einen Namen ein.";

        return;
    }


    try {

        let highscores =
            JSON.parse(
                localStorage.getItem(
                    "zahlenmeister_highscores"
                )
            ) || [];


        highscores.push({

            name:
                name.substring(
                    0,
                    20
                ),

            punkte:
                punktestand,

            durchlauf:
                durchlauf

        });


        highscores.sort(
            (a, b) =>
                b.punkte -
                a.punkte
        );


        highscores =
            highscores.slice(
                0,
                HIGHscore_ANZAHL
            );


        localStorage.setItem(
            "zahlenmeister_highscores",
            JSON.stringify(
                highscores
            )
        );


        scoreBereitsGespeichert =
            true;


        element(
            "highscore-fehler"
        ).textContent =
            "";


        zeigeHighscore();

    } catch (error) {

        console.error(error);


        element(
            "highscore-fehler"
        ).textContent =
            "Der Highscore konnte nicht gespeichert werden.";
    }
}


/* =========================================================
   HIGHSCORES LADEN
   ========================================================= */

function ladeHighscores() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "zahlenmeister_highscores"
            )
        ) || [];

    } catch (error) {

        console.error(error);

        return [];
    }
}


/* =========================================================
   HIGHSCORE ANZEIGEN
   ========================================================= */

function zeigeHighscore() {

    const highscores =
        ladeHighscores();


    element(
        "info-title"
    ).textContent =
        "BESTENLISTE";


    if (
        highscores.length === 0
    ) {

        element(
            "info-content"
        ).innerHTML = `

            <p>
                Noch keine Highscores gespeichert.
            </p>

            <p>
                Spiele eine Runde und sichere deinen Score!
            </p>

        `;

    } else {

        let html = `

            <table class="highscore-table">

                <thead>

                    <tr>

                        <th>RANG</th>
                        <th>NAME</th>
                        <th>PUNKTE</th>
                        <th>DURCHLAUF</th>

                    </tr>

                </thead>

                <tbody>

        `;


        highscores.forEach(
            (
                entry,
                index
            ) => {

                html += `

                    <tr>

                        <td>
                            #${index + 1}
                        </td>

                        <td>
                            ${escapeHtml(entry.name)}
                        </td>

                        <td>
                            ${Number(entry.punkte)}
                        </td>

                        <td>
                            ${Number(entry.durchlauf)}
                        </td>

                    </tr>

                `;
            }
        );


        html += `

                </tbody>

            </table>

        `;


        element(
            "info-content"
        ).innerHTML =
            html;
    }


    zeigeScreen(
        "info-screen"
    );
}


/* =========================================================
   ANLEITUNG
   ========================================================= */

function zeigeAnleitung() {

    element(
        "info-title"
    ).textContent =
        "SPIELANLEITUNG";


    element(
        "info-content"
    ).innerHTML = `

        <h3>
            1. SPIEL STARTEN
        </h3>

        <p>
            Wähle Schwierigkeit und Zahlenbereich.
        </p>


        <h3>
            2. GEHEIME ZAHL
        </h3>

        <p>
            Drei zufällige Zahlen werden erzeugt.
            Du siehst die Werte nicht und
            wählst nur A, B oder C.
        </p>


        <h3>
            3. VIER HAUPTRUNDEN
        </h3>

        <ul>

            <li>
                Gerade oder ungerade
            </li>

            <li>
                Höher oder tiefer
            </li>

            <li>
                Dazwischen oder außerhalb
            </li>

            <li>
                Zahlenbereich
            </li>

        </ul>


        <h3>
            4. ZEIT & PUNKTE
        </h3>

        <p>
            Je schneller du antwortest,
            desto größer ist dein Zeitbonus.
            Die Punkte werden aus
            Basiswert × Durchlauf +
            verbleibender Zeit berechnet.
        </p>


        <h3>
            5. BONUSFRAGE
        </h3>

        <p>
            Nach jeder erfolgreichen Hauptrunde
            darfst du versuchen,
            deine geheime Zahl zu erraten.

            Ein richtiger Tipp bringt
            ${BONUS_RICHTIGER_TIPP}
            Bonuspunkte.

            Ein falscher Tipp kostet
            ${STRAFE_FALSCHER_TIPP}
            Punkte, aber das Spiel geht weiter.
        </p>


        <h3>
            6. GAME OVER
        </h3>

        <p>
            Eine falsche Hauptrunden-Antwort
            oder abgelaufene Zeit beendet das Spiel.

            Danach wird deine geheime Zahl
            aufgedeckt und du kannst deinen
            Score speichern.
        </p>

    `;


    zeigeScreen(
        "info-screen"
    );
}


/* =========================================================
   EINSTELLUNGEN
   ========================================================= */

function zeigeEinstellungen() {

    starteSpielVorbereitung();
}


/* =========================================================
   ZURÜCK ZUM MENÜ
   ========================================================= */

function zurueckZumMenue() {

    stoppeTimer();


    /*
     * Bonus-Tipp beim Verlassen
     * des Spiels ebenfalls sperren.
     */

    sperreBonusTipp();


    element(
        "setup-fehler"
    ).textContent =
        "";


    element(
        "highscore-fehler"
    ).textContent =
        "";


    zeigeScreen(
        "main-menu"
    );
}


/* =========================================================
   ZUFALLSZAHL
   ========================================================= */

function zufallszahl(
    min,
    max
) {

    return Math.floor(
        Math.random() *
        (
            max - min + 1
        )
    ) + min;
}


/* =========================================================
   HTML SICHER MACHEN
   ========================================================= */

function escapeHtml(
    text
) {

    return String(text)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================================
   TASTATUR-EVENTS
   ========================================================= */

function initialisiereTastatur() {

    const userTipp =
        element(
            "user-tipp"
        );


    if (userTipp) {

        userTipp.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    tippAbgeben();
                }
            }
        );
    }


    const spielerName =
        element(
            "spieler-name"
        );


    if (spielerName) {

        spielerName.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    highscoreSpeichern();
                }
            }
        );
    }
}


/* =========================================================
   START
   ========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * Bonusbereich schon beim Laden
         * vollständig verstecken.
         */

        sperreBonusTipp();


        initialisiereTastatur();


        await ladeSpieldaten();
    }
);
