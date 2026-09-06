#!/usr/bin/env python3
"""Local dev server mirroring production's URL routing.

Python's default http.server serves files exactly as named, so a request
for /writing/matters-of-great-importance returns 404 even though prod
(nginx `try_files $uri $uri/ $uri.html`) resolves it to the .html file.

This wrapper adds the same .html fallback so `make dev` shows you the
same URLs you'll see on azhankhan.com.
"""
import http.server
import io
import os
import socketserver
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        # Instrument only local HTML responses. Source files and the nginx
        # image contain no debug loader; extensionless URLs use translate_path.
        path = self.translate_path(self.path)
        if os.path.isdir(path) and self.path.split('?', 1)[0].endswith('/'):
            path = os.path.join(path, 'index.html')
        if os.path.isfile(path) and path.endswith('.html'):
            with open(path, 'rb') as source:
                content = source.read()
            loader = (b'<style>:root { --debug-baseline: 8px; }</style>'
                      b'<script defer src="/debug/inspector.js"></script>')
            content = content.replace(b'</head>', loader + b'</head>', 1)
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(content)))
            self.send_header('Cache-Control', 'no-store')
            self.end_headers()
            return io.BytesIO(content)
        return super().send_head()

    def translate_path(self, path):
        fs_path = super().translate_path(path)
        if os.path.isdir(fs_path):
            return fs_path
        if os.path.isfile(fs_path):
            return fs_path
        # Production nginx probes $uri.html as the third try_files branch.
        # Mirror that so /writing/foo resolves to writing/foo.html here too.
        if os.path.isfile(fs_path + '.html'):
            return fs_path + '.html'
        return fs_path


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    # Allow quick Ctrl-C / restart without waiting out TIME_WAIT.
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    socketserver.ThreadingTCPServer.daemon_threads = True
    with socketserver.ThreadingTCPServer(('', port), Handler) as srv:
        print(f'Serving at http://localhost:{port}  (Ctrl-C to stop)')
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print()


if __name__ == '__main__':
    main()
