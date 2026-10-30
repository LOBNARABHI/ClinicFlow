# ClinicFlow

Petite application web pour gérer les patients et les rendez-vous d'une clinique : base PostgreSQL, API Express et interface React.

Ce que l'appli permet de faire :

- se connecter avec un email et un mot de passe (deux rôles : `admin` et `staff`)
- ajouter, modifier et rechercher des patients (par nom ou par CIN), avec pagination
- supprimer un patient, mais seulement en tant qu'admin
- créer des rendez-vous, les filtrer par date ou statut, et changer leur statut
- voir un petit dashboard : total des patients, rendez-vous du jour, nombre de pending et de confirmed

Un patient ne peut pas avoir deux rendez-vous confirmés à moins de 30 minutes d'écart. La règle est vérifiée dans l'API et aussi directement par PostgreSQL.

## Pour lancer le projet

Il faut Node.js 20.19 ou plus récent, PostgreSQL 15 ou plus, et npm.

### 1. Créer la base

Dans `psql`, en étant connecté avec le compte `postgres` :

```sql
CREATE USER clinic_user WITH PASSWORD 'motdepasse';
CREATE DATABASE clinicflow OWNER clinic_user;
\c clinicflow
GRANT ALL ON SCHEMA public TO clinic_user;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gist;
```

Les deux extensions demandent les droits superutilisateur, c'est pour ça qu'on les crée ici et pas dans la migration.

### 2. Le backend

```bash
cd test_technique_backend
npm install
cp .env.example .env
```

Sous PowerShell, la copie se fait avec `Copy-Item .env.example .env`. Le fichier `.env` contient :

```
DATABASE_URL=postgresql://clinic_user:motdepasse@localhost:5432/clinicflow
JWT_SECRET=changez_moi
PORT=5000
```

Ensuite on crée les tables, on charge les données de test et on démarre :

```bash
npm run migrate:up
npm run seed
npm run dev
```

L'API tourne sur http://localhost:5000.

### 3. Le frontend

Dans un deuxième terminal :

```bash
cd test_technique_frontend
npm install
cp .env.example .env
npm run dev
```

Le `.env` du frontend ne contient qu'une ligne : `VITE_API_URL=http://localhost:5000/api`. L'appli est sur http://localhost:5173.

## Comptes de test

Le seed crée 1 admin, 2 staff, 5 patients et 10 rendez-vous de statuts variés.

| Rôle  | Email                 | Mot de passe |
|-------|-----------------------|--------------|
| admin | admin@clinicflow.com  | Admin123!    |
| staff | staff1@clinicflow.com | Staff123!    |
| staff | staff2@clinicflow.com | Staff123!    |

On peut relancer `npm run seed` quand on veut, il vide les tables avant de réinsérer (donc il efface aussi les données ajoutées à la main).

## Commandes du backend

- `npm run migrate:up` applique les migrations
- `npm run migrate:down` annule la dernière
- `npm run seed` charge les données de test
- `npm run db:check` vérifie la connexion à PostgreSQL
- `npm run dev` lance le serveur avec rechargement automatique

## L'API

Tout est sous `/api` et demande un token JWT (header `Authorization: Bearer <token>`), sauf le login.

- `POST /auth/login` et `GET /auth/me`
- `POST /patients`, `GET /patients?search=&page=&limit=`, `GET /patients/:id`, `GET /patients/:id/appointments`, `PUT /patients/:id`
- `DELETE /patients/:id` réservé à l'admin
- `POST /appointments`, `GET /appointments?date=&status=`, `PATCH /appointments/:id/status`
- `GET /dashboard/stats`

Les erreurs renvoient les codes HTTP habituels : 400 pour une validation qui échoue, 401 sans token valide, 403 si le rôle ne suffit pas, 404 si la ressource n'existe pas, 409 pour un doublon de CIN ou un conflit de rendez-vous.

## Quelques choix que j'ai faits

- Des UUID comme clés primaires.
- La suppression d'un patient est logique (colonne `deleted_at`), pour ne pas perdre l'historique de ses rendez-vous. Les clés étrangères sont en `ON DELETE RESTRICT`. Le CIN est unique seulement parmi les patients non supprimés.
- `role` et `status` sont des types ENUM PostgreSQL.
- La recherche par nom s'appuie sur un index `pg_trgm`, et il y a des index sur la date, le statut et le patient des rendez-vous.
- Le backend est découpé en routes, controllers et services. La validation se fait avec Zod et les erreurs passent par un seul middleware.

Le détail de la conception (diagramme, relations, contraintes) est dans le dossier `docs`.

## Ce que je ferais ensuite

- Mettre le token dans un cookie HttpOnly plutôt que dans le `localStorage`.
- Relire le rôle de l'utilisateur en base à chaque requête : pour l'instant il est lu dans le token, valable un jour.
- Gérer proprement les fuseaux horaires : « aujourd'hui » dépend du fuseau du serveur PostgreSQL.
- Ajouter des tests (Jest et Supertest), un Docker Compose et une doc Swagger.
