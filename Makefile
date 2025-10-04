# ICN Navigator Web Frontend - Development Makefile
# Sprint 2 Development Commands

.PHONY: help build up down setup dev clean logs shell install test lint format start build-app diagnose

# Default target
help:
	@echo "🚀 ICN Navigator Web Frontend - Development Commands"
	@echo ""
	@echo "Setup Commands:"
	@echo "  make setup       - Smart initial setup (skips if already built)"
	@echo "  make fix         - Fix common setup issues"
	@echo "  make fix-deps    - Fix missing React dependencies"
	@echo "  make rebuild     - Force rebuild Docker images"
	@echo "  make install     - Smart dependency install (skips if exists)"
	@echo "  make reinstall   - Force reinstall dependencies"
	@echo "  make audit-fix   - Fix npm audit issues"
	@echo ""
	@echo "Development Commands:"
	@echo "  make dev         - Start development environment"
	@echo "  make start       - Start React dev server"
	@echo "  make build-app   - Build production bundle"
	@echo "  make build       - Build Docker images"
	@echo "  make up          - Start containers in background"
	@echo "  make down        - Stop and remove containers"
	@echo ""
	@echo "Utility Commands:"
	@echo "  make shell       - Open bash shell in container"
	@echo "  make logs        - View container logs"
	@echo "  make status      - Check environment status"
	@echo "  make diagnose    - Run comprehensive diagnostics"
	@echo "  make clean       - Clean up Docker resources"
	@echo ""
	@echo "Code Quality Commands:"
	@echo "  make lint        - Run ESLint"
	@echo "  make format      - Format code with Prettier"
	@echo "  make test        - Run tests"
	@echo "  make validate    - Run all checks (lint, format, test)"
	@echo ""
	@echo "Analysis Commands:"
	@echo "  make analyze     - Analyze bundle size"
	@echo "  make coverage    - Generate test coverage report"
	@echo ""
	@echo "Sprint 2 Status: Week 1 - Foundation Setup"

# Setup and Installation
setup:
	@echo "🏗️ Setting up ICN Navigator Web Frontend development environment..."
	@echo "Checking Docker..."
	@docker --version > /dev/null 2>&1 || (echo "❌ Docker is not installed" && exit 1)
	@docker-compose --version > /dev/null 2>&1 || (echo "❌ Docker Compose is not installed" && exit 1)
	@echo "✅ Docker is installed"
	@echo ""
	@echo "🔨 Building Docker image..."
	@docker-compose build
	@echo ""
	@echo "⬆️ Starting containers..."
	@docker-compose up -d
	@echo "Waiting for container to be ready..."
	@sleep 3
	@if docker-compose ps | grep -q "icn-navigator-web.*Up"; then \
		echo "✅ Container started successfully"; \
	else \
		echo "❌ Container failed to start. Running fix..."; \
		make fix; \
		exit 1; \
	fi
	@echo ""
	@echo "📱 Running project setup..."
	@make shell-setup

shell-setup:
	@echo "📱 Running initial project setup..."
	@if docker-compose exec icn-web-dev bash -c "test -d icn-frontend/node_modules"; then \
		echo "✅ Dependencies already installed, skipping npm install..."; \
	else \
		echo "📦 Installing dependencies for the first time..."; \
		docker-compose exec icn-web-dev bash -c "chmod +x setup.sh && sed -i 's/\r$//' setup.sh && ./setup.sh"; \
	fi

# Force rebuild (useful when Dockerfile changes)
rebuild:
	@echo "🔨 Force rebuilding Docker images..."
	docker-compose build --no-cache

# Fix common issues
fix:
	@echo "🔧 Fixing common setup issues..."
	@chmod +x fix-setup.sh
	@./fix-setup.sh

# Fix React dependencies
fix-deps:
	@echo "🔧 Fixing React dependencies..."
	@chmod +x fix-react-deps.sh
	@./fix-react-deps.sh

