import { runTableDrivenTests } from '../helpers.js';

describe('Unicode and Internationalization', () => {
  runTableDrivenTests([
    {
      name: 'handles mixed RTL/LTR text correctly',
      input: `---
title: "Mixed Languages"
description: "English and العربية and 中文"
author: "محمد Smith"
keywords: ["english", "العربية", "中文", "русский"]
---

# English Title العربية 中文

This is English text مع النص العربي and 中文字符 and русский текст.

{{ .Title | printf "%s - %s" "العنوان" }}

{{< figure src="/test.jpg" title="混合语言 Mixed Languages مختلط" >}}

- English bullet
- نقطة عربية
- 中文要点
- Русский пункт
- ελληνικό σημείο`,
      shouldContain: [
        'title: "Mixed Languages"',
        'description: "English and العربية and 中文"',
        'author: "محمد Smith"',
        'keywords: ["english", "العربية", "中文", "русский"]',
        '# English Title العربية 中文',
        'This is English text مع النص العربي and 中文字符 and русский текст.',
        '{{ .Title | printf "%s - %s" "العنوان" }}',
        '{{< figure src="/test.jpg" title="混合语言 Mixed Languages مختلط" >}}',
        '- نقطة عربية',
        '- 中文要点',
        '- Русский пункт',
        '- ελληνικό σημείο',
      ],
    },
    {
      name: 'preserves emoji and special characters in templates and shortcodes',
      input: `---
title: "Emoji Test 🚀"
description: "Testing emoji support ⭐🎉"
tags: ["🚀 rockets", "⭐ stars", "🎉 celebrations"]
social:
  twitter: "Follow us! 🐦"
---

# {{ .Title }} 🎯

{{ .Params.emoji | default "🚀" }}

{{< notice icon="💡" type="info" >}}
💡 Tip: Use emojis to make content more engaging! 🎉
{{< /notice >}}

- 🚗 Cars
- 🍕 Pizza
- Complex emoji: 👨‍💻 👩‍🚀 🏳️‍🌈`,
      shouldContain: [
        'title: "Emoji Test 🚀"',
        'description: "Testing emoji support ⭐🎉"',
        'tags: ["🚀 rockets", "⭐ stars", "🎉 celebrations"]',
        'twitter: "Follow us! 🐦"',
        '{{ .Params.emoji | default "🚀" }}',
        '{{< notice icon="💡" type="info" >}}',
        '💡 Tip: Use emojis to make content more engaging! 🎉',
        '- 🚗 Cars',
        '- 🍕 Pizza',
        'Complex emoji: 👨‍💻 👩‍🚀 🏳️‍🌈',
      ],
    },
    {
      name: 'handles unicode in shortcode parameters',
      input: `---
title: "Unicode Parameters"
---

{{< figure
  src="/images/测试.jpg"
  title="Тест изображение"
  alt="テスト画像"
  caption="🎉 Многоязычное изображение 图像测试"
  class="测试类"
>}}

{{< button
  text="点击这里 Нажмите здесь κάντε κλικ εδώ"
  url="/页面/страница/σελίδα/"
  class="按钮类 кнопка-класс κλάση-κουμπιού"
>}}

{{< code file="测试.js" language="javascript" title="多语言代码示例" >}}
// 这是中文注释
// Это русский комментарий
// هذا تعليق عربي
console.log("Hello 世界 мир κόσμος عالم! 🌍");
{{< /code >}}`,
      shouldContain: [
        'src="/images/测试.jpg"',
        'title="Тест изображение"',
        'alt="テスト画像"',
        'caption="🎉 Многоязычное изображение 图像测试"',
        'class="测试类"',
        'text="点击这里 Нажмите здесь κάντε κλικ εδώ"',
        'url="/页面/страница/σελίδα/"',
        'class="按钮类 кнопка-класс κλάση-κουμπιού"',
        'file="测试.js"',
        'title="多语言代码示例"',
        '// 这是中文注释',
        '// Это русский комментарий',
        '// هذا تعليق عربي',
        'console.log("Hello 世界 мир κόσμος عالم! 🌍");',
      ],
    },
    {
      name: 'preserves mathematical symbols and special characters',
      input: `---
title: "Mathematics & Symbols"
formula: "E = mc²"
symbols: ["∑", "∫", "∂", "∆", "π", "∞", "≈", "≠", "≤", "≥"]
currencies: ["$", "€", "¥", "£", "₹", "₽", "₩", "₪"]
fractions: ["¼", "½", "¾", "⅓", "⅔", "⅛", "⅜", "⅝", "⅞"]
---

# Mathematical Content: {{ .Params.formula }}

Area of circle: **A = πr² ≈ {{ printf "%.2f" $area }}**

**Copyright & Legal:** © ® ™ ℠ ℗

**Arrows & Logic:** → ← ↑ ↓ ↔ ⟹ ∧ ∨ ¬ ∀ ∃

**Geometry:** ∠ ∟ ⊥ ∥ △ ▢ ○ ●

Chemical formulas: H₂O, CO₂, C₆H₁₂O₆, Ca²⁺, SO₄²⁻

{{< chemical formula="H₂SO₄" name="Sulfuric Acid" >}}`,
      shouldContain: [
        'title: "Mathematics & Symbols"',
        'formula: "E = mc²"',
        'symbols: ["∑", "∫", "∂", "∆", "π", "∞", "≈", "≠", "≤", "≥"]',
        'currencies: ["$", "€", "¥", "£", "₹", "₽", "₩", "₪"]',
        'fractions: ["¼", "½", "¾", "⅓", "⅔", "⅛", "⅜", "⅝", "⅞"]',
        'Area of circle: **A = πr² ≈ {{ printf "%.2f" $area }}**',
        '**Copyright & Legal:** © ® ™ ℠ ℗',
        '**Arrows & Logic:** → ← ↑ ↓ ↔ ⟹ ∧ ∨ ¬ ∀ ∃',
        '**Geometry:** ∠ ∟ ⊥ ∥ △ ▢ ○ ●',
        'Chemical formulas: H₂O, CO₂, C₆H₁₂O₆, Ca²⁺, SO₄²⁻',
        '{{< chemical formula="H₂SO₄" name="Sulfuric Acid" >}}',
      ],
    },
  ]);
});
