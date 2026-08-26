import json
import sys
import shutil
import time
import random
from letterboxdpy.user import User
from letterboxdpy.movie import Movie
import requests

MAX_RETRIES = 3
INITIAL_BACKOFF = 30  # seconds

# ISO 639-1 code -> full language name, matching the naming already used in films_stats.json.
LANGUAGE_NAMES = {
    "en": "English", "es": "Spanish", "fr": "French", "de": "German", "it": "Italian",
    "pt": "Portuguese", "ru": "Russian", "ja": "Japanese", "ko": "Korean", "zh": "Chinese",
    "ar": "Arabic", "hi": "Hindi", "nl": "Dutch", "sv": "Swedish", "no": "Norwegian",
    "da": "Danish", "fi": "Finnish", "pl": "Polish", "tr": "Turkish", "el": "Greek",
    "he": "Hebrew", "th": "Thai", "vi": "Vietnamese", "id": "Indonesian", "cs": "Czech",
    "hu": "Hungarian", "ro": "Romanian", "uk": "Ukrainian", "bg": "Bulgarian", "hr": "Croatian",
    "sr": "Serbian", "sk": "Slovak", "sl": "Slovenian", "et": "Estonian", "lv": "Latvian",
    "lt": "Lithuanian", "is": "Icelandic", "ga": "Irish", "ca": "Catalan", "eu": "Basque",
    "gl": "Galician", "af": "Afrikaans", "sw": "Swahili", "fa": "Persian", "ur": "Urdu",
    "bn": "Bengali", "ta": "Tamil", "te": "Telugu", "ml": "Malayalam", "mr": "Marathi",
    "pa": "Punjabi", "gu": "Gujarati", "kn": "Kannada", "ne": "Nepali", "si": "Sinhala",
    "km": "Khmer", "lo": "Lao", "my": "Burmese", "ka": "Georgian", "hy": "Armenian",
    "az": "Azerbaijani", "kk": "Kazakh", "uz": "Uzbek", "mn": "Mongolian", "tl": "Tagalog",
    "ms": "Malay", "la": "Latin", "cy": "Welsh", "mt": "Maltese", "sq": "Albanian",
    "mk": "Macedonian", "bs": "Bosnian", "am": "Amharic", "yo": "Yoruba", "ig": "Igbo",
    "zu": "Zulu", "xh": "Xhosa", "so": "Somali", "ku": "Kurdish", "ps": "Pashto",
    "sd": "Sindhi", "yi": "Yiddish", "eo": "Esperanto", "zxx": "No spoken language",
}

def language_name(code):
    return LANGUAGE_NAMES.get(code, code.upper()) if code else code

def extract_extended_details(movie_obj):
    """Country/studio/language from the movie's own JSON-LD (avoids the broken
    /details page 'tab-details' selector in letterboxdpy and the extra request)."""
    script = movie_obj.pages.profile.script or {}
    countries = [c.get("name") for c in (script.get("countryOfOrigin") or []) if c.get("name")]
    studios = [s.get("name") for s in (script.get("productionCompany") or []) if s.get("name")]
    languages = [language_name(code) for code in (script.get("inLanguage") or []) if code]
    return {"country": countries, "studio": studios, "language": languages}

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
    if len(sys.argv) < 4:
        print("Uso: python script.py <slug> <nota_igor> <nota_valeria>")
        return

    slug = sys.argv[1]
    nota_igor = float(sys.argv[2])
    nota_valeria = float(sys.argv[3])

    path_json = 'src/data/films_stats.json'
    path_bkp = 'src/data/films_stats_bkp.json'
    path_failed = 'src/data/failed_films.json'

    try:
        shutil.copy2(path_json, path_bkp)
    except: pass

    with open(path_json, 'r', encoding='utf-8') as f:
        banco = json.load(f)


    if any(m['Film_URL'].endswith(f"/{slug}/") for m in banco["Movies_Info"]):
        print(f"Filme {slug} já existe.")
        return


    for attempt in range(1, MAX_RETRIES + 1):
        try:
            print(f"[Tentativa {attempt}/{MAX_RETRIES}] Buscando dados de '{slug}'...")
            time.sleep(random.uniform(2, 5))
            m = Movie(slug)
            detalhes = extract_extended_details(m)
            break
        except Exception as e:
            print(f"[Erro tentativa {attempt}] {e}")
            if attempt < MAX_RETRIES:
                backoff = INITIAL_BACKOFF * (2 ** (attempt - 1)) + random.uniform(0, 10)
                print(f"Aguardando {backoff:.0f}s antes de tentar novamente...")
                time.sleep(backoff)
            else:
                print(f"Falha após {MAX_RETRIES} tentativas. Salvando na fila...")
                try:
                    with open(path_failed, 'r', encoding='utf-8') as f:
                        failed_list = json.load(f)
                    
                    if not any(item['slug'] == slug for item in failed_list):
                        failed_list.append({
                            "slug": slug,
                            "rating_i": nota_igor,
                            "rating_v": nota_valeria,
                            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")
                        })
                        
                        with open(path_failed, 'w', encoding='utf-8') as f:
                            json.dump(failed_list, f, indent=4, ensure_ascii=False)
                except Exception as fe:
                    print(f"Erro ao salvar na fila: {fe}")
                return

    genres_only = [g['name'] for g in m.genres if g['type'] == 'genre']
    themes_only = [g['name'] for g in m.genres if g['type'] == 'theme']
    nanogenres_only = [g['name'] for g in m.genres if g['type'] == 'mini-theme']
    
    new_id = max([m['id'] for m in banco["Movies_Info"]], default=0) + 1

    new_movie = {
        "id": new_id,
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
        "Countries": detalhes.get('country', []),
        "Original_language": detalhes.get('language', ["English"])[0] if detalhes.get('language') else "English",
        "Spoken_languages": list(set(detalhes.get('language', []))),
        "Description": m.description,
        "Studios": detalhes.get('studio', []),
        "Film_URL": f"https://letterboxd.com/film/{slug}/",
        "Similar_Films": [],
        "Rating_Igor": nota_igor,
        "Rating_Valeria": nota_valeria
    }

    banco["Movies_Info"].append(new_movie)

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

    try:
        with open(path_failed, 'r', encoding='utf-8') as f:
            failed_list = json.load(f)
        
        new_failed_list = [item for item in failed_list if item['slug'] != slug]
        
        if len(new_failed_list) < len(failed_list):
            with open(path_failed, 'w', encoding='utf-8') as f:
                json.dump(new_failed_list, f, indent=4, ensure_ascii=False)
            print(f"Filme '{slug}' removido da fila de falhas.")
    except Exception as e:
        print(f"Erro ao atualizar fila de falhas: {e}")

if __name__ == "__main__":
    update_workflow()
