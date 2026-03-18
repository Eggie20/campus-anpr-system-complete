# Component Reference

Reusable component library for the Campus Security System.

---

## Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">Primary</button>

<!-- Variants -->
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-outline">Outline</button>
<button class="btn btn-ghost">Ghost</button>

<!-- Sizes -->
<button class="btn btn-sm">Small</button>
<button class="btn btn-lg">Large</button>
<button class="btn btn-block">Full Width</button>
<button class="btn btn-icon">🔍</button>
```

---

## Cards

```html
<article class="card">
  <header class="card-header">
    <h3 class="card-title">Title</h3>
  </header>
  <div class="card-body">Content here...</div>
  <footer class="card-footer">Footer actions</footer>
</article>
```

---

## Badges

```html
<span class="badge badge-primary">Primary</span>
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-danger">Alert</span>
<span class="badge badge-info">Info</span>
```

---

## Forms

```html
<div class="form-group">
  <label class="form-label">Label</label>
  <input type="text" class="form-input" placeholder="Placeholder" />
  <span class="form-hint">Helper text</span>
</div>

<select class="form-select">
  <option>Option 1</option>
</select>

<textarea class="form-textarea"></textarea>
```

---

## Modals

```html
<!-- Trigger -->
<button data-modal-open="myModal">Open Modal</button>

<!-- Modal -->
<div class="modal-backdrop" id="myModal">
  <div class="modal">
    <header class="modal-header">
      <h2 class="modal-title">Modal Title</h2>
      <button class="modal-close" data-modal-close>×</button>
    </header>
    <div class="modal-body">Content...</div>
    <footer class="modal-footer">
      <button class="btn btn-outline" data-modal-close>Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </footer>
  </div>
</div>
```

---

## Dropdowns

```html
<div class="dropdown">
  <button data-dropdown-trigger>Menu</button>
  <div class="dropdown-menu">
    <a href="#" class="dropdown-item">Item 1</a>
    <a href="#" class="dropdown-item">Item 2</a>
    <div class="dropdown-divider"></div>
    <a href="#" class="dropdown-item">Item 3</a>
  </div>
</div>
```

---

## Avatars

```html
<div class="avatar">JD</div>
<div class="avatar avatar-sm">A</div>
<div class="avatar avatar-lg">XL</div>
```

---

## Theme Toggle

```html
<button data-theme-toggle aria-label="Toggle theme">
  <span class="theme-icon">🌙</span>
</button>
```

---

## Mobile Menu Toggle

```html
<button data-mobile-menu-toggle aria-label="Open menu">☰</button>
```
