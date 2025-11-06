# Testing the publish script

This is a test post to demonstrate the new publishing workflow.

Writing is now simple:
- Create a markdown file in `src/posts/`
- Run `./publish src/posts/filename.md`
- Done

**Features:**
- Markdown to HTML conversion
- Automatic date extraction from filename
- Image handling (auto-copy to /img)
- Inserts at top of writing section (newest first)

The site stays pure - no build step, no JavaScript. Just a convenience script for writing.
