import React, { useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { scaleLinear } from "d3-scale";
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

interface WorldMapProps {
  movies: Movie[];
}

export default function WorldMapChart({ movies }: WorldMapProps) {
  const [tooltipContent, setTooltipContent] = useState("");

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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

  const maxCount = Math.max(...Object.values(countryData), 1);

  const colorScale = scaleLinear<string>()
    .domain([0, maxCount])
    .range(["#1a232e", "#00e054"]); 

  return (
    <div className="bg-lb-surface rounded-xl p-6 border border-border/50 shadow-lg relative">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lb-text text-xs uppercase tracking-widest">Global Film Reach</h3>
        <span className="text-[10px] text-lb-text/60">{Object.keys(countryData).length} Countries Explored</span>
      </div>
      
      <div className="h-[300px] md:h-[450px] w-full overflow-hidden rounded-lg bg-lb-body/50 border border-white/5">
        <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 190 }}>
          <ZoomableGroup zoom={1} maxZoom={3}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const countryName = geo.properties.name;
                  const count = countryData[countryName] || 0;
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={count > 0 ? colorScale(count) : "#14181c"}
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
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <Tooltip 
        id="map-tooltip" 
        style={{ backgroundColor: "#2c3440", color: "#fff", borderRadius: "8px", fontSize: "12px", zIndex: 100 }}
      />

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
                      {movie.Title || movie.title} 
                    </span>
                    <span className="text-lb-text/60 text-sm italic">
                      {movie.Year || movie.year}
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
