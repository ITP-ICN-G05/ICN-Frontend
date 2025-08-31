# ICN-Frontend

This is the **React web frontend** for the ICN project.  
It is built with [Create React App](https://create-react-app.dev/) and connects to the Spring Boot backend via REST APIs.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node)
- Git

### Installation
```bash
# clone repo
git clone git@github.com:ITP-ICN-G05/ICN-Frontend.git
cd ICN-Frontend

# install dependencies
npm install
```

### Running Locally

```bash
npm start
```

The app runs at http://localhost:3000.

## 🔌 API Configuration
* By default, the frontend expects the backend at `http://localhost:8080`.
* You can override by creating a `.env.development` file:

```
REACT_APP_API_URL=http://<backend-host>:8080
```

## 📜 Available Scripts
* `npm start` – Run dev server
* `npm run build` – Production build
* `npm test` – Run tests
* `npm run lint` – Run ESLint checks
* `npm run format` – Format code with Prettier

## 🤝 Contributing
1. Create a feature branch: `git checkout -b feature/xyz`
2. Commit changes: `git commit -m "feat: add xyz"`
3. Push branch: `git push origin feature/xyz`
4. Open a Pull Request

## 🛠️ Tools
* React
* Axios
* ESLint + Prettier
* GitHub Actions (CI)