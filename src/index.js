// prettier-plugin-hugo-post
// Fixed implementation with proper Prettier markdown integration

// No longer need yaml dependency - using Prettier's built-in parsers
import { doc } from 'prettier';
const { builders } = doc;
const { concat, hardline, join } = builders;

// Plugin metadata
export const languages = [
  {
    name: "Hugo Post",
    parsers: ["hugo-post"],
    extensions: [".md"],
    filenames: []
  }
];

export const parsers = {
  "hugo-post": {
    parse: parseHugoPost,
    astFormat: "hugo-post-ast",
    locStart: () => 0,
    locEnd: (node) => node.source?.length || 0,
  }
};

export const printers = {
  "hugo-post-ast": {
    print: printHugoPost,
    embed: embedHugoPost
  }
};

export const options = {
  hugoTemplateBracketSpacing: {
    type: "boolean",
    category: "Hugo",
    default: true,
    description: "Print spaces between go template brackets",
  }
};

/**
 * Parse Hugo post content
 */
function parseHugoPost(text) {
  const parts = splitFrontMatter(text);
  
  return {
    type: "hugo-post",
    source: text,
    frontMatter: parts.frontMatter ? {
      content: parts.frontMatter,
      delimiter: parts.delimiter
    } : null,
    content: parts.content || ""
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
      content: yamlMatch[2]
    };
  }
  
  // TOML front matter
  const tomlMatch = text.match(/^\+\+\+\r?\n([\s\S]*?)\r?\n\+\+\+\r?\n([\s\S]*)$/);
  if (tomlMatch) {
    return {
      frontMatter: tomlMatch[1],
      delimiter: 'toml',
      content: tomlMatch[2]
    };
  }
  
  // No front matter
  return {
    frontMatter: null,
    delimiter: null,
    content: text
  };
}

/**
 * Extract Hugo templates from content
 */
function extractTemplates(content) {
  const templates = [];
  const matchedRanges = [];
  const patterns = [
    { regex: /\{\{<\s*[^>]*\s*>\}\}/g, type: 'shortcode' },      // Hugo shortcodes (check first)
    { regex: /\{\{%\s*[^%]*\s*%\}\}/g, type: 'shortcode' },      // Hugo shortcode alternatives
    { regex: /\{\{\/\*[\s\S]*?\*\/\}\}/g, type: 'comment' },     // Hugo comments
    { regex: /\{\{-?\s*[^}]*\s*-?\}\}/g, type: null }            // Hugo variables and functions (check last)
  ];

  patterns.forEach(({ regex, type }) => {
    let match;
    while ((match = regex.exec(content)) !== null) {
      const start = match.index;
      const end = match.index + match[0].length;
      
      // Check if this range overlaps with any existing match
      const overlaps = matchedRanges.some(range => 
        (start < range.end && end > range.start)
      );
      
      if (!overlaps) {
        matchedRanges.push({ start, end });
        templates.push({
          start,
          end,
          content: match[0],
          type: type || classifyTemplate(match[0])
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
 * Print Hugo post content - now handled by embed function
 */
function printHugoPost(path, options) {
  const node = path.getValue();
  
  // The actual formatting is handled by the embed function
  // This should not be called when embed is used
  return node.source || "";
}

/**
 * Embed function - properly formats sections using Prettier's parsers
 */
function embedHugoPost(path, options) {
  const node = path.getValue();
  
  if (node.type === "hugo-post") {
    return async (textToDoc) => {
      const docs = [];
      
      // Format front matter using appropriate parser
      if (node.frontMatter) {
        if (node.frontMatter.delimiter === 'yaml') {
          try {
            const yamlDoc = await textToDoc(node.frontMatter.content, {
              ...options,
              parser: "yaml"
            });
            docs.push([
              "---",
              hardline,
              yamlDoc,
              hardline,
              "---"
            ]);
          } catch (error) {
            // Fallback to unformatted YAML
            docs.push([
              "---",
              hardline,
              node.frontMatter.content.trim(),
              hardline,
              "---"
            ]);
          }
        } else if (node.frontMatter.delimiter === 'toml') {
          // TOML support - no built-in parser, so keep as-is
          docs.push([
            "+++",
            hardline,
            node.frontMatter.content.trim(),
            hardline,
            "+++"
          ]);
        }
      }
      
      // Format content using markdown parser
      if (node.content && node.content.trim()) {
        try {
          const markdownDoc = await textToDoc(node.content, {
            ...options,
            parser: "markdown"
          });
          docs.push(markdownDoc);
        } catch (error) {
          // Fallback to unformatted content
          docs.push(node.content.trim());
        }
      }
      
      // Combine all sections
      if (docs.length === 0) {
        return "";
      } else if (docs.length === 1) {
        return docs[0];
      } else {
        // Join sections with double newlines
        return [docs[0], hardline, hardline, docs[1]];
      }
    };
  }
  
  return undefined;
}

// Template handling removed for now - letting markdown parser handle Hugo templates as-is
// This can be enhanced later to use go-template parser for individual template segments

// Template formatting is now handled by the go-template parser

export default {
  languages,
  parsers,
  printers,
  options
};
