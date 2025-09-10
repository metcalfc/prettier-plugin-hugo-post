import { runErrorRecoveryTests } from '../helpers.js';

describe('Error Recovery and Robustness', () => {
  runErrorRecoveryTests([
    {
      name: 'handles malformed shortcode quotes gracefully',
      input: `---
title: "Error Recovery Test"
---

# Testing Malformed Quotes

{{< figure src="unclosed-quote.jpg title="Missing quote >}}

Some content here.

{{< shortcode param="mixed'quotes"and"more >}}

More content.

{{< valid-shortcode param="this works" >}}`,
      shouldContain: [
        'title: "Error Recovery Test"',
        '# Testing Malformed Quotes',
        '{{< valid-shortcode param="this works" >}}',
      ],
      maxTime: 1000,
    },
    {
      name: 'handles invalid YAML front matter gracefully',
      input: `---
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

{{< shortcode param="value" >}}`,
      shouldContain: [
        '# Content Section',
        'This content should still be formatted correctly.',
        '{{ .Title }}',
        '{{< shortcode param="value" >}}',
      ],
    },
    {
      name: 'handles mixed template syntaxes gracefully',
      input: `---
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

Back to Hugo: {{% notice info %}}Hugo content{{% /notice %}}`,
      shouldContain: [
        'title: "Mixed Template Syntax"',
        '{{ .Title }}', // Hugo formatted
        '{{< figure src="/test.jpg" >}}', // Hugo formatted
        '{{ range .Pages }}{{ .Title }}{{ end }}', // Hugo formatted
        '{{% notice info %}}Hugo content{{% /notice %}}', // Hugo formatted
        '<%= @title %>', // Non-Hugo preserved
        '{# comment #}', // Non-Hugo preserved
        '{% for item in items %}{{ item }}{% endfor %}', // Non-Hugo preserved
      ],
    },
    {
      name: 'handles template syntax errors gracefully',
      input: `---
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

{{< valid-shortcode param="works" >}}`,
      shouldContain: [
        'title: "Syntax Errors"',
        'Normal content should still work.',
        '{{ .ValidTemplate }}',
        '{{< valid-shortcode param="works" >}}',
      ],
    },
    {
      name: 'handles extremely long lines without hanging',
      input: (() => {
        const veryLongParam = 'x'.repeat(50000); // 50KB single line
        return `---
title: "Long Lines Test"
---

{{< shortcode param="${veryLongParam}" >}}

{{ .Title }}

{{< another-shortcode data="${veryLongParam}" title="test" description="${veryLongParam}" >}}`;
      })(),
      shouldContain: [
        'title: "Long Lines Test"',
        '{{< shortcode param="',
        '{{ .Title }}',
        '{{< another-shortcode',
      ],
      maxTime: 2000,
    },
    {
      name: 'handles binary-like data mixed with text',
      input: `---
title: "Binary Data Test"
---

Text content here.

{{ .Title }}

Some content with weird characters: \x00\x01\x02\x03 more text.

{{< shortcode param="normal" >}}

More binary: \x04\x05\x06{{ .Variable }}\x07\x08

Final content.`,
      shouldContain: [
        'title: "Binary Data Test"',
        'Text content here.',
        '{{ .Title }}',
        '{{< shortcode param="normal" >}}',
        'Final content.',
      ],
    },
    {
      name: 'handles special regex characters in parameters',
      input: `---
title: "Regex Characters"
---

{{< shortcode pattern=".*+?^$\\{\\}()|[]" >}}

{{< validation regex="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" >}}

{{< path-matcher pattern="/api/v1/users/(\\d+)" >}}

{{< text-replace find="(\\w+)\\s+(\\w+)" replace="$2, $1" >}}

{{ .Content | replaceRE "\\\\b\\\\w+\\\\b" "word" }}`,
      shouldContain: [
        'title: "Regex Characters"',
        '{{< shortcode pattern=".*+?^$\\{\\}()|[]" >}}',
        '{{< validation regex="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" >}}',
        '{{< path-matcher pattern="/api/v1/users/(\\d+)" >}}',
        '{{< text-replace find="(\\w+)\\s+(\\w+)" replace="$2, $1" >}}',
        '{{ .Content | replaceRE "\\\\b\\\\w+\\\\b" "word" }}',
      ],
    },
  ]);
});
