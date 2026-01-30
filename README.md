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

- ✨ **7-Step Wizard Interface** - Guided workflow through all devfile sections
- 🎯 **Real-time YAML Preview** - See your devfile generated as you type
- ✅ **Built-in Validation** - Ensures devfile 2.3.0 compliance
- 📥 **One-Click Download** - Export your devfile.yaml instantly
- 📋 **Copy to Clipboard** - Quick copy functionality
- 🎨 **Responsive Design** - Works on desktop, tablet, and mobile
- ↩️ **Edit Any Step** - Navigate back to modify previous sections
- ⏭️ **Skip Optional Steps** - Streamlined workflow
- 🔄 **Reset Wizard** - Start fresh at any time
- 🎭 **No Backend Required** - Fully client-side application

## Wizard Steps

1. **Basic Information** - Project metadata (name, version, description, language)
2. **Projects** - Source code repositories (Git or Zip)
3. **Components** - Development environment containers, volumes, resources
4. **Commands** - Build, run, test, and debug commands
5. **Events** - Lifecycle event bindings (preStart, postStart, etc.)
6. **Variables** - Key-value pairs for substitution
7. **Review & Download** - Summary view with download functionality

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
| `npm test` | Run end-to-end tests with Playwright |
| `npm run test:ui` | Run tests in interactive UI mode |
| `npm run test:debug` | Run tests in debug mode |

## Testing

The project includes end-to-end tests using [Playwright](https://playwright.dev/) to verify the wizard functionality and devfile generation.

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
- **Quarkus Devfile Generation** - Generates a simplified version of the [Quarkus API Example devfile](https://github.com/che-incubator/quarkus-api-example/blob/main/devfile.yaml)
- **Schema Compliance** - Verifies generated devfiles comply with Devfile 2.3.0 specification

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
│   │   ├── common/          # Reusable UI components (Button, Card, Alert)
│   │   ├── forms/           # Form components (Input, Select, TextArea)
│   │   ├── wizard/          # Wizard navigation and container
│   │   ├── steps/           # Individual wizard step components
│   │   └── preview/         # YAML preview component
│   ├── hooks/               # Custom React hooks
│   │   ├── useWizardState.jsx    # State management
│   │   └── useYamlGenerator.jsx  # YAML generation
│   ├── utils/               # Utility functions
│   │   ├── devfileGenerator.js   # Devfile cleaning/validation
│   │   ├── validation.js         # Form validation rules
│   │   ├── downloadFile.js       # File download utility
│   │   └── constants.js          # App constants
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Application entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
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

2. **Validation**: Each step includes field-level validation to ensure data integrity and devfile 2.3.0 compliance.

3. **YAML Generation**: The `js-yaml` library converts the structured JavaScript object into properly formatted YAML, with custom cleaning to remove empty fields.

4. **Download**: The browser's Blob API creates a downloadable file from the generated YAML content.

## Devfile 2.3.0 Support

This wizard supports all major devfile 2.3.0 features:

- **Metadata**: name, version, displayName, description, language, provider, tags, website, supportUrl
- **Projects**: Git and Zip sources with checkoutFrom options
- **Components**:
  - Container (with image, env vars, volume mounts, endpoints, resource limits)
  - Volume (with size and ephemeral options)
  - Kubernetes/OpenShift resources
  - Image builds
- **Commands**:
  - Exec (command execution)
  - Apply (resource application)
  - Composite (command grouping)
- **Events**: preStart, postStart, preStop, postStop
- **Variables**: String substitution with `{{variable}}` syntax

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

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

**Made with ❤️ for the Devfile community**
