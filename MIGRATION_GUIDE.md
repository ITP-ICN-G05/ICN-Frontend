# Migration Guide: Docker Setup for ICN Web Frontend

This guide will help you migrate your existing ICN Web Frontend to the new Docker-based development environment.

## 📋 Pre-Migration Checklist

- [ ] Backup your current project (especially any custom configurations)
- [ ] Ensure Docker and Docker Compose are installed
- [ ] Note any custom environment variables you're using
- [ ] Save any local changes not yet committed

## 🚀 Step-by-Step Migration

### Step 1: Add Docker Files
Add these new files to your `ICN-Frontend` root directory:

1. **Dockerfile** - Defines the Docker container environment
2. **docker-compose.yml** - Orchestrates the container
3. **Makefile** - Provides convenient commands
4. **setup.sh** - Automated project setup script
5. **.dockerignore** - Optimizes Docker builds

### Step 2: Fix the App.js Issue
The current `App.js` appears to be React Native code. For the web frontend, it should be React web code:

```bash
# Remove the incorrect App.js
rm App.js

# The setup script will create the correct React web structure
```

### Step 3: Initial Setup
```bash
# From the ICN-Frontend directory
make setup
```

This will:
- Build the Docker image
- Start the container
- Create/update the React project structure
- Install all dependencies
- Set up development tools

### Step 4: Migrate Existing Code
If you have existing React web code:

```bash
# Enter the container
make shell

# Navigate to the project
cd icn-frontend

# Copy your existing source files to the appropriate directories:
# - Components → src/components/
# - Pages/Views → src/pages/
# - Services → src/services/
# - Utilities → src/utils/
```

### Step 5: Environment Configuration
```bash
# Enter container
make shell

cd icn-frontend

# Set up environment variables
cp .env.example .env.development.local

# Edit with your values
nano .env.development.local
```

Add your configuration:
```env
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GOOGLE_CLIENT_ID=your_actual_client_id
REACT_APP_LINKEDIN_CLIENT_ID=your_actual_client_id
```

### Step 6: Verify Setup
```bash
# Check Docker environment
make diagnose

# Start development server
make start

# Visit http://localhost:3000
```

## 🔄 Daily Development Workflow

### Starting Your Day
```bash
# Start the development environment
make dev
# OR
make up && make start
```

### During Development
```bash
# Run linting
make lint

# Format code
make format

# Run tests
make test

# Check bundle size
make analyze
```

### Ending Your Day
```bash
# Stop containers
make down

# Or keep them running in background
# (they'll resume quickly next time)
```

## 📁 Project Structure Changes

### Before (Basic Structure)
```
ICN-Frontend/
├── README.md
├── .gitignore
└── (loose files)
```

### After (Organized Structure)
```
ICN-Frontend/
├── Docker files (Dockerfile, docker-compose.yml, etc.)
├── Makefile
├── setup.sh
└── icn-frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── store/
    │   ├── hooks/
    │   ├── utils/
    │   ├── styles/
    │   └── types/
    ├── public/
    └── configuration files
```

## 🔧 Configuration Updates

### Package.json Scripts
The setup adds these npm scripts:
- `lint` - Run ESLint
- `lint:fix` - Auto-fix linting issues
- `format` - Format with Prettier
- `format:check` - Check formatting
- `validate` - Run all checks
- `analyze` - Analyze bundle size

### TypeScript Configuration
- Absolute imports configured
- Path aliases set up (@/components, @/pages, etc.)
- Strict mode enabled

### ESLint & Prettier
- React and TypeScript rules configured
- Prettier integration set up
- Git hooks via Husky

## 🆚 Comparison: Old vs New Workflow

| Task | Old Workflow | New Workflow |
|------|-------------|--------------|
| **Setup** | Manual npm install | `make setup` (once) |
| **Start Dev** | `npm start` | `make dev` or `make start` |
| **Install Deps** | `npm install` | `make install` (auto-detects) |
| **Run Tests** | `npm test` | `make test` |
| **Lint Code** | Manual ESLint | `make lint` |
| **Format Code** | Manual Prettier | `make format` |
| **Build** | `npm run build` | `make build-app` |
| **Troubleshoot** | Check manually | `make diagnose` |

## ⚠️ Important Notes

### Docker Networking
- The React dev server runs inside Docker at port 3000
- It's mapped to your host's port 3000
- API calls to backend should use `http://localhost:8080`

### File Watching
- Hot reload works through Docker volume mounting
- Changes to files are immediately reflected
- If hot reload stops working: `make restart`

### Performance
- First build takes longer (building Docker image)
- Subsequent starts are fast (cached image)
- Dependencies are cached in Docker volumes

## 🐛 Troubleshooting Migration Issues

### Issue: Port 3000 Already in Use
```bash
# Stop any existing React processes
# Then restart Docker container
make down
make up
```

### Issue: Dependencies Not Installing
```bash
# Force reinstall
make reinstall
```

### Issue: Old Configuration Conflicts
```bash
# Complete reset
make reset
```

### Issue: Permissions Problems
```bash
# Fix permissions in container
make shell
chmod -R 755 icn-frontend
```

## ✅ Post-Migration Checklist

- [ ] Docker environment starts successfully
- [ ] React dev server accessible at http://localhost:3000
- [ ] Hot reload working
- [ ] Can connect to backend API
- [ ] Tests running successfully
- [ ] Linting and formatting working
- [ ] Git hooks configured

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

## 🆘 Getting Help

If you encounter issues:

1. Run diagnostics: `make diagnose`
2. Check logs: `make logs`
3. Enter container for debugging: `make shell`
4. Refer to the main README.md
5. Contact the development team

---

**Migration Version**: 1.0.0  
**Last Updated**: Sprint 2, Week 1  
**Estimated Migration Time**: 30-45 minutes