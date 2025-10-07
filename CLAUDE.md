# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Epharma is a pharmacy management system (PMS) built as an Electron desktop application with Vue 3, TypeScript, and a local API backend. The application manages inventory, sales, clients, orders, and daily operations for pharmacies.

**Tech Stack:**
- **Frontend:** Vue 3 with TypeScript, PrimeVue UI components, Bootstrap 4
- **Desktop:** Electron 34 (main process handles auto-updates, IPC communication)
- **State Management:** Vuex 4
- **HTTP Client:** Axios
- **Build Tools:** Vue CLI 5, electron-builder

## Development Commands

### Starting Development
```bash
npm install                  # Install dependencies
npm run serve               # Start Vue dev server (for web development)
npm start                   # Start Electron app (electron-forge)
```

### Building & Packaging
```bash
npm run build               # Build Vue app for production
npm run make                # Package Electron app (no publish)
npm run publish             # Build and publish to GitHub releases
```

### Testing
```bash
npm run test:unit           # Run Jest unit tests
```

### Versioning
```bash
npm run upgrading           # Bump patch version (force)
```

## Architecture

### Application Structure

The codebase follows a modular architecture organized by business domain:

```
src/
├── views/                  # Page-level components organized by module
│   ├── admin/             # User management, settings
│   ├── stock/             # Products, orders, suppliers, inventory movements
│   ├── vente/             # Sales, cash register, clients, quotes, reservations
│   ├── gestion/           # Day-end operations, cash counting, statistics
│   └── auth/              # Login, password management, activation
├── components/            # Reusable components (tables, modals, exports)
├── services/              # Business logic and external API integrations
├── store/                 # Vuex state management (auth, pharmacy data)
├── router/                # Vue Router with auth guards
└── layouts/               # Application templates
```

### Key Architecture Patterns

**1. Multi-Level Authentication Flow:**
- Application activation check (localStorage `activationData`)
- User authentication (Vuex store + localStorage `epharma_asdecode_session`)
- Cash register authentication (per-session)
- Password change enforcement

**2. Electron IPC Communication:**
The main process (`electron-main.js`) handles:
- Auto-updates via `electron-updater` (GitHub releases)
- Manual database updates via HTTP download + extraction (`updateDownloader.js`)
- Version information (`get-app-version` handler)

**3. Dynamic API Configuration:**
The app supports multiple deployment modes:
- Local API: `http:127.0.0.1:9090` (default in development)
- Ngrok tunnels: Auto-detected via hostname
- Production: Configurable via store

**4. Permission System:**
User permissions (`habilitations`) control menu/feature access:
- Admins get full access to all modules
- Regular users have granular permissions per menu/submenu
- Stored in Vuex and checked in router guards

### Module Domains

**ADMIN:**
- User management (`utilisateurs`)
- System parameters (`parametres`)

**STOCK:**
- Products (`produits`), Orders (`commandes`), Suppliers (`fournisseurs`)
- Database management (`bases_de_donnees`)
- Returns (`retours`), Movements (`mouvement`), Sections (`rayons`)

**VENTE (Sales):**
- Cash register (`caisse`), Clients (`client`), Reservations (`reservations`)
- Quotes (`devis`), Sales dashboard (`ventes`)
- Configuration (`configuration`)

**GESTION (Management):**
- Cash counting (`billetages`), Day-end operations (`journees`)
- On-call schedules (`gardes`), Inventory (`inventaires`)
- Statistics (`statistiques`)

### External Services

**Vidal API Integration** (`services/vidalService.ts`):
- Medical drug database integration
- Configured via `.env` (app ID, API key)
- Base URL: `http://api.vidal.fr`

**Chatbot Integration** (`services/botpressService.ts`):
- AI assistant for user support

### Component Patterns

**Reusable Table Component** (`AsdecodeTable.vue`):
Generic data table component registered globally

**Export Components:**
- `ExportTable.vue`, `ExportTableCSV.vue`, `ExportDataTable.vue`
- `RecapFacture.vue`, `ExRecapFacture.vue` - Invoice generation

**Modals:**
- `PrescriptionModal.vue` - Prescription management
- `EquivalentMedicamentModal.vue` - Drug alternatives

### State Management

**Vuex Store Structure** (`store/index.ts`):
```typescript
state: {
  authenticated: boolean           // User login state
  caisseAuthenticated: boolean     // Cash register session
  user: User | null                // Current user data
  pharmacie: Pharmacie | null      // Pharmacy information
  habilitations: any               // User permissions
  api_url: string                  // Dynamic API endpoint
}
```

**Key Mutations:**
- `setAuthenticated` - Login user and store in localStorage
- `clearUserData` - Logout and redirect
- `setApiUrl` - Update API endpoint dynamically

### Router Guards

**Navigation Guards** (`router/index.ts`):
1. Check application activation
2. Redirect to activation page if not activated
3. Check user authentication
4. Force password change if required
5. Verify route permissions

### Build Configuration

**Webpack Polyfills** (`vue.config.js`):
Node.js modules polyfilled for browser: `path`, `zlib`, `crypto`, `stream`, `util`
Disabled: `fs`, `tls`, `net` (not available in browser)

**Electron Builder Config** (`package.json`):
- Target: Windows NSIS installer
- Output: `release/` directory
- Auto-updates from GitHub releases (`syklop/epharma-Electron`)
- Installer allows per-user installation with custom directory

### Global Utilities

**Format Services** (`services/FormatService.ts`):
Registered globally in Vue:
- `$moneyFormat` - Currency formatting
- `$dateFormat` - Date formatting
- `$checkUrlFormat` - URL validation

### PrimeVue Components

Heavy use of PrimeVue UI library with global registration in `main.ts`:
- DataTable, Column, Dropdown, AutoComplete
- DynamicDialog, ConfirmDialog
- FileUpload, Image, Editor
- Chart, ProgressBar, Toast

### Testing

Tests located in `tests/unit/` using Jest with Vue Test Utils.

## Important Notes

### Security Considerations
- `.env` file contains API keys (Vidal API, GitHub tokens) - ensure these are kept secure
- Do not commit `.env` to version control
- User tokens stored in localStorage (`epharma_asdecode_session`)

### Deployment
- Application uses domain-based routing (`http://epg-epharma.epharma`)
- Supports auto-updates via electron-updater
- Manual database updates via download + extraction mechanism

### Database
- API-based architecture (local backend at `localhost:9090`)
- Supervisor API: `https://epharma-panel.srv557357.hstgr.cloud`

### Timezone
Default timezone: `Africa/Libreville` (configured in store)
