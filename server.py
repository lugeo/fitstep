from http.server import HTTPServer, SimpleHTTPRequestHandler
import os

# Changer le répertoire de travail vers le dossier du projet
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Créer et démarrer le serveur
server_address = ('', 8000)
httpd = HTTPServer(server_address, SimpleHTTPRequestHandler)
print('Serveur démarré sur http://localhost:8000')
httpd.serve_forever()
