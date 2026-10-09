"""One-off: retry films whose Themes, Nanogenres or Countries are empty
(one Letterboxd request per film). Only fills fields that are empty today.
Countries Letterboxd doesn't have come from TMDB (e.g. TV episodes).

--countries: only fill empty Countries from a TMDB search by title/year (no Letterboxd requests)."""
import json
import random
import re
import sys
import time
import requests
from letterboxdpy.movie import Movie
from update_films import extract_extended_details, TMDB_API_KEY, MAX_RETRIES

PATH_JSON = 'src/data/films_stats.json'

# TMDB country names -> the Letterboxd names already used in films_stats.json.
TMDB_COUNTRY_NAMES = {
    "United States of America": "USA",
    "United Kingdom": "UK",
    "Korea, Republic of": "South Korea",
    "Russian Federation": "Russia",
}


def tmdb_countries(movie_obj):
    link = getattr(movie_obj, "tmdb_link", None) or ""
    parts = link.strip('/').split('/')
    if len(parts) < 2 or parts[-2] not in ("movie", "tv"):
        return []
    kind, tmdb_id = parts[-2], parts[-1]
    try:
        res = requests.get(f"https://api.themoviedb.org/3/{kind}/{tmdb_id}",
                           params={"api_key": TMDB_API_KEY}, timeout=5)
        if res.status_code != 200:
            return []
        names = [c.get("name") for c in res.json().get("production_countries", []) if c.get("name")]
        return [TMDB_COUNTRY_NAMES.get(n, n) for n in names]
    except Exception:
        return []


def tmdb_get(path, **params):
    try:
        res = requests.get(f"https://api.themoviedb.org/3/{path}",
                           params={"api_key": TMDB_API_KEY, **params}, timeout=5)
        return res.json() if res.status_code == 200 else {}
    except Exception:
        return {}


def tmdb_countries_by_search(title, year):
    """TMDB dropped the movie entries of many TV episodes, so search the title and,
    for 'Series: Episode' titles, the series itself (an episode shares its country)."""
    def normalize(text):
        return re.sub(r"[^a-z0-9]", "", (text or "").lower())

    candidates = [("movie", title, {"year": year}), ("tv", title, {})]
    if ":" in title:
        candidates.append(("tv", title.split(":")[0], {}))
    for kind, query, extra in candidates:
        results = tmdb_get(f"search/{kind}", query=query, **extra).get("results", [])
        match = next((r for r in results if normalize(r.get("title") or r.get("name")) == normalize(query)), None)
        if match:
            details = tmdb_get(f"{kind}/{match['id']}")
            names = [c.get("name") for c in details.get("production_countries", []) if c.get("name")]
            if names:
                return [TMDB_COUNTRY_NAMES.get(n, n) for n in names]
    return []


def fill_countries_only(banco):
    filled = 0
    for movie in banco["Movies_Info"]:
        if movie["Countries"]:
            continue
        countries = tmdb_countries_by_search(movie["Film_title"], movie["Release_year"])
        print(f"{movie['Film_title']}: {countries or 'nada'}")
        if countries:
            movie["Countries"] = countries
            filled += 1
    return filled


def fetch_movie(slug):
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return Movie(slug)
        except Exception as e:
            print(f"  [Erro tentativa {attempt}/{MAX_RETRIES}] {str(e).splitlines()[0]}")
            if attempt < MAX_RETRIES:
                time.sleep(15 * attempt + random.uniform(0, 5))
    return None


def main():
    with open(PATH_JSON, 'r', encoding='utf-8') as f:
        banco = json.load(f)

    if "--countries" in sys.argv:
        filled = fill_countries_only(banco)
        with open(PATH_JSON, 'w', encoding='utf-8') as f:
            json.dump(banco, f, indent=4, ensure_ascii=False)
        print(f"Concluido. Paises preenchidos: {filled}")
        return

    pending = [m for m in banco["Movies_Info"] if not m["Themes"] or not m["Nanogenres"] or not m["Countries"]]
    print(f"{len(pending)} filmes para tentar de novo")

    filled = {"Themes": 0, "Nanogenres": 0, "Countries": 0}
    for i, movie in enumerate(pending, start=1):
        slug = movie["Film_URL"].rstrip('/').split('/')[-1]
        m = fetch_movie(slug)
        if m is None:
            print(f"[{i}/{len(pending)}] {slug}: falhou")
            continue

        found = {
            "Themes": [g['name'] for g in m.genres if g['type'] == 'theme'],
            "Nanogenres": [g['name'] for g in m.genres if g['type'] == 'mini-theme'],
            "Countries": extract_extended_details(m).get('country', []),
        }
        if not movie["Countries"] and not found["Countries"]:
            found["Countries"] = tmdb_countries(m)

        changes = []
        for field, values in found.items():
            if not movie[field] and values:
                movie[field] = values
                filled[field] += 1
                changes.append(f"{field}={values}")
        print(f"[{i}/{len(pending)}] {slug}: {', '.join(changes) or 'nada novo'}")
        time.sleep(random.uniform(1.2, 2.5))

    with open(PATH_JSON, 'w', encoding='utf-8') as f:
        json.dump(banco, f, indent=4, ensure_ascii=False)
    print(f"Concluido. Preenchidos: {filled}")


if __name__ == "__main__":
    main()
