import React, { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLog } from "d3-scale";
import { List } from "lucide-react";
import { Movie } from "@/lib/filmUtils";
import { Tooltip } from "react-tooltip";

const geoUrl = "https://raw.githubusercontent.com/lotusms/world-map-data/main/world.json";

const countryMapping: Record<string, string> = {
  "USA": "United States of America",
  "UK": "United Kingdom",
  "South Korea": "South Korea",
  "Japan": "Japan",
  "France": "France",
  "Germany": "Germany",
  "Brazil": "Brazil",
  "Canada": "Canada",
  "Australia": "Australia",
  "Denmark": "Denmark",
  "Netherlands": "Netherlands",
  "Austria": "Austria"
};

interface Topology {
  objects: Record<string, { geometries: { properties: { name: string } }[] }>;
}

interface WorldMapProps {
  movies: Movie[];
}

export default function WorldMapChart({ movies }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [geography, setGeography] = useState<Topology | null>(null);
  const [isListOpen, setIsListOpen] = useState(false);
  const [listTab, setListTab] = useState<"visited" | "missing">("visited");

  // Fetched here (not by <Geographies>) so the list can name the countries still missing.
  useEffect(() => {
    fetch(geoUrl).then((r) => r.json()).then(setGeography).catch(() => {});
  }, []);
  
  const filteredMovies = useMemo(() => {
    if (!selectedCountry) return [];
    return movies.filter(m => 
      m.Countries.some(c => (countryMapping[c] || c) === selectedCountry)
    );
  }, [selectedCountry, movies]);



  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    movies.forEach((m) => {
      m.Countries.forEach((c) => {
        const mappedName = countryMapping[c] || c;
        counts[mappedName] = (counts[mappedName] || 0) + 1;
      });
    });
    return counts;
  }, [movies]);

  const maxCount = Math.max(...Object.values(countryData), 2);

  // Log scale from an already bright green, so countries with a single film stand out too.
  const colorScale = scaleLog<string>()
    .domain([1, maxCount])
    .range(["#1f9d55", "#00ff6a"]);

  const visitedCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    movies.forEach((m) => m.Countries.forEach((c) => { counts[c] = (counts[c] || 0) + 1; }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [movies]);

  const missingCountries = useMemo(() => {
    if (!geography) return [];
    const names = Object.values(geography.objects)[0].geometries.map((g) => g.properties.name);
    return [...new Set(names)].filter((n) => !countryData[n]).sort((a, b) => a.localeCompare(b));
  }, [geography, countryData]);

  const listItems = listTab === "visited" ? visitedCountries : missingCountries.map((n) => [n, 0] as [string, number]);

  return (
    <div className="bg-lb-surface rounded-xl p-3 sm:p-6 border border-border/50 shadow-lg relative">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <h3 className="text-lb-text text-[10px] sm:text-xs uppercase tracking-widest">Global Film Reach</h3>
          <button
            onClick={() => setIsListOpen(true)}
            className="text-lb-text/60 hover:text-lb-green transition-colors p-2.5 -m-2"
            title="Ver lista de países"
            aria-label="Ver lista de países"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <span className="text-[9px] sm:text-[10px] text-lb-text/60">{Object.keys(countryData).length} Countries</span>
      </div>
      
      <div className="h-[220px] sm:h-[300px] md:h-[450px] w-full overflow-hidden rounded-lg bg-lb-body/50 border border-white/5">
        <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 190 }}>
          <ZoomableGroup zoom={1} maxZoom={3}>
            {geography && <Geographies geography={geography}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const count = countryData[countryName] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={count > 0 ? colorScale(count) : "#1c2228"}
                      stroke="#2c3440"
                      strokeWidth={0.5}
                      onMouseEnter={() => {
                        setTooltipContent(`${countryName}: ${count} ${count === 1 ? 'film' : 'films'}`);
                      }}
                      onMouseLeave={() => {
                        setTooltipContent("");
                      }}
                      data-tooltip-id="map-tooltip"
                      data-tooltip-content={tooltipContent}
                      onClick={() => {
                        if (count > 0) {
                          setSelectedCountry(countryName);
                          setIsModalOpen(true);
                        }
                      }}
                      style={{
                        default: { outline: "none" },
                        hover: { fill: "#40bcf4", outline: "none", cursor: "pointer" },
                        pressed: { outline: "none" },
                      }}
                    />
                  );
                })
              }
            </Geographies>}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <Tooltip 
        id="map-tooltip" 
        style={{ backgroundColor: "#2c3440", color: "#fff", borderRadius: "8px", fontSize: "12px", zIndex: 100 }}
      />

      {isListOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsListOpen(false)}
        >
          <div
            className="bg-lb-surface border border-border w-full max-w-md max-h-[70vh] rounded-xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex justify-between items-center bg-lb-body/50">
              <h3 className="text-lb-bright font-bold flex items-center gap-2">
                <span className="text-xl">🌍</span> Países
              </h3>
              <button
                onClick={() => setIsListOpen(false)}
                className="text-lb-text hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="flex border-b border-border text-xs uppercase tracking-widest">
              <button
                onClick={() => setListTab("visited")}
                className={`flex-1 py-2.5 transition-colors ${listTab === "visited" ? "text-lb-green border-b-2 border-lb-green" : "text-lb-text/60 hover:text-lb-text"}`}
              >
                Já foram ({visitedCountries.length})
              </button>
              <button
                onClick={() => setListTab("missing")}
                className={`flex-1 py-2.5 transition-colors ${listTab === "missing" ? "text-lb-orange border-b-2 border-lb-orange" : "text-lb-text/60 hover:text-lb-text"}`}
              >
                Faltam ({missingCountries.length})
              </button>
            </div>

            <div className="overflow-y-auto p-4 custom-scrollbar">
              <ul className="space-y-2">
                {listItems.map(([name, count]) => (
                  <li key={name} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                    <span className={listTab === "visited" ? "text-lb-bright" : "text-lb-text"}>{name}</span>
                    {listTab === "visited" && (
                      <span className="text-lb-text/60 text-sm tabular-nums">
                        {count} {count === 1 ? "film" : "films"}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-lb-surface border border-border w-full max-w-md max-h-[70vh] rounded-xl overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            
            <div className="p-4 border-b border-border flex justify-between items-center bg-lb-body/50">
              <h3 className="text-lb-bright font-bold flex items-center gap-2">
                <span className="text-xl">🎬</span> {selectedCountry}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-lb-text hover:text-white p-1"
              >
                ✕
              </button>
            </div>
      
            <div className="overflow-y-auto p-4 custom-scrollbar">
              <ul className="space-y-3">
                {filteredMovies.map((movie, idx) => (
                  <li key={idx} className="flex justify-between items-center group border-b border-white/5 pb-2 last:border-0">
                    <span className="text-lb-bright group-hover:text-lb-blue transition-colors">
                      {movie.Film_title} 
                    </span>
                    <span className="text-lb-text/60 text-sm italic">
                      {movie.Release_year ?? "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
      
            <div className="p-3 bg-lb-body/30 text-center">
              <span className="text-[10px] text-lb-text/40 uppercase tracking-widest">
                Total: {filteredMovies.length} {filteredMovies.length === 1 ? 'film' : 'films'}
              </span>
            </div>
          </div>
          
          <div className="absolute inset-0 -z-10" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
