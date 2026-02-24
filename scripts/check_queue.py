import json
import os
import sys

def check():
    path = 'src/data/pending_films.json'
    if not os.path.exists(path):
        sys.exit(1) # Para o workflow se o arquivo não existir
    
    with open(path, 'r', encoding='utf-8') as f:
        queue = json.load(f)
    
    if len(queue) == 0:
        print("Fila vazia. Pulando execução.")
        sys.exit(1) # Para o workflow se não houver filmes
    
    print(f"Existem {len(queue)} filmes pendentes. Iniciando...")
    sys.exit(0) # Continua o workflow

if __name__ == "__main__":
    check()
