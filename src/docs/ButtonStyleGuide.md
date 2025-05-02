# TourCraft Button Style Guide

This document provides standards for button usage throughout the TourCraft application. Following these guidelines ensures a consistent user interface and experience.

## Button Components

### 1. Standard Button (`<Button>`)

The primary button component to use throughout the application. 

```jsx
import Button from '../components/ui/Button';

<Button variant="primary" size="md">Submit</Button>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | string | 'primary' | Button style variant |
| size | string | '' | Button size ('sm', 'md', 'lg') |
| type | string | 'button' | Button type ('button', 'submit', 'reset') |
| disabled | boolean | false | Whether the button is disabled |
| icon | ReactNode | null | Icon to display in the button |
| iconPosition | 'left' \| 'right' | 'left' | Position of the icon relative to text |
| iconOnly | boolean | false | Whether the button contains only an icon |
| tooltip | string | '' | Tooltip text (displays on hover, used with iconOnly) |
| onClick | function | undefined | Click handler function |
| className | string | '' | Additional CSS classes |

### 2. Action Button (`<ActionButton>`)

For compact icon buttons, typically used in tables, toolbars, or action menus.

```jsx
import ActionButton from '../components/common/ActionButton';
import { FaEdit } from 'react-icons/fa';

<ActionButton 
  tooltip="Modifier"
  icon={<FaEdit />}
  variant="primary"
  onClick={handleEdit}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| to | string | undefined | Optional URL for navigation (renders as Link) |
| tooltip | string | '' | Tooltip text |
| icon | ReactNode | required | Icon element |
| variant | string | 'primary' | Button style variant |
| size | string | 'sm' | Button size |
| onClick | function | undefined | Click handler function |

## Button Variants

Use the following variants consistently throughout the application:

### Primary Buttons
- **Usage**: Main actions, form submissions, confirming actions
- **Variant**: `primary`
- **Example**: "Save", "Submit", "Confirm", "Next"

### Secondary Buttons
- **Usage**: Alternative or secondary actions
- **Variant**: `secondary`
- **Example**: "Cancel", "Back", "View Details"

### Outline Primary Buttons
- **Usage**: Less emphasized but still important actions
- **Variant**: `outline-primary`
- **Example**: "Edit", "Filter", "Sort"

### Outline Secondary Buttons
- **Usage**: Tertiary actions, toggleable options
- **Variant**: `outline-secondary`
- **Example**: "Show More", "Options"

### Danger Buttons
- **Usage**: Destructive actions or warnings
- **Variant**: `danger`
- **Example**: "Delete", "Remove", "Clear All"

### Success Buttons
- **Usage**: Completion or positive actions
- **Variant**: `success`
- **Example**: "Complete", "Validate", "Approve"

### Link Buttons
- **Usage**: Navigation actions that should appear as links
- **Variant**: `link`
- **Example**: "Learn More", "View Documentation"

## Button Sizes

- **Small (`sm`)**: For compact UIs, tables, or secondary actions
- **Default (no size prop)**: Standard size for most buttons
- **Large (`lg`)**: For prominent actions or touch interfaces

## Icon Usage Guidelines

### Icon with Text
- Always provide proper spacing between icon and text
- Maintain consistent icon positioning (left is default)
- Example: `<Button icon={<FaPlus />}>Add Concert</Button>`

### Icon-Only Buttons
- Always provide a tooltip for accessibility
- Use ActionButton component for consistent styling
- Example: `<ActionButton icon={<FaEdit />} tooltip="Edit" />`

## Form Submission Buttons

- Always use `type="submit"` for form submission buttons
- Place primary action on the right, secondary actions on the left
- Example: 
```jsx
<div className="form-actions">
  <Button variant="outline-secondary">Cancel</Button>
  <Button variant="primary" type="submit">Save</Button>
</div>
```

## Spacing and Layout

- Group related buttons with consistent spacing
- For multiple buttons, maintain consistent order (cancel/secondary actions first, primary/confirm actions last)
- Use appropriate margin between buttons (standard is 8px)

## Accessibility Guidelines

- Ensure buttons have appropriate contrast ratios
- Provide meaningful text for screen readers
- Use `aria-label` for icon-only buttons without tooltips
- Disable buttons rather than hiding them when actions are unavailable

## Migration Guide

When updating existing code:
1. Replace direct `<button>` elements with the `<Button>` component
2. Convert icon-only buttons to `<ActionButton>` component
3. Standardize variant usage according to this guide