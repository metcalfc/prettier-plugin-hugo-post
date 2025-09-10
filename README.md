# prettier-plugin-hugo-post

[![npm version](https://img.shields.io/npm/v/prettier-plugin-hugo-post)](https://www.npmjs.com/package/prettier-plugin-hugo-post)
[![license](https://img.shields.io/npm/l/prettier-plugin-hugo-post)](https://github.com/metcalfc/prettier-plugin-hugo-post/blob/main/LICENSE)

A Prettier plugin for formatting Hugo content files with front matter (YAML, TOML, JSON), Markdown content, and Hugo template syntax.

## Features

- 🎯 **Complete front matter support** - YAML (`---`), TOML (`+++`), and JSON (`{}`) with proper formatting
- 📝 **Markdown content formatting** - Uses Prettier's built-in Markdown parser for professional formatting
- 🏷️ **Hugo shortcode formatting** - Properly formats shortcode parameters with intelligent spacing
- 🔧 **Enhanced template formatting** - Advanced Go template variable formatting with pipes, functions, and control structures
- ⚙️ **Zero configuration** - Works out of the box with sensible defaults
- 🔗 **Prettier integration** - Respects your existing Prettier configuration
- 🚀 **Hugo-optimized** - Specifically designed for Hugo's mixed-content `.md` files

## Installation

### For Hugo Content Files Only

```bash
npm install --save-dev prettier prettier-plugin-hugo-post
```

### For Complete Hugo Project (Recommended)

For the best Hugo development experience, use both plugins together:

```bash
npm install --save-dev prettier prettier-plugin-hugo-post prettier-plugin-go-template
```

**Note**: `prettier` is a peer dependency, so make sure you have it installed in your project.

## Configuration

### Basic Setup (Hugo Content Only)

Add the plugin to your Prettier configuration:

**.prettierrc.json**

```json
{
  "plugins": ["prettier-plugin-hugo-post"],
  "overrides": [
    {
      "files": ["content/**/*.md", "*.md", "*.hugo"],
      "options": {
        "parser": "hugo-post"
      }
    }
  ]
}
```

### Complete Hugo Project Setup (Recommended)

For comprehensive Hugo formatting, use both plugins with different file patterns:

**.prettierrc.json**

```json
{
  "plugins": ["prettier-plugin-hugo-post", "prettier-plugin-go-template"],
  "overrides": [
    {
      "files": ["content/**/*.md", "*.md"],
      "options": {
        "parser": "hugo-post",
        "printWidth": 100,
        "proseWrap": "preserve"
      }
    },
    {
      "files": ["layouts/**/*.html", "*.html"],
      "options": {
        "parser": "go-template"
      }
    }
  ]
}
```

### Advanced Hugo Configuration

For larger Hugo projects with specific formatting needs:

**.prettierrc.json**

```json
{
  "plugins": ["prettier-plugin-hugo-post", "prettier-plugin-go-template"],
  "printWidth": 100,
  "tabWidth": 2,
  "overrides": [
    {
      "files": ["content/**/*.md", "archetypes/**/*.md"],
      "options": {
        "parser": "hugo-post",
        "proseWrap": "preserve",
        "printWidth": 120
      }
    },
    {
      "files": ["layouts/**/*.html"],
      "options": {
        "parser": "go-template",
        "printWidth": 100
      }
    },
    {
      "files": ["data/**/*.json", "*.json"],
      "options": {
        "parser": "json"
      }
    },
    {
      "files": ["data/**/*.yaml", "data/**/*.yml", "*.yaml", "*.yml"],
      "options": {
        "parser": "yaml"
      }
    }
  ]
}
```

## Usage

### Command Line

**Hugo Content Files (.md):**
```bash
# Format a single content file
npx prettier --write content/posts/my-post.md

# Format all Hugo content files
npx prettier --write "content/**/*.md"

# Check content formatting without writing
npx prettier --check "content/**/*.md"
```

**Complete Hugo Project:**
```bash
# Format all Hugo files (content + templates + data)
npx prettier --write "content/**/*.md" "layouts/**/*.html" "data/**/*.{json,yaml,yml}"

# Format specific file types
npx prettier --write "content/**/*.md"     # Content files
npx prettier --write "layouts/**/*.html"  # Templates
npx prettier --write "data/**/*.json"     # JSON data files

# Check entire project formatting
npx prettier --check "**/*.{md,html,json,yaml,yml}"
```

**Package.json Scripts (Recommended):**
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:content": "prettier --write 'content/**/*.md'",
    "format:templates": "prettier --write 'layouts/**/*.html'",
    "format:check": "prettier --check .",
    "precommit": "prettier --check ."
  }
}
```

### Before and After

**Input:**

```markdown
---
title:    'My Blog Post'
date: 2025-01-15
tags:   [  'hugo',   'blog'  ]
draft:    false
author:
  name:  "John Doe"
  email:   "john@example.com"
---

#    My Title

This is some content with Hugo shortcodes:

{{<figure src="/image.jpg"alt="Description"class="center">}}
{{% notice info %}}Important information{{% /notice %}}

Hugo templates with enhanced formatting:

{{.Title|upper|truncate   50}}
{{ printf  "%s - %s"   .Title   .Date }}
{{if .Params.featured}}{{.Params.author.name | default "Anonymous"}}{{end}}

{{ range   .Pages  }}
- {{ .Title }}
{{  end  }}
```

**Output:**

```markdown
---
title: "My Blog Post"
date: 2025-01-15
tags: ["hugo", "blog"]
draft: false
author:
  name: "John Doe"
  email: "john@example.com"
---

# My Title

This is some content with Hugo shortcodes:

{{< figure src="/image.jpg" alt="Description" class="center" >}}
{{% notice info %}}Important information{{% /notice %}}

Hugo templates with enhanced formatting:

{{ .Title | upper | truncate 50 }}
{{ printf "%s - %s" .Title .Date }}
{{ if .Params.featured }}{{ .Params.author.name | default "Anonymous" }}{{ end }}

{{ range .Pages }}

- {{ .Title }}

{{ end }}
```

### Front Matter Format Examples

The plugin supports all Hugo front matter formats:

**YAML (most common):**
```markdown
---
title:    "My Post"
date: 2025-01-15
tags:   [  "hugo",   "blog"  ]
author:
  name:  "John Doe"
  email:   "john@example.com"
---
```

**TOML:**
```markdown
+++
title   =   "My Post"
date    = 2025-01-15T10:00:00Z
tags    = [   "hugo",    "blog"   ]
author = {name="John Doe", email="john@example.com"}
+++
```

**JSON:**
```markdown
{
    "title":   "My Post",
"date": "2025-01-15T10:00:00Z",
 "tags": [   "hugo",    "blog"   ],
      "author": {"name":"John Doe", "email":"john@example.com"}
}
```

**All formats are automatically formatted:**

```markdown
---
title: "My Post"
date: 2025-01-15
tags: ["hugo", "blog"]
author:
  name: "John Doe"
  email: "john@example.com"
---
```

```markdown
+++
title = "My Post"
date = 2025-01-15T10:00:00Z
tags = ["hugo", "blog"]
author = { name = "John Doe", email = "john@example.com" }
+++
```

```markdown
{
  "title": "My Post",
  "date": "2025-01-15T10:00:00Z",
  "tags": ["hugo", "blog"],
  "author": { "name": "John Doe", "email": "john@example.com" }
}
```

## Complete Hugo Project Formatting

### Why Use Both Plugins?

Hugo projects typically contain multiple file types that benefit from different formatting approaches:

| File Type | Plugin | Use Case |
|-----------|---------|----------|
| **Content Files** (`content/**/*.md`) | `prettier-plugin-hugo-post` | Mixed front matter + markdown + Hugo templates |
| **Layout Templates** (`layouts/**/*.html`) | `prettier-plugin-go-template` | Pure HTML with Go templates |
| **Partial Templates** (`layouts/partials/*.html`) | `prettier-plugin-go-template` | Template components |
| **Data Files** (`data/**/*.json`, `data/**/*.yaml`) | Built-in Prettier | Structured data |

### Hugo Template Files (.html)

**prettier-plugin-go-template** handles pure template files:

```html
<!-- Before -->
{{if .Site.Params.author}}
  <meta name="author" content="{{.Site.Params.author}}">
{{end}}

{{range .Site.Menus.main}}
  <a href="{{.URL}}">{{.Name}}</a>
{{end}}
```

```html
<!-- After -->
{{ if .Site.Params.author }}
  <meta name="author" content="{{ .Site.Params.author }}">
{{ end }}

{{ range .Site.Menus.main }}
  <a href="{{ .URL }}">{{ .Name }}</a>
{{ end }}
```

### Hugo Content Files (.md)

**prettier-plugin-hugo-post** handles mixed-content files:

```markdown
<!-- Before -->
---
title:    "My Post"
tags: [  "hugo",  "blog" ]
---

{{<figure src="/img.jpg"alt="Test">}}
{{ .Title|upper }}
```

```markdown
<!-- After -->
---
title: "My Post"
tags: ["hugo", "blog"]
---

{{< figure src="/img.jpg" alt="Test" >}}
{{ .Title | upper }}
```

## Formatting Flow

The plugin processes Hugo content files in three stages:

### 1. 🎯 Front Matter Formatting

**YAML front matter** (between `---` delimiters):
- Uses Prettier's built-in YAML parser
- Formats indentation, quoting, and spacing
- Example: `title:    "Post"` → `title: "Post"`

**TOML front matter** (between `+++` delimiters):
- Uses prettier-plugin-toml for proper TOML formatting
- Formats spacing around `=`, arrays, and inline objects
- Example: `title   =   "Post"` → `title = "Post"`

**JSON front matter** (between `{}` delimiters):
- Uses Prettier's built-in JSON parser
- Formats indentation and object spacing
- Example: `{"title":   "Post"}` → `{ "title": "Post" }`

### 2. 🏷️ Hugo Template Formatting

**Shortcode parameter spacing:**
- `{{<figure src="/img.jpg"title="Test">}}` → `{{< figure src="/img.jpg" title="Test" >}}`
- `{{% notice info %}}` → `{{% notice info %}}`
- Handles both `{{< >}}` and `{{% %}}` syntax with intelligent spacing

**Enhanced template variable formatting:**
- `{{.Title}}` → `{{ .Title }}`
- `{{.Params.author}}` → `{{ .Params.author }}`

**Advanced pipeline formatting:**
- `{{.Title|upper|truncate   50}}` → `{{ .Title | upper | truncate 50 }}`
- `{{.Content|replaceRE "\\b\\w+\\b" "word"|truncate 100}}` → `{{ .Content | replaceRE "\\b\\w+\\b" "word" | truncate 100 }}`
- Proper spacing around pipe operators with complex expressions

**Function calls with multiple arguments:**
- `{{ printf  "%s - %s"   .Title   .Date }}` → `{{ printf "%s - %s" .Title .Date }}`
- `{{ dict   "title"  .Title  "date"   .Date }}` → `{{ dict "title" .Title "date" .Date }}`
- Intelligent spacing for function parameters

**Control structures:**
- `{{if .Featured}}` → `{{ if .Featured }}`
- `{{range .Pages}}` → `{{ range .Pages }}`
- `{{end}}` → `{{ end }}`
- `{{else if .Draft}}` → `{{ else if .Draft }}`

**Whitespace control preservation:**
- `{{- if .Featured -}}` → `{{- if .Featured -}}` (unchanged)
- `{{-.Title-}}` → `{{- .Title -}}`
- Respects Hugo's whitespace trimming syntax

**Comments:**
- `{{/*   comment   */}}` → `{{/* comment */}}`

### 3. 📝 Markdown Content Formatting

**Everything else** gets formatted using Prettier's built-in Markdown parser:
- Headers, paragraphs, lists, code blocks
- Respects your Prettier configuration (printWidth, etc.)
- Professional, consistent markdown formatting

## Editor Integration

### VS Code

1. Install the [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
2. Install this plugin in your project: `npm install --save-dev prettier-plugin-hugo-post`
3. Configure Prettier as your default formatter for Markdown files

**settings.json**

```json
{
  "[markdown]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### Other Editors

This plugin works with any editor that supports Prettier:

- [WebStorm/IntelliJ IDEA](https://prettier.io/docs/en/webstorm.html)
- [Vim](https://prettier.io/docs/en/vim.html)
- [Emacs](https://prettier.io/docs/en/emacs.html)
- [Sublime Text](https://packagecontrol.io/packages/JsPrettier)

## Ignoring Code

Use standard Prettier ignore comments:

```markdown
---
title: 'My Post'
---

<!-- prettier-ignore -->
# This   heading   won't   be   formatted

Regular content will be formatted normally.

<!-- prettier-ignore-start -->
This entire block
  will be ignored
    by prettier
<!-- prettier-ignore-end -->
```

## Configuration Options

This plugin leverages Prettier's built-in parsers, so it respects your existing Prettier configuration for:

- `printWidth` - Line width for YAML and Markdown
- `tabWidth` - Indentation for YAML
- `useTabs` - Tab vs space preference
- `proseWrap` - How to wrap prose in Markdown

## Hugo Integration

### Complete Hugo Project Setup

This plugin works seamlessly with Hugo projects. For the best experience, use both plugins:

```bash
# Add to your Hugo project
npm install --save-dev prettier prettier-plugin-hugo-post prettier-plugin-go-template

# Format your entire Hugo project
npx prettier --write .

# Add to your package.json scripts
{
  "scripts": {
    "dev": "hugo server --buildDrafts",
    "build": "hugo --minify",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "prebuild": "npm run format:check"
  }
}
```

### CI/CD Integration

Add formatting checks to your continuous integration:

**.github/workflows/ci.yml**

```yaml
name: CI
on: [push, pull_request]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run format:check

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run format
      - run: hugo --minify
```

### Pre-commit Hook

Automatically format files before committing:

**package.json**

```json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "husky": "^8.0.3",
    "prettier": "^3.0.0",
    "prettier-plugin-hugo-post": "latest",
    "prettier-plugin-go-template": "^0.0.15"
  }
}
```

**.husky/pre-commit**

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx prettier --check .
```

## Comparison with Alternatives

| Feature           | prettier-plugin-hugo-post | Standard Prettier | prettier-plugin-go-template |
| ----------------- | ------------------------- | ----------------- | --------------------------- |
| YAML Front Matter | ✅ Formatted              | ❌ Ignored        | ❌ Ignored                  |
| TOML Front Matter | ✅ Formatted              | ❌ Ignored        | ❌ Ignored                  |
| JSON Front Matter | ✅ Formatted              | ❌ Ignored        | ❌ Ignored                  |
| Markdown Content  | ✅ Formatted              | ✅ Formatted      | ❌ Not supported            |
| Hugo Shortcodes   | ✅ Properly formatted     | ❌ May break      | ⚠️ Basic support            |
| Hugo Templates    | ✅ Enhanced formatting    | ❌ May break      | ✅ Good support             |
| Mixed Content     | ✅ Seamless (.md files)   | ❌ Requires setup | ❌ Pure templates only     |
| Hugo-Specific     | ✅ Built for Hugo         | ❌ Generic        | ⚠️ Generic Go templates    |

## Troubleshooting

### Plugin Not Loading

Make sure the plugin is installed in the same scope (local vs global) as Prettier:

```bash
# If using local prettier
npm install --save-dev prettier-plugin-hugo-post

# If using global prettier
npm install -g prettier-plugin-hugo-post
```

### Hugo Templates Getting Mangled

If you see Hugo templates being incorrectly formatted, make sure you're using the `hugo-post` parser:

```json
{
  "overrides": [
    {
      "files": ["*.md", "*.hugo"],
      "options": {
        "parser": "hugo-post"
      }
    }
  ]
}
```

### Shortcode Parameters Have Normalized Spacing

This is expected behavior. The plugin intelligently formats shortcode parameter spacing:
- `{{<figure src="/img.jpg"title="Test">}}` becomes `{{< figure src="/img.jpg" title="Test" >}}`
- `{{ printf  "%s"   .Title }}` becomes `{{ printf "%s" .Title }}`
- This ensures consistent formatting and readability across all Hugo templates

### Using Both Plugins Together

When using both `prettier-plugin-hugo-post` and `prettier-plugin-go-template`:

1. **Order in plugins array doesn't matter** - Prettier applies the right parser based on file patterns
2. **Different file extensions** - `.md` files use `hugo-post`, `.html` files use `go-template`
3. **No conflicts** - Each plugin handles its specific file types independently
4. **Performance** - Both plugins can be installed and used together without issues

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

### Development

```bash
# Clone the repository
git clone https://github.com/metcalfc/prettier-plugin-hugo-post.git
cd prettier-plugin-hugo-post

# Install dependencies
npm install

# Run tests
npm test

# Test with example files
npm run example
```

## License

MIT © [Chad Metcalf](https://github.com/metcalfc)

## Acknowledgments

- [Prettier](https://prettier.io/) for the excellent formatting engine
- [prettier-plugin-go-template](https://github.com/NiklasPor/prettier-plugin-go-template) for inspiration on Go template formatting
- [Hugo](https://gohugo.io/) for the amazing static site generator

---

**Made with ❤️ for the Hugo community**
