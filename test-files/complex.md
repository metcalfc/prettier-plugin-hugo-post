---
title: "Complex Templates"
categories: ["tech", "hugo"]
---

{{ range .Params.categories }}
-   [{{ . | title }}]({{ "/categories/" | relURL }}{{ . | urlize }})
{{ end }}

{{$pages := where .Site.Pages "Type" "post"}}
{{if $pages}}
Recent posts: {{len $pages}}
{{end}}

{{/* This is a comment */}}

Pipeline test: {{ .Title|upper|truncate 50 }}

{{-   if .Params.featured   -}}
Trimmed!
{{-  end  -}}
