<?php

namespace App\Controller;

use Opis\JsonSchema\Errors\ErrorFormatter;
use Opis\JsonSchema\Validator;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

class ContactController extends AbstractController
{
    #[Route('/api/contact', name: 'api_contact', methods: ['POST'])]
    public function contact(Request $request): JsonResponse
    {
        // 1. Lire le JSON envoyé par le formulaire
        $donnees = json_decode($request->getContent());

        // 2. Vérifier que le JSON est valide
        if (json_last_error() !== JSON_ERROR_NONE) {
            return $this->json(['message' => 'JSON invalide : ' . json_last_error_msg()], 400);
        }

        // 3. Valider les données avec le JSON Schema
        $schema = file_get_contents($this->getParameter('kernel.project_dir') . '/config/schemas/contact.json');

        $validator = new Validator();
        $validator->setMaxErrors(10);
        $validator->setStopAtFirstError(false);
        $resultat = $validator->validate($donnees, $schema);

        if (!$resultat->isValid()) {
            // Un message en français pour chaque champ
            $messages = [
                'sujet' => 'Choisissez un sujet dans la liste',
                'nom' => 'Nom invalide : commencez par une majuscule, lettres uniquement',
                'email' => "Format d'email invalide",
                'profil' => 'Choisissez votre profil dans la liste',
                'specialite' => '100 caractères maximum',
                'message' => 'Le message doit contenir entre 20 et 1000 caractères',
                'rgpd' => 'Vous devez accepter la politique de confidentialité',
            ];

            $erreurs = [];
            foreach ((new ErrorFormatter())->format($resultat->error()) as $chemin => $details) {
                $champ = ltrim($chemin, '/');
                if (isset($messages[$champ])) {
                    $erreurs[$champ] = $messages[$champ];
                }
            }

            // Champs manquants : aucune erreur sur un champ précis
            if (empty($erreurs)) {
                $erreurs['formulaire'] = 'Certains champs obligatoires sont manquants';
            }

            return $this->json(['message' => 'Formulaire invalide', 'erreurs' => $erreurs], 422);
        }

        return $this->json(['message' => 'Votre message a bien été envoyé'], 200);
    }
}
