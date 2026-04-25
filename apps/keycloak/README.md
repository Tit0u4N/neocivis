# Keycloak Configuration

## Deploy themes

### Build the theme

```bash
cd apps/keycloak
npm install
npm run build-keycloack-theme
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