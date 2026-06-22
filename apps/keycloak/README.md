# Keycloak — Thème personnalisé (Keycloakify)

Ce package contient le thème Keycloak de NeoCivis, construit avec **Keycloakify v11**. Il remplace les pages d'authentification natives de Keycloak (login, reset de mot de passe, etc.) par des pages React stylées avec la charte graphique du projet.

## Rôle dans le projet

Keycloak est l'IAM (Identity and Access Management) de NeoCivis. Il gère :
- L'authentification des citoyens (citizen-app) et des agents municipaux (town-hall-web)
- L'émission des JWT Bearer tokens consommés par le backend
- Les événements de cycle de vie des comptes (`access.REGISTER`, `access.UPDATE`, `access.DELETE`) envoyés via webhook au backend pour synchroniser la table `users`

Ce thème s'applique aux pages que Keycloak affiche directement dans le navigateur (login, mot de passe oublié, mise à jour du profil, etc.).

## Stack

| Composant | Technologie |
|-----------|-------------|
| Générateur de thème | Keycloakify v11 |
| UI | React 19 + Tailwind CSS v4 + @base-ui/react |
| Build | Vite |
| Dev / prévisualisation | Storybook (port 6008) |

## Développement

```bash
# Depuis apps/keycloak/
bun dev    # démarre Storybook pour prévisualiser les pages du thème
```

Storybook permet de développer et tester chaque page Keycloak (Login, Reset Password, etc.) sans avoir besoin d'une instance Keycloak active.

---

## Deploy themes

### Build the theme

```bash
cd apps/keycloak
npm install
npm run build-keycloak-theme
```

### Deploy the theme
To deploy copy the file on the server where Keycloak is running, for example in `/home/<user>` .
```bash
scp ./dist_keycloak/keycloak-theme-for-kc-all-other-versions.jar <user>@<keycloak-server>:/home/<user>/
```

If need move it to the right place
```bash
mv /home/<user>/keycloak-theme-for-kc-all-other-versions.jar <keycloak-installation-dir>/providers/
```

Rename the file to `keycloak-theme-for-kc-all-other-versions.jar` to `keycloak-theme.jar`
```bash
mv ./keycloak-theme-for-kc-all-other-versions.jar ./keycloak-theme.jar
```

### Restart Keycloak

First build the theme with keycloak.
```bash
<keycloak-installation-dir>/bin/kc.sh build --db postgres
```

Then restart the server.
```bash
<keycloak-installation-dir>/bin/kc.sh stop
<keycloak-installation-dir>/bin/kc.sh start-dev
```
Or with
```bash
systemctl restart keycloak
```