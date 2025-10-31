# Blog Posts

Write your blog posts as markdown files in this directory. When ready to publish:

1. Write your post: `YYYY-MM-DD-title.md`
2. Convert to HTML manually (or with a script)
3. Add as an `<article>` block in `index.html`

## Format

```markdown
# Post Title

*Month Day, Year*

Your content here...
```

## Converting to HTML

Copy this template into `index.html`:

```html
<article>
<time>YYYY-MM-DD</time>
<h3>Post Title</h3>
<p>First paragraph...</p>
<p>Second paragraph...</p>
</article>
```
