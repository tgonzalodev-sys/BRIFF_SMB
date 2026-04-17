import http.server, socketserver, os

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args): pass

with socketserver.TCPServer(("", 3333), Handler) as httpd:
    httpd.serve_forever()
