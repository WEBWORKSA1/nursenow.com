'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import { motion, AnimatePresence } from 'motion/react';
import { Info, TrendingUp, Wallet, Home, Landmark, Globe } from 'lucide-react';

interface CountryData {
  id: string;
  name: string;
  salary: number; // Annual USD
  rent: number;   // Monthly USD
  taxRate: number; // %
  costOfLivingIndex: number; // Relative to NYC (100)
  purchasingPower: number; // Calculated
}

const countryStats: Record<string, CountryData> = {
  "USA": { id: "USA", name: "United States", salary: 85000, rent: 1800, taxRate: 22, costOfLivingIndex: 75, purchasingPower: 0 },
  "GBR": { id: "GBR", name: "United Kingdom", salary: 45000, rent: 1200, taxRate: 20, costOfLivingIndex: 65, purchasingPower: 0 },
  "AUS": { id: "AUS", name: "Australia", salary: 75000, rent: 1600, taxRate: 25, costOfLivingIndex: 70, purchasingPower: 0 },
  "CAN": { id: "CAN", name: "Canada", salary: 65000, rent: 1400, taxRate: 25, costOfLivingIndex: 68, purchasingPower: 0 },
  "ARE": { id: "ARE", name: "UAE", salary: 55000, rent: 1500, taxRate: 0, costOfLivingIndex: 60, purchasingPower: 0 },
  "PHL": { id: "PHL", name: "Philippines", salary: 12000, rent: 400, taxRate: 15, costOfLivingIndex: 35, purchasingPower: 0 },
  "IND": { id: "IND", name: "India", salary: 10000, rent: 300, taxRate: 10, costOfLivingIndex: 25, purchasingPower: 0 },
  "DEU": { id: "DEU", name: "Germany", salary: 50000, rent: 1100, taxRate: 35, costOfLivingIndex: 65, purchasingPower: 0 },
  "SAU": { id: "SAU", name: "Saudi Arabia", salary: 40000, rent: 800, taxRate: 0, costOfLivingIndex: 50, purchasingPower: 0 },
  "SGP": { id: "SGP", name: "Singapore", salary: 50000, rent: 2500, taxRate: 10, costOfLivingIndex: 85, purchasingPower: 0 },
};

// Calculate Purchasing Power
Object.keys(countryStats).forEach(key => {
  const c = countryStats[key];
  const netAnnual = (c.salary * (1 - c.taxRate / 100)) - (c.rent * 12);
  c.purchasingPower = Math.round((netAnnual / c.costOfLivingIndex) * 10);
});

export default function PurchasingPowerMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, name: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 800;
    const height = 450;

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const projection = d3.geoMercator()
      .scale(120)
      .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const colorScale = d3.scaleSequential(d3.interpolateBlues)
      .domain([0, d3.max(Object.values(countryStats), d => d.purchasingPower) || 1000]);

    d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then((data: any) => {
      const countries = topojson.feature(data, data.objects.countries) as any;

      svg.selectAll('path')
        .data(countries.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d: any) => {
          const stats = countryStats[d.id] || countryStats[d.properties.name];
          return stats ? colorScale(stats.purchasingPower) : '#f1f5f9';
        })
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .style('cursor', 'pointer')
        .on('mouseover', (event, d: any) => {
          const stats = countryStats[d.id] || countryStats[d.properties.name];
          if (stats) {
            setTooltip({
              x: event.pageX,
              y: event.pageY,
              name: stats.name
            });
            d3.select(event.currentTarget).attr('fill', '#3b82f6');
          }
        })
        .on('mouseout', (event, d: any) => {
          setTooltip(null);
          const stats = countryStats[d.id] || countryStats[d.properties.name];
          d3.select(event.currentTarget).attr('fill', stats ? colorScale(stats.purchasingPower) : '#f1f5f9');
        })
        .on('click', (event, d: any) => {
          const stats = countryStats[d.id] || countryStats[d.properties.name];
          if (stats) setSelectedCountry(stats);
        });
    });
  }, []);

  return (
    <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Map Container */}
        <div className="flex-1 relative">
          <div className="mb-8">
            <h3 className="text-2xl font-display font-bold text-slate-900">Global Purchasing Power Heatmap</h3>
            <p className="text-slate-500 text-sm mt-1">Relative savings potential for nurses after taxes and cost of living.</p>
          </div>
          
          <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
            <svg ref={svgRef} className="w-full h-auto" />
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center space-x-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Purchasing Power:</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-blue-50 to-blue-900 rounded-full" />
            <div className="flex justify-between text-[10px] font-bold text-slate-400 w-full absolute -bottom-6 px-4">
              <span>LOW</span>
              <span>HIGH</span>
            </div>
          </div>
        </div>

        {/* Details Panel */}
        <div className="w-full lg:w-80 space-y-6">
          <AnimatePresence mode="wait">
            {selectedCountry ? (
              <motion.div
                key={selectedCountry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">{selectedCountry.name}</h4>
                    <p className="text-blue-600 font-bold text-xs uppercase tracking-widest">Relocation Profile</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase">Avg. Salary</span>
                      <Wallet className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">${selectedCountry.salary.toLocaleString()} <span className="text-xs text-slate-400">/yr</span></div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase">Avg. Rent</span>
                      <Home className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">${selectedCountry.rent.toLocaleString()} <span className="text-xs text-slate-400">/mo</span></div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-400 uppercase">Tax Rate</span>
                      <Landmark className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-xl font-bold text-slate-900">{selectedCountry.taxRate}%</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-bold text-slate-900">Purchasing Power</span>
                    <span className="text-blue-600 font-black text-2xl">{selectedCountry.purchasingPower}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(selectedCountry.purchasingPower / 1000) * 100}%` }}
                      className="bg-blue-600 h-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-4 leading-relaxed">
                    *Purchasing power is a custom metric calculated as (Net Salary - Rent) / Cost of Living Index.
                  </p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200">
                <Globe className="w-12 h-12 text-slate-300 mb-4" />
                <h4 className="font-bold text-slate-900">Select a Country</h4>
                <p className="text-slate-500 text-sm mt-2">Click on the map to see detailed financial relocation data.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {tooltip && (
        <div 
          className="fixed z-50 bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold pointer-events-none shadow-xl"
          style={{ left: tooltip.x + 10, top: tooltip.y - 30 }}
        >
          {tooltip.name}
        </div>
      )}
    </div>
  );
}
