import json
import sys
import shutil
import time
from letterboxdpy.user import User
from letterboxdpy.movie import Movie
from letterboxdpy.pages.movie_details import MovieDetails
import requests

# Reutilizando sua lógica de poster do TMDB
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

def update_workflow():
    # 1. Recebe slugs dos argumentos (passados pelo GitHub Action)
    # Formato esperado: slug1,slug2,slug3
    if len(sys.argv) < 2:
        return
    
    raw_args = " ".join(sys.argv[1:]) 
    new_slugs = [s.strip() for s in raw_args.replace(',', ' ').split() if s.strip()]

    path_json = 'src/data/films_stats.json'
    path_bkp = 'src/data/films_stats_bkp.json'

    # 2. Criar/Sobreescrever Backup antes de qualquer alteração
    try:
        shutil.copy2(path_json, path_bkp)
        print(f"Backup gerado em: {path_bkp}")
    except FileNotFoundError:
        print("Arquivo original não encontrado para backup, iniciando novo.")

    # 3. Carregar dados atuais
    try:
        with open(path_json, 'r', encoding='utf-8') as f:
            banco = json.load(f)
    except FileNotFoundError:
        banco = {"General_Info": [], "Movies_Info": []}

    # Pegar notas atualizadas dos perfis
    filmes_igor = User("igorbonato").get_films().get('movies', {})
    filmes_val = User("vs_ol_").get_films().get('movies', {})

    last_id = max([m['id'] for m in banco["Movies_Info"]], default=0)

    for slug in new_slugs:
        slug = slug.strip()
        if any(m['Film_URL'].endswith(f"/{slug}/") for m in banco["Movies_Info"]):
            print(f"Filme {slug} já existe no banco. Pulando...")
            continue

        print(f"Processando novo filme: {slug}")
        try:
            m = Movie(slug)
            md = MovieDetails(slug)
            detalhes_extras = md.get_extended_details()
            
            last_id += 1
            
            # Mapeamento
            film_dict = {
                "id": last_id,
                "Film_title": m.title,
                "Poster_Movie": buscar_poster_tmdb(m),
                "Release_year": m.year,
                "Director": m.crew['director'][0]['name'] if m.crew['director'] else "N/A",
                "Cast": [actor['name'] for actor in m.cast[:10]],
                "Average_rating": m.rating,
                "Genres": [g['name'] for g in m.genres if g['type'] == 'genre'],
                "Themes": [g['name'] for g in m.genres if g['type'] == 'theme'],
                "Nanogenres": [g['name'] for g in m.genres if g['type'] == 'mini-theme'],
                "Runtime": m.runtime,
                "Countries": detalhes_extras.get('country', []),
                "Original_language": detalhes_extras.get('language', ["English"])[0] if detalhes_extras.get('language') else "English",
                "Spoken_languages": list(set(detalhes_extras.get('language', []))),
                "Description": m.description,
                "Studios": detalhes_extras.get('studio', []),
                "Film_URL": f"https://letterboxd.com/film/{slug}/",
                "Rating_Igor": float(filmes_igor.get(slug, {}).get('rating', 0) or 0),
                "Rating_Valeria": float(filmes_val.get(slug, {}).get('rating', 0) or 0)
            }
            banco["Movies_Info"].append(film_dict)
            time.sleep(1.2) # Delay preventivo
        except Exception as e:
            print(f"Erro ao processar {slug}: {e}")

    # 4. Recalcular General_Info
    movies = banco["Movies_Info"]
    total_comp = sum(1 - abs(f["Rating_Igor"] - f["Rating_Valeria"]) / 5 for f in movies)
    avg_comp = (total_comp / len(movies) * 100) if movies else 0

    banco["General_Info"] = [{
        "Total_Movies": len(movies),
        "Compatibility": round(avg_comp, 2),
        "Sum_Rating_Igor": sum(f["Rating_Igor"] for f in movies),
        "Sum_Rating_Valeria": sum(f["Rating_Valeria"] for f in movies),
        "Avatar_Igor": User("igorbonato").get_avatar().get('url', ""),
        "Avatar_Valeria": User("vs_ol_").get_avatar().get('url', "")
    }]

    with open(path_json, 'w', encoding='utf-8') as f:
        json.dump(banco, f, indent=4, ensure_ascii=False)

if __name__ == "__main__":
    update_workflow()
