# Contributing to prettier-plugin-hugo-post

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/yourusername/prettier-plugin-hugo-post.git
cd prettier-plugin-hugo-post
```

2. Install dependencies:
```bash
npm install
```

3. Run tests to ensure everything works:
```bash
npm test
```

## Making Changes

1. Create a new branch for your feature or fix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and add tests if applicable

3. Run the test suite:
```bash
npm test
```

4. Format your code:
```bash
npm run format
```

5. Test with example files:
```bash
npm run example
```

## Submitting Changes

1. Push your branch to your fork
2. Create a pull request with a clear description of your changes
3. Ensure all CI checks pass
4. Once merged, maintainers will handle versioning and releases

## Code Style

- Follow existing code patterns
- Add tests for new functionality
- Update documentation as needed
- Keep commits focused and atomic

## Testing

We use Jest for testing. When adding new features:

1. Add test cases that cover the new functionality
2. Test edge cases and error conditions
3. Ensure all existing tests still pass

## Questions?

Feel free to open an issue for questions or discussion before making large changes.