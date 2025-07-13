# Aurum Provision Rechner

Dieses Repository enthält einen interaktiven, client-seitigen Rechner für Provisionen und Erträge im Aurum Partnerprogramm. Es basiert auf [OrgChartJS von BALKAN Graph](https://balkan.app/OrgChartJS/) und ermöglicht die Simulation von Organisationsstrukturen mit automatischen Berechnungen basierend auf den Regeln des Aurum-Systems, die bis Ende Juli 2025 gelten. Der Code ist Open Source und kann frei genutzt, angepasst oder überprüft werden. Siehe beigefügte MIT-Lizenz in der LICENSE.md

## Ein wichtiger Hinweis vorab:

Die nachfolgenden Informationen sind ohne Gewähr auf Richtigkeit und Vollständigkeit. Insbesondere wird keine Gewähr genommen auf Richtigkeit der Informationen oder Berechnungen, wenn diese als Grundlage für Investment- oder Marketingentscheidungen verwendet werden.

## Was ist Aurum?

Aurum ist ein dezentrales Fintech-Unternehmen, das innovative Krypto-Produkte und KI-gestützte Algorithmen anbietet. Es umfasst Tools wie den EX-AI Bot für automatisierte Trades, NeoBank für Zahlungen, Zeus AI Bot und Kartenlösungen. Das Partnerprogramm ermöglicht Provisionen durch Empfehlungen, mit Rängen (z. B. Nova bis Alpha), Profitshares und Boni. Aurum zielt auf sichere, effiziente Verwaltung digitaler Vermögenswerte ab und bietet potenziell hohe Renditen (exemplarisch wurden bis zu 17,5% monatlich im EX-AI Bot erwähnt).

### Warum interessant für Kunden?
- **Hohe Renditen und Passives Einkommen**: Durch KI-Trading und Profitsharing können Nutzer monatliche Erträge erzielen, ohne aktiven Handel.
- **Flexibilität**: Keine Lock-up-Perioden, jederzeitige Auszahlungen und Integration mit Wallets/Karten.
- **Partnerprogramm**: Direkte Provisionen (bis 18,5%), Team-Boni und Shareholder-Anteile motivieren zum Netzwerken.
- **Sicherheit**: Fokus auf Risikomanagement und Transparenz, ideal für Krypto-Einsteiger und Profis.

## Was habe ich gebaut und warum?

Ich habe einen webbasierten Simulator erstellt, der ein Organigramm _(gerichteter azyklischer Graph)_ darstellt und Provisionen, Erträge und Boni automatisch berechnet. Jeder Knoten repräsentiert ein Mitglied mit editierbaren Feldern (Name, Mitgliedsnummer, Einsatz) und berechneten Werten (z. B. Eigenanteil, Ertrag, Bonus, Provisionen).

**Warum?** Nachdem ich verschiedene Kombinationen aus Upline-Strukturen über eine und mehrere Ebenen mit unterschiedlichen Provisionsverteilungen ausprobiert habe, wollte ich einen _unverbindlichen_ Rechner bauen, um Szenarien zu simulieren. Basierend auf Infos aus Präsentationen, Slides und Chatgruppen hilft er mir, das Aurum-Modell zu verstehen. Die Berechnungsregeln befinden sich in den JavaScript-Dateien (`data.js` für Stufen und Gewinnverteilung, `app.js` für UI-Anpassungen). Es ist ein Tool zur Visualisierung und Planung – nicht offiziell, sondern als Hilfestellung.

**Wichtiger Hinweis**: Diese Regeln gelten nur bis Ende Juli 2025. Ab 1. August startet der offizielle Plan, bei dem zusätzliche Kriterien zum Erreichen höherer Stufen vonnöten sein werden. Erreichte Ränge bleiben erhalten, aber Aufstiege werden schwieriger und bedarfen mehrere Partner (Beine). Der Rechner ist unverbindlich und ungeprüft – lass die Affiliate-Regeln von deiner Upline überprüfen!

## Wie bedient man das Tool?

Das Tool verwendet OrgChartJS für eine interaktive Baumstruktur. Es läuft rein client-seitig (kein Server benötigt) und ist auf https://8bj.de/aurum/ für eine begrenzte Zeit online verfügbar. Hier eine kurze Anleitung:

### Grundlegende Bedienung
- **Organigramm aufbauen**: 
  - Klicke auf einen Knoten, um das Menü zu öffnen: "Kind hinzufügen" (neues Kind), "Bearbeiten" (Felder ändern) oder "Löschen".
  - Ziehe Knoten per Drag & Drop, um sie einem anderen Elternknoten zuzuordnen (Struktur ändern).
- **Felder eingeben**:
  - Pflichtfelder: Name (String), Mitgliedsnummer (beeinflusst Reihenfolge!), Einsatz ($-Betrag).
  - Nach Änderungen werden Felder wie Eigenanteil %, Ertrag &dollar; , Endstufe, Eigenvolumen &dollar; , Teamvolumen &dollar; , Bonus &dollar; , Sofortprovision &dollar; , Jahresprovision &dollar; , Gesamt &dollar; und auch die Simulation automatisch berechnet.
- **Anzeige**: Jeder Knoten zeigt "Mitgliedsnummer / Name" oben und "Einsatz (Eigenanteil%), Profit, Gesamtprovision" unten.
- **Speichern/Laden**:
  - Im oberen Menü: "JSON-Export" (kopiert Daten in die Zwischenablage) und "JSON-Import" (lädt aus Zwischenablage).
  - Die eingegebenen Daten sind sonst nach Schließen des Browsers verloren.

### Berechnungslogik (kurz)
- Basierend auf Paketgröße (z. B. Basic bis Ultimate) wird der Eigenanteil (60–95%) berechnet.
- Rendite: Exemplarisch 17,5% auf den Eigenanteil.
- Provisionen: Direkte Upline erhält Provision auf Einsatz, Profitshare auf Rendite. Indirekt: Differenz zu Downline-Maximum.
- Boni: Kumulativ für erreichte Stufen (z. B. Voyager: 100 $ Bonus).
- Reihenfolge: Mitgliedsnummer bestimmt Einstiegsreihenfolge und Sortierung.
- Direkte und indirekte Verkäufe werden zu 40% auf die Meilensteine (LV) der Stufen angerechnet.
- Details in `data.js` (Stufen und Verteilungen) und der Compute-Funktion im Code.

**Hinweis**: Überprüfe das Modell bei deiner Upline – es basiert auf unoffiziellen Quellen.

Für detaillierte OrgChartJS-Bedienung siehe die offizielle Dokumentation (z. B. Drag & Drop, Menüs, Layout-Anpassungen).

## Demo-Datensatz

Kopiere diesen JSON in die Zwischenablage und lade ihn via "Import from JSON":

```json
[{"id":0,"Name":"Upline","Einsatz":2000},{"id":"12","pid":0,"Name":"Aurum Foundation","Einsatz":100000},{"id":"13","pid":0,"Name":"King Charles","Einsatz":1000},{"id":"14","pid":"13","Name":"Prince William","Einsatz":50000},{"id":"15","pid":"13","Name":"Harry","Einsatz":5000},{"id":"22","pid":"14","Name":"George","Einsatz":10000},{"id":"25","pid":"22","Name":"Charlotte","Einsatz":250},{"id":"26","pid":"22","Name":"Louis","Einsatz":1000}]
```

Das simuliert eine Struktur mit Berechnungen.

## Installation und Entwicklung
- Klone das Repo: `git clone https://github.com/windowsfreak/aurum.git`
- Öffne `index.html` im Browser.
- Eine OrgChartJS-Version ist dem Projekt beigefügt.

Falls du Verbesserungen hast, erstelle einen Pull Request!
