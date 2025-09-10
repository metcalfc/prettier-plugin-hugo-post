// Import all test suites
import './suites/basic-functionality.test.js';
import './suites/prettier-integration.test.js';
import './suites/performance.test.js';
import './suites/error-recovery.test.js';
import './suites/unicode.test.js';

// Keep some of the edge cases and real-world patterns that don't fit the table-driven pattern
import { formatCode } from './helpers.js';

describe('Mixed Content Integration', () => {
  test('formats complex mixed content correctly', async () => {
    const input = `---
title:   "Complex Test"
tags: [   "mixed",    "content"   ]
---

# {{ .Title }}

This is a paragraph with {{ .Params.author | default "Anonymous" }}.

{{< figure src="/test.jpg"   alt="Test"  class="featured" >}}

Some more content here.

{{ range .Pages }}
- [{{ .Title }}]({{ .RelPermalink }})
{{ end }}

{{% notice info %}}
This is important info with {{ .Params.version }}.
{{% /notice %}}`;

    const result = await formatCode(input);

    expect(result).toContain('title: "Complex Test"');
    expect(result).toContain('tags: ["mixed", "content"]');
    expect(result).toContain('{{ .Params.author | default "Anonymous" }}');
    expect(result).toContain('{{< figure src="/test.jpg" alt="Test" class="featured" >}}');
    expect(result).toContain('{{ range .Pages }}');
    expect(result).toContain('{{% notice info %}}');
    expect(result).toContain('{{ .Params.version }}');
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
title: "Just Front Matter"
---`;
    const result = await formatCode(input);
    expect(result).toContain('title: "Just Front Matter"');
  });

  test('handles files with only content', async () => {
    const input = '# Just Content\n\nNo front matter here.';
    const result = await formatCode(input);
    expect(result).toContain('# Just Content');
    expect(result).toContain('No front matter here.');
  });

  test('handles nested template structures', async () => {
    const input = `{{ range .Pages }}
  {{ if .Params.featured }}
    {{ .Title }}
  {{ end }}
{{ end }}`;

    const result = await formatCode(input);
    expect(result).toContain('{{ range .Pages }}');
    expect(result).toContain('{{ if .Params.featured }}');
    expect(result).toContain('{{ .Title }}');
    expect(result).toContain('{{ end }}');
  });

  test('preserves content inside block shortcodes', async () => {
    const input = `{{< highlight javascript >}}
const test = "content";
console.log(test);
{{< /highlight >}}`;

    const result = await formatCode(input);
    expect(result).toContain('{{< highlight javascript >}}');
    expect(result).toContain('const test = "content";');
    expect(result).toContain('console.log(test);');
    expect(result).toContain('{{< /highlight >}}');
  });
});

describe('Critical Safety Tests', () => {
  test('handles malformed quotes gracefully', async () => {
    const input = `---
title: "Test"
---

{{< shortcode param="value >}}
{{ .Title }}`;

    const result = await formatCode(input);
    expect(result).toContain('title: "Test"');
    expect(result).toContain('{{ .Title }}');
  });

  test('handles very long parameter values', async () => {
    const longValue = 'x'.repeat(1000);
    const input = `{{< shortcode data="${longValue}" >}}`;
    const result = await formatCode(input);
    expect(result).toContain('{{< shortcode');
  });

  test('handles adjacent shortcodes without spaces', async () => {
    const input = '{{< br >}}{{< br >}}{{< br >}}';
    const result = await formatCode(input);
    expect(result).toContain('{{< br >}}');
  });

  test('handles real Hugo shortcode patterns', async () => {
    const input = `{{< youtube oHg5SJYRHA0 >}}
{{< vimeo 146022717 >}}
{{< speakerdeck 4e8126e72d853c0060001f97 >}}`;

    const result = await formatCode(input);
    expect(result).toContain('{{< youtube oHg5SJYRHA0 >}}');
    expect(result).toContain('{{< vimeo 146022717 >}}');
    expect(result).toContain('{{< speakerdeck 4e8126e72d853c0060001f97 >}}');
  });
});
