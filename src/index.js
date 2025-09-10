// prettier-plugin-hugo-post
// Fixed implementation with proper Prettier markdown integration

// No longer need yaml dependency - using Prettier's built-in parsers
import { doc } from 'prettier';
const { builders } = doc;
const { concat, hardline, join } = builders;

// Plugin metadata
export const languages = [
  {
    name: 'Hugo Post',
    parsers: ['hugo-post'],
    extensions: ['.md', '.hugo'],
    filenames: [],
  },
];

export const parsers = {
  'hugo-post': {
    parse: parseHugoPost,
    astFormat: 'hugo-post-ast',
    locStart: () => 0,
    locEnd: node => node.source?.length || 0,
  },
};

export const printers = {
  'hugo-post-ast': {
    print: printHugoPost,
  },
};

export const options = {
  hugoTemplateBracketSpacing: {
    type: 'boolean',
    category: 'Hugo',
    default: true,
    description: 'Print spaces between go template brackets',
  },
};

/**
 * Parse Hugo post content
 */
function parseHugoPost(text) {
  const parts = splitFrontMatter(text);

  return {
    type: 'hugo-post',
    source: text,
    frontMatter: parts.frontMatter
      ? {
          content: parts.frontMatter,
          delimiter: parts.delimiter,
        }
      : null,
    content: parts.content || '',
  };
}

/**
 * Split text into front matter and content
 */
function splitFrontMatter(text) {
  // YAML front matter
  const yamlMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (yamlMatch) {
    return {
      frontMatter: yamlMatch[1],
      delimiter: 'yaml',
      content: yamlMatch[2],
    };
  }

  // TOML front matter
  const tomlMatch = text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n([\s\S]*)$/);
  if (tomlMatch) {
    return {
      frontMatter: tomlMatch[1],
      delimiter: 'toml',
      content: tomlMatch[2],
    };
  }

  // No front matter
  return {
    frontMatter: null,
    delimiter: null,
    content: text,
  };
}

/**
 * Extract Hugo templates from content
 */
function extractTemplates(content) {
  const templates = [];
  const matchedRanges = [];
  const patterns = [
    { regex: /\{\{<\s*[^>]*\s*>\}\}/g, type: 'shortcode' }, // Hugo shortcodes (check first)
    { regex: /\{\{%\s*[^%]*\s*%\}\}/g, type: 'shortcode' }, // Hugo shortcode alternatives
    { regex: /\{\{\/\*[\s\S]*?\*\/\}\}/g, type: 'comment' }, // Hugo comments
    { regex: /\{\{-?\s*[^}]*\s*-?\}\}/g, type: null }, // Hugo variables and functions (check last)
  ];

  patterns.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;

      // Check if this range overlaps with any existing match
      const overlaps = matchedRanges.some(range => start < range.end && end > range.start);

      if (!overlaps) {
        matchedRanges.push({ start, end });
        templates.push({
          start,
          end,
          content: match[0],
          type: type || classifyTemplate(match[0]),
        });
      }
    }
  });

  return templates.sort((a, b) => a.start - b.start);
}

/**
 * Classify template type
 */
function classifyTemplate(template) {
  if (template.includes('{{<') || template.includes('{{%')) {
    return 'shortcode';
  } else if (template.includes('{{/*')) {
    return 'comment';
  } else if (template.includes('|')) {
    return 'pipeline';
  } else if (template.match(/\{\{\s*-?\s*(if|range|with|end)\b/)) {
    return 'control';
  } else {
    return 'variable';
  }
}

/**
 * Print Hugo post content
 */
async function printHugoPost(path, options, print) {
  const node = path.getValue();
  const parts = [];

  // Format front matter
  if (node.frontMatter) {
    if (node.frontMatter.delimiter === 'yaml') {
      const formattedYaml = await formatYaml(node.frontMatter.content, options);
      parts.push(`---\n${formattedYaml}\n---`);
    } else if (node.frontMatter.delimiter === 'toml') {
      parts.push(`+++\n${node.frontMatter.content.trim()}\n+++`);
    }
  }

  // Format content
  if (node.content && node.content.trim()) {
    const formattedContent = await formatHugoContent(node.content, options);
    parts.push(formattedContent);
  }

  return parts.join('\n\n');
}

/**
 * Format YAML front matter using Prettier
 */
async function formatYaml(yamlContent, options) {
  try {
    // Use dynamic import for ES modules
    const { format } = await import('prettier');
    const result = await format(yamlContent, {
      ...options,
      parser: 'yaml',
    });
    return result.trim();
  } catch (error) {
    // Fallback to basic cleanup if Prettier fails
    return yamlContent.trim();
  }
}

/**
 * Format Hugo content (markdown + templates)
 */
async function formatHugoContent(content, options) {
  // First, format all Hugo templates with regex
  content = formatHugoTemplates(content);

  // Then format as markdown using Prettier
  try {
    const { format } = await import('prettier');
    const result = await format(content, {
      ...options,
      parser: 'markdown',
    });
    return result.trim();
  } catch (error) {
    // Fallback to unformatted content
    return content.trim();
  }
}

/**
 * Format Hugo templates manually using regex
 */
function formatHugoTemplates(content) {
  // Handle shortcodes: {{< shortcode param="value" >}}
  content = content.replace(/\{\{<\s*([^>]*?)\s*>\}\}/g, (match, inner) => {
    inner = inner.trim();

    // Handle self-closing shortcodes - remove trailing /
    inner = inner.replace(/\/$/, '');

    // Fix only the specific patterns we know are broken
    // Pattern: "value"param= -> "value" param=
    inner = inner.replace(/("[^"]*")([a-z][a-z]*=)/gi, '$1 $2');
    inner = inner.replace(/('[^']*')([a-z][a-z]*=)/gi, '$1 $2');

    // Pattern: word"value" -> word "value" (but not param="value")
    inner = inner.replace(/([a-z]+)(?<!=)("[^"]*")/gi, '$1 $2');

    // Normalize spaces
    inner = inner.replace(/\s+/g, ' ').trim();

    // Split into tokens now that spacing is normalized
    const tokens = inner.split(' ').filter(token => token.trim());

    return `{{< ${tokens.join(' ')} >}}`;
  });

  // Handle {{% %}} shortcodes
  content = content.replace(/\{\{%\s*([^%]*?)\s*%\}\}/g, (match, inner) => {
    inner = inner.trim().replace(/\s+/g, ' ');
    return `{{% ${inner} %}}`;
  });

  // Handle regular Hugo variables: {{ .Variable }}
  content = content.replace(/\{\{(?!<|%|\/\*)\s*([^}]*?)\s*\}\}/g, (match, inner) => {
    // Check for whitespace control (- at start or end)
    const startControl = match.match(/^\{\{-/) ? '{{- ' : '{{ ';
    const endControl = match.match(/-\}\}$/) ? ' -}}' : ' }}';

    inner = inner.replace(/^-\s*/, '').replace(/\s*-$/, ''); // Remove control chars
    inner = inner.trim().replace(/\s+/g, ' ');
    inner = inner.replace(/\s*\|\s*/g, ' | ');

    return `${startControl}${inner}${endControl}`;
  });

  // Handle comments: {{/* comment */}}
  content = content.replace(/\{\{\/\*\s*([\s\S]*?)\s*\*\/\}\}/g, (match, inner) => {
    return `{{/* ${inner.trim()} */}}`;
  });

  return content;
}

export default {
  languages,
  parsers,
  printers,
  options,
};
