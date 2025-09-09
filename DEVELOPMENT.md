# Development Quick Start

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Test the plugin**:
   ```bash
   npm run example
   ```

## Testing Your Changes

1. **Edit the plugin**: Modify `src/index.js`
2. **Add tests**: Update `tests/index.test.js`
3. **Test with examples**: Run `npm run example` to see formatting in action
4. **Run full test suite**: `npm test`

## Project Structure

```
├── src/
│   └── index.js          # Main plugin implementation
├── tests/
│   └── index.test.js     # Jest tests
├── examples/
│   ├── test.md           # Example Hugo content (unformatted)
│   └── formatted.md      # Expected output after formatting
├── package.json          # Dependencies and scripts
├── README.md             # Documentation
└── .prettierrc           # Prettier configuration for this project
```

## Key Implementation Details

- **Parser**: `parseHugoPost()` - Handles front matter and content separation
- **Printer**: `printHugoPost()` - Formats the AST back to text
- **Template Handling**: Temporarily replaces templates with placeholders
- **Front Matter**: Uses YAML library for proper formatting
- **Markdown**: Leverages Prettier's built-in markdown parser

## Testing Strategy

1. **Unit tests**: Test individual formatters (variables, shortcodes, etc.)
2. **Integration tests**: Test complete files with mixed content
3. **Edge cases**: Malformed content, missing front matter, etc.
4. **Options testing**: Verify configuration options work correctly

## Common Issues

1. **AST position tracking**: Ensure `locStart`/`locEnd` are correct
2. **Placeholder conflicts**: Make sure placeholder strings are unique
3. **Template nesting**: Handle complex nested template structures
4. **Whitespace preservation**: Maintain Hugo's whitespace control syntax

## Debugging

1. **Add console.log()** in the parser/printer functions
2. **Use the examples**: Test with `examples/test.md`
3. **Check AST structure**: Log the parsed AST to understand structure
4. **Test incrementally**: Start with simple cases and add complexity

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for your changes
4. Ensure all tests pass
5. Submit a pull request

Happy coding! 🚀
