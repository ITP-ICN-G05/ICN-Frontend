#!/bin/bash

# Migrate from TypeScript to JavaScript
echo "🔄 Migrating from TypeScript to JavaScript..."

# Enter container and migrate
docker-compose exec icn-web-dev bash -c '
cd icn-frontend

echo "📦 Removing TypeScript dependencies..."
npm uninstall typescript @types/react @types/react-dom @types/react-router-dom @types/node @types/jest @types/lodash @typescript-eslint/eslint-plugin @typescript-eslint/parser

echo "📝 Removing TypeScript config..."
rm -f tsconfig.json

echo "🔄 Converting TypeScript files to JavaScript..."
# Rename .ts and .tsx files to .js
find src -name "*.ts" -o -name "*.tsx" | while read file; do
    newfile="${file%.ts*}.js"
    echo "Converting $file to $newfile"
    mv "$file" "$newfile"
done

echo "📦 Installing JavaScript setup..."
npm install --save-dev \
    eslint \
    prettier \
    eslint-config-prettier \
    eslint-plugin-prettier \
    eslint-plugin-react \
    eslint-plugin-react-hooks

echo "✅ Migration complete!"
echo "Note: You may need to remove TypeScript type annotations from your code."
'

echo ""
echo "🎉 Migration completed!"
echo "Next steps:"
echo "1. Remove any TypeScript type annotations from your code"
echo "2. Run 'make format' to fix any formatting issues"
echo "3. Run 'make start' to test your application"