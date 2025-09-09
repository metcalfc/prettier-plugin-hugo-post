// prettier-plugin-hugo-post
// Simplified and robust implementation

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

// Plugin metadata
export const languages = [
  {
    name: 'Hugo Post',
    parsers: ['hugo-post'],
    extensions: ['.md'],
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
  return {
    type: 'hugo-post',
    source: text,
    originalText: text,
  };
}

/**
 * Print Hugo post content
 */
function printHugoPost(path, options) {
  const node = path.getValue();
  const text = node.originalText || node.source || '';

  if (!text) return '';

  // Split into front matter and content
  const parts = splitFrontMatter(text);

  let result = '';

  // Format front matter
  if (parts.frontMatter) {
    result += formatFrontMatter(parts.frontMatter, parts.delimiter, options);
  }

  // Format content
  if (parts.content) {
    result += formatContent(parts.content, options);
  }

  return result;
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
 * Format front matter
 */
function formatFrontMatter(frontMatter, delimiter, options) {
  let formatted = frontMatter;

  if (delimiter === 'yaml') {
    try {
      const parsed = parseYaml(frontMatter);
      formatted = stringifyYaml(parsed, {
        lineWidth: options.printWidth || 80,
        indent: 2,
      }).trim();
    } catch (error) {
      // Keep original if parsing fails
      formatted = frontMatter.trim();
    }
  }

  const delim = delimiter === 'toml' ? '+++' : '---';
  return `${delim}\n${formatted}\n${delim}\n\n`;
}

/**
 * Format content with Hugo templates
 */
function formatContent(content, options) {
  if (!content.trim()) return '';

  const spacing = options.hugoTemplateBracketSpacing !== false;

  let result = content;

  // Format Hugo variables and templates
  result = result.replace(/\{\{\s*-?\s*(.*?)\s*-?\s*\}\}/g, (match, inner) => {
    const trimmed = inner.trim();
    const hasLeftTrim = match.includes('{{-');
    const hasRightTrim = match.includes('-}}');

    const space = spacing ? ' ' : '';
    const left = hasLeftTrim ? `{{-${space}` : `{{${space}`;
    const right = hasRightTrim ? `${space}-}}` : `${space}}}`;

    // Format pipelines
    const formattedInner = trimmed.replace(/\|\s*/g, ' | ').replace(/\s+\|/g, ' |');

    return left + formattedInner + right;
  });

  // Format Hugo shortcodes
  result = result.replace(/\{\{<\s*([^>\s]+)(.*?)\s*>\}\}/g, (match, name, params) => {
    const cleanParams = params.trim();
    const space = spacing ? ' ' : '';
    const paramSpace = cleanParams ? ' ' : '';
    return `{{<${space}${name}${paramSpace}${cleanParams}${space}>}}`;
  });

  // Format Hugo shortcodes with content
  result = result.replace(
    /\{\{<\s*([^>\s]+)(.*?)>\}\}([\s\S]*?)\{\{<\s*\/\1\s*>\}\}/g,
    (match, name, params, content) => {
      const cleanParams = params.trim();
      const space = spacing ? ' ' : '';
      const paramSpace = cleanParams ? ' ' : '';
      return `{{<${space}${name}${paramSpace}${cleanParams}${space}>}}${content}{{<${space}/${name}${space}>}}`;
    }
  );

  // Format percent shortcodes
  result = result.replace(/\{\{%\s*([^%\s]+)(.*?)\s*%\}\}/g, (match, name, params) => {
    const cleanParams = params.trim();
    const space = spacing ? ' ' : '';
    const paramSpace = cleanParams ? ' ' : '';
    return `{{%${space}${name}${paramSpace}${cleanParams}${space}%}}`;
  });

  // Format template comments
  result = result.replace(/\{\{\/\*\s*([\s\S]*?)\s*\*\/\}\}/g, (match, comment) => {
    const space = spacing ? ' ' : '';
    return `{{/*${space}${comment.trim()}${space}*/}}`;
  });

  // Basic markdown formatting
  result = result
    // Fix heading spacing
    .replace(/^(#+)\s+(.+)$/gm, '$1 $2')
    // Fix list item spacing
    .replace(/^(\s*)-\s+/gm, '$1- ')
    // Clean up multiple spaces in text (but not in code blocks)
    .replace(/(?<!`)`(?!`)[^`]*(?<!`)`(?!`)|(\S)\s{2,}(\S)/g, (match, p1, p2) => {
      if (p1 && p2) return p1 + ' ' + p2;
      return match;
    });

  return result.trim();
}

export default {
  languages,
  parsers,
  printers,
  options,
};
