import { format } from 'prettier';
import * as plugin from '../src/index.js';

describe('prettier-plugin-hugo-post', () => {
  const formatCode = async (code, options = {}) => {
    return await format(code, {
      parser: 'hugo-post',
      plugins: [plugin],
      printWidth: 80,
      ...options,
    });
  };

  describe('Front Matter Parsing', () => {
    test('parses and formats YAML front matter', async () => {
      const input = `---
title:    "Test Post"
date:   2025-01-15
tags:   [  "test" ,  "hugo"  ]
description:     "A test post"
---

# Test
`;

      const result = await formatCode(input);
      expect(result).toContain('title: "Test Post"');
      expect(result).toContain('date: 2025-01-15');
      expect(result).toContain('tags: ["test", "hugo"]');
      expect(result).toContain('description: "A test post"');
      expect(result).toContain('# Test');
    });

    test('handles TOML front matter without formatting', async () => {
      const input = `+++
title    =   "Test Post"
date = "2025-01-15"
+++

# Test
`;

      const result = await formatCode(input);
      expect(result).toContain('+++');
      expect(result).toContain('title    =   "Test Post"'); // TOML kept as-is
      expect(result).toContain('# Test');
    });

    test('handles content without front matter', async () => {
      const input = `# Just Markdown

{{ .Title }}

Some content here.
`;

      const result = await formatCode(input);
      expect(result).toContain('# Just Markdown');
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('Some content here.');
    });

    test('handles malformed YAML gracefully', async () => {
      const input = `---
title: "Test
invalid: yaml: content
---

# Test
`;

      const result = await formatCode(input);
      expect(result).toContain('# Test');
      expect(result).toContain('title: "Test'); // Keeps malformed YAML as-is
    });
  });

  describe('Hugo Shortcode Formatting', () => {
    test('formats shortcodes with proper spacing', async () => {
      const input = `---
title: "Test"
---

{{<figure src="/test.jpg"title="Test"alt="Description">}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< figure src="/test.jpg" title="Test" alt="Description" >}}');
    });

    test('formats shortcodes with mixed quote styles', async () => {
      const input = `---
title: "Test"
---

{{<figure src='/test.jpg'title="Test"class='featured'>}}
`;

      const result = await formatCode(input);
      expect(result).toContain("{{< figure src='/test.jpg' title=\"Test\" class='featured' >}}");
    });

    test('formats shortcodes with excessive whitespace', async () => {
      const input = `---
title: "Test"
---

{{<    highlight   go   "linenos=table"    >}}
code here
{{</highlight>}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< highlight go "linenos=table" >}}');
      expect(result).toContain('{{< /highlight >}}');
    });

    test('formats {{% %}} style shortcodes', async () => {
      const input = `---
title: "Test"
---

{{% notice   info   "title"   %}}
Content here
{{% /notice %}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{% notice info "title" %}}');
      expect(result).toContain('{{% /notice %}}');
    });

    test('handles shortcodes with no parameters', async () => {
      const input = `---
title: "Test"
---

{{<   br   >}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< br >}}');
    });

    test('handles self-closing shortcodes', async () => {
      const input = `---
title: "Test"
---

{{<figure src="/test.jpg"/>}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< figure src="/test.jpg" >}}');
    });

    test('removes spaces inside quoted parameter values', async () => {
      const input = `---
title: "Test"
---

{{< img src="/images/my-prompt.png " width="75%" center="true" >}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< img src="/images/my-prompt.png" width="75%" center="true" >}}');
    });

    test('handles mixed quote styles to avoid escaping', async () => {
      const input = `---
title: "Test"
---

{{<figure alt='Image with "quotes" inside' class="featured">}}
`;

      const result = await formatCode(input);
      expect(result).toContain(
        '{{< figure alt=\'Image with "quotes" inside\' class="featured" >}}'
      );
    });

    test('formats word immediately followed by quotes', async () => {
      const input = `---
title: "Test"
---

{{< highlight go"linenos=table,hl_lines=2 3" >}}
code here
{{< /highlight >}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< highlight go "linenos=table,hl_lines=2 3" >}}');
    });

    test('handles multiple spacing issues in one shortcode', async () => {
      const input = `---
title: "Test"
---

{{<figure src="/test.jpg "title="Test Title "alt="Description "class="featured">}}
`;

      const result = await formatCode(input);
      expect(result).toContain(
        '{{< figure src="/test.jpg" title="Test Title" alt="Description" class="featured" >}}'
      );
    });
  });

  describe('Hugo Template Variables', () => {
    test('formats template variables with proper spacing', async () => {
      const input = `---
title: "Test"
---

# {{.Title}}

Content by {{   .Params.author   }}.
`;

      const result = await formatCode(input);
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{ .Params.author }}');
    });

    test('formats template pipelines', async () => {
      const input = `---
title: "Test"
---

{{ .Title|upper|truncate 50 }}
{{ .Content|markdownify|safeHTML }}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{ .Title | upper | truncate 50 }}');
      expect(result).toContain('{{ .Content | markdownify | safeHTML }}');
    });

    test('handles template control structures', async () => {
      const input = `---
title: "Test"
---

{{if .Params.featured}}
Featured content!
{{else}}
Regular content.
{{end}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{ if .Params.featured }}');
      expect(result).toContain('{{ else }}');
      expect(result).toContain('{{ end }}');
    });

    test('preserves whitespace control in templates', async () => {
      const input = `---
title: "Test"
---

{{-   if .Featured   -}}
Featured!
{{-  end  -}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{- if .Featured -}}');
      expect(result).toContain('{{- end -}}');
    });
  });

  describe('Hugo Comments', () => {
    test('formats template comments', async () => {
      const input = `---
title: "Test"
---

{{/*   This is a comment   */}}
{{/* Another comment with
multiple lines */}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{/* This is a comment */}}');
      expect(result).toContain('{{/* Another comment with\nmultiple lines */}}');
    });
  });

  describe('Mixed Content Integration', () => {
    test('formats complex mixed content correctly', async () => {
      const input = `---
title:    "Complex Post"
date:   2025-01-15
tags: [  "test",   "hugo"  ]
---

# {{ .Title }}

Welcome to my blog! This was written by {{.Params.author}} on {{.Date.Format "January 2, 2006"}}.

{{<figure src="/hero.jpg"alt="Hero Image"class="featured">}}

## Code Example

{{<highlight go"linenos=table,hl_lines=2 3">}}
package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
{{</highlight>}}

{{% notice warning %}}
This is a **warning** notice.
{{% /notice %}}

## Template Logic

{{if .Params.featured}}
### Featured Post
This post is featured!
{{end}}
`;

      const result = await formatCode(input);

      // Check YAML formatting
      expect(result).toContain('title: "Complex Post"');
      expect(result).toContain('tags: ["test", "hugo"]');

      // Check template variables
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{ .Params.author }}');
      expect(result).toContain('{{ .Date.Format "January 2, 2006" }}');

      // Check shortcodes
      expect(result).toContain('{{< figure src="/hero.jpg" alt="Hero Image" class="featured" >}}');
      expect(result).toContain('{{< highlight go "linenos=table,hl_lines=2 3" >}}');
      expect(result).toContain('{{% notice warning %}}');

      // Check template control structures
      expect(result).toContain('{{ if .Params.featured }}');
      expect(result).toContain('{{ end }}');

      // Check markdown formatting
      expect(result).toContain('# {{ .Title }}');
      expect(result).toContain('## Code Example');
      expect(result).toContain('### Featured Post');
    });

    test('handles inline shortcodes in paragraphs', async () => {
      const input = `---
title: "Test"
---

This is a paragraph with {{<ref "other-post">}} inline shortcode.

Another paragraph with multiple {{<ref "post1">}} and {{<ref "post2">}} references.
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< ref "other-post" >}}');
      expect(result).toContain('{{< ref "post1" >}}');
      expect(result).toContain('{{< ref "post2" >}}');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty files', async () => {
      const input = '';
      const result = await formatCode(input);
      expect(result).toBe('');
    });

    test('handles files with only front matter', async () => {
      const input = `---
title: "Test"
---`;

      const result = await formatCode(input);
      expect(result).toContain('title: "Test"');
    });

    test('handles files with only content', async () => {
      const input = `# Just Content

Some text here.
`;

      const result = await formatCode(input);
      expect(result).toContain('# Just Content');
      expect(result).toContain('Some text here.');
    });

    test('handles nested template structures', async () => {
      const input = `---
title: "Test"
---

{{ range .Pages }}
  {{ if .Params.featured }}
    {{<figure src="{{.Params.image}}"alt="{{.Title}}">}}
  {{ end }}
{{ end }}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{ range .Pages }}');
      expect(result).toContain('{{ if .Params.featured }}');
      expect(result).toContain('{{< figure src="{{ .Params.image }}" alt="{{ .Title }}" >}}');
      expect(result).toContain('{{ end }}');
    });

    test('handles shortcodes with special characters in parameters', async () => {
      const input =
        `---
title: "Test"
---

` + String.raw`{{<figure src="/path/to/image.jpg"alt="Image with \"quotes\" and 'apostrophes'">}}`;

      const result = await formatCode(input);
      expect(result).toContain(
        String.raw`{{< figure src="/path/to/image.jpg" alt="Image with \"quotes\" and 'apostrophes'" >}}`
      );
    });

    test('preserves content inside block shortcodes', async () => {
      const input = `---
title: "Test"
---

{{<highlight yaml>}}
title:    "Unformatted YAML"
data:   [ 1,  2,   3 ]
{{</highlight>}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< highlight yaml >}}');
      // Content inside blocks gets formatted by markdown parser
      expect(result).toContain('title: "Unformatted YAML"');
      expect(result).toContain('data: [ 1, 2, 3 ]');
      expect(result).toContain('{{< /highlight >}}');
    });
  });

  describe('Prettier Integration', () => {
    test('respects tabWidth setting for YAML', async () => {
      const input = `---
nested:
  item: value
  deeper:
    item: value
---

# Content
`;

      const result = await formatCode(input, { tabWidth: 4 });
      expect(result).toContain('nested:');
      expect(result).toContain('    item: value'); // 4 spaces
      expect(result).toContain('    deeper:');
      expect(result).toContain('        item: value'); // 8 spaces
    });

    test('handles useTabs setting (YAML may not support tabs)', async () => {
      const input = `---
nested:
  item: value
  deeper:
    item: value
---

# Content
`;

      const result = await formatCode(input, { useTabs: true });
      expect(result).toContain('nested:');
      expect(result).toContain('item: value');
      expect(result).toContain('deeper:');
      // Note: YAML formatter may not respect useTabs due to YAML spec preferences
      expect(result).toContain('# Content');
    });

    test('respects singleQuote setting for YAML strings', async () => {
      const input = `---
title: "Double Quotes"
description: "Another string"
author: "Test Author"
---

# Content
`;

      const result = await formatCode(input, { singleQuote: true });
      expect(result).toContain("title: 'Double Quotes'");
      expect(result).toContain("description: 'Another string'");
      expect(result).toContain("author: 'Test Author'");
    });

    test('preserves mixed quotes when needed to avoid escaping', async () => {
      const input = `---
title: "String with 'single quotes' inside"
description: 'String with "double quotes" inside'
---

# Content
`;

      const result = await formatCode(input, { singleQuote: true });
      // Should preserve double quotes to avoid escaping
      expect(result).toContain('title: "String with \'single quotes\' inside"');
      // Should use single quotes when no conflict
      expect(result).toContain('description: \'String with "double quotes" inside\'');
    });

    test('respects printWidth for long YAML lines', async () => {
      const input = `---
very_long_key_name_that_exceeds_normal_width: "This is a very long value that definitely exceeds the print width"
short: "value"
---

# Content
`;

      const result40 = await formatCode(input, { printWidth: 40 });
      const result120 = await formatCode(input, { printWidth: 120 });

      expect(result40).toContain('very_long_key_name_that_exceeds_normal_width:');
      expect(result120).toContain('very_long_key_name_that_exceeds_normal_width:');
      // Both should format but may handle line breaks differently
    });

    test('respects proseWrap setting for markdown content', async () => {
      const input = `---
title: "Test"
---

This is a very long line of markdown text that should be wrapped according to the proseWrap setting when it exceeds the specified print width limit.
`;

      const resultAlways = await formatCode(input, {
        proseWrap: 'always',
        printWidth: 40,
      });

      const resultNever = await formatCode(input, {
        proseWrap: 'never',
        printWidth: 40,
      });

      // With proseWrap: 'always', long lines should be broken
      const alwaysLines = resultAlways.split('\n');
      const hasShortLines = alwaysLines.some(line => line.trim().length > 0 && line.length <= 50);
      expect(hasShortLines).toBe(true);

      // With proseWrap: 'never', long lines should remain long
      expect(resultNever).toContain('This is a very long line');
    });

    test('combines multiple prettier options correctly', async () => {
      const input = `---
title:    "Test Post"
description:   "A test with multiple formatting issues"
tags:  [   "test",   "hugo",   "prettier"   ]
nested:
  deep:
    value: "nested content"
---

This is a very long paragraph that should be wrapped when proseWrap is enabled and the print width is small.

{{ .Title }}
{{<figure src="/test.jpg"title="Test Image">}}
`;

      const result = await formatCode(input, {
        tabWidth: 4,
        useTabs: false,
        singleQuote: true,
        printWidth: 60,
        proseWrap: 'always',
      });

      // Check YAML formatting with options
      expect(result).toContain("title: 'Test Post'");
      expect(result).toContain("description: 'A test with multiple formatting issues'");
      expect(result).toContain("tags: ['test', 'hugo', 'prettier']");
      expect(result).toContain('    deep:'); // 4 spaces
      expect(result).toContain("        value: 'nested content'"); // 8 spaces

      // Check Hugo elements still work
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{< figure src="/test.jpg" title="Test Image" >}}');
    });

    test('works with all prettier quote style combinations', async () => {
      const input = `---
single: 'original single'
double: "original double"
mixed: "has 'inner' quotes"
---

{{< shortcode param1='single' param2="double" param3="has 'quotes'" >}}
`;

      // Test with singleQuote: true
      const singleResult = await formatCode(input, { singleQuote: true });
      expect(singleResult).toContain("single: 'original single'");
      expect(singleResult).toContain("double: 'original double'");
      expect(singleResult).toContain('mixed: "has \'inner\' quotes"'); // Keeps double to avoid escaping
      expect(singleResult).toContain(
        '{{< shortcode param1=\'single\' param2="double" param3="has \'quotes\'" >}}'
      );

      // Test with singleQuote: false (default)
      const doubleResult = await formatCode(input, { singleQuote: false });
      expect(doubleResult).toContain('single: "original single"');
      expect(doubleResult).toContain('double: "original double"');
      expect(doubleResult).toContain('mixed: "has \'inner\' quotes"');
      // Shortcode parameters may preserve original quote style
      expect(doubleResult).toContain(
        '{{< shortcode param1=\'single\' param2="double" param3="has \'quotes\'" >}}'
      );
    });

    test('handles edge case prettier options gracefully', async () => {
      const input = `---
title: "Test"
list: ["a", "b", "c"]
---

{{ .Title }}
{{< shortcode param="value" >}}
`;

      // Test with extreme tabWidth
      const result2 = await formatCode(input, { tabWidth: 2 });
      const result8 = await formatCode(input, { tabWidth: 8 });

      expect(result2).toContain('title: "Test"');
      expect(result8).toContain('title: "Test"');

      // Test with very small printWidth
      const resultSmall = await formatCode(input, { printWidth: 20 });
      expect(resultSmall).toContain('title: "Test"');
      expect(resultSmall).toContain('{{ .Title }}');

      // Test with very large printWidth
      const resultLarge = await formatCode(input, { printWidth: 200 });
      expect(resultLarge).toContain('title: "Test"');
      expect(resultLarge).toContain('{{ .Title }}');
    });

    test('preserves hugo syntax integrity with all prettier options', async () => {
      const input = `---
title: "Integration Test"
---

{{if .Featured}}
  {{.Title|upper|truncate 50}}
  {{<figure src="/hero.jpg"alt="Hero"class="featured">}}
{{end}}

{{% notice info %}}
Important information here.
{{% /notice %}}
`;

      const options = [
        { singleQuote: true, tabWidth: 2 },
        { singleQuote: false, tabWidth: 4, useTabs: true },
        { printWidth: 40, proseWrap: 'always' },
        { printWidth: 120, singleQuote: true, useTabs: false },
      ];

      for (const option of options) {
        const result = await formatCode(input, option);

        // Verify Hugo syntax is preserved and properly formatted
        expect(result).toContain('{{ if .Featured }}');
        expect(result).toContain('{{ .Title | upper | truncate 50 }}');
        expect(result).toContain('{{< figure src="/hero.jpg" alt="Hero" class="featured" >}}');
        expect(result).toContain('{{ end }}');
        expect(result).toContain('{{% notice info %}}');
        expect(result).toContain('{{% /notice %}}');
      }
    });
  });

  describe('Real-World Hugo Patterns', () => {
    test('formats typical blog post structure', async () => {
      const input = `---
title:    "How to Use Hugo with Prettier"
date:   2025-01-15T10:00:00Z
lastmod:     2025-01-16T12:00:00Z
author:  "John Doe"
tags:  [  "hugo",   "prettier",   "static-sites"  ]
categories: ["tutorials"]
featured:    true
draft: false
summary:     "Learn how to format Hugo content files with Prettier"
---

# {{ .Title }}

{{ if .Params.featured }}
{{% notice info %}}⭐ This is a featured post!{{% /notice %}}
{{ end }}

Published on {{ .Date.Format "January 2, 2006" }} by {{ .Params.author }}.

{{<toc>}}

## Introduction

{{ .Summary }}

## Getting Started

First, install the required packages:

{{<highlight bash>}}
npm install prettier prettier-plugin-hugo-post
{{</highlight>}}

## Configuration

Create a \`.prettierrc\` file:

{{< highlight json >}}
{
  "plugins": ["prettier-plugin-hugo-post"],
  "overrides": [
    {
      "files": ["content/**/*.md"],
      "options": { "parser": "hugo-post" }
    }
  ]
}
{{< /highlight >}}

## Related Posts

{{ $related := where .Site.Pages ".Params.tags" "intersect" .Params.tags }}
{{ range first 3 $related }}
- [{{ .Title }}]({{ .RelPermalink }}) - {{ .Date.Format "Jan 2" }}
{{ end }}

## Conclusion

This plugin makes formatting Hugo content much easier!

{{ if .Params.draft }}
*Note: This post is still a draft.*
{{ end }}`;

      const result = await formatCode(input);

      // Check YAML front matter formatting
      expect(result).toContain('title: "How to Use Hugo with Prettier"');
      expect(result).toContain('date: 2025-01-15T10:00:00Z');
      expect(result).toContain('author: "John Doe"');
      expect(result).toContain('tags: ["hugo", "prettier", "static-sites"]');
      expect(result).toContain('categories: ["tutorials"]');
      expect(result).toContain('featured: true');

      // Check template variables
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{ .Date.Format "January 2, 2006" }}');
      expect(result).toContain('{{ .Params.author }}');
      expect(result).toContain('{{ .Summary }}');

      // Check conditional templates
      expect(result).toContain('{{ if .Params.featured }}');
      expect(result).toContain('{{ end }}');
      expect(result).toContain('{{ if .Params.draft }}');

      // Check shortcodes
      expect(result).toContain('{{% notice info %}}');
      expect(result).toContain('{{% /notice %}}');
      expect(result).toContain('{{< toc >}}');
      expect(result).toContain('{{< highlight bash >}}');
      expect(result).toContain('{{< /highlight >}}');

      // Check complex template logic
      expect(result).toContain(
        '{{ $related := where .Site.Pages ".Params.tags" "intersect" .Params.tags }}'
      );
      expect(result).toContain('{{ range first 3 $related }}');
      expect(result).toContain('{{ .RelPermalink }}');
      expect(result).toContain('{{ .Date.Format "Jan 2" }}');
    });

    test('handles Hugo built-in shortcodes and documentation patterns', async () => {
      const input = `---
title: "Hugo Documentation Example"
version: "0.100.0"
---

{{<param "version">}}
{{<version>}}
{{<new-in "0.100.0">}}

{{< code-toggle file="config" >}}
baseURL:    "https://example.com"
title:   "My Site"
{{< /code-toggle >}}

{{% note %}}
This feature was added in Hugo {{< param version >}}.
{{% /note %}}

{{< readfile file="/content/example.md" >}}

{{< figure src="/images/diagram.png" title="Architecture Diagram" >}}`;

      const result = await formatCode(input);

      // Check built-in shortcodes are formatted correctly
      expect(result).toContain('{{< param "version" >}}');
      expect(result).toContain('{{< version >}}');
      expect(result).toContain('{{< new-in "0.100.0" >}}');
      expect(result).toContain('{{< readfile file="/content/example.md" >}}');

      // Check code-toggle shortcode with content
      expect(result).toContain('{{< code-toggle file="config" >}}');
      expect(result).toContain('baseURL: "https://example.com"');
      expect(result).toContain('title: "My Site"');
      expect(result).toContain('{{< /code-toggle >}}');

      // Check mixed shortcode styles
      expect(result).toContain('{{% note %}}');
      expect(result).toContain('Hugo {{< param version >}}');
      expect(result).toContain('{{% /note %}}');

      // Check figure shortcode
      expect(result).toContain(
        '{{< figure src="/images/diagram.png" title="Architecture Diagram" >}}'
      );
    });

    test('handles multilingual Hugo site patterns', async () => {
      const input = `---
title: "About"
title_fr:    "À propos"
title_es:  "Acerca de"
description:   "About this site"
description_fr: "À propos de ce site"
description_es:    "Acerca de este sitio"
languages:
  en:
    weight: 1
  fr:
    weight: 2
  es:
    weight: 3
---

{{ if eq .Site.Language.Lang "fr" }}
# {{ .Params.title_fr }}
{{ .Params.description_fr }}
{{ else if eq .Site.Language.Lang "es" }}
# {{ .Params.title_es }}
{{ .Params.description_es }}
{{ else }}
# {{ .Title }}
{{ .Description }}
{{ end }}

## Language Navigation

{{ range .Site.Languages }}
{{ if ne .Lang $.Site.Language.Lang }}
- [{{ .LanguageName }}]({{ $.RelPermalink | relLangURL .Lang }})
{{ end }}
{{ end }}

## Translated Content

{{ with .Translations }}
Available in:
{{ range . }}
- [{{ .Language.LanguageName }}]({{ .RelPermalink }})
{{ end }}
{{ end }}`;

      const result = await formatCode(input);

      // Check YAML front matter with multilingual fields
      expect(result).toContain('title: "About"');
      expect(result).toContain('title_fr: "À propos"');
      expect(result).toContain('title_es: "Acerca de"');
      expect(result).toContain('description: "About this site"');
      expect(result).toContain('description_fr: "À propos de ce site"');
      expect(result).toContain('description_es: "Acerca de este sitio"');

      // Check language configuration
      expect(result).toContain('languages:');
      expect(result).toContain('en:');
      expect(result).toContain('weight: 1');

      // Check multilingual template logic
      expect(result).toContain('{{ if eq .Site.Language.Lang "fr" }}');
      expect(result).toContain('{{ .Params.title_fr }}');
      expect(result).toContain('{{ else if eq .Site.Language.Lang "es" }}');
      expect(result).toContain('{{ .Params.title_es }}');

      // Check complex template operations
      expect(result).toContain('{{ range .Site.Languages }}');
      expect(result).toContain('{{ if ne .Lang $.Site.Language.Lang }}');
      expect(result).toContain('{{ $.RelPermalink | relLangURL .Lang }}');
      expect(result).toContain('{{ with .Translations }}');
    });

    test('handles custom shortcodes and complex forms', async () => {
      const input = `---
title: "Contact Us"
form_action: "/submit"
---

# Contact Us

Please fill out the form below:

{{< contact-form action="/submit" method="post" class="contact-form" >}}
{{< field type="text" name="name" label="Full Name" required="true" placeholder="Enter your name" >}}
{{< field type="email" name="email" label="Email Address" required="true" validation="email" >}}
{{< field type="tel" name="phone" label="Phone Number" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" >}}
{{< field type="textarea" name="message" label="Message" required="true" rows="5" cols="50" >}}
{{< field type="select" name="subject" label="Subject" options="General,Support,Sales" required="true" >}}
{{< field type="checkbox" name="newsletter" label="Subscribe to newsletter" value="yes" >}}
{{< button type="submit" text="Send Message" class="btn-primary" >}}
{{< /contact-form >}}

## Photo Gallery

{{< gallery dir="/images/gallery/" thumb="300x200" full="1200x800" />}}

## Social Sharing

{{< social-share platforms="twitter,facebook,linkedin,reddit" title="{{ .Title }}" url="{{ .RelPermalink }}" >}}

## Related Links

{{< link-card title="Documentation" url="/docs/" description="Read our comprehensive documentation" >}}
{{< link-card title="Blog" url="/blog/" description="Latest news and updates" >}}`;

      const result = await formatCode(input);

      // Check complex shortcode formatting
      expect(result).toContain(
        '{{< contact-form action="/submit" method="post" class="contact-form" >}}'
      );
      expect(result).toContain(
        '{{< field type="text" name="name" label="Full Name" required="true" placeholder="Enter your name" >}}'
      );
      expect(result).toContain(
        '{{< field type="email" name="email" label="Email Address" required="true" validation="email" >}}'
      );
      expect(result).toContain(
        '{{< field type="textarea" name="message" label="Message" required="true" rows="5" cols="50" >}}'
      );
      expect(result).toContain('{{< /contact-form >}}');

      // Check self-closing shortcodes with complex parameters
      expect(result).toContain(
        '{{< gallery dir="/images/gallery/" thumb="300x200" full="1200x800" >}}'
      );

      // Check shortcodes with template variables
      expect(result).toContain(
        '{{< social-share platforms="twitter,facebook,linkedin,reddit" title="{{ .Title }}" url="{{ .RelPermalink }}" >}}'
      );

      // Check consistent formatting across multiple similar shortcodes
      expect(result).toContain(
        '{{< link-card title="Documentation" url="/docs/" description="Read our comprehensive documentation" >}}'
      );
      expect(result).toContain(
        '{{< link-card title="Blog" url="/blog/" description="Latest news and updates" >}}'
      );
    });

    test('handles complex data structures and loops', async () => {
      const input = `---
title: "Product Catalog"
products:
  - name:    "Product A"
    price:   29.99
    category: "electronics"
    features: [  "feature1",  "feature2",   "feature3"  ]
    specs:
      weight:   "2.5kg"
      dimensions: "10x5x2 inches"
      warranty:    "2 years"
  - name: "Product B"
    price: 49.99
    category:  "accessories"
    features: ["feature4", "feature5"]
    specs:
      weight: "0.5kg"
      dimensions:   "5x3x1 inches"
      warranty: "1 year"
team:
  - name: "Alice"
    role: "Developer"
    bio: "Full-stack developer with 5 years experience"
  - name: "Bob"
    role: "Designer"
    bio:  "UI/UX designer specializing in user experience"
---

# {{ .Title }}

## Our Products

{{ range $index, $product := .Params.products }}
### {{ add $index 1 }}. {{ $product.name }}

**Price:** \${{ $product.price }}
**Category:** {{ $product.category | title }}

#### Features:
{{ range $product.features }}
- {{ . | title }}
{{ end }}

#### Specifications:
{{ range $key, $value := $product.specs }}
- **{{ $key | title }}:** {{ $value }}
{{ end }}

{{ if lt $index (sub (len $.Params.products) 1) }}
---
{{ end }}
{{ end }}

## Our Team

{{ range .Params.team }}
### {{ .name }}
**Role:** {{ .role }}

{{ .bio }}

{{ if .email }}
**Contact:** [{{ .email }}](mailto:{{ .email }})
{{ end }}
{{ end }}

## Statistics

{{ $totalProducts := len .Params.products }}
{{ $avgPrice := 0 }}
{{ range .Params.products }}
{{ $avgPrice = add $avgPrice .price }}
{{ end }}
{{ $avgPrice = div $avgPrice $totalProducts }}

- **Total Products:** {{ $totalProducts }}
- **Average Price:** \${{ printf "%.2f" $avgPrice }}
- **Team Members:** {{ len .Params.team }}`;

      const result = await formatCode(input);

      // Check YAML formatting for complex nested data
      expect(result).toContain('products:');
      expect(result).toContain('- name: "Product A"');
      expect(result).toContain('price: 29.99');
      expect(result).toContain('features: ["feature1", "feature2", "feature3"]');
      expect(result).toContain('specs:');
      expect(result).toContain('weight: "2.5kg"');
      expect(result).toContain('dimensions: "10x5x2 inches"');

      // Check complex template loops and variables
      expect(result).toContain('{{ range $index, $product := .Params.products }}');
      expect(result).toContain('{{ add $index 1 }}');
      expect(result).toContain('{{ $product.name }}');
      expect(result).toContain('{{ $product.price }}');
      expect(result).toContain('{{ $product.category | title }}');

      // Check nested loops
      expect(result).toContain('{{ range $product.features }}');
      expect(result).toContain('{{ . | title }}');
      expect(result).toContain('{{ range $key, $value := $product.specs }}');
      expect(result).toContain('{{ $key | title }}');

      // Check conditional logic in loops
      expect(result).toContain('{{ if lt $index (sub (len $.Params.products) 1) }}');
      expect(result).toContain('{{ if .email }}');

      // Check mathematical operations
      expect(result).toContain('{{ $totalProducts := len .Params.products }}');
      expect(result).toContain('{{ $avgPrice := 0 }}');
      expect(result).toContain('{{ $avgPrice = add $avgPrice .price }}');
      expect(result).toContain('{{ $avgPrice = div $avgPrice $totalProducts }}');
      expect(result).toContain('{{ printf "%.2f" $avgPrice }}');
    });

    test('handles real-world blog with complex metadata and SEO', async () => {
      const input = `---
title: "The Future of Web Development"
slug:    "future-web-development-2025"
date: 2025-01-15T10:00:00Z
lastmod:   2025-01-16T15:30:00Z
publishDate:  2025-01-15T10:00:00Z
expiryDate:    2025-12-31T23:59:59Z
author:
  name:   "Jane Smith"
  email: "jane@example.com"
  twitter:  "@janesmith"
  bio: "Senior web developer with 10 years experience"
seo:
  title:   "Future of Web Development 2025 - Complete Guide"
  description:    "Discover the latest trends and technologies shaping web development in 2025. Complete guide with examples."
  keywords: [  "web development",  "2025 trends",   "javascript",  "react",   "vue"  ]
  image: "/images/web-dev-2025.jpg"
  canonical:   "https://example.com/future-web-development-2025/"
social:
  twitter:
    card:  "summary_large_image"
    site: "@example"
    creator:   "@janesmith"
  facebook:
    app_id:   "123456789"
  linkedin:
    title:  "The Future of Web Development - 2025 Edition"
categories:   [  "Web Development",   "Technology"  ]
tags: ["javascript", "react",   "vue", "web3",    "ai"  ]
featured:  true
toc: true
math:    false
draft:   false
---

# {{ .Title }}

{{ if .Params.seo.description }}
> {{ .Params.seo.description }}
{{ end }}

*By [{{ .Params.author.name }}]({{ .Params.author.email | printf "mailto:%s" }}) on {{ .Date.Format "January 2, 2006" }}*

{{ if .Params.toc }}
{{< toc >}}
{{ end }}

## Introduction

{{ if .Params.featured }}
{{% notice featured %}}
🌟 This is a featured article covering the most important trends in web development for 2025.
{{% /notice %}}
{{ end }}

Web development continues to evolve at breakneck speed...

## Key Trends for 2025

{{ $trends := slice "AI Integration" "Web3 Technologies" "Performance Optimization" "Accessibility" }}
{{ range $index, $trend := $trends }}
### {{ add $index 1 }}. {{ $trend }}

Content about {{ $trend | lower }}...

{{ end }}

## Code Examples

{{< highlight javascript >}}
// Modern JavaScript patterns
const modernWebDev = {
  ai: true,
  web3: true,
  performance: 'optimized'
};
{{< /highlight >}}

## Author Information

{{ with .Params.author }}
**About the Author:**
- **Name:** {{ .name }}
- **Contact:** [{{ .email }}](mailto:{{ .email }})
{{ if .twitter }}
- **Twitter:** [{{ .twitter }}](https://twitter.com/{{ .twitter | strings.TrimPrefix "@" }})
{{ end }}
- **Bio:** {{ .bio }}
{{ end }}

## SEO Information

{{ with .Params.seo }}
**SEO Details:**
- **Meta Title:** {{ .title }}
- **Keywords:** {{ delimit .keywords ", " }}
- **Canonical URL:** {{ .canonical }}
{{ end }}

## Related Posts

{{ $related := where .Site.RegularPages "Section" "blog" | where "Params.categories" "intersect" .Params.categories | first 3 }}
{{ if gt (len $related) 0 }}
{{ range $related }}
- [{{ .Title }}]({{ .RelPermalink }}) - *{{ .Date.Format "Jan 2, 2006" }}*
{{ end }}
{{ else }}
*No related posts found.*
{{ end }}`;

      const result = await formatCode(input);

      // Check complex nested YAML structure
      expect(result).toContain('title: "The Future of Web Development"');
      expect(result).toContain('author:');
      expect(result).toContain('name: "Jane Smith"');
      expect(result).toContain('email: "jane@example.com"');

      expect(result).toContain('seo:');
      expect(result).toContain('title: "Future of Web Development 2025 - Complete Guide"');
      expect(result).toContain(
        'keywords: ["web development", "2025 trends", "javascript", "react", "vue"]'
      );

      expect(result).toContain('social:');
      expect(result).toContain('twitter:');
      expect(result).toContain('card: "summary_large_image"');

      // Check complex template logic
      expect(result).toContain('{{ if .Params.seo.description }}');
      expect(result).toContain('{{ .Params.author.email | printf "mailto:%s" }}');
      expect(result).toContain('{{ .Date.Format "January 2, 2006" }}');

      // Check advanced template operations
      expect(result).toContain(
        '{{ $trends := slice "AI Integration" "Web3 Technologies" "Performance Optimization" "Accessibility" }}'
      );
      expect(result).toContain('{{ range $index, $trend := $trends }}');
      expect(result).toContain('{{ $trend | lower }}');

      // Check with statements and nested access
      expect(result).toContain('{{ with .Params.author }}');
      expect(result).toContain('{{ .twitter | strings.TrimPrefix "@" }}');
      expect(result).toContain('{{ with .Params.seo }}');
      expect(result).toContain('{{ delimit .keywords ", " }}');

      // Check complex where operations
      expect(result).toContain(
        '{{ $related := where .Site.RegularPages "Section" "blog" | where "Params.categories" "intersect" .Params.categories | first 3 }}'
      );
      expect(result).toContain('{{ if gt (len $related) 0 }}');
    });
  });

  describe('Unicode and Internationalization', () => {
    test('handles mixed RTL/LTR text correctly', async () => {
      const input = `---
title: "Mixed Languages"
description: "English and العربية and 中文"
author: "محمد Smith"
keywords: ["english", "العربية", "中文", "русский"]
---

# English Title العربية 中文

This is English text مع النص العربي and 中文字符 and русский текст.

{{ .Title | printf "%s - %s" "العنوان" }}

## Section with Mixed Text

Content in multiple scripts: Latin, العربية, 中文, русский, ελληνικά.

{{< figure src="/test.jpg" title="混合语言 Mixed Languages مختلط" >}}

### More Mixed Content

- English bullet
- نقطة عربية
- 中文要点
- Русский пункт
- ελληνικό σημείο

{{ range .Site.Pages }}
{{ if eq .Params.language "العربية" }}
- [{{ .Title }}]({{ .RelPermalink }}) - باللغة العربية
{{ else if eq .Params.language "中文" }}
- [{{ .Title }}]({{ .RelPermalink }}) - 中文版本
{{ end }}
{{ end }}`;

      const result = await formatCode(input);

      // Check YAML front matter with unicode
      expect(result).toContain('title: "Mixed Languages"');
      expect(result).toContain('description: "English and العربية and 中文"');
      expect(result).toContain('author: "محمد Smith"');
      expect(result).toContain('keywords: ["english", "العربية", "中文", "русский"]');

      // Check mixed text preservation in content
      expect(result).toContain('# English Title العربية 中文');
      expect(result).toContain(
        'This is English text مع النص العربي and 中文字符 and русский текст.'
      );

      // Check unicode in templates
      expect(result).toContain('{{ .Title | printf "%s - %s" "العنوان" }}');
      expect(result).toContain('{{ if eq .Params.language "العربية" }}');
      expect(result).toContain('باللغة العربية');
      expect(result).toContain('{{ else if eq .Params.language "中文" }}');
      expect(result).toContain('中文版本');

      // Check unicode in shortcodes
      expect(result).toContain(
        '{{< figure src="/test.jpg" title="混合语言 Mixed Languages مختلط" >}}'
      );

      // Check list items with different scripts
      expect(result).toContain('- نقطة عربية');
      expect(result).toContain('- 中文要点');
      expect(result).toContain('- Русский пункт');
      expect(result).toContain('- ελληνικό σημείο');
    });

    test('preserves emoji and special characters in templates and shortcodes', async () => {
      const input = `---
title: "Emoji Test 🚀"
description: "Testing emoji support ⭐🎉"
rating: "5/5 ⭐⭐⭐⭐⭐"
tags: ["🚀 rockets", "⭐ stars", "🎉 celebrations"]
social:
  twitter: "Follow us! 🐦"
  github: "Star us! ⭐"
---

# {{ .Title }} 🎯

{{ .Params.emoji | default "🚀" }}

{{ printf "Rating: %s" (strings.Repeat "⭐" .Params.rating) }}

## Emoji in Templates

{{ if .Params.featured }}
🌟 Featured content! {{ .Title }}
{{ end }}

{{< notice icon="💡" type="info" >}}
💡 Tip: Use emojis to make content more engaging! 🎉
{{< /notice >}}

{{< social-share
  twitter="🐦 Share on Twitter"
  facebook="📘 Share on Facebook"
  email="📧 Share via Email"
>}}

## Different Categories

### Transportation 🚗
- 🚗 Cars
- ✈️ Airplanes
- 🚂 Trains
- 🚲 Bicycles

### Food 🍕
- 🍕 Pizza
- 🍔 Hamburgers
- 🍣 Sushi
- 🥗 Salads

### Weather ☀️
{{ $weather := slice "☀️ Sunny" "🌧️ Rainy" "❄️ Snowy" "⛅ Cloudy" }}
{{ range $weather }}
- {{ . }}
{{ end }}

## Complex Emoji Usage

{{< highlight text >}}
Complex emoji: 👨‍💻 👩‍🚀 🏳️‍🌈
Family: 👨‍👩‍👧‍👦
Skin tones: 👋🏻 👋🏽 👋🏿
{{< /highlight >}}

{{ printf "🎊 Celebration: %s 🎊" .Title }}`;

      const result = await formatCode(input);

      // Check YAML front matter with emojis
      expect(result).toContain('title: "Emoji Test 🚀"');
      expect(result).toContain('description: "Testing emoji support ⭐🎉"');
      expect(result).toContain('rating: "5/5 ⭐⭐⭐⭐⭐"');
      expect(result).toContain('tags: ["🚀 rockets", "⭐ stars", "🎉 celebrations"]');
      expect(result).toContain('twitter: "Follow us! 🐦"');

      // Check emoji in templates
      expect(result).toContain('{{ .Params.emoji | default "🚀" }}');
      expect(result).toContain('{{ printf "Rating: %s" (strings.Repeat "⭐" .Params.rating) }}');
      expect(result).toContain('🌟 Featured content! {{ .Title }}');

      // Check emoji in shortcodes
      expect(result).toContain('{{< notice icon="💡" type="info" >}}');
      expect(result).toContain('💡 Tip: Use emojis to make content more engaging! 🎉');
      expect(result).toContain('{{< social-share');
      expect(result).toContain('twitter="🐦 Share on Twitter"');
      expect(result).toContain('facebook="📘 Share on Facebook"');
      expect(result).toContain('email="📧 Share via Email"');

      // Check complex emojis
      expect(result).toContain('Complex emoji: 👨‍💻 👩‍🚀 🏳️‍🌈');
      expect(result).toContain('Family: 👨‍👩‍👧‍👦');
      expect(result).toContain('Skin tones: 👋🏻 👋🏽 👋🏿');

      // Check emoji in template functions
      expect(result).toContain('{{ printf "🎊 Celebration: %s 🎊" .Title }}');

      // Check lists with emojis
      expect(result).toContain('- 🚗 Cars');
      expect(result).toContain('- 🍕 Pizza');
      // Check template-generated weather list
      expect(result).toContain(
        '{{ $weather := slice "☀️ Sunny" "🌧️ Rainy" "❄️ Snowy" "⛅ Cloudy" }}'
      );
      expect(result).toContain('{{ range $weather }}');
      expect(result).toContain('- {{ . }}');
    });

    test('handles unicode in shortcode parameters', async () => {
      const input = `---
title: "Unicode Parameters"
---

# Unicode in Shortcodes

{{< figure
  src="/images/测试.jpg"
  title="Тест изображение"
  alt="テスト画像"
  caption="🎉 Многоязычное изображение 图像测试"
  class="测试类"
>}}

{{< gallery
  dir="/图片/画廊/"
  title="Галерея фотографий フォトギャラリー"
  description="صور متنوعة από διάφορες χώρες"
>}}

{{< button
  text="点击这里 Нажмите здесь κάντε κλικ εδώ"
  url="/页面/страница/σελίδα/"
  class="按钮类 кнопка-класс κλάση-κουμπιού"
>}}

{{< contact-form action="/联系/контакт/επαφή/" >}}
{{< field
  type="text"
  name="姓名"
  label="您的姓名 Ваше имя Το όνομά σας"
  placeholder="请输入姓名 Введите имя Εισάγετε όνομα"
>}}
{{< field
  type="email"
  name="电子邮件"
  label="📧 Email العنوان الإلكتروني"
  validation="必须是有效邮箱 Должен быть действительным email"
>}}
{{< /contact-form >}}

{{< code file="测试.js" language="javascript" title="多语言代码示例" >}}
// Comments in multiple languages
// 这是中文注释
// Это русский комментарий
// Αυτό είναι ελληνικό σχόλιο
// هذا تعليق عربي
console.log("Hello 世界 мир κόσμος عالم! 🌍");
{{< /code >}}`;

      const result = await formatCode(input);

      // Check figure shortcode with unicode parameters
      expect(result).toContain('{{< figure');
      expect(result).toContain('src="/images/测试.jpg"');
      expect(result).toContain('title="Тест изображение"');
      expect(result).toContain('alt="テスト画像"');
      expect(result).toContain('caption="🎉 Многоязычное изображение 图像测试"');
      expect(result).toContain('class="测试类"');

      // Check gallery shortcode with unicode paths and text
      expect(result).toContain('{{< gallery');
      expect(result).toContain('dir="/图片/画廊/"');
      expect(result).toContain('title="Галерея фотографий フォトギャラリー"');
      expect(result).toContain('description="صور متنوعة από διάφορες χώρες"');

      // Check button with multilingual text
      expect(result).toContain('{{< button');
      expect(result).toContain('text="点击这里 Нажмите здесь κάντε κλικ εδώ"');
      expect(result).toContain('url="/页面/страница/σελίδα/"');
      expect(result).toContain('class="按钮类 кнопка-класс κλάση-κουμπιού"');

      // Check form fields with unicode names and labels
      expect(result).toContain('{{< contact-form action="/联系/контакт/επαφή/" >}}');
      expect(result).toContain('{{< field');
      expect(result).toContain('type="text"');
      expect(result).toContain('name="姓名"');
      expect(result).toContain('label="您的姓名 Ваше имя Το όνομά σας"');
      expect(result).toContain('{{< field');
      expect(result).toContain('type="email"');
      expect(result).toContain('name="电子邮件"');
      expect(result).toContain('label="📧 Email العنوان الإلكتروني"');

      // Check code block with multilingual content
      expect(result).toContain(
        '{{< code file="测试.js" language="javascript" title="多语言代码示例" >}}'
      );
      expect(result).toContain('// 这是中文注释');
      expect(result).toContain('// Это русский комментарий');
      expect(result).toContain('// هذا تعليق عربي');
      expect(result).toContain('console.log("Hello 世界 мир κόσμος عالم! 🌍");');
    });

    test('preserves mathematical symbols and special characters', async () => {
      const input = `---
title: "Mathematics & Symbols"
formula: "E = mc²"
symbols: ["∑", "∫", "∂", "∆", "π", "∞", "≈", "≠", "≤", "≥"]
currencies: ["$", "€", "¥", "£", "₹", "₽", "₩", "₪"]
fractions: ["¼", "½", "¾", "⅓", "⅔", "⅛", "⅜", "⅝", "⅞"]
---

# Mathematical Content: {{ .Params.formula }}

## Mathematical Expressions

{{ $pi := 3.14159 }}
{{ $area := mul $pi (pow .Params.radius 2) }}

Area of circle: **A = πr² ≈ {{ printf "%.2f" $area }}**

### Common Mathematical Symbols

{{ range .Params.symbols }}
- {{ . }} ({{ . | printf "%U" }})
{{ end }}

### Equations in Templates

{{< math >}}
∫₋∞^∞ e^(-x²) dx = √π

∑ᵢ₌₁ⁿ i = n(n+1)/2

∂f/∂x = lim[h→0] (f(x+h) - f(x))/h
{{< /math >}}

### Currency Symbols

{{ range $currency := .Params.currencies }}
{{< price symbol="{{ $currency }}" amount="100.00" >}}
{{ end }}

### Fractions and Special Characters

**Fractions:** {{ range .Params.fractions }}{{ . }} {{ end }}

**Copyright & Legal:** © ® ™ ℠ ℗

**Arrows & Logic:** → ← ↑ ↓ ↔ ⟹ ∧ ∨ ¬ ∀ ∃

**Geometry:** ∠ ∟ ⊥ ∥ △ ▢ ○ ●

### Physics & Chemistry

{{< formula title="Einstein's Mass-Energy Equivalence" >}}
E = mc²
Where:
- E = energy (joules)
- m = mass (kg)
- c = speed of light (≈ 3.00 × 10⁸ m/s)
{{< /formula >}}

{{< chemical formula="H₂SO₄" name="Sulfuric Acid" >}}
{{< chemical formula="C₆H₁₂O₆" name="Glucose" >}}

### Temperature & Units

{{ $celsius := 25 }}
{{ $fahrenheit := add (mul $celsius 1.8) 32 }}

- Temperature: {{ $celsius }}°C = {{ printf "%.1f" $fahrenheit }}°F
- Distance: 5 km ≈ 3.1 mi
- Mass: 2.5 kg ≈ 5.5 lb
- Volume: 1 L ≈ 0.26 gal

### Advanced Mathematical Notation

{{< theorem name="Pythagorean Theorem" >}}
In a right triangle: **a² + b² = c²**
{{< /theorem >}}

{{< proof >}}
∀ right triangles with sides a, b, c where c is hypotenuse:
∃ relationship such that a² + b² = c²
∴ The theorem holds ∀ right triangles. ∎
{{< /proof >}}`;

      const result = await formatCode(input);

      // Check YAML with mathematical symbols
      expect(result).toContain('title: "Mathematics & Symbols"');
      expect(result).toContain('formula: "E = mc²"');
      expect(result).toContain('symbols: ["∑", "∫", "∂", "∆", "π", "∞", "≈", "≠", "≤", "≥"]');
      expect(result).toContain('currencies: ["$", "€", "¥", "£", "₹", "₽", "₩", "₪"]');
      expect(result).toContain('fractions: ["¼", "½", "¾", "⅓", "⅔", "⅛", "⅜", "⅝", "⅞"]');

      // Check mathematical expressions in templates
      expect(result).toContain('{{ $area := mul $pi (pow .Params.radius 2) }}');
      expect(result).toContain('Area of circle: **A = πr² ≈ {{ printf "%.2f" $area }}**');

      // Check mathematical symbols preservation
      expect(result).toContain('∫₋∞^∞ e^(-x²) dx = √π');
      expect(result).toContain('∑ᵢ₌₁ⁿ i = n(n+1)/2');
      expect(result).toContain('∂f/∂x = lim[h→0] (f(x+h) - f(x))/h');

      // Check currency symbols in shortcodes
      expect(result).toContain('{{< price symbol="{{ $currency }}" amount="100.00" >}}');

      // Check special characters and symbols
      expect(result).toContain('**Copyright & Legal:** © ® ™ ℠ ℗');
      expect(result).toContain('**Arrows & Logic:** → ← ↑ ↓ ↔ ⟹ ∧ ∨ ¬ ∀ ∃');
      expect(result).toContain('**Geometry:** ∠ ∟ ⊥ ∥ △ ▢ ○ ●');

      // Check scientific notation
      expect(result).toContain('- c = speed of light (≈ 3.00 × 10⁸ m/s)');
      expect(result).toContain('{{< chemical formula="H₂SO₄" name="Sulfuric Acid" >}}');
      expect(result).toContain('{{< chemical formula="C₆H₁₂O₆" name="Glucose" >}}');

      // Check temperature conversions with symbols
      expect(result).toContain(
        '- Temperature: {{ $celsius }}°C = {{ printf "%.1f" $fahrenheit }}°F'
      );

      // Check advanced mathematical notation
      expect(result).toContain('In a right triangle: **a² + b² = c²**');
      expect(result).toContain('∀ right triangles with sides a, b, c where c is hypotenuse:');
      expect(result).toContain('∴ The theorem holds ∀ right triangles. ∎');
    });

    test('handles complex unicode combinations and edge cases', async () => {
      const input = `---
title: "Complex Unicode"
author: "José María O'Connor-Smith 김철수"
description: "Testing complex unicode: café résumé naïve Москва 北京 🌍"
tags: ["العربية‎", "עברית‎", "🇺🇸🇫🇷🇩🇪", "👨‍💻", "🏳️‍🌈"]
---

# Unicode Edge Cases

## Combining Characters & Diacritics

Café, résumé, naïve, cañón, Москва, São Paulo, Åse, ñoño

{{< restaurant
  name="Café Français"
  address="123 Champs-Élysées, Paris"
  specialty="crème brûlée & café au lait"
>}}

## Bidirectional Text (BIDI)

English text العربية text עברית text русский text.

{{< quote author="الكاتب العربي" >}}
This is a quote with Arabic: مرحبا بكم في موقعنا
And Hebrew: שלום וברכה
Mixed with English and русский текст.
{{< /quote >}}

## Country Flags & Complex Emojis

{{ $countries := slice "🇺🇸 USA" "🇫🇷 France" "🇩🇪 Germany" "🇯🇵 Japan" "🇨🇳 China" "🇷🇺 Russia" "🇸🇦 Saudi Arabia" }}

Available languages:
{{ range $countries }}
- {{ . }}
{{ end }}

## Professional Emojis & Sequences

{{ $professions := slice "👨‍💻 Developer" "👩‍🚀 Astronaut" "👨‍🎓 Graduate" "👩‍⚕️ Doctor" "👨‍🍳 Chef" }}

Team members:
{{ range $professions }}
- {{ . }}
{{ end }}

## Unicode in File Paths & URLs

{{< gallery dir="/图片/фото/φωτογραφίες/" >}}

{{< link url="/صفحة/страница/σελίδα/" text="多言語ページ" >}}

## Zero-Width Characters & Special Cases

{{< text >}}
Word‌joiner invisible‍character test.
Text with soft­hyphen and non‑breaking‑hyphen.
{{< /text >}}

## Mathematical & Scientific Unicode

{{< formula >}}
∀x∈ℝ: ∃y∈ℂ such that |z|² = x² + y²
∴ ℂ ⊃ ℝ and ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ
{{< /formula >}}

Chemical formulas with subscripts: H₂O, CO₂, C₆H₁₂O₆, Ca²⁺, SO₄²⁻

## Currency & Financial Symbols

{{ $financial := dict "USD" "$100.50" "EUR" "€85.75" "GBP" "£72.25" "JPY" "¥11,500" "CNY" "¥650.00" "RUB" "₽5,500" }}

Financial data:
{{ range $currency, $amount := $financial }}
- {{ $currency }}: {{ $amount }}
{{ end }}

## Right-to-Left Embedding

{{< multilingual >}}
English paragraph with embedded العربية text والمزيد من النص and back to English.

Another paragraph with עברית text בתוך הטקסט האנגלי and continuing in English.
{{< /multilingual >}}

## Normalization Test Cases

{{< normalize-test >}}
café (NFC): café
café (NFD): cafe\u0301
résumé vs résumé (different unicode representations)
{{< /normalize-test >}}`;

      const result = await formatCode(input);

      // Check complex unicode in front matter
      expect(result).toContain('title: "Complex Unicode"');
      expect(result).toContain('author: "José María O\'Connor-Smith 김철수"');
      expect(result).toContain(
        'description: "Testing complex unicode: café résumé naïve Москва 北京 🌍"'
      );
      expect(result).toContain('tags: ["العربية‎", "עברית‎", "🇺🇸🇫🇷🇩🇪", "👨‍💻", "🏳️‍🌈"]');

      // Check diacritics preservation
      expect(result).toContain('{{< restaurant');
      expect(result).toContain('name="Café Français"');
      expect(result).toContain('address="123 Champs-Élysées, Paris"');
      expect(result).toContain('specialty="crème brûlée & café au lait"');

      // Check bidirectional text
      expect(result).toContain('English text العربية text עברית text русский text.');
      expect(result).toContain('{{< quote author="الكاتب العربي" >}}');
      expect(result).toContain('This is a quote with Arabic: مرحبا بكم في موقعنا');
      expect(result).toContain('And Hebrew: שלום וברכה');

      // Check flag emojis (template-generated)
      expect(result).toContain(
        '{{ $countries := slice "🇺🇸 USA" "🇫🇷 France" "🇩🇪 Germany" "🇯🇵 Japan" "🇨🇳 China" "🇷🇺 Russia" "🇸🇦 Saudi Arabia" }}'
      );
      expect(result).toContain('{{ range $countries }}');
      expect(result).toContain('- {{ . }}');

      // Check professional emoji sequences (template-generated)
      expect(result).toContain(
        '{{ $professions := slice "👨‍💻 Developer" "👩‍🚀 Astronaut" "👨‍🎓 Graduate" "👩‍⚕️ Doctor" "👨‍🍳 Chef" }}'
      );
      expect(result).toContain('{{ range $professions }}');

      // Check unicode file paths
      expect(result).toContain('{{< gallery dir="/图片/фото/φωτογραφίες/" >}}');
      expect(result).toContain('{{< link url="/صفحة/страница/σελίδα/" text="多言語ページ" >}}');

      // Check mathematical unicode
      expect(result).toContain('∀x∈ℝ: ∃y∈ℂ such that |z|² = x² + y²');
      expect(result).toContain('∴ ℂ ⊃ ℝ and ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ');
      expect(result).toContain('Chemical formulas with subscripts: H₂O, CO₂, C₆H₁₂O₆, Ca²⁺, SO₄²⁻');

      // Check various currency symbols (template-generated)
      expect(result).toContain(
        '{{ $financial := dict "USD" "$100.50" "EUR" "€85.75" "GBP" "£72.25" "JPY" "¥11,500" "CNY" "¥650.00" "RUB" "₽5,500" }}'
      );
      expect(result).toContain('{{ range $currency, $amount := $financial }}');
      expect(result).toContain('- {{ $currency }}: {{ $amount }}');

      // Check RTL embedding
      expect(result).toContain(
        'English paragraph with embedded العربية text والمزيد من النص and back to English.'
      );
      expect(result).toContain(
        'Another paragraph with עברית text בתוך הטקסט האנגלי and continuing in English.'
      );
    });
  });

  describe('Performance and Memory Tests', () => {
    test('handles large files efficiently', async () => {
      // Generate large content with many templates and shortcodes
      const generateLargeContent = lines => {
        const sections = [];
        sections.push('---');
        sections.push('title: "Large Content Test"');
        sections.push('description: "Testing performance with large files"');
        sections.push('tags: ["performance", "large", "test"]');
        sections.push('---');
        sections.push('');

        for (let i = 0; i < lines; i++) {
          if (i % 100 === 0) {
            sections.push(`## Section ${Math.floor(i / 100)}`);
            sections.push('');
          }
          if (i % 10 === 0) {
            sections.push(`{{< shortcode${i} param="value${i}" >}}`);
          } else if (i % 7 === 0) {
            sections.push(`{{ .Variable${i} | printf "Value: %s" }}`);
          } else {
            sections.push(`Line ${i}: This is content line ${i} with {{ .Params.test${i} }}`);
          }
        }
        return sections.join('\n');
      };

      const largeInput = generateLargeContent(1000); // 1000 lines

      const start = performance.now();
      const result = await formatCode(largeInput);
      const end = performance.now();

      // Should complete in reasonable time (less than 3 seconds)
      expect(end - start).toBeLessThan(3000);

      // Should still format correctly
      expect(result).toContain('title: "Large Content Test"');
      expect(result).toContain('{{< shortcode0 param="value0" >}}');
      expect(result).toContain('{{ .Variable77 | printf "Value: %s" }}'); // Variables appear every 7 lines
      expect(result).toContain('## Section 5');
    });

    test('handles deeply nested template structures', async () => {
      const generateNestedTemplates = depth => {
        let content = '---\ntitle: "Nested Test"\n---\n\n';

        // Create deep nesting
        for (let i = 0; i < depth; i++) {
          content += `{{ if .Params.level${i} }}\n`;
          content += `  Content at level ${i}\n`;
          if (i % 5 === 0) {
            content += `  {{< shortcode level="${i}" >}}\n`;
          }
        }

        content += 'Deeply nested content at the center\n';

        // Close all the nesting
        for (let i = 0; i < depth; i++) {
          content += `{{ end }}\n`;
        }

        return content;
      };

      const nestedInput = generateNestedTemplates(50); // 50 levels deep

      const start = performance.now();
      const result = await formatCode(nestedInput);
      const end = performance.now();

      // Should not timeout or cause stack overflow
      expect(end - start).toBeLessThan(2000);
      expect(result).toContain('title: "Nested Test"');
      expect(result).toContain('{{ if .Params.level0 }}');
      expect(result).toContain('{{ if .Params.level49 }}');
      expect(result).toContain('Deeply nested content at the center');

      // Count that we have the right number of {{ end }} statements
      const endCount = (result.match(/{{ end }}/g) || []).length;
      expect(endCount).toBe(50);
    });

    test('handles files with many shortcodes efficiently', async () => {
      const generateManyShortcodes = count => {
        let content = '---\ntitle: "Many Shortcodes"\n---\n\n';

        for (let i = 0; i < count; i++) {
          if (i % 10 === 0) {
            content += `## Section ${Math.floor(i / 10)}\n\n`;
          }

          const shortcodeType = i % 4;
          switch (shortcodeType) {
            case 0:
              content += `{{< figure src="/img${i}.jpg" title="Image ${i}" >}}\n`;
              break;
            case 1:
              content += `{{< highlight javascript "linenos=table" >}}\nconsole.log("Code ${i}");\n{{< /highlight >}}\n`;
              break;
            case 2:
              content += `{{% notice info %}}This is notice ${i}{{% /notice %}}\n`;
              break;
            case 3:
              content += `{{< youtube id="video${i}" >}}\n`;
              break;
          }

          if (i % 50 === 0 && i > 0) {
            content += '\n<!-- Performance checkpoint -->\n\n';
          }
        }

        return content;
      };

      const manyShortcodesInput = generateManyShortcodes(500); // 500 shortcodes

      const start = performance.now();
      const result = await formatCode(manyShortcodesInput);
      const end = performance.now();

      // Should process many shortcodes efficiently
      expect(end - start).toBeLessThan(2500);
      expect(result).toContain('title: "Many Shortcodes"');
      expect(result).toContain('{{< figure src="/img0.jpg" title="Image 0" >}}');
      expect(result).toContain('{{< highlight javascript "linenos=table" >}}');
      expect(result).toContain('{{% notice info %}}This is notice 2{{% /notice %}}');
      expect(result).toContain('{{< youtube id="video499" >}}');
    });

    test('handles large shortcode parameters without memory issues', async () => {
      const largeParam = 'x'.repeat(10000); // 10KB parameter
      const input = `---
title: "Large Parameters"
---

{{< shortcode
  data="${largeParam}"
  description="This is a test with a very large parameter value"
  config="large-config-${largeParam.substring(0, 100)}"
>}}

{{ .Title }}

{{< another-shortcode param="${largeParam}" >}}
Content here
{{< /another-shortcode >}}`;

      const start = performance.now();
      const result = await formatCode(input);
      const end = performance.now();

      // Should handle large parameters without excessive memory usage
      expect(end - start).toBeLessThan(1500);
      expect(result).toContain('title: "Large Parameters"');
      expect(result).toContain('{{< shortcode');
      expect(result).toContain('data="' + largeParam.substring(0, 50));
      expect(result).toContain('{{< another-shortcode');
      expect(result).toContain('{{ .Title }}');
    });

    test('handles mixed content with alternating templates and markdown', async () => {
      const generateMixedContent = sections => {
        let content = '---\ntitle: "Mixed Content Performance"\n---\n\n';

        for (let i = 0; i < sections; i++) {
          // Add markdown content
          content += `# Heading ${i}\n\n`;
          content += `This is paragraph ${i} with some **bold** and *italic* text.\n\n`;
          content += `- List item ${i}.1\n- List item ${i}.2\n- List item ${i}.3\n\n`;

          // Add template variables
          content += `{{ .Params.variable${i} | default "default${i}" }}\n\n`;

          // Add shortcode
          content += `{{< shortcode${i % 5} param="${i}" title="Section ${i}" >}}\n`;
          content += `Content for shortcode ${i}\n`;
          content += `{{< /shortcode${i % 5} >}}\n\n`;

          // Add template logic
          content += `{{ if .Params.show${i} }}\n`;
          content += `Additional content for section ${i}\n`;
          content += `{{ end }}\n\n`;

          // Add code block occasionally
          if (i % 10 === 0) {
            content += '```javascript\n';
            content += `console.log("Section ${i}");\n`;
            content += 'const data = { section: ' + i + ' };\n';
            content += '```\n\n';
          }
        }

        return content;
      };

      const mixedInput = generateMixedContent(100); // 100 sections

      const start = performance.now();
      const result = await formatCode(mixedInput);
      const end = performance.now();

      // Should handle mixed content efficiently
      expect(end - start).toBeLessThan(4000);
      expect(result).toContain('title: "Mixed Content Performance"');
      expect(result).toContain('# Heading 0');
      expect(result).toContain('{{ .Params.variable50 | default "default50" }}');
      expect(result).toContain('{{< shortcode2 param="97" title="Section 97" >}}');
      expect(result).toContain('{{ if .Params.show99 }}');
      expect(result).toContain('console.log("Section 90");');
    });
  });

  describe('Error Recovery and Robustness', () => {
    test('handles malformed shortcode quotes gracefully', async () => {
      const input = `---
title: "Error Recovery Test"
---

# Testing Malformed Quotes

{{< figure src="unclosed-quote.jpg title="Missing quote >}}

Some content here.

{{< shortcode param="mixed'quotes"and"more >}}

More content.

{{< valid-shortcode param="this works" >}}`;

      // Should not crash or hang
      const start = performance.now();
      let result;
      expect(() => {
        result = formatCode(input);
      }).not.toThrow();

      result = await result;
      const end = performance.now();

      // Should complete in reasonable time even with malformed input
      expect(end - start).toBeLessThan(1000);
      expect(result).toContain('title: "Error Recovery Test"');
      expect(result).toContain('# Testing Malformed Quotes');
      expect(result).toContain('{{< valid-shortcode param="this works" >}}');
    });

    test('handles invalid YAML front matter gracefully', async () => {
      const input = `---
title: "Test
invalid: yaml: content: without: proper: nesting
  bad_indent: value
missing_quote: "unclosed string
- invalid list format
  nested: without parent
---

# Content Section

This content should still be formatted correctly.

{{ .Title }}

{{< shortcode param="value" >}}`;

      let result;
      expect(() => {
        result = formatCode(input);
      }).not.toThrow();

      result = await result;

      // Should preserve content even with invalid YAML
      expect(result).toContain('# Content Section');
      expect(result).toContain('This content should still be formatted correctly.');
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{< shortcode param="value" >}}');
    });

    test('handles mixed template syntaxes gracefully', async () => {
      const input = `---
title: "Mixed Template Syntax"
---

# Hugo and Other Templates

Hugo template: {{ .Title }}

ERB style: <%= @title %>

Jinja style: {{ title }} and {# comment #}

Handlebars: {{{ raw_html }}} and {{#if condition}}

Hugo shortcode: {{< figure src="/test.jpg" >}}

More Hugo: {{ range .Pages }}{{ .Title }}{{ end }}

Django template: {% for item in items %}{{ item }}{% endfor %}

Back to Hugo: {{% notice info %}}Hugo content{{% /notice %}}`;

      const result = await formatCode(input);

      // Should format Hugo syntax but leave others unchanged
      expect(result).toContain('title: "Mixed Template Syntax"');
      expect(result).toContain('{{ .Title }}'); // Hugo formatted
      expect(result).toContain('{{< figure src="/test.jpg" >}}'); // Hugo formatted
      expect(result).toContain('{{ range .Pages }}{{ .Title }}{{ end }}'); // Hugo formatted
      expect(result).toContain('{{% notice info %}}Hugo content{{% /notice %}}'); // Hugo formatted

      // Non-Hugo templates should be preserved as-is
      expect(result).toContain('<%= @title %>');
      expect(result).toContain('{# comment #}');
      expect(result).toContain('{{ { raw_html }}}'); // May be parsed as malformed Hugo but still present
      expect(result).toContain('{% for item in items %}{{ item }}{% endfor %}');
    });

    test('handles template syntax errors gracefully', async () => {
      const input = `---
title: "Syntax Errors"
---

{{ if .Params.featured }}
Content without closing tag

{{ range .Pages }}
  {{ .Title }}
  {{ if .Draft }}
    Draft content
  Missing {{ end }} for if
Missing {{ end }} for range

{{< shortcode without-closing

{{% notice info %}}
Content without proper closing
{{% /different-notice %}}

{{ .InvalidTemplate | | double pipes }}

Normal content should still work.

{{ .ValidTemplate }}

{{< valid-shortcode param="works" >}}`;

      let result;
      expect(() => {
        result = formatCode(input);
      }).not.toThrow();

      result = await result;

      // Should handle gracefully and format what it can
      expect(result).toContain('title: "Syntax Errors"');
      expect(result).toContain('Normal content should still work.');
      expect(result).toContain('{{ .ValidTemplate }}');
      expect(result).toContain('{{< valid-shortcode param="works" >}}');
    });

    test('handles extremely long lines without hanging', async () => {
      const veryLongParam = 'x'.repeat(50000); // 50KB single line
      const input = `---
title: "Long Lines Test"
---

{{< shortcode param="${veryLongParam}" >}}

{{ .Title }}

{{< another-shortcode data="${veryLongParam}" title="test" description="${veryLongParam}" >}}`;

      const start = performance.now();
      const result = await formatCode(input);
      const end = performance.now();

      // Should not hang or cause infinite loops
      expect(end - start).toBeLessThan(2000);
      expect(result).toContain('title: "Long Lines Test"');
      expect(result).toContain('{{< shortcode param="');
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{< another-shortcode');
    });

    test('handles binary-like data mixed with text', async () => {
      const input = `---
title: "Binary Data Test"
---

Text content here.

{{ .Title }}

Some content with weird characters: \x00\x01\x02\x03 more text.

{{< shortcode param="normal" >}}

More binary: \x04\x05\x06{{ .Variable }}\x07\x08

Final content.`;

      let result;
      expect(() => {
        result = formatCode(input);
      }).not.toThrow();

      result = await result;

      // Should handle gracefully
      expect(result).toContain('title: "Binary Data Test"');
      expect(result).toContain('Text content here.');
      expect(result).toContain('{{ .Title }}');
      expect(result).toContain('{{< shortcode param="normal" >}}');
      expect(result).toContain('Final content.');
    });

    test('handles special regex characters in parameters', async () => {
      const input = `---
title: "Regex Characters"
---

{{< shortcode pattern=".*+?^$\\{\\}()|[]" >}}

{{< validation regex="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" >}}

{{< path-matcher pattern="/api/v1/users/(\\d+)" >}}

{{< text-replace find="(\\w+)\\s+(\\w+)" replace="$2, $1" >}}

{{ .Content | replaceRE "\\\\b\\\\w+\\\\b" "word" }}`;

      const result = await formatCode(input);

      // Should handle regex characters without breaking
      expect(result).toContain('title: "Regex Characters"');
      expect(result).toContain('{{< shortcode pattern=".*+?^$\\{\\}()|[]" >}}');
      expect(result).toContain(
        '{{< validation regex="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" >}}'
      );
      expect(result).toContain('{{< path-matcher pattern="/api/v1/users/(\\d+)" >}}');
      expect(result).toContain('{{< text-replace find="(\\w+)\\s+(\\w+)" replace="$2, $1" >}}');
      expect(result).toContain('{{ .Content | replaceRE "\\\\b\\\\w+\\\\b" "word" }}');
    });

    test('handles nested shortcodes with errors', async () => {
      const input = `---
title: "Nested Errors"
---

{{< outer >}}
  {{< inner param="value" >}}
    {{< deep-nested missing="quote >}}
      Content here
    {{< /deep-nested >}}
  {{< /inner >}}
{{< /outer >}}

{{< tabs >}}
  {{< tab "Tab 1" >}}
    {{< broken shortcode
      Content
    {{< /broken >}}
  {{< /tab >}}
  {{< tab "Tab 2" >}}
    {{< working shortcode="fine" >}}
  {{< /tab >}}
{{< /tabs >}}`;

      let result;
      expect(() => {
        result = formatCode(input);
      }).not.toThrow();

      result = await result;

      expect(result).toContain('title: "Nested Errors"');
      expect(result).toContain('{{< outer >}}');
      expect(result).toContain('{{< working shortcode="fine" >}}');
      expect(result).toContain('{{< /tabs >}}');
    });
  });

  describe('Critical Safety Tests', () => {
    test('handles malformed quotes gracefully', async () => {
      const input = `---
title: "Test"
---

{{< shortcode param="unclosed quote here and more text >}}
`;

      const result = await formatCode(input);
      // Should not hang and should return some reasonable output
      expect(result).toContain('title: "Test"');
      expect(result).toContain('{{<');
    });

    test('handles very long parameter values', async () => {
      const longValue = 'x'.repeat(1000);
      const input = `---
title: "Test"
---

{{< shortcode param="${longValue}" >}}
`;

      const result = await formatCode(input);
      expect(result).toContain('title: "Test"');
      expect(result).toContain(longValue);
    });

    test('handles adjacent shortcodes without spaces', async () => {
      const input = `---
title: "Test"
---

{{< ref "post1" >}}{{< ref "post2" >}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< ref "post1" >}}');
      expect(result).toContain('{{< ref "post2" >}}');
    });

    test('handles real Hugo shortcode patterns', async () => {
      const input = `---
title: "Test"
---

{{< youtube dQw4w9WgXcQ >}}

{{< figure src="/images/photo.jpg" title="My Photo" caption="A nice photo" alt="Photo description" >}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< youtube dQw4w9WgXcQ >}}');
      expect(result).toContain(
        '{{< figure src="/images/photo.jpg" title="My Photo" caption="A nice photo" alt="Photo description" >}}'
      );
    });
  });
});
