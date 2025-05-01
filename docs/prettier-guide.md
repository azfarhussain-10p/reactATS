# Prettier Integration Guide for ATS Application

This document provides details on the Prettier integration in the ATS application.

## Overview

Prettier is an opinionated code formatter that enforces a consistent code style across the entire codebase. It supports many languages and integrates with most editors.

## Configuration

The ATS application uses the following Prettier configuration (`.prettierrc.json`):

```json
{
  "singleQuote": true,
  "semi": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "auto",
  "jsxSingleQuote": false,
  "bracketSameLine": false,
  "quoteProps": "as-needed"
}
```

## Usage

### Command Line

Format all files:

```bash
npm run format
```

Check if files are formatted correctly:

```bash
npm run format:check
```

### Editor Integration

For the best development experience, configure your editor to format on save:

#### VS Code

1. Install the Prettier extension
2. Update your settings.json to enable format on save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

#### WebStorm/IntelliJ

1. Go to Settings/Preferences
2. Navigate to Languages & Frameworks > JavaScript > Prettier
3. Check "On save" under "Run for files"

## Ignored Files

The `.prettierignore` file specifies which files and directories should be excluded from formatting.

## Integration with ESLint

The ATS application uses `eslint-config-prettier` to disable ESLint rules that might conflict with Prettier's formatting.
