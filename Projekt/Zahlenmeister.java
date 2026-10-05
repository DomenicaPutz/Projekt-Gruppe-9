import java.util.Random;
import java.util.Scanner;

public class Zahlenmeister {

    // ==========================================
    // KONSTANTEN
    // ==========================================

    static final int BASISPUNKTE = 10;
    static final int BONUS_RICHTIGER_TIPP = 100;
    static final int STRAFE_FALSCHER_TIPP = 50;

    static final int ZEIT_LEICHT = 20;
    static final int ZEIT_MITTEL = 15;
    static final int ZEIT_SCHWER = 10;

    // ==========================================
    // SPIELVARIABLEN
    // ==========================================

    static Scanner scanner = new Scanner(System.in);
    static Random random = new Random();

    static int geheimeZahl;

    static int untereGrenze;
    static int obereGrenze;

    static int zeitlimit;

    static int punktestand = 0;
    static int durchlauf = 1;

    static boolean spielLaeuft = true;

    // ==========================================
    // MAIN
    // ==========================================

    public static void main(String[] args) {

        System.out.println("=================================");
        System.out.println("         ZAHLENMEISTER");
        System.out.println("=================================");

        schwierigkeitWaehlen();

        zahlenbereichFestlegen();

        neueGeheimeZahlErzeugen();

        System.out.println();
        System.out.println("Das Spiel beginnt!");
        System.out.println("Deine ausgewählte Zahl bleibt geheim.");

        spielStarten();

        spielBeenden();
    }

    // ==========================================
    // HAUPTSPIEL
    // ==========================================

    static void spielStarten() {

        while (spielLaeuft) {

            System.out.println();
            System.out.println("=================================");
            System.out.println("          DURCHLAUF " + durchlauf);
            System.out.println("          PUNKTE: " + punktestand);
            System.out.println("=================================");

            // ==================================
            // HAUPTRUNDE 1
            // ==================================

            if (!rundeGeradeUngerade()) {
                spielLaeuft = false;
                break;
            }

            if (bonusFrage()) {
                continue;
            }

            // ==================================
            // HAUPTRUNDE 2
            // ==================================

            if (!rundeHoeherTiefer()) {
                spielLaeuft = false;
                break;
            }

            if (bonusFrage()) {
                continue;
            }

            // ==================================
            // HAUPTRUNDE 3
            // ==================================

            if (!rundeDazwischenAusserhalb()) {
                spielLaeuft = false;
                break;
            }

            if (bonusFrage()) {
                continue;
            }

            // ==================================
            // HAUPTRUNDE 4
            // ==================================

            if (!rundeZahlenbereich()) {
                spielLaeuft = false;
                break;
            }

            if (bonusFrage()) {
                continue;
            }

            // ==================================
            // ALLE 4 RUNDEN GESCHAFFT
            // ==================================

            System.out.println();
            System.out.println("Alle 4 Hauptrunden geschafft!");

            durchlauf++;
        }
    }

    // ==========================================
    // SCHWIERIGKEIT
    // ==========================================

    static void schwierigkeitWaehlen() {

        System.out.println();
        System.out.println("Wähle den Schwierigkeitsgrad:");
        System.out.println("1 - Leicht  (" + ZEIT_LEICHT + " Sekunden)");
        System.out.println("2 - Mittel  (" + ZEIT_MITTEL + " Sekunden)");
        System.out.println("3 - Schwer  (" + ZEIT_SCHWER + " Sekunden)");

        int auswahl = leseZahl(1, 3);

        if (auswahl == 1) {

            zeitlimit = ZEIT_LEICHT;
            System.out.println("Schwierigkeit: Leicht");

        } else if (auswahl == 2) {

            zeitlimit = ZEIT_MITTEL;
            System.out.println("Schwierigkeit: Mittel");

        } else {

            zeitlimit = ZEIT_SCHWER;
            System.out.println("Schwierigkeit: Schwer");
        }
    }

    // ==========================================
    // ZAHLENBEREICH
    // ==========================================

    static void zahlenbereichFestlegen() {

        System.out.println();
        System.out.println("Lege deinen Zahlenbereich fest.");

        System.out.print("Untere Grenze: ");
        int min = leseGanzzahl();

        System.out.print("Obere Grenze: ");
        int max = leseGanzzahl();

        while (max <= min) {

            System.out.println(
                    "Die obere Grenze muss größer als die untere sein."
            );

            System.out.print("Obere Grenze erneut eingeben: ");
            max = leseGanzzahl();
        }

        untereGrenze = min;
        obereGrenze = max;

        System.out.println(
                "Zahlenbereich: "
                        + untereGrenze
                        + " bis "
                        + obereGrenze
        );
    }

