# prettier-plugin-hugo-post

[![npm version](https://img.shields.io/npm/v/prettier-plugin-hugo-post)](https://www.npmjs.com/package/prettier-plugin-hugo-post)
[![license](https://img.shields.io/npm/l/prettier-plugin-hugo-post)](https://github.com/metcalfc/prettier-plugin-hugo-post/blob/main/LICENSE)

A Prettier plugin for formatting Hugo content files with YAML front matter, Markdown content, and Hugo template syntax.

## Features

- 🎯 **YAML front matter formatting** - Uses Prettier's built-in YAML parser for consistent formatting
- 📝 **Markdown content formatting** - Uses Prettier's built-in Markdown parser for professional formatting  
- 🏷️ **Hugo shortcode formatting** - Properly formats shortcode parameters and spacing
- 🔧 **Hugo template formatting** - Formats template variables, pipelines, and control structures
- ⚙️ **Zero configuration** - Works out of the box with sensible defaults
- 🔗 **Prettier integration** - Respects your existing Prettier configuration

## Installation

```bash
npm install --save-dev prettier prettier-plugin-hugo-post
```

**Note**: `prettier` is a peer dependency, so make sure you have it installed in your project.

## Configuration

### Basic Setup

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

### Advanced Configuration

For Hugo projects, you might want more specific configuration:

**.prettierrc.json**

```json
{
  "plugins": ["prettier-plugin-hugo-post"],
  "overrides": [
    {
      "files": ["content/**/*.md"],
      "options": {
        "parser": "hugo-post",
        "printWidth": 100,
        "proseWrap": "preserve"
      }
    }
  ]
}
```

## Usage

### Command Line

```bash
# Format a single file
npx prettier --write content/posts/my-post.md

# Format all Hugo content files
npx prettier --write "content/**/*.md"

# Check formatting without writing
npx prettier --check "content/**/*.md"
```

### Before and After

**Input:**

```markdown
---
title:    'My Blog Post'
date: 2025-01-15
tags:   [  'hugo',   'blog'  ]
draft:    false
---

#    My Title

This is some content with a Hugo shortcode:

{{<figure src="/image.jpg"alt="Description"class="center">}}

And a Hugo template:

{{.Title|upper|truncate 50}}

{{if .Params.featured}}
Featured post!
{{end}}
```

**Output:**

```markdown
---
title: "My Blog Post"
date: 2025-01-15
tags: ["hugo", "blog"]
draft: false
---

# My Title

This is some content with a Hugo shortcode:

{{< figure src="/image.jpg " alt="Description " class="center" >}}

And a Hugo template:

{{ .Title | upper | truncate 50 }}

{{ if .Params.featured }}
Featured post!
{{ end }}
```

## Formatting Flow

The plugin processes Hugo content files in three stages:

### 1. 🎯 Front Matter Formatting

**YAML front matter** (between `---` delimiters):
- Uses Prettier's built-in YAML parser
- Formats indentation, quoting, and spacing
- Example: `title:    "Post"` → `title: "Post"`

**TOML front matter** (between `+++` delimiters):
- Preserved as-is (no formatting applied)
- Maintains original spacing and structure

### 2. 🏷️ Hugo Template Formatting

**Shortcode parameter spacing:**
- `{{<figure src="/img.jpg"title="Test">}}` → `{{< figure src="/img.jpg " title="Test" >}}`
- `{{% notice info %}}` → `{{% notice info %}}`
- Handles both `{{< >}}` and `{{% %}}` syntax

**Template variable spacing:**
- `{{.Title}}` → `{{ .Title }}`  
- `{{.Params.author}}` → `{{ .Params.author }}`

**Pipeline formatting:**
- `{{.Title|upper|truncate 50}}` → `{{ .Title | upper | truncate 50 }}`
- Adds proper spacing around pipe operators

**Control structures:**
- `{{if .Featured}}` → `{{ if .Featured }}`
- `{{range .Pages}}` → `{{ range .Pages }}`
- `{{end}}` → `{{ end }}`

**Whitespace control preservation:**
- `{{- if .Featured -}}` → `{{- if .Featured -}}` (unchanged)
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

This plugin is designed to work seamlessly with Hugo projects:

```bash
# Add to your Hugo project
npm install --save-dev prettier prettier-plugin-hugo-post

# Format your content
npx prettier --write "content/**/*.md"

# Add to your build process
npm run format && hugo build
```

## Comparison with Alternatives

| Feature           | prettier-plugin-hugo-post | Standard Prettier |
| ----------------- | ------------------------- | ----------------- |
| YAML Front Matter | ✅ Formatted              | ❌ Ignored        |
| Markdown Content  | ✅ Formatted              | ✅ Formatted      |
| Hugo Shortcodes   | ✅ Formatted              | ❌ May break      |
| Hugo Templates    | ✅ Formatted              | ❌ May break      |
| Mixed Content     | ✅ Seamless               | ❌ Requires setup |

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

### Shortcode Parameters Have Extra Spaces

This is expected behavior. The plugin normalizes shortcode parameter spacing:
- `{{<figure src="/img.jpg"title="Test">}}` becomes `{{< figure src="/img.jpg " title="Test" >}}`
- This ensures consistent formatting and readability

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
