---
title:    "Basic Test"
date:   2025-01-15
tags:   [  "test" ,  "basic"  ]
---

#    {{.Title}}

Simple test with {{   .Params.author   }}.

{{if .Params.featured}}
Featured!
{{end}}
