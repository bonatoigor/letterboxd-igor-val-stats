import json
import os
import sys
from update_films import update_workflow 

PATH_PENDING = 'src/data/pending_films.json'

def main():
    if not os.path.exists(PATH_PENDING):
        return

    with open(PATH_PENDING, 'r', encoding='utf-8') as f:
        queue = json.load(f)

    if not queue:
        return

    movie = queue[0]
    slug = movie['slug']
    r_i = movie['rating_i']
    r_v = movie['rating_v']

    print(f"--- Iniciando processamento de: {slug} ---")

    try:
        sys.argv = [sys.argv[0], slug, str(r_i), str(r_v)]
        update_workflow()
        
        queue.pop(0)
        
        with open(PATH_PENDING, 'w', encoding='utf-8') as f:
            json.dump(queue, f, indent=4, ensure_ascii=False)
        print(f"--- Sucesso: {slug} removido da fila de pendentes ---")

    except Exception as e:
        print(f"Erro ao processar fila: {e}")

if __name__ == "__main__":
    main()
