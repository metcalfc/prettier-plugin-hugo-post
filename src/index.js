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

  // JSON front matter
  const jsonMatch = text.match(/^{\r?\n([\s\S]*?)\r?\n}\r?\n([\s\S]*)$/);
  if (jsonMatch) {
    return {
      frontMatter: `{\n${jsonMatch[1]}\n}`,
      delimiter: 'json',
      content: jsonMatch[2],
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
      const formattedToml = await formatToml(node.frontMatter.content, options);
      parts.push(`+++\n${formattedToml}\n+++`);
    } else if (node.frontMatter.delimiter === 'json') {
      const formattedJson = await formatJson(node.frontMatter.content, options);
      parts.push(formattedJson);
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
 * Format TOML front matter using prettier-plugin-toml
 */
async function formatToml(tomlContent, options) {
  try {
    // Use dynamic import for ES modules
    const { format } = await import('prettier');
    const result = await format(tomlContent, {
      ...options,
      parser: 'toml',
      plugins: ['prettier-plugin-toml'],
    });
    return result.trim();
  } catch (error) {
    // Fallback to basic cleanup if Prettier fails
    console.warn('TOML formatting failed:', error.message);
    return tomlContent.trim();
  }
}

/**
 * Format JSON front matter using Prettier's built-in JSON parser
 */
async function formatJson(jsonContent, options) {
  try {
    // Use dynamic import for ES modules
    const { format } = await import('prettier');
    const result = await format(jsonContent, {
      ...options,
      parser: 'json',
    });
    return result.trim();
  } catch (error) {
    // Fallback to basic cleanup if Prettier fails
    console.warn('JSON formatting failed:', error.message);
    return jsonContent.trim();
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
/**
 * Tokenization-based Hugo shortcode formatter
 * Treats shortcode content as a mini-language to parse properly
 */
function tokenizeShortcode(content) {
  const tokens = [];
  let i = 0;
  const maxIterations = Math.max(1000, content.length * 2); // Safety limit
  let iterations = 0;

  while (i < content.length) {
    iterations++;
    if (iterations > maxIterations) {
      console.warn(
        `Tokenizer stopped at position ${i} to prevent infinite loop. Content: ${content.substring(i, i + 20)}...`
      );
      break;
    }

    const char = content[i];

    // Skip whitespace
    if (/\s/.test(char)) {
      i++;
      continue;
    }

    // Handle quoted strings (with escape support)
    if (char === '"' || char === "'") {
      const quote = char;
      let value = quote;
      i++; // Skip opening quote

      while (i < content.length && iterations < maxIterations) {
        iterations++;
        const current = content[i];

        if (current === '\\' && i + 1 < content.length) {
          // Handle escaped characters
          value += current + content[i + 1];
          i += 2;
        } else if (current === quote) {
          // Found closing quote
          value += current;
          i++;
          break;
        } else {
          value += current;
          i++;
        }
      }

      // Trim whitespace inside quotes but preserve escaped content
      const inner = value.slice(1, -1); // Remove quotes
      const trimmed = inner.replace(/^\s+|\s+$/g, ''); // Trim but preserve escapes
      tokens.push({ type: 'quoted', value: quote + trimmed + quote });
      continue;
    }

    // Handle unquoted tokens (parameter names, shortcode name, etc.)
    let token = '';
    while (i < content.length && !/[\s"']/.test(content[i]) && iterations < maxIterations) {
      iterations++;
      token += content[i];
      i++;
    }

    if (token) {
      tokens.push({ type: 'unquoted', value: token });
    }
  }

  return tokens;
}

function formatShortcodeFromTokens(tokens) {
  if (tokens.length === 0) return '';

  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const nextToken = tokens[i + 1];

    // Add the token value
    result.push(token.value);

    // Determine if we need a space after this token
    if (nextToken) {
      // Always add space between tokens, with special cases:

      // Case 1: Current token ends with = (parameter assignment)
      if (token.value.endsWith('=')) {
        // No space between param= and "value"
        continue;
      }

      // Case 2: Next token starts with =
      if (nextToken.value.startsWith('=')) {
        // No space between param and =value
        continue;
      }

      // Case 3: Handle the "word followed by quote" case
      // If current token is unquoted word and next is quoted, add space
      if (token.type === 'unquoted' && nextToken.type === 'quoted') {
        result.push(' ');
        continue;
      }

      // Default: add space between tokens
      result.push(' ');
    }
  }

  return result.join('');
}

/**
 * Enhanced template variable formatter inspired by prettier-plugin-go-template
 * Handles Go template syntax with better spacing and structure
 */
function formatTemplateVariable(match, inner) {
  // Check for whitespace control (- at start or end)
  const startControl = match.match(/^\{\{-/) ? '{{- ' : '{{ ';
  const endControl = match.match(/-\}\}$/) ? ' -}}' : ' }}';

  // Remove control characters from inner content
  inner = inner.replace(/^-\s*/, '').replace(/\s*-$/, '');

  // Handle different template constructs
  const formatted = formatTemplateExpression(inner.trim());

  return `${startControl}${formatted}${endControl}`;
}

/**
 * Format a template expression with proper spacing and structure
 */
function formatTemplateExpression(expr) {
  // Handle empty expressions
  if (!expr) return '';

  // Handle control structures (if, range, with, end, else, etc.)
  if (expr.match(/^\s*(if|range|with|block|define|template)\b/)) {
    return formatControlStructure(expr);
  }

  // Handle 'end' statements
  if (expr.match(/^\s*end\s*$/)) {
    return 'end';
  }

  // Handle 'else' statements
  if (expr.match(/^\s*else(\s+if\b)?/)) {
    return formatControlStructure(expr);
  }

  // Handle regular expressions (variables, functions, pipes)
  return formatExpression(expr);
}

/**
 * Format control structures like if, range, with
 */
function formatControlStructure(expr) {
  // Normalize whitespace and preserve structure
  return expr.trim().replace(/\s+/g, ' ');
}

/**
 * Format regular expressions with proper pipe spacing and function calls
 */
function formatExpression(expr) {
  // Handle complex expressions with pipes
  if (expr.includes('|')) {
    return formatPipeExpression(expr);
  }

  // Handle function calls with multiple arguments
  if (expr.includes(' ')) {
    return formatFunctionCall(expr);
  }

  // Simple variable access
  return expr.trim();
}

/**
 * Format pipe expressions with proper spacing
 */
function formatPipeExpression(expr) {
  return expr
    .split('|')
    .map(part => formatFunctionCall(part.trim())) // Format each part as a function call
    .filter(part => part) // Remove empty parts
    .join(' | ');
}

/**
 * Format function calls with proper argument spacing
 */
function formatFunctionCall(expr) {
  // Handle quoted strings and preserve them
  const parts = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];

    if ((char === '"' || char === "'") && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
      current += char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      current += char;
      parts.push(current.trim());
      current = '';
    } else if (char === ' ' && !inQuotes) {
      if (current.trim()) {
        parts.push(current.trim());
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts.join(' ');
}

function formatHugoTemplates(content) {
  try {
    // Handle both {{< >}} and {{% %}} shortcodes with tokenization
    content = content.replace(/(\{\{[<%]\s*)(.*?)(\s*[>%]\}\})/g, (match, open, inner, close) => {
      try {
        // Remove self-closing slash
        inner = inner.replace(/\/$/, '');

        // Tokenize and reformat
        const tokens = tokenizeShortcode(inner);
        const formatted = formatShortcodeFromTokens(tokens);

        // Determine proper delimiters (preserve < vs %)
        const isPercent = open.includes('%');
        const openDelim = isPercent ? '{{% ' : '{{< ';
        const closeDelim = isPercent ? ' %}}' : ' >}}';

        return openDelim + formatted + closeDelim;
      } catch (error) {
        console.warn(`Failed to format shortcode: ${match}. Error: ${error.message}`);
        return match; // Return original on error
      }
    });

    // Handle regular Hugo variables: {{ .Variable }}
    content = content.replace(/\{\{(?!<|%|\/\*)\s*([^}]*?)\s*\}\}/g, (match, inner) => {
      try {
        return formatTemplateVariable(match, inner);
      } catch (error) {
        console.warn(`Failed to format variable: ${match}. Error: ${error.message}`);
        return match; // Return original on error
      }
    });

    // Handle comments: {{/* comment */}}
    content = content.replace(/\{\{\/\*\s*([\s\S]*?)\s*\*\/\}\}/g, (match, inner) => {
      try {
        return `{{/* ${inner.trim()} */}}`;
      } catch (error) {
        console.warn(`Failed to format comment: ${match}. Error: ${error.message}`);
        return match; // Return original on error
      }
    });

    // Ensure block-level control structures have proper line breaks to prevent
    // markdown formatter from treating them as part of list items or other constructs
    content = ensureProperBlockSpacing(content);

    return content;
  } catch (error) {
    console.error(`Critical error in formatHugoTemplates: ${error.message}`);
    return content; // Return original content on critical failure
  }
}

/**
 * Ensure block-level control structures have proper spacing to prevent
 * Prettier's markdown formatter from treating them as part of other constructs
 */
function ensureProperBlockSpacing(content) {
  // Split content into lines for analysis
  const lines = content.split('\n');
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const trimmedLine = line.trim();

    // Check if this line is an end control that should be standalone
    const isEndControl = trimmedLine.match(/^\{\{\s*end\s*\}\}$/);
    const prevIsListItem = prevLine.trim().match(/^[-*+]\s/);

    // If previous line is a list item and current line is {{ end }},
    // add blank line to prevent markdown formatter from indenting the {{ end }}
    if (isEndControl && prevIsListItem) {
      result.push('');
      result.push(line);
    } else {
      result.push(line);
    }
  }

  return result.join('\n');
}

export default {
  languages,
  parsers,
  printers,
  options,
};
