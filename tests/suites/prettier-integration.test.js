import { formatCode, runTableDrivenTests } from '../helpers.js';

describe('Prettier Integration', () => {
  runTableDrivenTests([
    {
      name: 'respects tabWidth setting for YAML',
      input: `---
nested:
  item: value
  deeper:
    item: value
---`,
      options: { tabWidth: 4 },
      shouldContain: [
        'nested:',
        '    item: value', // 4 spaces
        '    deeper:',
        '        item: value', // 8 spaces
      ],
    },
    {
      name: 'handles useTabs setting gracefully',
      input: `---
nested:
  item: value
---`,
      options: { useTabs: true },
      shouldContain: ['nested:', 'item: value'], // YAML may not support tabs
    },
    {
      name: 'respects singleQuote setting for YAML strings',
      input: `---
title: "Double Quotes"
description: "Another string"
---`,
      options: { singleQuote: true },
      shouldContain: ["title: 'Double Quotes'", "description: 'Another string'"],
    },
    {
      name: 'preserves mixed quotes when needed to avoid escaping',
      input: `---
title: "String with 'single quotes' inside"
description: 'String with "double quotes" inside'
---`,
      options: { singleQuote: true },
      shouldContain: [
        'title: "String with \'single quotes\' inside"',
        'description: \'String with "double quotes" inside\'',
      ],
    },
  ]);

  describe('Complex Prettier Integration', () => {
    test('combines multiple prettier options correctly', async () => {
      const input = `---
title:    "Test Post"
description:   "A test with multiple formatting issues"
tags:  [   "test",   "hugo",   "prettier"   ]
nested:
  deep:
    value: "nested content"
---

{{ .Title }}
{{<figure src="/test.jpg"title="Test Image">}}`;

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

    test('preserves Hugo syntax integrity with all prettier options', async () => {
      const input = `---
title: "Integration Test"
---

{{if .Featured}}
  {{.Title|upper|truncate 50}}
  {{<figure src="/hero.jpg"alt="Hero"class="featured">}}
{{end}}

{{% notice info %}}
Important information here.
{{% /notice %}}`;

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
});