install:
	@echo "📦 Installing dependencies..."
	@if docker-compose exec icn-web-dev bash -c "test -d icn-frontend/node_modules && test -f icn-frontend/package-lock.json"; then \
		echo "✅ Dependencies already installed, skipping..."; \
		echo "💡 Use 'make reinstall' to force reinstall dependencies"; \
	else \
		echo "📦 Installing dependencies..."; \
		docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm install"; \
	fi

# Force reinstall dependencies
reinstall:
	@echo "🔄 Force reinstalling dependencies..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && rm -rf node_modules package-lock.json && npm install"

# Fix npm audit issues
audit-fix:
	@echo "🔧 Fixing npm audit issues..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm audit fix"

# Development
dev:
	@echo "🚀 Starting ICN Navigator Web development environment..."
	docker-compose up

build:
	@echo "🔨 Building Docker images..."
	docker-compose build

up:
	@echo "⬆️ Starting containers..."
	docker-compose up -d

down:
	@echo "⬇️ Stopping containers..."
	docker-compose down

# Development Utilities  
shell:
	@echo "🐚 Opening shell in web development container..."
	docker-compose exec icn-web-dev bash

logs:
	@echo "📋 Viewing container logs..."
	docker-compose logs -f icn-web-dev

# React specific commands
start:
	@echo "🌐 Starting React development server..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm start"

build-app:
	@echo "📦 Building production bundle..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run build"

serve-build:
	@echo "🚀 Serving production build..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npx serve -s build -l 3000"

# Code Quality
lint:
	@echo "🔍 Running ESLint..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run lint"

lint-fix:
	@echo "🔧 Fixing ESLint issues..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run lint:fix"

format:
	@echo "✨ Formatting code with Prettier..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run format"

format-check:
	@echo "🔍 Checking code formatting..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run format:check"

test:
	@echo "🧪 Running tests..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm test -- --watchAll=false"

test-watch:
	@echo "🧪 Running tests in watch mode..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm test"

coverage:
	@echo "📊 Generating test coverage report..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm test -- --coverage --watchAll=false"

validate:
	@echo "✅ Running all validation checks..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run validate"

# Analysis
analyze:
	@echo "📊 Analyzing bundle size..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm run analyze"

check-updates:
	@echo "🔍 Checking for dependency updates..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npx npm-check-updates"

# Cleanup
clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f
	docker volume prune -f

clean-all:
	@echo "🧹 Deep cleaning Docker resources..."
	docker-compose down -v --rmi all
	docker system prune -a -f
	docker volume prune -f

clean-cache:
	@echo "🧹 Cleaning npm cache..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm cache clean --force"

# Status and Info
status:
	@echo "📊 Development Environment Status:"
	@echo ""
	docker-compose ps
	@echo ""
	@echo "💾 Disk Usage:"
	docker system df
	@echo ""
	@echo "🌐 Network Info:"
	docker network ls | grep icn

info:
	@echo "ℹ️ Project Information:"
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm list --depth=0"

# Diagnostic commands
diagnose:
	@echo "🔍 Running diagnostics..."
	@echo "📋 Container Status:"
	docker-compose ps
	@echo ""
	@echo "📦 Node/NPM versions in container:"
	docker-compose exec icn-web-dev bash -c "node --version && npm --version"
	@echo ""
	@echo "⚛️ React Scripts version:"
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm list react-scripts" || echo "React Scripts not installed"
	@echo ""
	@echo "📁 Project structure:"
	docker-compose exec icn-web-dev bash -c "ls -la icn-frontend/" || echo "Project directory not found"
	@echo ""
	@echo "📊 Dependencies status:"
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && npm outdated" || echo "Unable to check outdated packages"

# Quick development workflow
quick-start: build up install start

# Emergency reset
reset: clean setup

# CI/CD commands
ci-test:
	@echo "🧪 Running CI tests..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && CI=true npm test -- --coverage"

ci-build:
	@echo "📦 Running CI build..."
	docker-compose exec icn-web-dev bash -c "cd icn-frontend && CI=true npm run build"