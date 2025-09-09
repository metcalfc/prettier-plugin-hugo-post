# 🧪 Complete Testing Guide for prettier-plugin-hugo-post

## Quick Start Testing

### 1. **Automated Setup & Testing**
```bash
cd ~/src/github.com/metcalfc/prettier-plugin-hugo-post

# Run everything automatically
npm run setup
```

### 2. **Individual Test Commands**
```bash
# Basic tests
npm test                    # Jest test suite (70+ tests)
npm run example            # Format the main example file
npm run test:comprehensive # Complete test suite with detailed output
npm run test:interactive   # Interactive testing tool

# Development tests
npm run format             # Format plugin source code
npm run format:check       # Check if code is properly formatted
```

## Testing Options Explained

### 🚀 **Option 1: Comprehensive Test Suite**
```bash
npm run test:comprehensive
```
**What it does:**
- Runs Jest automated tests
- Tests plugin loading and exports
- Formats multiple test files with before/after output
- Tests configuration options
- Tests edge cases (malformed YAML, empty files, etc.)
- Performance testing with large files
- Integration testing with .prettierrc

**Best for:** Complete validation before publishing

### ⚡ **Option 2: Interactive Testing**
```bash
npm run test:interactive
```
**What it does:**
- Menu-driven testing interface
- Quick format testing
- Custom file testing
- Debug mode with detailed output
- Jest-only testing

**Best for:** Development and troubleshooting

### 🧪 **Option 3: Jest Test Suite Only**
```bash
npm test
```
**What it does:**
- Runs 70+ automated unit tests
- Tests all formatters and parsers
- Validates configuration options
- Tests error handling

**Best for:** Continuous integration and development

### 📝 **Option 4: Example File Testing**
```bash
npm run example
```
**What it does:**
- Formats the main example file (`examples/test.md`)
- Shows immediate before/after results
- Quick validation that plugin works

**Best for:** Quick verification

## Manual Testing with Your Own Files

### **Test with a specific Hugo file:**
```bash
# Format and see output
./node_modules/.bin/prettier --plugin ./src/index.js /path/to/your/hugo/post.md

# Check if formatting would change anything
./node_modules/.bin/prettier --plugin ./src/index.js --check /path/to/your/hugo/post.md

# Write changes back to file
./node_modules/.bin/prettier --plugin ./src/index.js --write /path/to/your/hugo/post.md
```

### **Test with configuration options:**
```bash
# Disable bracket spacing
./node_modules/.bin/prettier --plugin ./src/index.js --hugo-template-bracket-spacing=false your-file.md

# Disable shortcode formatting
./node_modules/.bin/prettier --plugin ./src/index.js --hugo-shortcode-formatting=false your-file.md
```

## Test Files Included

### **Pre-built Test Cases:**
```
test-files/
├── basic.md        # Simple Hugo content with basic templates
├── shortcodes.md   # Hugo shortcodes testing
├── complex.md      # Advanced templates, pipelines, comments
└── malformed.md    # Error handling test (malformed YAML)

examples/
├── test.md         # Comprehensive example (unformatted)
└── formatted.md    # Expected output after formatting
```

### **Test Content Types:**
- ✅ YAML/TOML/JSON front matter
- ✅ Hugo variables (`{{ .Title }}`)
- ✅ Hugo shortcodes (`{{< figure >}}`)
- ✅ Template control structures (`{{ if }}`, `{{ range }}`)
- ✅ Pipelines (`{{ .Title | upper | truncate 50 }}`)
- ✅ Comments (`{{/* comment */}}`)
- ✅ Whitespace control (`{{- .Title -}}`)
- ✅ Markdown formatting
- ✅ Code blocks with templates
- ✅ Edge cases and error handling

## Debugging Failed Tests

### **If tests fail:**

1. **Check Node.js version:**
   ```bash
   node --version  # Should be 14.x or higher
   ```

2. **Reinstall dependencies:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Run debug mode:**
   ```bash
   npm run test:interactive
   # Choose option 4 (debug)
   ```

4. **Check specific test:**
   ```bash
   npm test -- --testNamePattern="Front Matter"
   ```

5. **View detailed Jest output:**
   ```bash
   npm test -- --verbose
   ```

## Performance Benchmarks

The plugin should:
- ✅ Format simple files (< 100 lines) in < 100ms
- ✅ Format complex files (< 1000 lines) in < 1s  
- ✅ Format large files (< 5000 lines) in < 5s
- ✅ Handle malformed content gracefully
- ✅ Preserve all Hugo functionality

## Integration Testing

### **VS Code Integration:**
1. Create `.prettierrc` in your Hugo project:
   ```json
   {
     "plugins": ["~/src/github.com/metcalfc/prettier-plugin-hugo-post/src/index.js"],
     "overrides": [
       {
         "files": ["content/**/*.md"],
         "options": { "parser": "hugo-post" }
       }
     ]
   }
   ```

2. Open a Hugo content file
3. Format with `Shift+Alt+F` (or `Cmd+Shift+P` → "Format Document")

### **CLI Integration:**
```bash
# In your Hugo project root
./node_modules/.bin/prettier --plugin ../prettier-plugin-hugo-post/src/index.js --write "content/**/*.md"
```

## Test Coverage

Current test coverage includes:
- ✅ **Parser tests:** Front matter extraction, template detection
- ✅ **Formatter tests:** All template types, shortcodes, markdown
- ✅ **Option tests:** All configuration options
- ✅ **Integration tests:** End-to-end formatting
- ✅ **Error handling:** Malformed input, missing dependencies
- ✅ **Edge cases:** Empty files, no front matter, large files

## Next Steps After Testing

Once all tests pass:

1. **Use in your Hugo project:**
   ```bash
   cd /path/to/your/hugo/site
   npm install --save-dev /Users/metcalfc/src/github.com/metcalfc/prettier-plugin-hugo-post
   ```

2. **Configure VS Code** with the `.prettierrc` setup

3. **Format your content:**
   ```bash
   npx prettier --write "content/**/*.md"
   ```

4. **Consider publishing to NPM** for the community! 🚀

**Happy testing! 🎉**
