(() => {
    "use strict";

    // -------------------- MONTAGE DU JEU --------------------

    const root = document.getElementById("jeu-snake");

    if (!root) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const language = params.get("lang") === "en" ? "en" : "fr";

    const textes = {
        fr: {
            welcome: "BIENVENUE AU JEU DU SNAKE",
            rules: [
                "Guidez le serpent avec les flèches directionnelles.",
                "Mangez les pommes rouges pour grandir.",
                "Chaque pomme mangée vous rapporte 1 point.",
                "Le serpent accélère au fil des pommes.",
                "Toucher un mur ou votre propre corps = défaite.",
                "Le demi-tour est impossible."
            ],
            start: "Appuyez sur ENTRÉE pour commencer.",
            escapeMenu: "ÉCHAP pour le menu.",
            apples: (score) => `x ${score}`,
            best: (score) => `Meilleur score : ${score}`,
            pause: "PAUSE",
            victory: "VICTOIRE !",
            fullGrid: "La grille est entièrement remplie.",
            lost: "PERDU !",
            crashed: "Le serpent s'est écrasé.",
            applesEaten: (score) => `Pommes mangées : ${score}`,
            newBest: "NOUVEAU MEILLEUR SCORE !",
            replay: "Appuyez sur ENTRÉE pour rejouer.",
            controls: ""
        },
        en: {
            welcome: "WELCOME TO SNAKE",
            rules: [
                "Guide the snake with the arrow keys.",
                "Eat the red apples to grow.",
                "Each apple earns you 1 point.",
                "The snake gets faster as you collect apples.",
                "Hitting a wall or your own body = defeat.",
                "Turning directly backwards is impossible."
            ],
            start: "Press ENTER to start.",
            escapeMenu: "ESC for the menu.",
            apples: (score) => `x ${score}`,
            best: (score) => `Best score: ${score}`,
            pause: "PAUSE",
            victory: "VICTORY!",
            fullGrid: "The grid is completely filled.",
            lost: "GAME OVER!",
            crashed: "The snake crashed.",
            applesEaten: (score) => `Apples eaten: ${score}`,
            newBest: "NEW BEST SCORE!",
            replay: "Press ENTER to play again.",
            controls: ""
        }
    };

    const t = textes[language];

    document.documentElement.lang = language;
    document.title = language === "en" ? "Snake" : "Jeu du Snake";

    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 660;
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", language === "en" ? "Playable Snake game" : "Jeu du Snake jouable");

    Object.assign(canvas.style, {
        display: "block",
        width: "auto",
        height: "auto",
        maxWidth: "100%",
        maxHeight: "calc(100vh - 32px)",
        margin: "0 auto",
        backgroundColor: "#0D0A9B",
        outline: "none"
    });

    root.appendChild(canvas);

    const ctx = canvas.getContext("2d");

    // -------------------- CONSTANTES --------------------

    const TAILLE_CASE = 30;
    const NOMBRE_CASES = 20;
    const HAUTEUR_BANDEAU = 60;
    const LARGEUR_FENETRE = 600;
    const HAUTEUR_FENETRE = 660;

    const BLANC = "rgb(255,255,255)";
    const FOND = "#0D0A9B";
    const ROUGE_SITE = "#E1001A";
    const NOIR = "#0D0A9B";
    const GRIS = "rgba(255,255,255,0.6)";
    const ROSE_PASTEL = "rgba(255,255,255,0.10)";
    const BORDEAUX_PASTEL = "rgba(255,255,255,0.04)";
    const VERT_FORET = "rgb(255,255,255)";
    const VERT_SERPENT = "rgba(255,255,255,0.85)";
    const VERT_TETE = "#E1001A";
    const CONTOUR_SERPENT = "#0D0A9B";
    const ROUGE_POMME = "#E1001A";
    const ROUGE_LANGUE = "#E1001A";
    const MARRON = "rgba(255,255,255,0.7)";
    const JAUNE_ETOILE = "rgb(255,255,255)";

    const COULEURS_FEUX = [
        "#E1001A",
        "rgb(255,255,255)",
        "rgba(255,255,255,0.6)"
    ];

    const PARTICULES_PAR_EXPLOSION = 40;
    const DUREE_PARTICULE = 60;
    const GRAVITE_PARTICULE = 0.08;
    const CHANCE_EXPLOSION = 0.04;

    const HAUT = [0, -1];
    const BAS = [0, 1];
    const GAUCHE = [-1, 0];
    const DROITE = [1, 0];

    const VITESSE_DEPART = 6;
    const VITESSE_MAX = 15;
    const POMMES_PAR_PALIER = 3;
    const SCORE_KEY = "snake_meilleur_score";

    const DIRECTIONS_TOUCHES = {
        ArrowUp: HAUT,
        ArrowDown: BAS,
        ArrowLeft: GAUCHE,
        ArrowRight: DROITE,
        z: HAUT,
        Z: HAUT,
        w: HAUT,
        W: HAUT,
        s: BAS,
        S: BAS,
        q: GAUCHE,
        Q: GAUCHE,
        a: GAUCHE,
        A: GAUCHE,
        d: DROITE,
        D: DROITE
    };

    // -------------------- ÉTAT DU JEU --------------------

    let serpent = [];
    let direction = DROITE;
    let directionDemandee = DROITE;
    let pomme = null;
    let score = 0;
    let meilleurScore = lireMeilleurScore();
    let recordBattu = false;
    let victoire = false;
    let dernierPas = 0;
    let etat = "accueil";
    let pause = false;
    let particules = [];

    // -------------------- OUTILS --------------------

    function memeDirection(a, b) {
        return a[0] === b[0] && a[1] === b[1];
    }

    function sensOppose(a, b) {
        return a[0] === -b[0] && a[1] === -b[1];
    }

    function choisirDirection(directionActuelle, nouvelleDirection) {
        if (sensOppose(directionActuelle, nouvelleDirection)) {
            return directionActuelle;
        }

        return nouvelleDirection;
    }

    function creerSerpent() {
        const milieu = Math.floor(NOMBRE_CASES / 2);

        return [0, 1, 2].map((decalage) => [milieu - decalage, milieu]);
    }

    function cleCase(caseGrille) {
        return `${caseGrille[0]}:${caseGrille[1]}`;
    }

    function listerCasesLibres(serpentActuel) {
        const occupees = new Set(serpentActuel.map(cleCase));
        const cases = [];

        for (let colonne = 0; colonne < NOMBRE_CASES; colonne += 1) {
            for (let ligne = 0; ligne < NOMBRE_CASES; ligne += 1) {
                if (!occupees.has(`${colonne}:${ligne}`)) {
                    cases.push([colonne, ligne]);
                }
            }
        }

        return cases;
    }

    function placerPomme(serpentActuel) {
        const casesLibres = listerCasesLibres(serpentActuel);

        if (casesLibres.length === 0) {
            return null;
        }

        return casesLibres[Math.floor(Math.random() * casesLibres.length)];
    }

    function nouvellePartie() {
        serpent = creerSerpent();
        direction = DROITE;
        directionDemandee = DROITE;
        pomme = placerPomme(serpent);
        score = 0;
        recordBattu = false;
        victoire = false;
        pause = false;
        particules = [];
        dernierPas = performance.now();
        etat = "jeu";
    }

    function retourMenu() {
        serpent = creerSerpent();
        direction = DROITE;
        directionDemandee = DROITE;
        pomme = placerPomme(serpent);
        score = 0;
        recordBattu = false;
        victoire = false;
        pause = false;
        particules = [];
        etat = "accueil";
    }

    function calculerVitesse() {
        return Math.min(VITESSE_MAX, VITESSE_DEPART + Math.floor(score / POMMES_PAR_PALIER));
    }

    function calculerNouvelleTete() {
        return [
            serpent[0][0] + direction[0],
            serpent[0][1] + direction[1]
        ];
    }

    function estHorsGrille(caseGrille) {
        return caseGrille[0] < 0
            || caseGrille[0] >= NOMBRE_CASES
            || caseGrille[1] < 0
            || caseGrille[1] >= NOMBRE_CASES;
    }

    function seMord(serpentActuel) {
        const tete = cleCase(serpentActuel[0]);
        return serpentActuel.slice(1).some((caseGrille) => cleCase(caseGrille) === tete);
    }

    function casesEgales(a, b) {
        return a && b && a[0] === b[0] && a[1] === b[1];
    }

    function faireAvancerPartie() {
        direction = directionDemandee;

        const nouvelleTete = calculerNouvelleTete();
        const mange = casesEgales(nouvelleTete, pomme);
        const nouveauSerpent = [nouvelleTete, ...serpent];

        if (!mange) {
            nouveauSerpent.pop();
        }

        serpent = nouveauSerpent;

        if (estHorsGrille(serpent[0]) || seMord(serpent)) {
            terminerPartie(false);
            return;
        }

        if (mange) {
            score += 1;
            pomme = placerPomme(serpent);

            if (pomme === null) {
                terminerPartie(true);
            }
        }
    }

    function terminerPartie(gagne) {
        victoire = gagne;
        recordBattu = mettreAJourMeilleurScore(score);
        meilleurScore = lireMeilleurScore();
        etat = "fin";
        pause = false;

        if (recordBattu) {
            particules = creerExplosion(300, 200);
        }
    }

    // -------------------- SCORE --------------------

    function lireMeilleurScore() {
        try {
            const contenu = localStorage.getItem(SCORE_KEY);

            if (!contenu) {
                return 0;
            }

            const donnees = JSON.parse(contenu);

            if (!Number.isInteger(donnees.score)) {
                return 0;
            }

            return donnees.score;
        } catch (error) {
            return 0;
        }
    }

    function enregistrerMeilleurScore(nouveauScore) {
        try {
            localStorage.setItem(
                SCORE_KEY,
                JSON.stringify({
                    score: nouveauScore,
                    date: new Date().toISOString().slice(0, 10)
                })
            );
        } catch (error) {
            // En mode privé, le jeu reste jouable même si localStorage est refusé.
        }
    }

    function mettreAJourMeilleurScore(nouveauScore) {
        const ancienScore = lireMeilleurScore();

        if (nouveauScore > ancienScore) {
            enregistrerMeilleurScore(nouveauScore);
            return true;
        }

        return false;
    }

    // -------------------- DESSIN GÉNÉRIQUE --------------------

    function texte(texteAffiche, x, y, taille = 30, couleur = BLANC, alignement = "left") {
        ctx.font = `${taille}px Avenir, "Avenir Next", sans-serif`;
        ctx.fillStyle = couleur;
        ctx.textAlign = alignement;
        ctx.textBaseline = "top";
        ctx.fillText(texteAffiche, x, y);
    }

    function texteCentre(texteAffiche, y, taille = 30, couleur = BLANC) {
        texte(texteAffiche, LARGEUR_FENETRE / 2, y, taille, couleur, "center");
    }

    function rectangleArrondi(x, y, largeur, hauteur, rayon, remplissage, bordure = null, epaisseur = 1) {
        ctx.beginPath();
        ctx.roundRect(x, y, largeur, hauteur, rayon);

        if (remplissage) {
            ctx.fillStyle = remplissage;
            ctx.fill();
        }

        if (bordure) {
            ctx.strokeStyle = bordure;
            ctx.lineWidth = epaisseur;
            ctx.stroke();
        }
    }

    function rectangleCase(caseGrille) {
        return {
            x: caseGrille[0] * TAILLE_CASE,
            y: HAUTEUR_BANDEAU + caseGrille[1] * TAILLE_CASE,
            largeur: TAILLE_CASE,
            hauteur: TAILLE_CASE
        };
    }

    function centreCase(caseGrille) {
        const rect = rectangleCase(caseGrille);
        return [rect.x + rect.largeur / 2, rect.y + rect.hauteur / 2];
    }

    function perpendiculaire(directionActuelle) {
        return [-directionActuelle[1], directionActuelle[0]];
    }

    function pointDecale(centre, directionActuelle, distance) {
        return [
            centre[0] + directionActuelle[0] * distance,
            centre[1] + directionActuelle[1] * distance
        ];
    }

    // -------------------- GRILLE --------------------

    function dessinerGrille() {
        for (let colonne = 0; colonne < NOMBRE_CASES; colonne += 1) {
            for (let ligne = 0; ligne < NOMBRE_CASES; ligne += 1) {
                ctx.fillStyle = (colonne + ligne) % 2 === 0 ? ROSE_PASTEL : BORDEAUX_PASTEL;
                ctx.fillRect(
                    colonne * TAILLE_CASE,
                    HAUTEUR_BANDEAU + ligne * TAILLE_CASE,
                    TAILLE_CASE,
                    TAILLE_CASE
                );
            }
        }
    }

    // -------------------- ÉTOILE --------------------

    function dessinerEtoile(centre, rayon) {
        const points = [];

        for (let numero = 0; numero < 10; numero += 1) {
            const angle = -Math.PI / 2 + numero * Math.PI / 5;
            const distance = numero % 2 === 0 ? rayon : rayon * 0.45;

            points.push([
                centre[0] + distance * Math.cos(angle),
                centre[1] + distance * Math.sin(angle)
            ]);
        }

        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);

        points.slice(1).forEach((point) => ctx.lineTo(point[0], point[1]));

        ctx.closePath();
        ctx.fillStyle = JAUNE_ETOILE;
        ctx.fill();
        ctx.strokeStyle = NOIR;
        ctx.lineWidth = 1;
        ctx.stroke();
    }

    // -------------------- LOGO --------------------

    function dessinerLogoSerpent(centre, largeur = 170) {
        const nombre = 24;
        const amplitude = Math.floor(largeur / 8);
        const points = [];

        for (let numero = 0; numero < nombre; numero += 1) {
            const progression = numero / (nombre - 1);
            const x = centre[0] - largeur / 2 + progression * largeur;
            const y = centre[1] + amplitude * Math.sin(progression * 3 * Math.PI);
            const rayon = 4 + 6 * progression;
            points.push([x, y, rayon]);
        }

        points.forEach(([x, y, rayon]) => {
            ctx.beginPath();
            ctx.arc(x, y, rayon, 0, Math.PI * 2);
            ctx.fillStyle = VERT_SERPENT;
            ctx.fill();
            ctx.strokeStyle = CONTOUR_SERPENT;
            ctx.lineWidth = 2;
            ctx.stroke();
        });

        const dernier = points[points.length - 1];
        const tete = [dernier[0] + 4, dernier[1]];

        ctx.strokeStyle = ROUGE_LANGUE;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(tete[0] + 10, tete[1]);
        ctx.lineTo(tete[0] + 22, tete[1]);
        ctx.stroke();

        [-1, 1].forEach((cote) => {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(tete[0] + 22, tete[1]);
            ctx.lineTo(tete[0] + 28, tete[1] + cote * 4);
            ctx.stroke();
        });

        ctx.beginPath();
        ctx.arc(tete[0], tete[1], 13, 0, Math.PI * 2);
        ctx.fillStyle = VERT_TETE;
        ctx.fill();
        ctx.strokeStyle = CONTOUR_SERPENT;
        ctx.lineWidth = 2;
        ctx.stroke();

        [-1, 1].forEach((cote) => {
            const oeil = [tete[0] + 3, tete[1] + cote * 6];

            ctx.beginPath();
            ctx.arc(oeil[0], oeil[1], 4, 0, Math.PI * 2);
            ctx.fillStyle = BLANC;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(oeil[0] + 1, oeil[1], 2, 0, Math.PI * 2);
            ctx.fillStyle = NOIR;
            ctx.fill();
        });
    }

    // -------------------- POMME --------------------

    function dessinerPommeCentree(centre, rayon) {
        ctx.beginPath();
        ctx.arc(centre[0], centre[1], rayon, 0, Math.PI * 2);
        ctx.fillStyle = ROUGE_POMME;
        ctx.fill();
        ctx.strokeStyle = NOIR;
        ctx.lineWidth = 1;
        ctx.stroke();

        const haut = [centre[0], centre[1] - rayon];

        ctx.beginPath();
        ctx.moveTo(haut[0], haut[1]);
        ctx.lineTo(haut[0] + 1, haut[1] - rayon / 2);
        ctx.strokeStyle = MARRON;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(
            haut[0] + rayon / 3,
            haut[1] - rayon / 3,
            Math.max(2, rayon / 4),
            0,
            Math.PI * 2
        );
        ctx.fillStyle = VERT_SERPENT;
        ctx.fill();
    }

    function dessinerPomme(caseGrille) {
        dessinerPommeCentree(centreCase(caseGrille), TAILLE_CASE / 2 - 4);
    }

    // -------------------- SERPENT --------------------

    function dessinerSegment(caseGrille, couleur) {
        const rect = rectangleCase(caseGrille);

        rectangleArrondi(
            rect.x + 2,
            rect.y + 2,
            rect.largeur - 4,
            rect.hauteur - 4,
            8,
            couleur,
            CONTOUR_SERPENT,
            2
        );
    }

    function dessinerYeux(caseGrille, directionActuelle) {
        const lateral = perpendiculaire(directionActuelle);
        const avant = pointDecale(centreCase(caseGrille), directionActuelle, 4);

        [-1, 1].forEach((cote) => {
            const oeil = pointDecale(avant, lateral, cote * 6);
            const pupille = pointDecale(oeil, directionActuelle, 1);

            ctx.beginPath();
            ctx.arc(oeil[0], oeil[1], 4, 0, Math.PI * 2);
            ctx.fillStyle = BLANC;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(pupille[0], pupille[1], 2, 0, Math.PI * 2);
            ctx.fillStyle = NOIR;
            ctx.fill();
        });
    }

    function dessinerLangue(caseGrille, directionActuelle) {
        const lateral = perpendiculaire(directionActuelle);
        const base = pointDecale(centreCase(caseGrille), directionActuelle, TAILLE_CASE / 2 - 2);
        const pointe = pointDecale(base, directionActuelle, 10);

        ctx.beginPath();
        ctx.moveTo(base[0], base[1]);
        ctx.lineTo(pointe[0], pointe[1]);
        ctx.strokeStyle = ROUGE_LANGUE;
        ctx.lineWidth = 3;
        ctx.stroke();

        [-1, 1].forEach((cote) => {
            const bout = pointDecale(pointDecale(pointe, directionActuelle, 5), lateral, cote * 4);

            ctx.beginPath();
            ctx.moveTo(pointe[0], pointe[1]);
            ctx.lineTo(bout[0], bout[1]);
            ctx.strokeStyle = ROUGE_LANGUE;
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }

    function dessinerSerpent() {
        serpent.slice(1).reverse().forEach((caseGrille) => {
            dessinerSegment(caseGrille, VERT_SERPENT);
        });

        dessinerLangue(serpent[0], direction);
        dessinerSegment(serpent[0], VERT_TETE);
        dessinerYeux(serpent[0], direction);
    }

    // -------------------- BANDEAU --------------------

    function dessinerBandeau() {
        ctx.fillStyle = FOND;
        ctx.fillRect(0, 0, LARGEUR_FENETRE, HAUTEUR_BANDEAU);

        ctx.strokeStyle = VERT_FORET;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, HAUTEUR_BANDEAU - 2);
        ctx.lineTo(LARGEUR_FENETRE, HAUTEUR_BANDEAU - 2);
        ctx.stroke();

        dessinerPommeCentree([30, HAUTEUR_BANDEAU / 2 + 3], 12);
        texte(t.apples(score), 52, 20, 30, BLANC);

        ctx.font = "30px Avenir, 'Avenir Next', sans-serif";
        const libelle = t.best(meilleurScore);
        const largeur = ctx.measureText(libelle).width;
        const xTexte = LARGEUR_FENETRE - largeur - 20;

        texte(libelle, xTexte, 20, 30, BLANC);
        dessinerEtoile([xTexte - 18, HAUTEUR_BANDEAU / 2], 11);
    }

    // -------------------- FEUX D'ARTIFICE --------------------

    function creerParticule(x, y, couleur) {
        const angle = Math.random() * 2 * Math.PI;
        const vitesse = 1 + Math.random() * 3;

        return {
            x: x,
            y: y,
            vx: Math.cos(angle) * vitesse,
            vy: Math.sin(angle) * vitesse,
            vie: DUREE_PARTICULE,
            couleur: couleur
        };
    }

    function creerExplosion(x, y) {
        const couleur = COULEURS_FEUX[Math.floor(Math.random() * COULEURS_FEUX.length)];
        const nouvelles = [];

        for (let i = 0; i < PARTICULES_PAR_EXPLOSION; i += 1) {
            nouvelles.push(creerParticule(x, y, couleur));
        }

        return nouvelles;
    }

    function animerFeuxArtifice(deltaFrames) {
        if (Math.random() < CHANCE_EXPLOSION * deltaFrames) {
            const x = 80 + Math.random() * (LARGEUR_FENETRE - 160);
            const y = 80 + Math.random() * 220;
            particules.push(...creerExplosion(x, y));
        }

        particules.forEach((particule) => {
            particule.x += particule.vx * deltaFrames;
            particule.y += particule.vy * deltaFrames;
            particule.vy += GRAVITE_PARTICULE * deltaFrames;
            particule.vie -= deltaFrames;
        });

        particules = particules.filter((particule) => particule.vie > 0);
    }

    function dessinerParticules() {
        particules.forEach((particule) => {
            const rayon = 2 + 2 * particule.vie / DUREE_PARTICULE;

            ctx.beginPath();
            ctx.arc(particule.x, particule.y, Math.max(1, rayon), 0, Math.PI * 2);
            ctx.fillStyle = particule.couleur;
            ctx.fill();
        });
    }

    // -------------------- ÉCRANS --------------------

    function afficherAccueil() {
        ctx.fillStyle = FOND;
        ctx.fillRect(0, 0, LARGEUR_FENETRE, HAUTEUR_FENETRE);

        dessinerLogoSerpent([LARGEUR_FENETRE / 2 - 14, 40]);
        texteCentre(t.welcome, 85, 38, VERT_FORET);
        rectangleArrondi(50, 150, LARGEUR_FENETRE - 100, 270, 14, null, VERT_FORET, 4);

        t.rules.forEach((ligneRegle, index) => {
            texteCentre(ligneRegle, 182 + index * 38, 21, BLANC);
        });

        texteCentre(t.start, 470, 30, VERT_FORET);
        texteCentre(t.escapeMenu, 520, 24, GRIS);
    }

    function afficherJeu() {
        ctx.fillStyle = FOND;
        ctx.fillRect(0, 0, LARGEUR_FENETRE, HAUTEUR_FENETRE);

        dessinerGrille();

        if (pomme !== null) {
            dessinerPomme(pomme);
        }

        dessinerSerpent();
        dessinerBandeau();

        if (pause) {
            ctx.fillStyle = "rgba(13,10,155,0.75)";
            ctx.fillRect(0, HAUTEUR_BANDEAU, LARGEUR_FENETRE, LARGEUR_FENETRE);
            texteCentre(t.pause, 290, 50, VERT_FORET);
        }
    }

    function afficherFin() {
        ctx.fillStyle = FOND;
        ctx.fillRect(0, 0, LARGEUR_FENETRE, HAUTEUR_FENETRE);

        if (recordBattu) {
            dessinerParticules();
        }

        dessinerLogoSerpent([LARGEUR_FENETRE / 2 - 14, 45]);

        if (victoire) {
            texteCentre(t.victory, 100, 50, VERT_FORET);
            texteCentre(t.fullGrid, 170, 30, BLANC);
        } else {
            texteCentre(t.lost, 100, 50, BLANC);
            texteCentre(t.crashed, 170, 30, BLANC);
        }

        texteCentre(t.applesEaten(score), 250, 30, BLANC);
        texteCentre(recordBattu ? t.newBest : t.best(meilleurScore), 300, 30, VERT_FORET);
        texteCentre(t.replay, 420, 30, VERT_FORET);
        texteCentre(t.escapeMenu, 470, 24, GRIS);
    }

    function dessiner() {
        if (etat === "accueil") {
            afficherAccueil();
        } else if (etat === "jeu") {
            afficherJeu();
        } else {
            afficherFin();
        }
    }

    // -------------------- CLAVIER --------------------

    window.addEventListener("keydown", function(event) {
        if (event.ctrlKey || event.metaKey || event.altKey) {
            return;
        }

        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(event.key)) {
            event.preventDefault();
        }

        if (event.key === "Escape") {
            event.preventDefault();
            retourMenu();
            return;
        }

        if (etat === "accueil" && event.key === "Enter") {
            event.preventDefault();
            nouvellePartie();
            return;
        }

        if (etat === "fin" && event.key === "Enter") {
            event.preventDefault();
            nouvellePartie();
            return;
        }

        if (etat !== "jeu") {
            return;
        }

        if (event.key === " ") {
            pause = !pause;
            dernierPas = performance.now();
            return;
        }

        const nouvelleDirection = DIRECTIONS_TOUCHES[event.key];

        if (nouvelleDirection && !pause) {
            directionDemandee = choisirDirection(direction, nouvelleDirection);
        }
    });

    canvas.addEventListener("click", function() {
        canvas.focus();
    });

    // -------------------- PAUSE AUTOMATIQUE --------------------

    function mettreEnPauseSiNecessaire() {
        if (etat === "jeu") {
            pause = true;
        }
    }

    window.addEventListener("blur", mettreEnPauseSiNecessaire);

    document.addEventListener("visibilitychange", function() {
        if (document.hidden) {
            mettreEnPauseSiNecessaire();
        }
    });

    // -------------------- BOUCLE D'ANIMATION --------------------

    let tempsPrecedent = performance.now();

    function animation(maintenant) {
        const deltaMs = Math.min(maintenant - tempsPrecedent, 100);
        const deltaFrames = deltaMs / (1000 / 60);
        tempsPrecedent = maintenant;

        if (etat === "jeu" && !pause) {
            const delai = 1000 / calculerVitesse();

            if (maintenant - dernierPas >= delai) {
                dernierPas = maintenant;
                faireAvancerPartie();
            }
        } else if (etat === "fin" && recordBattu) {
            animerFeuxArtifice(deltaFrames);
        }

        dessiner();
        requestAnimationFrame(animation);
    }

    retourMenu();
    requestAnimationFrame(animation);
    setTimeout(() => canvas.focus(), 0);
})();