    // ==========================================
    // DREI UNBEKANNTE ZAHLEN ERZEUGEN
    // ==========================================

    static void neueGeheimeZahlErzeugen() {

        int zahlA = zufallszahl(
                untereGrenze,
                obereGrenze
        );

        int zahlB = zufallszahl(
                untereGrenze,
                obereGrenze
        );

        int zahlC = zufallszahl(
                untereGrenze,
                obereGrenze
        );

        // Alle drei Zahlen müssen unterschiedlich sein.

        while (zahlB == zahlA) {

            zahlB = zufallszahl(
                    untereGrenze,
                    obereGrenze
            );
        }

        while (zahlC == zahlA || zahlC == zahlB) {

            zahlC = zufallszahl(
                    untereGrenze,
                    obereGrenze
            );
        }

        // ======================================
        // WICHTIG:
        // Die tatsächlichen Werte werden NICHT
        // dem Spieler angezeigt.
        // ======================================

        System.out.println();
        System.out.println(
                "Drei unbekannte Zahlen wurden erzeugt."
        );

        System.out.println(
                "Wähle eine der drei unbekannten Zahlen:"
        );

        System.out.println("1 - Unbekannte Zahl A");
        System.out.println("2 - Unbekannte Zahl B");
        System.out.println("3 - Unbekannte Zahl C");

        int auswahl = leseZahl(1, 3);

        if (auswahl == 1) {

            geheimeZahl = zahlA;

        } else if (auswahl == 2) {

            geheimeZahl = zahlB;

        } else {

            geheimeZahl = zahlC;
        }

        System.out.println();
        System.out.println(
                "Deine Auswahl wurde gespeichert."
        );

        System.out.println(
                "Der Wert deiner Zahl bleibt geheim."
        );
    }

    // ==========================================
    // RUNDE 1
    // GERADE / UNGERADE
    // ==========================================

    static boolean rundeGeradeUngerade() {

        System.out.println();
        System.out.println("---------------------------------");
        System.out.println("RUNDE 1 - GERADE ODER UNGERADE");
        System.out.println("---------------------------------");

        System.out.println(
                "Ist deine unbekannte Zahl gerade oder ungerade?"
        );

        System.out.println("1 - Gerade");
        System.out.println("2 - Ungerade");

        long startzeit =
                System.currentTimeMillis();

        int antwort =
                leseZahl(1, 2);

        long verbleibendeZeit =
                verbleibendeZeit(startzeit);

        if (verbleibendeZeit <= 0) {

            System.out.println("Zeit abgelaufen!");

            return false;
        }

        boolean richtig;

        if (geheimeZahl % 2 == 0) {

            richtig = antwort == 1;

        } else {

            richtig = antwort == 2;
        }

        if (!richtig) {

            System.out.println("Falsch!");

            return false;
        }

        punkteVergeben(verbleibendeZeit);

        System.out.println("Richtig!");

        return true;
    }

    // ==========================================
    // RUNDE 2
    // HÖHER / TIEFER
    // ==========================================

    static boolean rundeHoeherTiefer() {

        System.out.println();
        System.out.println("---------------------------------");
        System.out.println("RUNDE 2 - HÖHER ODER TIEFER");
        System.out.println("---------------------------------");

        int vergleichszahl =
                zufallszahl(
                        untereGrenze,
                        obereGrenze
                );

        while (vergleichszahl == geheimeZahl) {

            vergleichszahl =
                    zufallszahl(
                            untereGrenze,
                            obereGrenze
                    );
        }

        System.out.println(
                "Ist deine Zahl höher oder tiefer als "
                        + vergleichszahl
                        + "?"
        );

        System.out.println("1 - Höher");
        System.out.println("2 - Tiefer");

        long startzeit =
                System.currentTimeMillis();

        int antwort =
                leseZahl(1, 2);

        long verbleibendeZeit =
                verbleibendeZeit(startzeit);

        if (verbleibendeZeit <= 0) {

            System.out.println("Zeit abgelaufen!");

            return false;
        }

        boolean richtig;

        if (geheimeZahl > vergleichszahl) {

            richtig = antwort == 1;

        } else {

            richtig = antwort == 2;
        }

        if (!richtig) {

            System.out.println("Falsch!");

            return false;
        }

        punkteVergeben(verbleibendeZeit);

        System.out.println("Richtig!");

        return true;
    }

