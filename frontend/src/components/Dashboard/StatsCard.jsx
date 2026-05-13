import React from "react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";


export function StatsGrid({ children }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 w-full auto-rows-fr">
      {children}
    </div>
  );
}

export default function StatsCard({
  title,
  value,
  icon,
  color = "blue",
  trend,
  sparklineData = [],
  children,
}) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600", chart: "#3b82f6" },
    green: { bg: "bg-green-50", text: "text-green-600", chart: "#22c55e" },
    yellow: { bg: "bg-yellow-50", text: "text-yellow-600", chart: "#eab308" },
    red: { bg: "bg-red-50", text: "text-red-600", chart: "#ef4444" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", chart: "#a855f7" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", chart: "#6366f1" },
  };

  const theme = colorMap[color] || colorMap.blue;

  return (
    <div className="group relative bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(0,0,0,0.08)] transition-all duration-500 border border-slate-100 flex flex-col min-w-0 h-full overflow-hidden hover:-translate-y-1">
      {/* Background Accent Gradient */}
      <div
        className={`absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.03] transition-all duration-700 group-hover:scale-110 group-hover:opacity-[0.08] ${theme.bg}`}
      />

      <div className="flex justify-between items-start mb-4 sm:mb-6 z-10">
        <div
          className={`p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl ${theme.bg} ${theme.text} transition-all duration-500 shadow-sm border border-white/50`}
        >
          {React.cloneElement(icon, { size: 22, strokeWidth: 2.5 })}
        </div>
        
        {trend && (
          <div className={`text-[9px] sm:text-[10px] font-black px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg ${trend > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} border border-black/5`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-0.5 sm:space-y-1 relative z-10 flex-1 min-w-0">
        <p className="text-slate-400 text-[9px] sm:text-[10px] font-black tracking-widest sm:tracking-[0.15em] uppercase ">
          {title}
        </p>
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">
            {value}
          </p>
        </div>
      </div>

      {children && (
        <div className="mt-6 relative z-10">
          {children}
        </div>
      )}

      {sparklineData.length > 0 && (
        <div className="h-12 w-full mt-4 -mx-6 opacity-40 group-hover:opacity-100 transition-all duration-700">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient
                  id={`gradient-${color}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={theme.chart} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={theme.chart} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={theme.chart}
                strokeWidth={2}
                fill={`url(#gradient-${color})`}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
