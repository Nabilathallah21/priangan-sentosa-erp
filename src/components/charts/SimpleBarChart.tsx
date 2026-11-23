"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SimpleBarChartProps {
  title: string;
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  barColor?: string;
}

export function SimpleBarChart({
  title,
  data,
  xKey,
  yKey,
  barColor = "#526D9B",
}: SimpleBarChartProps) {
  return (
    <Card className="border-[#E5E7EB] bg-white shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[#1F2937]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
            <Tooltip />
            <Bar dataKey={yKey} fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}