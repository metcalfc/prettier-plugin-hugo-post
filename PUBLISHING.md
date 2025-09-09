# Publishing Guide

This document outlines the release and publishing process for prettier-plugin-hugo-post.

## Prerequisites

### NPM Token Setup

1. Create an NPM account and login
2. Generate an automation token: `npm token create --type=automation`
3. Add the token to GitHub Secrets as `NPM_TOKEN`

### GitHub Repository Setup

1. Go to repository Settings > Secrets and variables > Actions
2. Add the NPM_TOKEN secret
3. Enable branch protection for `main` branch (recommended)

## Release Process

### Manual Release (Simple)

1. Update the version in `package.json`:

   ```bash
   npm version patch  # for bug fixes
   npm version minor  # for new features
   npm version major  # for breaking changes
   ```

2. Push the version commit and tag:

   ```bash
   git push origin main --tags
   ```

3. Create a GitHub release from the tag:

   ```bash
   gh release create v1.0.1 --auto
   ```

4. The `publish.yml` workflow will automatically publish to npm when a release is created.

## CI/CD Workflows

### CI Workflow (`ci.yml`)

- Runs on every push and PR to main
- Tests on Node.js 20, 22 (Ubuntu)
- Checks formatting and runs example

### Publish Workflow (`publish.yml`)

- **This is what publishes to npm**
- Triggers on GitHub releases
- Runs tests before publishing
- Uses NPM_TOKEN to publish

### Dependabot (`dependabot.yml`)

- Weekly dependency updates
- Automatically creates PRs for updates

## Branch Protection (Recommended)

Configure branch protection for `main`:

1. Go to Settings > Branches
2. Add rule for `main` branch
3. Enable:
   - Require pull request reviews
   - Require status checks (CI workflow)
   - Restrict pushes to specific people/teams
