# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial implementation of prettier-plugin-hugo-post
- Support for YAML, TOML, and JSON front matter formatting
- Hugo template syntax formatting (variables, shortcodes, control structures)
- Markdown content formatting while preserving Hugo templates
- Configurable options for bracket spacing and shortcode formatting
- Comprehensive test suite
- Documentation and examples

### Features
- Smart multi-format parsing for hybrid Hugo content files
- Template-aware markdown formatting
- Hugo shortcode support (`{{< >}}` and `{{% %}}`)
- Go template formatting with proper spacing
- Whitespace control preservation (`{{-` and `-}}`)
- Template comment handling (`{{/* */}}`)
- Pipeline formatting with proper spacing around `|`
- Front matter preservation and formatting

## [0.1.0] - 2025-01-15

### Added
- Initial release
- Basic Hugo content file parsing and formatting
- Support for common Hugo template patterns
- Integration with Prettier 3.x
- Test suite and documentation
