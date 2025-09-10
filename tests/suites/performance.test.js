import { runPerformanceTests } from '../helpers.js';

describe('Performance and Memory Tests', () => {
  runPerformanceTests([
    {
      name: 'handles large files efficiently',
      generateInput: () => {
        const sections = [];
        sections.push('---');
        sections.push('title: "Large Content Test"');
        sections.push('description: "Testing performance with large files"');
        sections.push('tags: ["performance", "large", "test"]');
        sections.push('---');
        sections.push('');

        for (let i = 0; i < 1000; i++) {
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
      },
      maxTime: 3000,
      shouldContain: [
        'title: "Large Content Test"',
        '{{< shortcode0 param="value0" >}}',
        '{{ .Variable77 | printf "Value: %s" }}',
        '## Section 5',
      ],
    },
    {
      name: 'handles deeply nested template structures',
      generateInput: () => {
        let content = '---\ntitle: "Nested Test"\n---\n\n';

        for (let i = 0; i < 50; i++) {
          content += `{{ if .Params.level${i} }}\n`;
          content += `  Content at level ${i}\n`;
          if (i % 5 === 0) {
            content += `  {{< shortcode level="${i}" >}}\n`;
          }
        }

        content += 'Deeply nested content at the center\n';

        for (let i = 0; i < 50; i++) {
          content += `{{ end }}\n`;
        }

        return content;
      },
      maxTime: 2000,
      shouldContain: [
        'title: "Nested Test"',
        '{{ if .Params.level0 }}',
        '{{ if .Params.level49 }}',
        'Deeply nested content at the center',
      ],
    },
    {
      name: 'handles files with many shortcodes efficiently',
      generateInput: () => {
        let content = '---\ntitle: "Many Shortcodes"\n---\n\n';

        for (let i = 0; i < 500; i++) {
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
      },
      maxTime: 2500,
      shouldContain: [
        'title: "Many Shortcodes"',
        '{{< figure src="/img0.jpg" title="Image 0" >}}',
        '{{< highlight javascript "linenos=table" >}}',
        '{{% notice info %}}This is notice 2{{% /notice %}}',
        '{{< youtube id="video499" >}}',
      ],
    },
    {
      name: 'handles large shortcode parameters without memory issues',
      generateInput: () => {
        const largeParam = 'x'.repeat(10000); // 10KB parameter
        return `---
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
      },
      maxTime: 1500,
      shouldContain: [
        'title: "Large Parameters"',
        '{{< shortcode',
        '{{ .Title }}',
        '{{< another-shortcode',
      ],
    },
  ]);
});
