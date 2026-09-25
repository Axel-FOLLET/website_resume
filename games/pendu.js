(() => {
    "use strict";

    // -------------------- MONTAGE DU JEU --------------------

    const root = document.getElementById("jeu-pendu");

    if (!root) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const language = params.get("lang") === "en" ? "en" : "fr";

    const textes = {
        fr: {
            title: "BIENVENUE AU JEU DU PENDU",
            subtitle: "Trouvez le mot secret pour survivre !",
            penaltiesAllowed: "Vous avez droit à 12 pénalités.",
            badLetter: "Une mauvaise lettre coûte 1 pénalité.",
            badWord: "Un mot complet incorrect coûte 5 pénalités.",
            wordLength: (n) => `Le mot contient ${n} lettre(s).`,
            start: "Appuyez sur ENTRÉE pour commencer.",
            escapeWelcome: "ÉCHAP pour recommencer.",
            penalties: (n) => `Pénalités : ${n}/12`,
            chances: (n) => `Chances restantes : ${n}`,
            attempts: (n) => `Tentatives : ${n}`,
            word: (value) => `Mot : ${value}`,
            proposal: "Votre proposition :",
            invalid: "ENTRÉE INVALIDE. ENTREZ UNE LETTRE OU UN MOT.",
            already: "CETTE LETTRE A DÉJÀ ÉTÉ TENTÉE.",
            victory: "VOUS REMPORTEZ LA PARTIE !",
            survive: "Vous obtenez le droit de survivre.",
            defeat: "DÉFAITE",
            badLuck: "Le sort vous a été défavorable.",
            hanged: "Vous allez être pendu.",
            wordWas: (value) => `Le mot était : ${value}`,
            replay: "Appuyez sur ENTRÉE ou cliquez pour REJOUER.",
            escapeEnd: "ÉCHAP pour revenir à l'accueil.",
            newBest: "FÉLICITATIONS ! NOUVEAU MEILLEUR SCORE !",
            noBest: "Aucun meilleur score enregistré.",
            best: (score, date) => `Meilleur score : ${score} tentative(s) le ${date}.`
        },
        en: {
            title: "WELCOME TO HANGMAN",
            subtitle: "Find the secret word to survive!",
            penaltiesAllowed: "You are allowed 12 penalties.",
            badLetter: "A wrong letter costs 1 penalty.",
            badWord: "A wrong full word costs 5 penalties.",
            wordLength: (n) => `The word contains ${n} letter(s).`,
            start: "Press ENTER to start.",
            escapeWelcome: "ESC to restart.",
            penalties: (n) => `Penalties: ${n}/12`,
            chances: (n) => `Chances remaining: ${n}`,
            attempts: (n) => `Attempts: ${n}`,
            word: (value) => `Word: ${value}`,
            proposal: "Your guess:",
            invalid: "INVALID ENTRY. ENTER A LETTER OR A WORD.",
            already: "THIS LETTER HAS ALREADY BEEN TRIED.",
            victory: "YOU WIN!",
            survive: "You earn the right to survive.",
            defeat: "DEFEAT",
            badLuck: "Luck was not on your side.",
            hanged: "You are going to be hanged.",
            wordWas: (value) => `The word was: ${value}`,
            replay: "Press ENTER or click to PLAY AGAIN.",
            escapeEnd: "ESC to return to the home screen.",
            newBest: "CONGRATULATIONS! NEW BEST SCORE!",
            noBest: "No best score recorded yet.",
            best: (score, date) => `Best score: ${score} attempt(s) on ${date}.`
        }
    };

    const t = textes[language];

    document.documentElement.lang = language;
    document.title = language === "en" ? "Hangman" : "Jeu du Pendu";

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    canvas.tabIndex = 0;
    canvas.setAttribute("aria-label", language === "en" ? "Playable Hangman game" : "Jeu du Pendu jouable");

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

    const BLANC = "rgb(255,255,255)";
    const NOIR = "rgb(255,255,255)";
    const GRIS = "rgba(255,255,255,0.6)";
    const MARRON = "rgba(255,255,255,0.85)";
    const ROUGE = "#E1001A";
    const VERT = "rgb(255,255,255)";
    const ORANGE = "rgba(255,255,255,0.6)";
    const VERT_CLAIR = "rgba(255,255,255,0.35)";
    const ROUGE_CLAIR = "rgba(225,0,26,0.75)";
    const FOND_MESSAGE = "#0D0A9B";
    const FOND = "#0D0A9B";
    const FOND_CLAIR = "rgba(255,255,255,0.10)";
    const FOND_VICTOIRE = "#0D0A9B";
    const FOND_DEFAITE = "#0D0A9B";

    const MAX_PENALITES = 12;
    const LIGNES_CLAVIER = ["AZERTYUIOP", "QSDFGHJKLM", "WXCVBN"];
    const TOUCHE_LARGEUR = 46;
    const TOUCHE_HAUTEUR = 50;
    const TOUCHE_ECART = 8;
    const CLAVIER_X = 620;
    const CLAVIER_LARGEUR = 532;
    const CLAVIER_Y = 250;
    const SCORE_KEY = "pendu_meilleur_score";

    const MOTS = [
    "abeille",
    "abricot",
    "accordeon",
    "acheter",
    "acteur",
    "actrice",
    "affiche",
    "aider",
    "ail",
    "algue",
    "amande",
    "ambition",
    "ambulance",
    "ami",
    "amour",
    "amusant",
    "ananas",
    "ancien",
    "annee",
    "aout",
    "apprendre",
    "araignee",
    "arbitre",
    "arbre",
    "arc",
    "architecte",
    "argent",
    "argente",
    "armoire",
    "arriver",
    "assiette",
    "aubergine",
    "automne",
    "autre",
    "avare",
    "avion",
    "avocat",
    "avoine",
    "avril",
    "bague",
    "baguette",
    "balcon",
    "baleine",
    "ballon",
    "banane",
    "banquier",
    "bas",
    "basilic",
    "basket",
    "bateau",
    "batterie",
    "beau",
    "beige",
    "beurre",
    "bibliotheque",
    "bijou",
    "billet",
    "biscuit",
    "blanc",
    "ble",
    "bleu",
    "boire",
    "boite",
    "bonheur",
    "bonnet",
    "botte",
    "bouche",
    "boucher",
    "boue",
    "bougie",
    "boulanger",
    "bouteille",
    "boxe",
    "bracelet",
    "branche",
    "bras",
    "brosse",
    "brouillard",
    "bureau",
    "bus",
    "cable",
    "cacahuete",
    "cadre",
    "cafe",
    "cahier",
    "caillou",
    "calculatrice",
    "calendrier",
    "calme",
    "camion",
    "camionnette",
    "canape",
    "canard",
    "cannelle",
    "capitale",
    "carotte",
    "cartable",
    "cascade",
    "casquette",
    "casserole",
    "cave",
    "ceinture",
    "cent",
    "cerise",
    "cerveau",
    "chaise",
    "chambre",
    "champ",
    "champignon",
    "champion",
    "chance",
    "changer",
    "chanson",
    "chanter",
    "chanteur",
    "chapeau",
    "chat",
    "chataigne",
    "chaud",
    "chaussette",
    "chaussure",
    "cheminee",
    "chemise",
    "chercher",
    "cheval",
    "cheveux",
    "cheville",
    "chien",
    "chocolat",
    "choix",
    "ciel",
    "cinema",
    "cinq",
    "cinquante",
    "citron",
    "clair",
    "classe",
    "clavier",
    "cle",
    "cochon",
    "coeur",
    "coiffeur",
    "colere",
    "collier",
    "colline",
    "complique",
    "concert",
    "confiance",
    "confiture",
    "construire",
    "content",
    "continent",
    "corps",
    "costume",
    "cou",
    "coude",
    "couleur",
    "couloir",
    "courage",
    "courageux",
    "courgette",
    "courir",
    "course",
    "court",
    "coussin",
    "couteau",
    "couverture",
    "crabe",
    "craie",
    "cravate",
    "crayon",
    "creativite",
    "creme",
    "croissant",
    "cuillere",
    "cuisiner",
    "cuisinier",
    "curieux",
    "curiosite",
    "cyclisme",
    "dangereux",
    "danse",
    "danser",
    "danseur",
    "dauphin",
    "decembre",
    "decennie",
    "dedans",
    "defaite",
    "dehors",
    "demain",
    "dent",
    "derriere",
    "descendre",
    "desert",
    "dessiner",
    "dessous",
    "dessus",
    "detruire",
    "deux",
    "devant",
    "devoir",
    "dictionnaire",
    "different",
    "difficile",
    "dimanche",
    "diplome",
    "distance",
    "dix",
    "docteur",
    "doigt",
    "donner",
    "dore",
    "dormir",
    "dos",
    "doute",
    "douze",
    "drapeau",
    "droit",
    "droite",
    "drole",
    "eau",
    "echarpe",
    "echouer",
    "eclair",
    "ecole",
    "economiser",
    "ecouter",
    "ecran",
    "ecrire",
    "ecrivain",
    "egoisme",
    "electricien",
    "eleve",
    "enfant",
    "ennui",
    "ennuyeux",
    "enseigner",
    "ensemble",
    "entrainement",
    "entrer",
    "enveloppe",
    "epaule",
    "epice",
    "equipe",
    "escalade",
    "escalier",
    "esperer",
    "espoir",
    "etagere",
    "etang",
    "ete",
    "etoile",
    "etrange",
    "etroit",
    "etudiant",
    "etudier",
    "evier",
    "examen",
    "facile",
    "facteur",
    "faible",
    "faiblesse",
    "falaise",
    "famille",
    "farine",
    "fatigue",
    "fauteuil",
    "faux",
    "femme",
    "fenetre",
    "ferme",
    "fermer",
    "fermier",
    "fete",
    "feuille",
    "fevrier",
    "fierte",
    "filet",
    "fille",
    "film",
    "fils",
    "fleur",
    "flute",
    "foie",
    "folie",
    "fonce",
    "football",
    "force",
    "foret",
    "fort",
    "four",
    "fourchette",
    "fourmi",
    "fraise",
    "frein",
    "frere",
    "froid",
    "fromage",
    "frontiere",
    "fruit",
    "fusee",
    "gagner",
    "gants",
    "gateau",
    "gauche",
    "gel",
    "genereux",
    "generosite",
    "genou",
    "gentil",
    "gentillesse",
    "gilet",
    "givre",
    "glace",
    "globe",
    "golf",
    "gomme",
    "gorge",
    "graine",
    "grand",
    "grange",
    "gratitude",
    "grenier",
    "grenouille",
    "gris",
    "guerre",
    "guitare",
    "haricot",
    "harpe",
    "haut",
    "helicoptere",
    "herbe",
    "heure",
    "heureux",
    "hier",
    "histoire",
    "hiver",
    "hockey",
    "homme",
    "honnete",
    "honte",
    "hopital",
    "horaire",
    "horloge",
    "huile",
    "huit",
    "humilite",
    "ici",
    "idee",
    "identique",
    "ile",
    "imagination",
    "impatient",
    "impoli",
    "important",
    "impossible",
    "imprimante",
    "incertain",
    "ingenieur",
    "injuste",
    "instant",
    "instrument",
    "intelligence",
    "intelligent",
    "interessant",
    "inutile",
    "jalousie",
    "jamais",
    "jambe",
    "janvier",
    "jardin",
    "jardinier",
    "jaune",
    "jeu",
    "jeudi",
    "jeune",
    "joie",
    "jouer",
    "jour",
    "journal",
    "journaliste",
    "joyeux",
    "juge",
    "juillet",
    "juin",
    "jungle",
    "jupe",
    "jus",
    "juste",
    "justice",
    "kiwi",
    "klaxon",
    "la",
    "lac",
    "laid",
    "lait",
    "lampe",
    "langue",
    "lapin",
    "large",
    "laver",
    "lecon",
    "lecture",
    "leger",
    "legume",
    "lent",
    "liberte",
    "libre",
    "lion",
    "lire",
    "lit",
    "livre",
    "loi",
    "long",
    "loup",
    "lourd",
    "lundi",
    "lune",
    "lunettes",
    "lutte",
    "magasin",
    "magazine",
    "mai",
    "maillot",
    "main",
    "maintenant",
    "mais",
    "maison",
    "malade",
    "manger",
    "mangue",
    "manteau",
    "marche",
    "marcher",
    "mardi",
    "marin",
    "marron",
    "mars",
    "matin",
    "mecanicien",
    "mechancete",
    "mechant",
    "medaille",
    "melodie",
    "melon",
    "meme",
    "memoire",
    "mensonge",
    "menteur",
    "menthe",
    "mer",
    "mercredi",
    "mere",
    "metro",
    "midi",
    "miel",
    "mille",
    "minute",
    "miroir",
    "mois",
    "moment",
    "monde",
    "montagne",
    "monter",
    "montre",
    "moteur",
    "moto",
    "mousse",
    "mouton",
    "mur",
    "muscle",
    "musicien",
    "musique",
    "nager",
    "nappe",
    "natation",
    "navire",
    "neige",
    "nerf",
    "nerveux",
    "nettoyer",
    "neuf",
    "nez",
    "noir",
    "noix",
    "nombre",
    "normal",
    "note",
    "nouveau",
    "novembre",
    "nuage",
    "nuit",
    "nulle",
    "occupe",
    "ocean",
    "octobre",
    "oeil",
    "oeuf",
    "oignon",
    "oiseau",
    "ongle",
    "onze",
    "orage",
    "orange",
    "orchestre",
    "ordinateur",
    "oreille",
    "oreiller",
    "orge",
    "orgue",
    "os",
    "ouragan",
    "ours",
    "ouvrir",
    "pain",
    "paix",
    "pancarte",
    "panier",
    "pantalon",
    "papier",
    "papillon",
    "parapluie",
    "parc",
    "pardon",
    "pareil",
    "paresse",
    "parfois",
    "parler",
    "part",
    "partir",
    "partout",
    "pasteque",
    "pate",
    "pates",
    "patience",
    "patient",
    "patinage",
    "payer",
    "pays",
    "peau",
    "pecheur",
    "peigne",
    "peintre",
    "perdre",
    "pere",
    "persil",
    "petit",
    "peur",
    "peureux",
    "phare",
    "photo",
    "photographe",
    "piano",
    "piece",
    "pied",
    "pilote",
    "place",
    "plafond",
    "plage",
    "plan",
    "plombier",
    "plongee",
    "pluie",
    "poele",
    "poids",
    "poignet",
    "poire",
    "poisson",
    "poivre",
    "poivron",
    "poli",
    "policier",
    "politesse",
    "pomme",
    "pompier",
    "pont",
    "porte",
    "possible",
    "pot",
    "poule",
    "poumon",
    "poussiere",
    "prairie",
    "prendre",
    "prince",
    "princesse",
    "printemps",
    "prix",
    "probleme",
    "professeur",
    "projet",
    "promettre",
    "propre",
    "province",
    "prune",
    "puits",
    "pull",
    "pyjama",
    "qualite",
    "quantite",
    "quarante",
    "quatorze",
    "quatre",
    "question",
    "quinze",
    "racine",
    "radio",
    "raisin",
    "raison",
    "rapide",
    "refrigerateur",
    "regarder",
    "region",
    "regle",
    "regret",
    "rein",
    "reine",
    "remercier",
    "renard",
    "rencontrer",
    "reparer",
    "reponse",
    "requin",
    "respect",
    "restaurant",
    "rester",
    "reussir",
    "reve",
    "rideau",
    "riviere",
    "riz",
    "robe",
    "roche",
    "roi",
    "rose",
    "roue",
    "rouge",
    "route",
    "rue",
    "rugby",
    "rythme",
    "sable",
    "sac",
    "sagesse",
    "saison",
    "salade",
    "sale",
    "salle",
    "salon",
    "saluer",
    "samedi",
    "sandale",
    "sang",
    "sauce",
    "saut",
    "sauter",
    "savane",
    "savon",
    "saxophone",
    "scooter",
    "seconde",
    "secret",
    "seize",
    "sel",
    "semaine",
    "sept",
    "septembre",
    "serieux",
    "serpent",
    "serviette",
    "seul",
    "shampooing",
    "short",
    "siecle",
    "simple",
    "six",
    "ski",
    "soeur",
    "soir",
    "sol",
    "soldat",
    "soleil",
    "solution",
    "sommeil",
    "sortir",
    "soupe",
    "source",
    "souris",
    "souvenir",
    "souvent",
    "special",
    "sport",
    "sportif",
    "stade",
    "statue",
    "stress",
    "stupide",
    "stylo",
    "sucre",
    "sur",
    "surprise",
    "table",
    "tableau",
    "taille",
    "talon",
    "tambour",
    "tapis",
    "tarte",
    "tasse",
    "taxi",
    "telephone",
    "television",
    "tempete",
    "temps",
    "tennis",
    "terrain",
    "terrasse",
    "terre",
    "tete",
    "the",
    "theatre",
    "tigre",
    "timbre",
    "timide",
    "toit",
    "tomate",
    "tonnerre",
    "tortue",
    "toujours",
    "tracteur",
    "train",
    "tramway",
    "travail",
    "travailler",
    "treize",
    "trente",
    "triste",
    "tristesse",
    "trois",
    "trompette",
    "tronc",
    "trophee",
    "trottinette",
    "trousse",
    "trouver",
    "turquoise",
    "un",
    "utile",
    "vacances",
    "vache",
    "valeur",
    "valise",
    "vallee",
    "vanille",
    "vase",
    "velo",
    "vendeur",
    "vendre",
    "vendredi",
    "vent",
    "ventre",
    "verite",
    "verre",
    "vert",
    "veste",
    "viande",
    "victoire",
    "vieux",
    "village",
    "ville",
    "vin",
    "vingt",
    "violet",
    "violon",
    "visage",
    "visiter",
    "vitesse",
    "voile",
    "voisin",
    "voiture",
    "volant",
    "voler",
    "volley",
    "voyage",
    "voyager",
    "vrai",
    "yaourt"
];

    const MOTS_EN = [
    "apple", "airplane", "alarm", "animal", "answer", "arrow", "autumn", "baby", "backpack", "bakery",
    "balloon", "banana", "basket", "beach", "bicycle", "birthday", "blanket", "bottle", "bridge", "brother",
    "bubble", "butter", "butterfly", "cabin", "camera", "candle", "captain", "carpet", "castle", "chair",
    "cheese", "cherry", "chicken", "chocolate", "circle", "circus", "clock", "cloud", "coffee", "computer",
    "cookie", "cotton", "country", "cousin", "crayon", "crocodile", "curtain", "dancer", "desert", "diamond",
    "dinner", "doctor", "dolphin", "donkey", "dragon", "dream", "eagle", "elephant", "engine", "evening",
    "family", "farmer", "feather", "finger", "flower", "forest", "friend", "garden", "giraffe", "glasses",
    "guitar", "hammer", "harbor", "helmet", "holiday", "honey", "horse", "hospital", "island", "jacket",
    "jungle", "kangaroo", "kettle", "kitchen", "kitten", "ladder", "lantern", "laptop", "lemon", "library",
    "lighthouse", "lion", "magic", "mailbox", "market", "meadow", "melon", "mirror", "monkey", "morning",
    "mountain", "mushroom", "music", "napkin", "needle", "notebook", "ocean", "orange", "package", "painter",
    "panda", "parrot", "peanut", "pencil", "penguin", "picture", "pillow", "pirate", "planet", "pocket",
    "potato", "pumpkin", "puzzle", "rabbit", "rainbow", "river", "robot", "rocket", "sailor", "salad",
    "sandwich", "school", "season", "shadow", "silver", "singer", "sister", "snowman", "spider", "spring",
    "squirrel", "station", "storm", "strawberry", "summer", "sunshine", "supper", "teacher", "teapot", "thunder",
    "ticket", "tiger", "tomato", "tractor", "train", "treasure", "trumpet", "turtle", "umbrella", "valley",
    "village", "violin", "volcano", "waiter", "walnut", "weather", "whale", "window", "winter", "wizard",
    "wolf", "yellow", "zebra", "adventure", "battery", "bookshelf", "calendar", "camping", "champion", "chimney",
    "compass", "concert", "courage", "cucumber", "daughter", "elevator", "explorer", "fireplace", "football", "freedom",
    "goldfish", "hamburger", "keyboard", "language", "mermaid", "network", "program", "software", "website", "browser"
    ];

    // -------------------- ÉTAT DU JEU --------------------

    let motOriginal = "";
    let mot = "";
    let penalite = 0;
    let nombreTentatives = 0;
    let lettresTentees = new Set();
    let lettresDevinees = new Set();
    let saisie = "";
    let message = "";
    let finMessage = 0;
    let etat = "accueil";
    let victoire = false;
    let texteScore = "";
    let zonesTouches = [];

    // -------------------- OUTILS --------------------

    function nettoyage(texte) {
        return texte
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z]/g, "");
    }

    function entreeValide(texte) {
        return /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/u.test(texte);
    }

    function choisirMot() {
        const liste = language === "en" ? MOTS_EN : MOTS;

        return liste[Math.floor(Math.random() * liste.length)];
    }

    function preparerNouveauMot() {
        motOriginal = choisirMot();
        mot = nettoyage(motOriginal);
        penalite = 0;
        nombreTentatives = 0;
        lettresTentees = new Set();
        lettresDevinees = new Set();
        saisie = "";
        message = "";
        finMessage = 0;
        victoire = false;
        texteScore = "";
    }

    function retourAccueil() {
        preparerNouveauMot();
        etat = "accueil";
    }

    function demarrerPartie() {
        penalite = 0;
        nombreTentatives = 0;
        lettresTentees = new Set();
        lettresDevinees = new Set();
        saisie = "";
        message = "";
        finMessage = 0;
        victoire = false;
        texteScore = "";
        etat = "jeu";
    }

    function rejouer() {
        preparerNouveauMot();
        etat = "jeu";
    }

    function motAffiche() {
        return [...mot]
            .map((lettre) => lettresDevinees.has(lettre) ? lettre.toUpperCase() : "_")
            .join(" ");
    }

    function motTrouve() {
        return [...new Set(mot)].every((lettre) => lettresDevinees.has(lettre));
    }

    function afficherMessageTemporaire(texte) {
        message = texte;
        finMessage = performance.now() + 3000;
    }

    function traiterTentative(tentativeBrute) {
        const brute = tentativeBrute.trim();

        if (!brute || !entreeValide(brute)) {
            afficherMessageTemporaire(t.invalid);
            return;
        }

        const tentative = nettoyage(brute);

        if (!tentative) {
            afficherMessageTemporaire(t.invalid);
            return;
        }

        nombreTentatives += 1;

        if (tentative.length === 1) {
            if (lettresTentees.has(tentative)) {
                afficherMessageTemporaire(t.already);
                return;
            }

            lettresTentees.add(tentative);

            if (mot.includes(tentative)) {
                lettresDevinees.add(tentative);
            } else {
                penalite += 1;
            }
        } else if (tentative === mot) {
            terminerPartie(true);
            return;
        } else {
            penalite += 5;
        }

        if (motTrouve()) {
            terminerPartie(true);
        } else if (penalite >= MAX_PENALITES) {
            penalite = Math.min(penalite, MAX_PENALITES);
            terminerPartie(false);
        }
    }

    // -------------------- SCORE --------------------

    function lireMeilleurScore() {
        try {
            const contenu = localStorage.getItem(SCORE_KEY);

            if (!contenu) {
                return null;
            }

            const score = JSON.parse(contenu);

            if (!Number.isInteger(score.tentatives) || !score.date) {
                return null;
            }

            return score;
        } catch (error) {
            return null;
        }
    }

    function enregistrerScore() {
        try {
            const date = new Date().toISOString().slice(0, 10);
            localStorage.setItem(
                SCORE_KEY,
                JSON.stringify({ tentatives: nombreTentatives, date: date })
            );
            return date;
        } catch (error) {
            return new Date().toISOString().slice(0, 10);
        }
    }

    function texteMeilleurScore(gagne) {
        const ancien = lireMeilleurScore();

        if (gagne && (!ancien || nombreTentatives < ancien.tentatives)) {
            enregistrerScore();
            return t.newBest;
        }

        if (!ancien) {
            return t.noBest;
        }

        return t.best(ancien.tentatives, ancien.date);
    }

    function terminerPartie(gagne) {
        victoire = gagne;
        texteScore = texteMeilleurScore(gagne);
        etat = "fin";
        saisie = "";
        message = "";
    }

    // -------------------- DESSIN GÉNÉRIQUE --------------------

    function rectangleArrondi(x, y, largeur, hauteur, rayon, remplissage, bordure = null, epaisseur = 1) {
        ctx.beginPath();
        ctx.roundRect(x, y, largeur, hauteur, rayon);

        if (remplissage) {
            ctx.fillStyle = remplissage;
            ctx.fill();
        }

        if (bordure) {
            ctx.lineWidth = epaisseur;
            ctx.strokeStyle = bordure;
            ctx.stroke();
        }
    }

    function texte(texteAffiche, x, y, taille = 30, couleur = NOIR, alignement = "left") {
        ctx.font = `${taille}px Avenir, "Avenir Next", sans-serif`;
        ctx.fillStyle = couleur;
        ctx.textAlign = alignement;
        ctx.textBaseline = "top";
        ctx.fillText(texteAffiche, x, y);
    }

    function texteCentre(texteAffiche, y, taille = 30, couleur = NOIR) {
        texte(texteAffiche, canvas.width / 2, y, taille, couleur, "center");
    }

    // -------------------- POTENCE ET PERSONNAGE --------------------

    function ligne(depart, arrivee, couleur, epaisseur = 5) {
        ctx.beginPath();
        ctx.moveTo(depart[0], depart[1]);
        ctx.lineTo(arrivee[0], arrivee[1]);
        ctx.strokeStyle = couleur;
        ctx.lineWidth = epaisseur;
        ctx.stroke();
    }

    function dessinerPotence() {
        const segments = [
            [1, [150, 500], [250, 500]],
            [2, [250, 500], [350, 500]],
            [3, [200, 500], [200, 100]],
            [4, [200, 100], [300, 100]],
            [5, [200, 130], [240, 100]],
            [6, [300, 100], [300, 150]]
        ];

        segments.forEach(([seuil, depart, arrivee]) => {
            if (penalite >= seuil) {
                ligne(depart, arrivee, MARRON, 5);
            }
        });
    }

    function dessinerHomme() {
        if (penalite >= 7) {
            ctx.beginPath();
            ctx.arc(300, 200, 50, 0, Math.PI * 2);
            ctx.strokeStyle = ROUGE;
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        const segments = [
            [8, [300, 250], [300, 400]],
            [9, [300, 260], [250, 310]],
            [10, [300, 260], [350, 310]],
            [11, [300, 400], [250, 450]],
            [12, [300, 400], [350, 450]]
        ];

        segments.forEach(([seuil, depart, arrivee]) => {
            if (penalite >= seuil) {
                ligne(depart, arrivee, ROUGE, 5);
            }
        });
    }

    function dessinerLogoPendu(centreX, haut) {
        const gauche = centreX - 30;
        const bas = haut + 70;

        ligne([gauche - 15, bas], [gauche + 45, bas], MARRON, 5);
        ligne([gauche, bas], [gauche, haut], MARRON, 5);
        ligne([gauche, haut], [gauche + 50, haut], MARRON, 5);
        ligne([gauche, haut + 20], [gauche + 20, haut], MARRON, 4);
        ligne([gauche + 50, haut], [gauche + 50, haut + 22], NOIR, 3);

        ctx.beginPath();
        ctx.arc(gauche + 50, haut + 32, 10, 0, Math.PI * 2);
        ctx.strokeStyle = ROUGE;
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // -------------------- CLAVIER --------------------

    function couleurTouche(lettre) {
        const minuscule = lettre.toLowerCase();

        if (!lettresTentees.has(minuscule)) {
            return FOND_CLAIR;
        }

        return mot.includes(minuscule) ? VERT_CLAIR : ROUGE_CLAIR;
    }

    function dessinerClavier() {
        zonesTouches = [];

        LIGNES_CLAVIER.forEach((ligneClavier, numeroLigne) => {
            const largeurLigne = ligneClavier.length * (TOUCHE_LARGEUR + TOUCHE_ECART) - TOUCHE_ECART;
            const xDepart = CLAVIER_X + (CLAVIER_LARGEUR - largeurLigne) / 2;
            const y = CLAVIER_Y + numeroLigne * (TOUCHE_HAUTEUR + TOUCHE_ECART);

            [...ligneClavier].forEach((lettre, numero) => {
                const x = xDepart + numero * (TOUCHE_LARGEUR + TOUCHE_ECART);

                rectangleArrondi(
                    x,
                    y,
                    TOUCHE_LARGEUR,
                    TOUCHE_HAUTEUR,
                    8,
                    couleurTouche(lettre),
                    GRIS,
                    2
                );

                texte(lettre, x + TOUCHE_LARGEUR / 2, y + 10, 30, NOIR, "center");

                zonesTouches.push({
                    lettre: lettre.toLowerCase(),
                    x: x,
                    y: y,
                    largeur: TOUCHE_LARGEUR,
                    hauteur: TOUCHE_HAUTEUR
                });
            });
        });
    }

    // -------------------- BARRE DE PÉNALITÉS --------------------

    function couleurBarre(rapport) {
        if (rapport < 1 / 3) {
            return VERT;
        }

        if (rapport < 2 / 3) {
            return ORANGE;
        }

        return ROUGE;
    }

    function dessinerBarrePenalites(x, y, largeur, hauteur) {
        const rapport = Math.min(penalite / MAX_PENALITES, 1);

        rectangleArrondi(x, y, largeur, hauteur, 10, FOND_CLAIR);

        if (rapport > 0) {
            rectangleArrondi(x, y, largeur * rapport, hauteur, 10, couleurBarre(rapport));
        }

        rectangleArrondi(x, y, largeur, hauteur, 10, null, NOIR, 2);
    }

    // -------------------- ÉCRANS --------------------

    function afficherAccueil() {
        ctx.fillStyle = FOND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        dessinerLogoPendu(canvas.width / 2, 25);
        texteCentre(t.title, 120, 50, NOIR);
        texteCentre(t.subtitle, 190, 30, NOIR);

        rectangleArrondi(300, 245, 600, 205, 14, null, MARRON, 4);
        texteCentre(t.penaltiesAllowed, 270, 30, NOIR);
        texteCentre(t.badLetter, 320, 30, NOIR);
        texteCentre(t.badWord, 360, 30, NOIR);
        texteCentre(t.wordLength(mot.length), 410, 30, NOIR);
        texteCentre(t.start, 520, 30, VERT);
        texteCentre(t.escapeWelcome, 570, 24, GRIS);
    }

    function afficherJeu() {
        ctx.fillStyle = FOND;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        dessinerPotence();
        dessinerHomme();
        dessinerClavier();

        texte(t.penalties(penalite), 620, 50, 30, NOIR);
        dessinerBarrePenalites(620, 85, CLAVIER_LARGEUR, 26);
        texte(t.chances(Math.max(MAX_PENALITES - penalite, 0)), 620, 130, 30, NOIR);
        texte(t.attempts(nombreTentatives), 620, 165, 30, GRIS);

        texte(t.word(motAffiche()), 50, 612, 46, NOIR);
        ctx.font = "30px Avenir, 'Avenir Next', sans-serif";
        const xBoite = Math.max(260, 50 + ctx.measureText(t.proposal).width + 20);

        texte(t.proposal, 50, 708, 30, NOIR);

        rectangleArrondi(xBoite, 695, 400, 42, 8, FOND_CLAIR, MARRON, 3);
        texte(saisie.toUpperCase(), xBoite + 12, 704, 30, NOIR);

        if (Math.floor(performance.now() / 500) % 2 === 0) {
            ctx.font = "30px Avenir, 'Avenir Next', sans-serif";
            const largeurSaisie = ctx.measureText(saisie.toUpperCase()).width;
            const xCurseur = xBoite + 14 + largeurSaisie;
            ligne([xCurseur, 703], [xCurseur, 729], NOIR, 2);
        }

        if (message && performance.now() <= finMessage) {
            ctx.font = "30px Avenir, 'Avenir Next', sans-serif";
            const largeur = ctx.measureText(message).width;
            const cadreLargeur = largeur + 40;
            const cadreX = (canvas.width - cadreLargeur) / 2;

            rectangleArrondi(cadreX, 540, cadreLargeur, 50, 10, FOND_MESSAGE, ROUGE, 2);
            texteCentre(message, 550, 30, NOIR);
        } else if (message) {
            message = "";
        }
    }

    function afficherFin() {
        ctx.fillStyle = victoire ? FOND_VICTOIRE : FOND_DEFAITE;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.save();
        ctx.translate(-100, 130);
        dessinerPotence();
        dessinerHomme();
        ctx.restore();

        if (victoire) {
            texteCentre(t.victory, 150, 50, VERT);
            texteCentre(t.survive, 230, 30, NOIR);
            texteCentre(texteScore, 310, 30, NOIR);
        } else {
            texteCentre(t.defeat, 150, 50, NOIR);
            texteCentre(t.badLuck, 230, 30, NOIR);
            texteCentre(t.hanged, 280, 30, NOIR);
            texteCentre(texteScore, 350, 30, NOIR);
        }

        texteCentre(t.wordWas(motOriginal.toUpperCase()), 450, 30, NOIR);
        texteCentre(t.replay, 535, 30, VERT);
        texteCentre(t.escapeEnd, 585, 24, GRIS);
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

    // -------------------- SOURIS --------------------

    function coordonneesSouris(event) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: (event.clientX - rect.left) * (canvas.width / rect.width),
            y: (event.clientY - rect.top) * (canvas.height / rect.height)
        };
    }

    canvas.addEventListener("click", function(event) {
        canvas.focus();

        if (etat === "fin") {
            rejouer();
            return;
        }

        if (etat !== "jeu") {
            return;
        }

        const souris = coordonneesSouris(event);
        const touche = zonesTouches.find((zone) =>
            souris.x >= zone.x
            && souris.x <= zone.x + zone.largeur
            && souris.y >= zone.y
            && souris.y <= zone.y + zone.hauteur
        );

        if (touche) {
            traiterTentative(touche.lettre);
        }
    });

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
            retourAccueil();
            return;
        }

        if (etat === "accueil") {
            if (event.key === "Enter") {
                event.preventDefault();
                demarrerPartie();
            }
            return;
        }

        if (etat === "fin") {
            if (event.key === "Enter") {
                event.preventDefault();
                rejouer();
            }
            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();
            saisie = saisie.slice(0, -1);
            return;
        }

        if (event.key === "Enter") {
            event.preventDefault();
            const tentative = saisie;
            saisie = "";
            traiterTentative(tentative);
            return;
        }

        if (/^[A-Za-zÀ-ÖØ-öø-ÿ]$/u.test(event.key)) {
            event.preventDefault();
            saisie += event.key;
        }
    });

    // -------------------- BOUCLE D'ANIMATION --------------------

    function animation() {
        dessiner();
        requestAnimationFrame(animation);
    }

    preparerNouveauMot();
    requestAnimationFrame(animation);
    setTimeout(() => canvas.focus(), 0);
})();
