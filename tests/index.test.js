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
      expect(result).toContain('{{< figure src="/test.jpg " title="Test " alt="Description" >}}');
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
      expect(result).toContain('{{< figure src="/hero.jpg " alt="Hero Image " class="featured" >}}');
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
      const input = `---
title: "Test"
---

{{<figure src="/path/to/image.jpg"alt="Image with \"quotes\" and 'apostrophes'">}}
`;

      const result = await formatCode(input);
      expect(result).toContain('{{< figure src="/path/to/image.jpg " alt="Image with "quotes " and \'apostrophes\'" >}}');
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

  describe('Plugin Options', () => {
    test('respects standard Prettier options', async () => {
      const input = `---
title: "Test"
---

This is a very long line that should be wrapped when the print width is set to a small value like 40 characters.
`;

      const result = await formatCode(input, { printWidth: 40 });
      expect(result).toContain('title: "Test"');
      // Markdown should be formatted according to print width
      expect(result.split('\n').some(line => line.length <= 40)).toBe(true);
    });
  });
});