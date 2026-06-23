# Laurent 360

Tableau de bord personnel, mobile-first, basé sur [Tabler](https://github.com/tabler/tabler), pour piloter un programme de transformation santé sur 36 semaines.

## Fonctions

- vue quotidienne orientée prochaine action ;
- poids, tour de taille, pas, sommeil, énergie, douleur et humeur ;
- objectifs SMART et jalons S2, S6, S12, S18, S24 et S36 ;
- check-in texte, dictée vocale et photos privées ;
- coach local, défis adaptatifs, XP, niveaux, badges et encouragements ;
- graphiques ApexCharts et journal filtrable ;
- export/import JSON ;
- endpoint d'agent externe configurable ;
- PWA légère et fonctionnement hors connexion après première visite.

## Vie privée

Le dépôt contient uniquement le code et des données fictives de démonstration. Les données réelles sont conservées dans `localStorage` sur l'appareil. Les photos sont compressées et conservées localement. Elles ne sont jamais commitées sur GitHub.

GitHub Pages étant statique, ne jamais ajouter une clé API secrète dans le navigateur. L'agent externe doit être exposé par une fonction backend sécurisée, par exemple une Supabase Edge Function ou une Vercel Function.

## Agent externe

Le format d'échange est documenté dans [`AGENT_CONTRACT.md`](./AGENT_CONTRACT.md). L'URL de l'endpoint se configure dans l'interface. Sans endpoint, un coach déterministe local reste actif.

## Développement local

```bash
python -m http.server 8080
```

Puis ouvrir `http://localhost:8080/laurent-360/` depuis la racine du dépôt.

## Limite médicale

Cette application soutient le suivi, la motivation et l'organisation. Elle ne pose pas de diagnostic et ne remplace pas un professionnel de santé.
