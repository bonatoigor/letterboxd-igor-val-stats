"""Saves every film Igor or Valéria marked as watched on Letterboxd, so Watch Next
can skip them. Costs about one request per 72 films (~47 requests today)."""
import json
import os
from letterboxdpy.user import User

PATH_WATCHED = 'src/data/watched_slugs.json'
USERS = ["igorbonato", "vs_ol_"]


def main():
    watched = set()
    for username in USERS:
        films = User(username).get_films().get('movies', {})
        print(f"{username}: {len(films)} filmes")
        if not films:
            print("Lista vazia (bloqueio ou erro?). Mantendo o arquivo atual.")
            return
        watched |= set(films.keys())

    previous = []
    if os.path.exists(PATH_WATCHED):
        with open(PATH_WATCHED, 'r', encoding='utf-8') as f:
            previous = json.load(f)
    # A partial scrape would bring back films we already saw; keep the old list instead.
    if len(watched) < len(previous) * 0.9:
        print(f"Lista nova ({len(watched)}) bem menor que a atual ({len(previous)}). Mantendo o arquivo atual.")
        return

    with open(PATH_WATCHED, 'w', encoding='utf-8') as f:
        json.dump(sorted(watched), f, indent=1, ensure_ascii=False)
    print(f"{len(watched)} filmes salvos ({len(watched) - len(previous):+d})")


if __name__ == "__main__":
    main()
