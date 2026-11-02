<?php

namespace App\Controller;

use App\Entity\Coach;
use App\Entity\Salle;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ImageController extends AbstractController
{
  // Photo d'une salle : seulement son gestionnaire ou un admin
  #[Route('/api/salles/{id}/image', name: 'api_salle_image', methods: ['POST'])]
  public function salle(Salle $salle, Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse
  {
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

    if (!$this->isGranted('ROLE_ADMIN') && $salle->getGestionnaire() !== $this->getUser()) {
      return $this->json(['message' => 'Vous ne pouvez modifier que vos propres salles.'], 403);
    }

    $fichier = $request->files->get('imageFile');
    $erreur = $this->verifierImage($fichier, $validator);
    if ($erreur !== null) {
      return $this->json(['message' => $erreur], 422);
    }

    $salle->setImageFile($fichier);
    $entityManager->flush();

    return $this->json(['message' => 'Photo enregistrée.', 'imageName' => $salle->getImageName()]);
  }

  // Photo d'un coach : seulement le coach lui-même ou un admin
  #[Route('/api/coaches/{id}/image', name: 'api_coach_image', methods: ['POST'])]
  public function coach(Coach $coach, Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse
  {
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

    if (!$this->isGranted('ROLE_ADMIN') && $coach->getUser() !== $this->getUser()) {
      return $this->json(['message' => 'Vous ne pouvez modifier que votre propre photo.'], 403);
    }

    $fichier = $request->files->get('imageFile');
    $erreur = $this->verifierImage($fichier, $validator);
    if ($erreur !== null) {
      return $this->json(['message' => $erreur], 422);
    }

    $coach->setImageFile($fichier);
    $entityManager->flush();

    return $this->json(['message' => 'Photo enregistrée.', 'imageName' => $coach->getImageName()]);
  }

  // Photo de profil de l'utilisateur connecté
  #[Route('/api/me/image', name: 'api_me_image', methods: ['POST'])]
  public function profil(Request $request, EntityManagerInterface $entityManager, ValidatorInterface $validator): JsonResponse
  {
    $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

    /** @var User $user */
    $user = $this->getUser();

    $fichier = $request->files->get('imageFile');
    $erreur = $this->verifierImage($fichier, $validator);
    if ($erreur !== null) {
      return $this->json(['message' => $erreur], 422);
    }

    $user->setImageFile($fichier);
    $entityManager->flush();

    return $this->json(['message' => 'Photo enregistrée.', 'imageName' => $user->getImageName()]);
  }

  // Vérifie qu'un fichier a été envoyé et que c'est une image JPG, PNG ou WEBP de 2 Mo maximum
  private function verifierImage(?UploadedFile $fichier, ValidatorInterface $validator): ?string
  {
    $erreurs = $validator->validate($fichier, [
      new Assert\NotNull(message: 'Aucune photo envoyée.'),
      new Assert\Image(
        maxSize: '2M',
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSizeMessage: 'La photo ne doit pas dépasser 2 Mo.',
        mimeTypesMessage: 'Formats acceptés : JPG, PNG ou WEBP.',
      ),
    ]);

    return count($erreurs) > 0 ? $erreurs[0]->getMessage() : null;
  }
}
