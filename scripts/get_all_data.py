import json
import requests
import time
from letterboxdpy.user import User
from letterboxdpy.movie import Movie
from letterboxdpy.pages.movie_details import MovieDetails


def buscar_poster_tmdb(movie_obj):
    tmdb_link = movie_obj.tmdb_link if hasattr(
        movie_obj, 'tmdb_link') else None
    if tmdb_link:
        tmdb_id = tmdb_link.strip('/').split('/')[-1]
        api_key = "9db1612712db88e78b09c26a17aa0c35"
        url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={api_key}"
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                path = data.get("poster_path")
                if path:
                    return f"https://image.tmdb.org/t/p/w300_and_h450_bestv2{path}"
        except:
            pass
    return movie_obj.poster


def buscar_poster_por_slug_tmdb(slug):
    api_key = "9db1612712db88e78b09c26a17aa0c35"
    search_url = f"https://api.themoviedb.org/3/search/movie?api_key={api_key}&query={slug.replace('-', ' ')}"
    try:
        res = requests.get(search_url, timeout=5)
        if res.status_code == 200:
            results = res.json().get("results")
            if results:
                path = results[0].get("poster_path")
                title = results[0].get("title")
                if path:
                    return f"https://image.tmdb.org/t/p/w300_and_h450_bestv2{path}", title
    except:
        pass
    return None, None


def gerar_banco_completo():
    try:
        with open('slugs_unicos.json', 'r', encoding='utf-8') as f:
            slugs = json.load(f)
    except FileNotFoundError:
        print("Erro: Arquivo slugs_unicos.json não encontrado.")
        return

    try:
        with open('meus_vistos.json', 'r', encoding='utf-8') as f:
            vistos_set = set(json.load(f))
    except FileNotFoundError:
        vistos_set = set()

    print(f"Buscando notas de igorbonato e vs_ol_...")
    filmes_igor = User("igorbonato").get_films().get('movies', {})
    filmes_val = User("vs_ol_").get_films().get('movies', {})

    banco_final = {"General_Info": [], "Movies_Info": []}
    total = len(slugs)

    for i, slug in enumerate(slugs, start=1):
        print(f"[{i}/{total}] Processando: {slug}")
        try:
            m = Movie(slug)
            md = MovieDetails(slug)

            detalhes_extras = md.get_extended_details()
            similar_list = []

            similares_raw = m.get_similar_movies()
            try:
                if similares_raw:
                    count_sim = 0
                    for film_id, data in similares_raw.items():
                        if count_sim >= 10:
                            break

                        sim_slug = data.get('slug') if isinstance(
                            data, dict) else str(data).split('/')[-2]

                        if sim_slug in vistos_set:
                            continue

                        poster_url, real_title = buscar_poster_por_slug_tmdb(
                            sim_slug)

                        if real_title:
                            similar_list.append({
                                "id": film_id,
                                "title": real_title,
                                "url": f"https://letterboxd.com/film/{sim_slug}/",
                                "poster": poster_url if poster_url else f"https://a.ltrbxd.com/resized/film-poster/{film_id}.jpg"
                            })
                            count_sim += 1
                            time.sleep(0.2)
            except Exception as e:
                print(f"Aviso: Erro nos similares: {e}")

            rating_raw_igor = filmes_igor.get(slug, {}).get('rating', 0)
            rating_raw_val = filmes_val.get(slug, {}).get('rating', 0)
            nota_igor = float(rating_raw_igor) if rating_raw_igor else 0.0
            nota_val = float(rating_raw_val) if rating_raw_val else 0.0

            genres_only = [g['name'] for g in m.genres if g['type'] == 'genre']
            themes_only = [g['name'] for g in m.genres if g['type'] == 'theme']
            nanogenres_only = [g['name']
                               for g in m.genres if g['type'] == 'mini-theme']

            film_dict = {
                "id": i,
                "Film_title": m.title,
                "Poster_Movie": buscar_poster_tmdb(m),
                "Release_year": m.year,
                "Director": m.crew['director'][0]['name'] if m.crew['director'] else "N/A",
                "Cast": [actor['name'] for actor in m.cast[:10]],
                "Average_rating": m.rating,
                "Genres": genres_only,
                "Themes": themes_only,
                "Nanogenres": nanogenres_only,
                "Runtime": m.runtime,
                "Countries": detalhes_extras.get('country', []),
                "Original_language": detalhes_extras.get('language', ["English"])[0] if detalhes_extras.get('language') else "English",
                "Spoken_languages": list(set(detalhes_extras.get('language', []))),
                "Description": m.description,
                "Studios": detalhes_extras.get('studio', []),
                "Film_URL": f"https://letterboxd.com/film/{slug}/",
                "Similar_Films": similar_list,
                "Rating_Igor": nota_igor,
                "Rating_Valeria": nota_val
            }
            banco_final["Movies_Info"].append(film_dict)

            time.sleep(1.2)

        except Exception as e:
            print(f"Erro em {slug}: {e}")

    movies = banco_final["Movies_Info"]
    if movies:
        total_comp = sum(
            1 - abs(f["Rating_Igor"] - f["Rating_Valeria"]) / 5 for f in movies)
        avg_comp = (total_comp / len(movies) * 100)
    else:
        avg_comp = 0

    banco_final["General_Info"].append({
        "Total_Movies": len(movies),
        "Compatibility": round(avg_comp, 2),
        "Sum_Rating_Igor": sum(f["Rating_Igor"] for f in movies),
        "Sum_Rating_Valeria": sum(f["Rating_Valeria"] for f in movies),
        "Avatar_Igor": User("igorbonato").get_avatar().get('url', ""),
        "Avatar_Valeria": User("vs_ol_").get_avatar().get('url', "")
    })

    with open('films_stats.json', 'w', encoding='utf-8') as f:
        json.dump(banco_final, f, indent=4, ensure_ascii=False)

    print(
        f"\nSucesso! Arquivo 'films_stats.json' gerado com {len(movies)} filmes.")


if __name__ == "__main__":
    gerar_banco_completo()