    // ==========================================
    // RUNDE 3
    // DAZWISCHEN / AUSSERHALB
    // ==========================================

    static boolean rundeDazwischenAusserhalb() {

        System.out.println();
        System.out.println("---------------------------------");
        System.out.println("RUNDE 3 - DAZWISCHEN ODER AUSSERHALB");
        System.out.println("---------------------------------");

        int zahl1 =
                zufallszahl(
                        untereGrenze,
                        obereGrenze
                );

        int zahl2 =
                zufallszahl(
                        untereGrenze,
                        obereGrenze
                );

        while (zahl1 == zahl2) {

            zahl2 =
                    zufallszahl(
                            untereGrenze,
                            obereGrenze
                    );
        }

        int min =
                Math.min(zahl1, zahl2);

        int max =
                Math.max(zahl1, zahl2);

        System.out.println(
                "Liegt deine Zahl zwischen "
                        + min
                        + " und "
                        + max
                        + "?"
        );

        System.out.println("1 - Dazwischen");
        System.out.println("2 - Außerhalb");

        long startzeit =
                System.currentTimeMillis();

        int antwort =
                leseZahl(1, 2);

        long verbleibendeZeit =
                verbleibendeZeit(startzeit);

        if (verbleibendeZeit <= 0) {

            System.out.println("Zeit abgelaufen!");

            return false;
        }

        boolean dazwischen =
                geheimeZahl > min
                        && geheimeZahl < max;

        boolean richtig;

        if (dazwischen) {

            richtig = antwort == 1;

        } else {

            richtig = antwort == 2;
        }

        if (!richtig) {

            System.out.println("Falsch!");

            return false;
        }

        punkteVergeben(verbleibendeZeit);

        System.out.println("Richtig!");

        return true;
    }

    // ==========================================
    // RUNDE 4
    // ZAHLENBEREICH
    // ==========================================

    static boolean rundeZahlenbereich() {

        System.out.println();
        System.out.println("---------------------------------");
        System.out.println("RUNDE 4 - ZAHLENBEREICH");
        System.out.println("---------------------------------");

        int gesamtbereich =
                obereGrenze - untereGrenze + 1;

        int bereichsGroesse =
                (int) Math.ceil(
                        gesamtbereich / 4.0
                );

        int[][] bereiche =
                new int[4][2];

        for (int i = 0; i < 4; i++) {

            int start =
                    untereGrenze
                            + i * bereichsGroesse;

            int ende =
                    Math.min(
                            start + bereichsGroesse - 1,
                            obereGrenze
                    );

            bereiche[i][0] = start;
            bereiche[i][1] = ende;
        }

        System.out.println(
                "In welchem Bereich liegt deine Zahl?"
        );

        for (int i = 0; i < 4; i++) {

            System.out.println(
                    (i + 1)
                            + " - "
                            + bereiche[i][0]
                            + " bis "
                            + bereiche[i][1]
            );
        }

        long startzeit =
                System.currentTimeMillis();

        int antwort =
                leseZahl(1, 4);

        long verbleibendeZeit =
                verbleibendeZeit(startzeit);

        if (verbleibendeZeit <= 0) {

            System.out.println("Zeit abgelaufen!");

            return false;
        }

        int richtigerBereich = -1;

        for (int i = 0; i < 4; i++) {

            if (geheimeZahl >= bereiche[i][0]
                    && geheimeZahl <= bereiche[i][1]) {

                richtigerBereich =
                        i + 1;

                break;
            }
        }

        if (antwort != richtigerBereich) {

            System.out.println("Falsch!");

            return false;
        }

        punkteVergeben(verbleibendeZeit);

        System.out.println("Richtig!");

        return true;
    }

    // ==========================================
    // BONUSFRAGE
    // ==========================================

