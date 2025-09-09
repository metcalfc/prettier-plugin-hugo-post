---
title: "My Hugo Blog Post"
date: 2025-01-15T10:00:00Z
author: "Chad Metcalf"
tags: ["hugo", "prettier", "markdown"]
categories:
  - web development
  - static sites
draft: false
featured: true
description: "A comprehensive example of Hugo content with mixed syntax"
---

# {{ .Title }}

Welcome to my blog! This post was written by {{ .Params.author }} on {{ .Date.Format "January 2, 2006" }}.

## About This Site

{{ if .Site.Params.description }}
_{{ .Site.Params.description }}_
{{ end }}

The site title is **{{ .Site.Title }}** and it has {{ len .Site.Pages }} pages.

## Categories

{{ range .Params.categories }}

- [{{ . | title }}]({{ "/categories/" | relURL }}{{ . | urlize }})
  {{ end }}

## Featured Content

{{ if .Params.featured }}
🌟 **This is a featured post!** 🌟
{{ else }}
This is a regular post.
{{ end }}

## Code Examples

Here's some Hugo templating:

```html
{{ range .Pages }}
  <article>
    <h2><a href="{{ .RelPermalink }}">{{ .Title }}</a></h2>
    <time>{{ .Date.Format "2006-01-02" }}</time>
    <p>{{ .Summary }}</p>
  </article>
{{ end }}
```

## Hugo Shortcodes

{{< figure src="/images/hugo-logo.png" title="Hugo Logo" alt="The Hugo static site generator logo" >}}

{{< highlight go "linenos=table,hl_lines=2 3" >}}
package main

import "fmt"

func main() {
    fmt.Println("Hello, Hugo!")
}
{{< /highlight >}}

{{% notice info %}}
This is an **info** notice with some _markdown_ content inside.
{{% /notice %}}

## Template Logic

{{ with .Params.author }}

### About the Author

This post was written by **{{ . }}**.

{{ if eq . "Chad Metcalf" }}
Chad is the creator of this Hugo prettier plugin.
{{ end }}
{{ else }}

### Anonymous Post

The author of this post is unknown.
{{ end }}

## Complex Templates

{{ $featured := where .Site.Pages "Params.featured" true }}
{{ if $featured }}

### Other Featured Posts

{{ range first 3 $featured }}

- [{{ .Title }}]({{ .RelPermalink }}) - {{ .Date.Format "Jan 2" }}
  {{ end }}
  {{ end }}

## Pipeline Examples

The site has {{ len .Site.Pages | lang.NumFmt 0 }} total pages.

{{ .Content | markdownify | safeHTML }}

{{ .Title | upper | truncate 50 "..." }}

## Template Comments

{{/* This is a comment that won't appear in the output */}}

{{/*
Multi-line comment
with more details
*/}}

## Whitespace Control

{{- if .Params.featured -}}
Featured!
{{- end -}}

Normal spacing: {{ .Title }}

Trimmed: {{- .Title -}}

## Math and Special Characters

Hugo can handle special characters like émojis 🚀 and math: E = mc²

That's all for now!

{{ if .Params.draft }}
_This post is still a draft._
{{ end }}
