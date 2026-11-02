// Test de charge et de stress de l'API FitBook avec k6
// Lancement (depuis le dossier backend) :
//   K6_WEB_DASHBOARD=true K6_WEB_DASHBOARD_EXPORT=tests/stress/rapport-stress.html k6 run tests/stress/test-stress.js
// Les courbes sont enregistrées dans tests/stress/rapport-stress.html

import http from "k6/http";
import { check, sleep } from "k6";

const URL = __ENV.URL || "https://127.0.0.1:8000";

export const options = {
    insecureSkipTLSVerify: true, // certificat local de Symfony
    // Montée progressive du nombre d'utilisateurs simultanés
    stages: [
        { duration: "30s", target: 10 }, // charge normale
        { duration: "30s", target: 25 }, // charge élevée
        { duration: "30s", target: 50 }, // stress
        { duration: "30s", target: 0 }, // retour au calme
    ],
    // Objectifs : 95 % des réponses en moins de 2 s et moins de 5 % d'erreurs
    thresholds: {
        http_req_duration: ["p(95)<2000"],
        http_req_failed: ["rate<0.05"],
    },
};

// Une fois au début : connexion d'un sportif pour récupérer le token JWT
export function setup() {
    const reponse = http.post(
        `${URL}/api/login_check`,
        JSON.stringify({
            username: "emma.janssens@gmail.com",
            password: "julien123",
        }),
        { headers: { "Content-Type": "application/json" } },
    );
    return { token: reponse.json("token") };
}

// Parcours d'un utilisateur : pages publiques puis son profil
export default function (donnees) {
    const pagesPubliques = [
        "/api/salles",
        "/api/cours",
        "/api/seances",
        "/api/coaches",
        "/api/activites",
    ];
    for (const page of pagesPubliques) {
        const reponse = http.get(URL + page, { tags: { page } });
        check(reponse, { [`${page} répond 200`]: (r) => r.status === 200 });
    }

    const reponse = http.get(`${URL}/api/me`, {
        headers: { Authorization: `Bearer ${donnees.token}` },
        tags: { page: "/api/me" },
    });
    check(reponse, { "/api/me répond 200": (r) => r.status === 200 });

    sleep(1); // temps de lecture de la page
}
