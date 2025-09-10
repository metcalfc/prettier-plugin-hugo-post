import { formatCode, runTableDrivenTests } from '../helpers.js';

describe('Basic Hugo Functionality', () => {
  describe('Front Matter Parsing', () => {
    runTableDrivenTests([
      {
        name: 'parses and formats YAML front matter',
        input: `---
title:    "Hello World"
date:   2023-01-01
tags:  [  "test",   "sample"  ]
data:   [ 1,  2,   3 ]
---

# Content here`,
        shouldContain: [
          'title: "Hello World"',
          'date: 2023-01-01',
          'tags: ["test", "sample"]',
          'data: [1, 2, 3]',
          '# Content here',
        ],
      },
      {
        name: 'formats TOML front matter correctly',
        input: `+++
title   =   "TOML Test"
description =    "Testing TOML formatting"
draft   =false
tags    = [   "test",    "toml"   ]
author = {name="John", email="john@test.com"}
+++

# {{ .Title }}`,
        shouldContain: [
          'title = "TOML Test"',
          'description = "Testing TOML formatting"',
          'draft = false',
          'tags = ["test", "toml"]',
          'author = { name = "John", email = "john@test.com" }',
          '# {{ .Title }}',
        ],
      },
      {
        name: 'formats JSON front matter correctly',
        input: `{
    "title":   "JSON Test",
"description": "Testing JSON formatting",
 "draft":false,
   "tags": [   "test",    "json"   ],
      "author": {"name":"Jane", "email":"jane@test.com"}
}

# {{ .Title }}`,
        shouldContain: [
          '"title": "JSON Test"',
          '"description": "Testing JSON formatting"',
          '"draft": false',
          '"tags": ["test", "json"]',
          '"author": { "name": "Jane", "email": "jane@test.com" }',
          '# {{ .Title }}',
        ],
      },
      {
        name: 'handles content without front matter',
        input: '# Just a title\n\nSome content here.',
        shouldContain: ['# Just a title', 'Some content here.'],
      },
      {
        name: 'handles malformed YAML gracefully',
        input: `---
title: "Test
invalid yaml: content
---

# Content`,
        shouldContain: ['# Content'],
      },
    ]);
  });

  describe('Hugo Shortcode Formatting', () => {
    runTableDrivenTests([
      {
        name: 'formats shortcodes with proper spacing',
        input: '{{<figure src="/test.jpg"alt="test">}}',
        shouldContain: ['{{< figure src="/test.jpg" alt="test" >}}'],
      },
      {
        name: 'formats shortcodes with mixed quote styles',
        input: `{{<shortcode param1='value1'param2="value2">}}`,
        shouldContain: [`{{< shortcode param1='value1' param2="value2" >}}`],
      },
      {
        name: 'formats shortcodes with excessive whitespace',
        input: '{{<   figure    src="/test.jpg"     >}}',
        shouldContain: ['{{< figure src="/test.jpg" >}}'],
      },
      {
        name: 'formats {{% %}} style shortcodes',
        input: '{{% notice   info %}}Content{{% /notice %}}',
        shouldContain: ['{{% notice info %}}', 'Content', '{{% /notice %}}'],
      },
      {
        name: 'handles shortcodes with no parameters',
        input: '{{<br>}}',
        shouldContain: ['{{< br >}}'],
      },
      {
        name: 'handles self-closing shortcodes',
        input: '{{<figure src="/test.jpg"/>}}',
        shouldContain: ['{{< figure src="/test.jpg" >}}'],
      },
      {
        name: 'removes spaces inside quoted parameter values',
        input: '{{< shortcode param=" spaced value " >}}',
        shouldContain: ['{{< shortcode param="spaced value" >}}'],
      },
      {
        name: 'handles mixed quote styles to avoid escaping',
        input: `{{< shortcode text="He said 'hello'" title='The "Best" Post' >}}`,
        shouldContain: [`{{< shortcode text="He said 'hello'" title='The "Best" Post' >}}`],
      },
    ]);
  });

  describe('Hugo Template Variables', () => {
    runTableDrivenTests([
      {
        name: 'formats template variables with proper spacing',
        input: '{{.Title}}',
        shouldContain: ['{{ .Title }}'],
      },
      {
        name: 'formats template pipelines',
        input: '{{.Title|upper|truncate 50}}',
        shouldContain: ['{{ .Title | upper | truncate 50 }}'],
      },
      {
        name: 'handles template control structures',
        input: '{{if .IsHome}}Home{{else}}Not Home{{end}}',
        shouldContain: ['{{ if .IsHome }}', 'Home', '{{ else }}', 'Not Home', '{{ end }}'],
      },
      {
        name: 'preserves whitespace control in templates',
        input: '{{- .Title -}}',
        shouldContain: ['{{- .Title -}}'],
      },
      {
        name: 'formats complex pipe expressions with proper spacing',
        input: '{{ .Content|replaceRE  "\\\\b\\\\w+\\\\b"   "word"|truncate 100 }}',
        shouldContain: ['{{ .Content | replaceRE "\\\\b\\\\w+\\\\b" "word" | truncate 100 }}'],
      },
      {
        name: 'formats function calls with multiple arguments',
        input: '{{ printf  "%s - %s"   .Title   .Date }}',
        shouldContain: ['{{ printf "%s - %s" .Title .Date }}'],
      },
      {
        name: 'formats dict and slice functions',
        input: '{{ dict   "title"  .Title  "date"   .Date }}',
        shouldContain: ['{{ dict "title" .Title "date" .Date }}'],
      },
      {
        name: 'handles complex nested expressions',
        input: '{{ .Title | upper | printf "Title: %s" }}',
        shouldContain: ['{{ .Title | upper | printf "Title: %s" }}'],
      },
    ]);
  });

  describe('Template-Markdown Interaction', () => {
    runTableDrivenTests([
      {
        name: 'prevents {{ end }} from being indented under list items',
        input: `---
title: "Test"
---

{{ range .Pages }}
- {{ .Title }}
{{ end }}`,
        shouldContain: ['{{ range .Pages }}', '- {{ .Title }}', '{{ end }}'],
        shouldNotContain: ['  {{ end }}'], // Should not be indented
      },
      {
        name: 'handles multiple control structures with lists',
        input: `{{ if .IsHome }}
- Home item
{{ else }}
- Other item
{{ end }}`,
        shouldContain: [
          '{{ if .IsHome }}',
          '- Home item',
          '{{ else }}',
          '- Other item',
          '{{ end }}',
        ],
        shouldNotContain: ['  {{ else }}', '  {{ end }}'],
      },
      {
        name: 'preserves proper spacing around block templates',
        input: `Some content
{{ range .Pages }}
- {{ .Title }}
{{ end }}
More content`,
        shouldContain: [
          'Some content',
          '{{ range .Pages }}',
          '- {{ .Title }}',
          '{{ end }}',
          'More content',
        ],
      },
    ]);
  });

  describe('Hugo Comments', () => {
    test('formats template comments', async () => {
      const input = '{{/* This is a comment */}}';
      const result = await formatCode(input);
      expect(result).toContain('{{/* This is a comment */}}');
    });
  });
});
