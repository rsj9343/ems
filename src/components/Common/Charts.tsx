import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

interface ChartProps {
  data: any[];
  width?: number;
  height?: number;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export const SimpleBarChart: React.FC<ChartProps & { xKey: string; yKey: string }> = ({
  data,
  xKey,
  yKey,
  height = 300
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Bar dataKey={yKey} fill="#3B82F6" />
    </BarChart>
  </ResponsiveContainer>
);

export const SimplePieChart: React.FC<ChartProps & { nameKey: string; valueKey: string }> = ({
  data,
  nameKey,
  valueKey,
  height = 300
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        outerRadius={80}
        fill="#8884d8"
        dataKey={valueKey}
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
);

export const SimpleLineChart: React.FC<ChartProps & { xKey: string; yKey: string }> = ({
  data,
  xKey,
  yKey,
  height = 300
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey={xKey} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey={yKey} stroke="#3B82F6" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);