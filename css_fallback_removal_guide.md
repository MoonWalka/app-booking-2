# CSS Fallback Removal Complete Guide

## Overview
This guide outlines the process for removing CSS fallbacks across the entire TourCraft project. The goal is to standardize the CSS by relying solely on CSS custom properties defined in the global CSS files rather than using fallback values in individual component CSS files.

## Progress So Far
- ✅ Successfully removed all CSS fallbacks from 10 files in the programmateurs component directory

## Current Stats (from detection script)
- Total CSS Files: 255
- Files with Fallbacks: 141
- Total Fallbacks: 2114

## Fallback Types
1. **Simple Fallbacks (1980)**: `var(--tc-color-primary, #0d6efd)` → `var(--tc-color-primary)`
2. **Nested Fallbacks (22)**: `var(--tc-border-radius, var(--tc-spacing-2))` → `var(--tc-border-radius)`
3. **Complex Fallbacks (112)**: `var(--tc-text-muted, var(--tc-color-text-secondary, #6c757d))` → `var(--tc-text-muted)`

## How to Complete the Cleanup

### Option 1: Use the Existing Script

The project already has a script to remove CSS fallbacks. Run it with:

```bash
cd /Users/meltinrecordz/Documents/TourCraft/code/app-booking-2
node remove_css_fallbacks.js --path=src/components --verbose
```

You can first run with the `--dry-run` flag to see what changes would be made without modifying files:

```bash
node remove_css_fallbacks.js --path=src/components --dry-run --verbose
```

Then process different directories one at a time:

```bash
# Process styles directory
node remove_css_fallbacks.js --path=src/styles --verbose

# Process other component directories
node remove_css_fallbacks.js --path=src/components/common --verbose
node remove_css_fallbacks.js --path=src/components/artistes --verbose
node remove_css_fallbacks.js --path=src/components/concerts --verbose
node remove_css_fallbacks.js --path=src/components/lieux --verbose
```

### Option 2: Visual Studio Code Search and Replace

You can use VS Code's search and replace functionality with regex:

1. Open the search panel (Ctrl+Shift+F or Cmd+Shift+F)
2. Search for: `var\(--tc-[a-zA-Z0-9-]+, [^)]+\)`
3. Replace with: `var(--tc-$1)`
4. Ensure "Use Regular Expression" is enabled (Alt+R or Option+R)
5. Filter by `*.css` files
6. Preview changes before applying them

### Option 3: Git Pre-commit Hook

To prevent new fallbacks from being introduced, add a pre-commit hook:

1. Create a file `.git/hooks/pre-commit`:
```bash
#!/bin/bash

# Detect CSS fallbacks in staged files
STAGED_CSS_FILES=$(git diff --cached --name-only --diff-filter=ACMRTUXB | grep "\.css$")

if [ -n "$STAGED_CSS_FILES" ]; then
  echo "Checking CSS files for fallbacks..."
  for FILE in $STAGED_CSS_FILES; do
    if grep -q "var(--tc-[a-zA-Z0-9-]*, " "$FILE"; then
      echo "❌ CSS fallback found in $FILE"
      echo "   Please remove fallbacks before committing."
      exit 1
    fi
  done
fi

exit 0
```

2. Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## Testing and Validation

After removing fallbacks, test the application thoroughly to ensure:

1. All styles render correctly
2. No UI elements appear unstyled
3. Application works properly in all supported browsers

## Documentation

Maintain a record of this standard by:

1. Adding a note to the CSS style guide
2. Ensuring all developers understand that CSS variables should not include fallbacks
3. Documenting that all styling should rely on the global CSS custom properties

## Final Steps

Once complete, run a final scan to ensure all fallbacks have been removed:

```bash
node detect_css_fallbacks.js
```

The report should show 0 fallbacks remaining.
