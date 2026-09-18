from http.server import BaseHTTPRequestHandler, HTTPServer
import base64

class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()
    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(n).decode("ascii", "ignore")
        if "," in body:
            body = body.split(",", 1)[1]
        open("/Users/davidpence/kingdom-rush-clone/sprint-logs/krc-shot.png", "wb").write(base64.b64decode(body))
        self.send_response(200)
        self._cors()
        self.end_headers()
        self.wfile.write(b"ok")

HTTPServer(("127.0.0.1", 8799), H).serve_forever()