    static boolean bonusFrage() {

        System.out.println();
        System.out.println(
                "Möchtest du deine unbekannte Zahl erraten?"
        );

        System.out.println("1 - Ja");
        System.out.println("2 - Nein");

        int auswahl =
                leseZahl(1, 2);

        // ======================================
        // NEIN
        // ======================================

        if (auswahl == 2) {

            return false;
        }

        // ======================================
        // JA
        // ======================================

        System.out.print(
                "Gib deinen Tipp ein: "
        );

        int tipp =
                leseGanzzahl();

        // ======================================
        // RICHTIGER TIPP
        // ======================================

        if (tipp == geheimeZahl) {

            punktestand +=
                    BONUS_RICHTIGER_TIPP;

            System.out.println();
            System.out.println(
                    "*** RICHTIG GERATEN! ***"
            );

            System.out.println(
                    "+"
                            + BONUS_RICHTIGER_TIPP
                            + " Bonuspunkte"
            );

            System.out.println(
                    "Aktueller Punktestand: "
                            + punktestand
            );

            // Neue drei unbekannte Zahlen
            neueGeheimeZahlErzeugen();

            // Neuer Durchlauf beginnt wieder bei Runde 1
            durchlauf = 1;

            System.out.println(
                    "Neue geheime Zahl wurde erzeugt."
            );

            System.out.println(
                    "Das Spiel beginnt wieder bei Runde 1."
            );

            return true;
        }

        // ======================================
        // FALSCHER TIPP
        // ======================================

        punktestand -=
                STRAFE_FALSCHER_TIPP;

        if (punktestand < 0) {

            punktestand = 0;
        }

        System.out.println();
        System.out.println(
                "Falsch geraten!"
        );

        System.out.println(
                "-"
                        + STRAFE_FALSCHER_TIPP
                        + " Punkte"
        );

        System.out.println(
                "Das Spiel geht weiter."
        );

        System.out.println(
                "Die geheime Zahl bleibt dieselbe."
        );

        System.out.println(
                "Aktueller Punktestand: "
                        + punktestand
        );

        return false;
    }

    // ==========================================
    // PUNKTEBERECHNUNG
    // ==========================================

    static void punkteVergeben(
            long verbleibendeSekunden) {

        int punkte =
                (BASISPUNKTE * durchlauf)
                        + (int) verbleibendeSekunden;

        punktestand += punkte;

        System.out.println();
        System.out.println(
                "Basispunkte: "
                        + (BASISPUNKTE * durchlauf)
        );

        System.out.println(
                "Zeitbonus: "
                        + verbleibendeSekunden
        );

        System.out.println(
                "Punkte für diese Runde: "
                        + punkte
        );

        System.out.println(
                "Aktueller Punktestand: "
                        + punktestand
        );
    }

    // ==========================================
    // VERBLEIBENDE ZEIT
    // ==========================================

    static long verbleibendeZeit(
            long startzeit) {

        long vergangeneMillis =
                System.currentTimeMillis()
                        - startzeit;

        long vergangeneSekunden =
                vergangeneMillis / 1000;

        return zeitlimit
                - vergangeneSekunden;
    }

    // ==========================================
    // ZUFALLSZAHL
    // ==========================================

    static int zufallszahl(
            int min,
            int max) {

        return random.nextInt(
                max - min + 1
        ) + min;
    }

    // ==========================================
    // EINGABE MIT BEREICH
    // ==========================================

    static int leseZahl(
            int min,
            int max) {

        while (true) {

            String eingabe =
                    scanner.nextLine();

            try {

                int zahl =
                        Integer.parseInt(eingabe);

                if (zahl >= min
                        && zahl <= max) {

                    return zahl;
                }

                System.out.println(
                        "Bitte eine Zahl zwischen "
                                + min
                                + " und "
                                + max
                                + " eingeben:"
                );

            } catch (NumberFormatException e) {

                System.out.println(
                        "Ungültige Eingabe. "
                                + "Bitte eine Zahl eingeben:"
                );
            }
        }
    }

    // ==========================================
    // EINGABE EINER GANZEN ZAHL
    // ==========================================

    static int leseGanzzahl() {

        while (true) {

            String eingabe =
                    scanner.nextLine();

            try {

                return Integer.parseInt(
                        eingabe
                );

            } catch (NumberFormatException e) {

                System.out.println(
                        "Ungültige Eingabe. "
                                + "Bitte eine ganze Zahl eingeben:"
                );
            }
        }
    }

    // ==========================================
    // SPIELENDE
    // ==========================================

    static void spielBeenden() {

        System.out.println();
        System.out.println("=================================");
        System.out.println("            GAME OVER");
        System.out.println("=================================");

        // Die geheime Zahl wird erst jetzt aufgedeckt.
        System.out.println(
                "Deine geheime Zahl war: "
                        + geheimeZahl
        );

        System.out.println(
                "Dein finaler Punktestand: "
                        + punktestand
        );

        System.out.println(
                "Erreichter Durchlauf: "
                        + durchlauf
        );

        System.out.println();
        System.out.println(
                "Danke fürs Spielen!"
        );
    }
}