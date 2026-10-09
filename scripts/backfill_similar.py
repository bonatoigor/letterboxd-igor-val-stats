"""One-off: refill Similar_Films for every film in films_stats.json from the
'Similar Films' section of each film page (one Letterboxd request per film).
Resumable: films already in the new format (entries with 'slug') are skipped."""
import json
import random
import time
from letterboxdpy.core.scraper import parse_url
from update_films import extract_similar_films, MAX_RETRIES

PATH_JSON = 'src/data/films_stats.json'
SAVE_EVERY = 10


def is_done(movie):
    similar = movie.get("Similar_Films") or []
    return bool(similar) and "slug" in similar[0]


def fetch_dom(slug):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return parse_url(f"https://letterboxd.com/film/{slug}/")
        except Exception as e:
            print(f"  [Erro tentativa {attempt}/{MAX_RETRIES}] {str(e).splitlines()[0]}")
            if attempt < MAX_RETRIES:
                time.sleep(15 * attempt + random.uniform(0, 5))
    return None


def save(banco):
    with open(PATH_JSON, 'w', encoding='utf-8') as f:
        json.dump(banco, f, indent=4, ensure_ascii=False)


def main():
    with open(PATH_JSON, 'r', encoding='utf-8') as f:
        banco = json.load(f)

    movies = banco["Movies_Info"]
    pending = [m for m in movies if not is_done(m)]
    print(f"{len(pending)} de {len(movies)} filmes para atualizar")

    failed = []
    for i, movie in enumerate(pending, start=1):
        slug = movie["Film_URL"].rstrip('/').split('/')[-1]
        print(f"[{i}/{len(pending)}] {slug}")
        dom = fetch_dom(slug)
        if dom is None:
            failed.append(slug)
            continue
        movie["Similar_Films"] = extract_similar_films(dom)
        print(f"  {len(movie['Similar_Films'])} similares")
        if i % SAVE_EVERY == 0:
            save(banco)
        time.sleep(random.uniform(1.2, 2.5))

    save(banco)
    print(f"Concluido. Falhas: {failed or 'nenhuma'}")


if __name__ == "__main__":
    main()
