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
        <ComposableMap projectionConfig={{ rotate: [-10, 0, 0], scale: 147 }}>
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
    </div>
  );
}
