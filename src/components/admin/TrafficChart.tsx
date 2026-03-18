"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type RawPoint = { created_at: string; type: string };

type Props = {
  rawData: RawPoint[];
  organicPct: number;
  readPct: number;
  otherPct: number;
};

type Filter = "day" | "week" | "month" | "year";

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const reads = payload.find((p: any) => p.dataKey === "reads")?.value ?? 0;
  const visits = payload.find((p: any) => p.dataKey === "visits")?.value ?? 0;
  const other = payload.find((p: any) => p.dataKey === "other")?.value ?? 0;
  const total = (reads as number) + (visits as number) + (other as number);

  return (
    <div className="bg-[#1d1d1f] rounded-2xl p-5 shadow-2xl w-[220px] pointer-events-none">
      <div className="text-[10px] font-bold text-white/40 mb-3 uppercase tracking-[0.15em]">
        Live Pulse Insight
      </div>
      <div className="flex items-center justify-between text-[13px] font-bold text-white mb-2">
        <span>Total Pulse</span>
        <span className="text-[#41cc00]">{total} events</span>
      </div>
      <div className="space-y-1.5 mt-3">
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="w-2 h-2 rounded-full bg-[#41cc00] inline-block" /> Direct/Home
          </span>
          <span className="text-white font-bold">{visits}</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block" /> Article Reads
          </span>
          <span className="text-white font-bold">{reads}</span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="flex items-center gap-1.5 text-white/60">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" /> Other
          </span>
          <span className="text-white font-bold">{other}</span>
        </div>
      </div>
      <div className="mt-3 text-[10px] text-white/30 font-medium">{label}</div>
    </div>
  );
}

function aggregateData(rawData: RawPoint[], filter: Filter) {
  const now = new Date();
  let buckets: { label: string; start: Date; end: Date }[] = [];

  if (filter === "day") {
    // Last 24 hours by hour
    for (let i = 23; i >= 0; i--) {
      const start = new Date(now);
      start.setHours(now.getHours() - i, 0, 0, 0);
      const end = new Date(start);
      end.setHours(start.getHours() + 1, 0, 0, 0);
      buckets.push({ label: `${start.getHours()}:00`, start, end });
    }
  } else if (filter === "week") {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(now.getDate() - i);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 1);
      buckets.push({
        label: start.toLocaleDateString("en-US", { weekday: "short" }),
        start,
        end,
      });
    }
  } else if (filter === "month") {
    // Last 30 days, grouped by week
    for (let i = 3; i >= 0; i--) {
      const end = new Date(now);
      end.setDate(now.getDate() - i * 7);
      end.setHours(23, 59, 59);
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      buckets.push({
        label: `Wk ${4 - i}`,
        start,
        end,
      });
    }
  } else {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const start = new Date(now);
      start.setMonth(now.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(start.getMonth() + 1, 0);
      end.setHours(23, 59, 59);
      buckets.push({
        label: start.toLocaleDateString("en-US", { month: "short" }),
        start,
        end,
      });
    }
  }

  return buckets.map((bucket) => {
    const inBucket = rawData.filter((d) => {
      const t = new Date(d.created_at);
      return t >= bucket.start && t < bucket.end;
    });
    return {
      label: bucket.label,
      visits: inBucket.filter((d) => d.type === "visit").length,
      reads: inBucket.filter((d) => d.type === "read").length,
      other: inBucket.filter((d) => d.type !== "visit" && d.type !== "read").length,
    };
  });
}

export function TrafficChart({ rawData, organicPct, readPct, otherPct }: Props) {
  const [filter, setFilter] = useState<Filter>("week");

  const chartData = useMemo(() => aggregateData(rawData, filter), [rawData, filter]);

  const filters: Filter[] = ["day", "week", "month", "year"];

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
              filter === f
                ? "bg-[#093C15] text-white shadow-md"
                : "bg-black/5 text-black/40 hover:text-black/70"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
            <defs>
              <linearGradient id="gradVisits" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#41cc00" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#41cc00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradReads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradOther" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000008" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fontWeight: 700, fill: "#00000040" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fontWeight: 700, fill: "#00000030" }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#09394408", strokeWidth: 40 }} />
            <Area
              type="monotone"
              dataKey="visits"
              stroke="#41cc00"
              strokeWidth={2}
              fill="url(#gradVisits)"
              dot={false}
              activeDot={{ r: 6, fill: "#093C15", stroke: "white", strokeWidth: 2 }}
              name="visits"
            />
            <Area
              type="monotone"
              dataKey="reads"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#gradReads)"
              dot={false}
              activeDot={{ r: 6, fill: "#3b82f6", stroke: "white", strokeWidth: 2 }}
              name="reads"
            />
            <Area
              type="monotone"
              dataKey="other"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#gradOther)"
              dot={false}
              activeDot={{ r: 6, fill: "#f97316", stroke: "white", strokeWidth: 2 }}
              name="other"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-8 px-4 border-t border-black/5 pt-6">
        {[
          { name: "Direct/Home", color: "bg-[#41cc00]", value: `${organicPct}%` },
          { name: "Article Reads", color: "bg-blue-500", value: `${readPct}%` },
          { name: "Other Engagement", color: "bg-orange-500", value: `${otherPct}%` },
        ].map((src) => (
          <div key={src.name} className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full ${src.color} shadow-sm`} />
            <span className="text-[13px] font-bold text-[#1d1d1f]">{src.name}</span>
            <span className="text-[13px] font-bold text-black/20">{src.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
