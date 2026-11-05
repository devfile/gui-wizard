[![Contribute](https://www.eclipse.org/che/contribute.svg)](https://workspaces.openshift.com#https://github.com/devfile/gui-wizard)
[![Dev](https://img.shields.io/static/v1?label=Open%20in&message=Che%20dogfooding%20server%20(with%20VS%20Code)&logo=eclipseche&color=FDB940&labelColor=525C86)](https://che-dogfooding.apps.che-dev.x6e0.p1.openshiftapps.com#https://github.com/devfile/gui-wizard)

# Devfile GUI Wizard

A user-friendly, modern web application for creating [devfile 2.3.0](https://devfile.io/) configuration files through an interactive step-by-step wizard interface.

![Devfile Version](https://img.shields.io/badge/devfile-2.3.0-blue)
![React](https://img.shields.io/badge/react-18.3.1-61dafb)
![Tailwind CSS](https://img.shields.io/badge/tailwind-3.4.0-38bdf8)
![Vite](https://img.shields.io/badge/vite-5.4.0-646cff)

## Overview

The Devfile GUI Wizard simplifies the process of creating devfile YAML configurations by providing an intuitive, guided experience. No need to memorize the devfile schema or YAML syntax—just fill out the forms and download your ready-to-use `devfile.yaml`.

## Features

- ✨ **8-Step Wizard Interface** - Guided workflow through all devfile sections
- 🧩 **Complete Devfile 2.3.0 Support** - Every field of the schema, including parent overrides
- 🎯 **Real-time YAML Preview** - See your devfile generated as you type
- ✅ **Built-in Validation** - Schema compliance plus the devfile/api validation rules, reported per step
- 📥 **One-Click Download** - Export your devfile.yaml instantly
- 📋 **Copy to Clipboard** - Quick copy functionality
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile
- ↩️ **Edit Any Step** - Navigate back to modify previous sections
- ⏭️ **Skip Optional Steps** - Streamlined workflow
- 🔄 **Reset Wizard** - Start fresh at any time
- 🎭 **No Backend Required** - Fully client-side application

## Wizard Steps

1. **Basic Information** - Metadata (name, version, description, language, tags, architectures, ...) and devfile attributes
2. **Parent** - Inherit from a parent devfile by URI, registry id or DevWorkspaceTemplate, and override any part of it
3. **Projects** - Projects, starter projects and dependent projects, from Git or Zip sources
4. **Components** - Containers, volumes, Kubernetes and OpenShift resources, and image builds
5. **Commands** - Exec, apply and composite commands, with groups and labels
6. **Events** - Lifecycle event bindings (preStart, postStart, preStop, postStop)
7. **Variables** - Key-value pairs for substitution
8. **Review & Download** - Summary, validation report and download

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18.x or higher
- npm 9.x or higher

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/devfile-gui-wizard.git
   cd devfile-gui-wizard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Development Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install dependencies |
| `npm run dev` | Start development server (with hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run the whole test suite with Playwright |
| `npm run test:unit` | Run the serializer, validator and schema compliance tests |
| `npm run test:e2e` | Run the browser tests |
| `npm run test:ui` | Run tests in interactive UI mode |
| `npm run test:debug` | Run tests in debug mode |

## Testing

The project uses [Playwright](https://playwright.dev/) both for unit tests of the devfile
serializer and validator, and for end-to-end tests of the wizard.

### Running Tests

1. **First time setup** - Install Playwright browsers:
   ```bash
   npx playwright install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Interactive mode** (see tests run in real-time):
   ```bash
   npm run test:ui
   ```

### Test Coverage

The test suite includes:
- **Schema Compliance** - Generated devfiles are validated against the published devfile 2.3.0 JSON
  schema, and the suite fails if any field of that schema cannot be produced by the wizard
- **Serializer and validator** - One test per serialization and validation rule
- **Quarkus Devfile Generation** - Rebuilds the [Quarkus API Example devfile](https://github.com/che-incubator/quarkus-api-example/blob/main/devfile.yaml) through the UI
- **Full UI coverage** - Parent, the three project lists, every component and command type,
  variables, and the validation feedback

See [`tests/README.md`](tests/README.md) for detailed testing documentation.

## OpenShift Deployment

The application can be deployed to OpenShift using Kustomize. The deployment manifests are located in the `openshift/` directory.

### Prerequisites

- OpenShift CLI (`oc`) or Kubernetes CLI (`kubectl`) installed
- Access to an OpenShift cluster
- Container image built and pushed to a registry (automatically built via GitHub Actions)

### Quick Deploy

1. **Set your namespace** (optional):
   ```bash
   oc project your-project-name
   # or create a new project
   oc new-project devfile-gui-wizard
   ```

2. **Deploy using Kustomize**:
   ```bash
   kubectl apply -k openshift
   ```
   
   Or with `oc`:
   ```bash
   oc apply -k openshift
   ```

3. **Get the application URL**:
   ```bash
   oc get route devfile-gui-wizard -o jsonpath='{.spec.host}'
   ```

### Verify Deployment

```bash
# Check deployment status
kubectl get deployment devfile-gui-wizard

# Check pods
kubectl get pods -l app=devfile-gui-wizard

# Check service
kubectl get service devfile-gui-wizard

# Check route (OpenShift)
oc get route devfile-gui-wizard
```

### Customization

The deployment uses the image `ghcr.io/ibuziuk/devfile-gui-wizard:latest` by default. To customize:

1. **Update image tag**: Edit `openshift/kustomization.yaml`:
   ```yaml
   images:
     - name: ghcr.io/ibuziuk/devfile-gui-wizard
       newName: ghcr.io/ibuziuk/devfile-gui-wizard
       newTag: v1.0.0  # or specific commit hash
   ```

2. **Adjust replica count**: Edit `openshift/kustomization.yaml`:
   ```yaml
   replicas:
     - name: devfile-gui-wizard
       count: 3
   ```

3. **Set namespace**: Edit `openshift/kustomization.yaml`:
   ```yaml
   namespace: my-project
   ```

### Preview Changes

Before applying, preview what will be deployed:

```bash
kubectl kustomize openshift
```

### Cleanup

To remove all resources:

```bash
kubectl delete -k openshift
```

## OAuth-protected dev server

`devfile.yaml` runs the Vite dev server behind an [openshift/oauth-proxy](https://github.com/openshift/oauth-proxy)
sidecar, on a dedicated OpenShift Route. Only users who can `get pods` in the workspace
namespace can reach it; the dev server itself is not exposed (`exposure: none`), so it is
reachable only over the pod loopback.

This is meant for internal development on a cluster, not as a general-purpose hardening
recipe. A dedicated Route is needed because both the DevWorkspace basic solver and the Che
gateway put every endpoint on the shared workspace hostname under a rewritten path prefix,
where the `/oauth/callback` path would not route back to the proxy.

### How it is wired

| Piece | Where it lives |
|-------|----------------|
| `oauth-proxy` sidecar, listening on 4180, upstream `127.0.0.1:5173` | `oauth-proxy` container component |
| Service `wizard-oauth` | generated by the operator from the endpoint's `discoverable: true` attribute |
| Route `wizard-oauth` (edge TLS, redirect) | `oauth-proxy-route` OpenShift component, `deployByDefault: true` |
| OAuth client identity | `wizard-oauth` ServiceAccount, created once in the namespace |

The workspace pod keeps the ServiceAccount the DevWorkspace Operator generates for it, so it
keeps its SCC and role bindings. The proxy authenticates as the `wizard-oauth` OAuth client
using that ServiceAccount's token, mounted into the workspace as an automounted secret.

### One-time namespace setup

Run once per namespace, before starting the workspace:

```bash
oc create sa wizard-oauth

# Registers the Route as a valid redirect target, so the callback URL is resolved
# dynamically and never has to be hardcoded.
oc annotate sa wizard-oauth \
  serviceaccounts.openshift.io/oauth-redirectreference.primary='{"kind":"OAuthRedirectReference","apiVersion":"v1","reference":{"kind":"Route","name":"wizard-oauth"}}'

# Token for that OAuth client, automounted into the workspace at /var/run/oauth-client.
oc apply -f - <<'EOF'
apiVersion: v1
kind: Secret
metadata:
  name: wizard-oauth-client
  labels:
    controller.devfile.io/mount-to-devworkspace: "true"
    controller.devfile.io/watch-secret: "true"
  annotations:
    kubernetes.io/service-account.name: wizard-oauth
    controller.devfile.io/mount-as: file
    controller.devfile.io/mount-path: /var/run/oauth-client
type: kubernetes.io/service-account-token
EOF
```

Both labels are required: `mount-to-devworkspace` is what the operator selects on, and
without `watch-secret` the controller's cache never sees the secret. The secret has to exist
before the workspace starts, since automounting happens before inlined OpenShift components
are applied.

Then set the two variables at the top of `devfile.yaml`:

| Variable | Value |
|----------|-------|
| `namespace` | the namespace the workspace runs in — used for `--client-id` and the access check |
| `cookie-secret` | `openssl rand -base64 32` |

Once the workspace is running, the URL is:

```bash
oc get route wizard-oauth -o jsonpath='{.spec.host}{"\n"}'
```

### Notes and troubleshooting

- **`unable to validate against any security context constraint`** — something overrode the
  pod's ServiceAccount. The SCC is bound to the generated `<workspaceID>-sa`; a pod running
  as any other ServiceAccount loses it.
- **`invalid client`** on login — the `namespace` variable does not match the real namespace,
  so `--client-id` names a ServiceAccount that does not exist.
- **403 after logging in** — expected when the user cannot `get pods` in the namespace. Adjust
  the `--openshift-sar` argument to match who should have access.
- **502 with an empty page** — that is oauth-proxy failing to reach the upstream, not the
  router (router errors come with an HTML page). Either the dev server is not running, so run
  the `start-dev-server` command, or it is not on the loopback address the proxy dials. Check
  with `oc logs <workspace-pod> -c oauth-proxy`, which logs the dial error. The
  `start-dev-server` command passes `--host 127.0.0.1` for this reason: Vite's default host is
  `localhost`, which Node may resolve to `::1` only.
- Do not pre-create the `wizard-oauth` Route by hand: the operator refuses to adopt objects it
  does not own and the workspace will fail to start.
- The ServiceAccount token is mounted into every workspace container, including `nodejs-dev`.
- Names are fixed, so two workspaces running this devfile in the same namespace collide on the
  Service and Route.
- Termination is `edge`, so router-to-pod traffic is plaintext inside the cluster. Reencrypt
  would need the serving-cert secret mounted into the sidecar, which devfile container
  components cannot do directly.
- To get the usual unauthenticated (or gateway-authenticated) dev server URL back, set the
  `dev-server` endpoint to `exposure: public`.

## Technology Stack

- **Frontend Framework:** React 18.3.1
- **Styling:** Tailwind CSS 3.4.0 with @tailwindcss/forms plugin
- **Build Tool:** Vite 5.4.0
- **YAML Generation:** js-yaml 4.1.0
- **State Management:** React useReducer + Context API
- **Language:** JavaScript (ES6+)

## Project Structure

```
devfile-gui-wizard/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components (Button, Card, Alert, Badge)
│   │   ├── forms/           # Field components (Input, Select, repeaters, attributes editor)
│   │   ├── editors/         # Editors for components, commands, projects, endpoints, git sources
│   │   ├── wizard/          # Wizard navigation, progress bar and per-step validation
│   │   ├── steps/           # Individual wizard step components
│   │   └── preview/         # YAML preview component
│   ├── hooks/
│   │   └── useWizardState.jsx    # State management
│   ├── utils/               # Utility functions
│   │   ├── devfileGenerator.js   # Devfile serialization and validation
│   │   ├── factories.js          # Factories for every editable devfile element
│   │   ├── downloadFile.js       # File download utility
│   │   └── constants.js          # App constants
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── tests/
│   ├── unit/                # Serializer, validator and schema compliance tests
│   ├── e2e/                 # Browser tests
│   └── schema/              # Vendored devfile 2.3.0 JSON schema
├── index.html               # HTML entry point
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── CLAUDE.md                # Claude Code instructions
└── README.md                # This file
```

## How It Works

1. **State Management**: The application uses React's `useReducer` hook combined with Context API to manage the wizard state and devfile data.

2. **Validation**: `validateDevfile` applies the schema constraints and the devfile/api validation
   rules to the whole devfile. Each step shows the messages it is responsible for, and the review
   step shows all of them; errors block the download, warnings do not.

3. **YAML Generation**: The serializer walks the devfile schema explicitly instead of cleaning up
   the UI state, so wizard-only bookkeeping can never leak into the output and empty fields are
   left out. The `js-yaml` library then renders the resulting object.

4. **Download**: The browser's Blob API creates a downloadable file from the generated YAML content.

## Devfile 2.3.0 Support

The wizard covers the whole devfile 2.3.0 schema:

- **Metadata**: name (or generateName), version, displayName, description, icon, language,
  projectType, provider, tags, architectures, website, supportUrl, globalMemoryLimit and attributes
- **Parent**: inheritance by uri, registry id or DevWorkspaceTemplate, with overrides for
  components, commands, the three project lists, variables and attributes
- **Projects**: projects, starter projects and dependent projects, from Git (multiple remotes,
  checkoutFrom) or Zip sources
- **Components**:
  - Container (image, command, args, env, volume mounts, endpoints, requests and limits,
    mountSources, sourceMapping, dedicatedPod, deployment and service annotations)
  - Volume (size, ephemeral)
  - Kubernetes and OpenShift resources (uri or inlined, deployByDefault, endpoints)
  - Image builds (dockerfile from a uri, a devfile registry or a git repository)
- **Commands**: exec, apply and composite, each with a group, a label and attributes
- **Events**: preStart, postStart, preStop, postStop
- **Variables**: string substitution with `{{variable}}` syntax
- **Attributes**: free-form YAML on the devfile, metadata, components, commands, projects and
  endpoints

[`SCHEMA_COVERAGE.md`](SCHEMA_COVERAGE.md) lists every field and the validation rules applied on
top of the schema.

## Resources

- [Devfile Official Documentation](https://devfile.io/docs/)
- [Devfile 2.3.0 Schema](https://devfile.io/docs/2.3.0/devfile-schema)
- [GitHub Issue #1765 - Original Feature Request](https://github.com/devfile/api/issues/1765)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

## License

This project is open source and available under the [Apache License Version 2.0](LICENSE).

## Acknowledgments

- Built with [Claude Code](https://claude.ai/code)
- Devfile specification by the [Devfile Community](https://devfile.io/)
- UI components styled with [Tailwind CSS](https://tailwindcss.com/)

---

## 📞 Community Support

For issues and questions use the main Devfile [issue tracker](https://github.com/devfile/api/issues)

Contributions are most welcome!

**Made with ❤️ for the Devfile community**
