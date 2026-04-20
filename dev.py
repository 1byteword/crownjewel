#!/usr/bin/env python3
"""Local dev server mirroring production's URL routing.

Python's default http.server serves files exactly as named, so a request
for /writing/matters-of-great-importance returns 404 even though prod
(nginx `try_files $uri $uri/ $uri.html`) resolves it to the .html file.

This wrapper adds the same .html fallback so `make dev` shows you the
same URLs you'll see on azhankhan.com.
"""
import http.server
import os
import socketserver
import sys


class Handler(http.server.SimpleHTTPRequestHandler):
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
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(('', port), Handler) as srv:
        print(f'Serving at http://localhost:{port}  (Ctrl-C to stop)')
        try:
            srv.serve_forever()
        except KeyboardInterrupt:
            print()


if __name__ == '__main__':
    main()
