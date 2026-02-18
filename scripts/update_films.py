import json
import sys
import shutil
import time
import requests
from letterboxdpy.user import User
from letterboxdpy.movie import Movie
from letterboxdpy.pages.movie_details import MovieDetails

from letterboxdpy.core.scraper import Scraper

Scraper.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"

def buscar_poster_tmdb(movie_obj):
    tmdb_link = movie_obj.tmdb_link if hasattr(movie_obj, 'tmdb_link') else None
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
        except: pass
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
    except: pass
    return None, None

def update_workflow():
    if len(sys.argv) < 4:
        print("Uso: python script.py <slug> <nota_igor> <nota_valeria>")
        return
    
    slug = sys.argv[1]
    nota_igor = float(sys.argv[2])
    nota_valeria = float(sys.argv[3])

    path_json = 'src/data/films_stats.json'
    path_igor_watched = 'src/data/igor_watched.json'
    path_couple_watched = 'src/data/couple_watched.json'
    path_bkp = 'src/data/films_stats_bkp.json'


    try:
        with open(path_igor_watched, 'r', encoding='utf-8') as f:
            igor_watched = set(json.load(f))
    except: igor_watched = set()

    try:
        with open(path_couple_watched, 'r', encoding='utf-8') as f:
            couple_watched_list = json.load(f)
            couple_watched_set = set(couple_watched_list)
    except: 
        couple_watched_list = []
        couple_watched_set = set()

    try: shutil.copy2(path_json, path_bkp)
    except: pass

    with open(path_json, 'r', encoding='utf-8') as f:
        banco = json.load(f)


    if any(m['Film_URL'].endswith(f"/{slug}/") for m in banco["Movies_Info"]):
        print(f"Filme {slug} já existe no banco principal.")
        return


    m = Movie(slug)
    md = MovieDetails(slug)
    detalhes = md.get_extended_details()
    
    similar_list = []
    similares_raw = m.get_similar_movies()
    if similares_raw:
        count_sim = 0
        for film_id, data in similares_raw.items():
            if count_sim >= 5: break
            
            sim_slug = data.get('slug') if isinstance(data, dict) else str(data).split('/')[-2]

            if sim_slug in igor_watched:
                continue

            poster_url, real_title = buscar_poster_por_slug_tmdb(sim_slug)
            if real_title:
                similar_list.append({
                    "id": film_id,
                    "title": real_title,
                    "url": f"https://letterboxd.com/film/{sim_slug}/",
                    "poster": poster_url if poster_url else f"https://a.ltrbxd.com/resized/film-poster/{film_id}.jpg"
                })
                count_sim += 1
                time.sleep(0.3)

    new_id = max([item['id'] for item in banco["Movies_Info"]], default=0) + 1
    new_movie = {
        "id": new_id,
        "Film_title": m.title,
        "Poster_Movie": buscar_poster_tmdb(m), 
        "Release_year": m.year,
        "Director": m.crew['director'][0]['name'] if m.crew['director'] else "N/A",
        "Cast": [actor['name'] for actor in m.cast[:10]],
        "Average_rating": m.rating,
        "Genres": [g['name'] for g in m.genres if g['type'] == 'genre'],
        "Runtime": m.runtime,
        "Countries": detalhes.get('country', []),
        "Film_URL": f"https://letterboxd.com/film/{slug}/",
        "Similar_Films": similar_list,
        "Rating_Igor": nota_igor,
        "Rating_Valeria": nota_valeria
    }
    
    banco["Movies_Info"].append(new_movie)
    
    if slug not in couple_watched_set:
        couple_watched_list.append(slug)
        with open(path_couple_watched, 'w', encoding='utf-8') as f:
            json.dump(couple_watched_list, f, indent=4, ensure_ascii=False)


    movies = banco["Movies_Info"]
    total_comp = sum(1 - abs(f["Rating_Igor"] - f["Rating_Valeria"]) / 5 for f in movies)
    avg_comp = (total_comp / len(movies) * 100) if movies else 0

    gen = banco["General_Info"][0]
    gen["Total_Movies"] = len(movies)
    gen["Compatibility"] = round(avg_comp, 1) 
    gen["Sum_Rating_Igor"] = round(sum(f["Rating_Igor"] for f in movies), 1)
    gen["Sum_Rating_Valeria"] = round(sum(f["Rating_Valeria"] for f in movies), 1)

    with open(path_json, 'w', encoding='utf-8') as f:
        json.dump(banco, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    update_workflow()
