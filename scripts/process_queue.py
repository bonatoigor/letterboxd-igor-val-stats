import json
import os
import sys
from update_films import update_workflow 

PATH_PENDING = 'src/data/pending_films.json'
PATH_EXCLUDED = 'src/data/watch_next_excluded.json'
# The site's "Já vi" button queues films with both ratings at -1 (via the already
# deployed trigger-film-update function): exclude them from Watch Next instead of logging them.
EXCLUDE_RATING = -1


def is_exclusion(item):
    return item.get('rating_i') == EXCLUDE_RATING and item.get('rating_v') == EXCLUDE_RATING


def apply_exclusions(queue):
    exclusions = [item['slug'] for item in queue if is_exclusion(item)]
    if not exclusions:
        return queue

    with open(PATH_EXCLUDED, 'r', encoding='utf-8') as f:
        excluded = json.load(f)
    excluded += [slug for slug in exclusions if slug not in excluded]
    with open(PATH_EXCLUDED, 'w', encoding='utf-8') as f:
        json.dump(excluded, f, indent=2, ensure_ascii=False)
    print(f"Watch Next: excluidos {', '.join(exclusions)}")

    queue = [item for item in queue if not is_exclusion(item)]
    with open(PATH_PENDING, 'w', encoding='utf-8') as f:
        json.dump(queue, f, indent=4, ensure_ascii=False)
    return queue


def main():
    if not os.path.exists(PATH_PENDING):
        return

    with open(PATH_PENDING, 'r', encoding='utf-8') as f:
        queue = json.load(f)

    queue = apply_exclusions(queue)
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
