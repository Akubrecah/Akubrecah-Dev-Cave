'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  value: number;
}

interface PremiumAreaChartProps {
  data: DataPoint[];
  color?: string;
  height?: number;
}

export function PremiumAreaChart({ data, color = '#E30613', height = 240 }: PremiumAreaChartProps) {
  if (!data?.length) return null;

  const width = 1000;
  const padding = 40;
  
  const maxVal = Math.max(...data.map(d => Number(d.value) || 0), 10);
  const minVal = Math.min(...data.map(d => Number(d.value) || 0), 0);
  const range = maxVal - minVal || 10;

  const points = data.map((d, i) => ({
    x: padding + (data.length > 1 ? (i * (width - 2 * padding)) / (data.length - 1) : (width - 2 * padding) / 2),
    y: height - padding - (((Number(d.value) || 0) - minVal) / range) * (height - 2 * padding)
  }));

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div className="relative p-8 rounded-[40px] bg-background/40 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[320px]">
      <div className="absolute top-8 left-8">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest opacity-40">Analytics Trend</h3>
        <p className="text-2xl font-bold text-[#E30613] mt-1 leading-none tracking-tight tabular-nums">
          {Math.round(data[data.length - 1].value).toLocaleString()}
        </p>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full mt-12 overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + p * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + p * (height - 2 * padding)}
            className="stroke-white/5"
            strokeWidth="1"
          />
        ))}

        {/* Area */}
        <motion.path
          d={areaPath}
          fill="url(#chartGradient)"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 1, delay: 0.5, type: 'spring', stiffness: 50 }}
          style={{ originY: 1 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.2, ease: "easeInOut" }}
        />

        {/* Points */}
        {points.map((p, i) => (
          <motion.circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="4"
            fill="#0a0a0a"
            stroke={color}
            strokeWidth="2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 100 }}
            whileHover={{ scale: 2, r: 6 }}
          />
        ))}
      </svg>

      {/* X Labels */}
      <div className="flex justify-between mt-4 px-10">
        {data.map((d, i) => (
          <span key={i} className="text-[10px] font-bold text-gray-600 tracking-widest uppercase">
            {new Date(d.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </span>
        ))}
      </div>
    </div>
  );
}
