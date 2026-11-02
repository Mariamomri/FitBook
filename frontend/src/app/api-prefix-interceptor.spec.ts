import { enleverPrefixe } from './api-prefix-interceptor';

describe('enleverPrefixe (API en ligne dans un sous-dossier)', () => {
  it('enlève /Fitbook des IRI, même dans les objets et tableaux imbriqués', () => {
    const reponse = {
      '@id': '/Fitbook/api/cours',
      member: [{ '@id': '/Fitbook/api/cours/1', coach: '/Fitbook/api/coaches/12', titre: 'Yoga' }],
    };
    expect(enleverPrefixe(reponse, '/Fitbook')).toEqual({
      '@id': '/api/cours',
      member: [{ '@id': '/api/cours/1', coach: '/api/coaches/12', titre: 'Yoga' }],
    });
  });

  it('ne touche pas aux autres textes, nombres et valeurs vides', () => {
    expect(enleverPrefixe('/Fitbook/images/a.jpg', '/Fitbook')).toBe('/Fitbook/images/a.jpg');
    expect(enleverPrefixe(42, '/Fitbook')).toBe(42);
    expect(enleverPrefixe(null, '/Fitbook')).toBeNull();
  });
});
