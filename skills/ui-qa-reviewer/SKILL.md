---
name: ui-qa-reviewer
description: UI/UX Quality Assurance reviewer for modern, clean, and aesthetic user interfaces. Use when you need to audit a web project's UI for design consistency, visual hierarchy, spacing, typography, and modern aesthetics, producing a structured Markdown report.
---

# UI QA Reviewer Skill

This skill provides a structured workflow for performing a UI/UX audit of a web project, regardless of the framework used. It focuses on clean, minimalist design principles and functional aesthetics.

## Workflow

1.  **Analyze Framework**: Run the `scripts/analyze_framework.cjs` script to identify the project's tech stack (React, Gatsby, Next.js, etc.) and styling methodology (Tailwind, SASS, etc.).
2.  **Review Principles**: Read `references/ui_principles.md` to establish the baseline design standards for the audit.
3.  **Audit the Codebase**: Manually (via grep/read_file) examine key components, layouts, and global styles for:
    -   Consistent spacing (4px/8px grid).
    -   Clear visual hierarchy and scanability.
    -   Correct use of color and typography.
    -   Modern aesthetic elements (soft shadows, rounded corners, clean icons).
4.  **Generate Report**: Use the `assets/report_template.md` as a base to create a comprehensive `UI_QA_REPORT.md` file in the project root.

## Bundled Resources

### Scripts
-   `scripts/analyze_framework.cjs`: Automatically detects the project's framework, styling library, and language.

### References
-   `references/ui_principles.md`: A concise guide to modern UI design principles (Visual Hierarchy, Spacing, Typography, etc.).

### Assets
-   `assets/report_template.md`: A structured Markdown template for the final UI QA report.

## Examples

### Triggering the Skill
-   "Can you review the UI of this project and let me know how it looks?"
-   "Perform a UI QA audit and generate a report."
-   "Does this project follow modern design principles for a clean UI?"

### Using the Framework Script
```bash
node scripts/analyze_framework.cjs
```
