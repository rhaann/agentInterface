"use client";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Label
} from 'recharts';

// --- Internal Helper Functions for Formatting ---
// (These belong here as they relate to *how* the graph component displays things)

const formatDateTick = (timestamp: number): string => {
  if (typeof timestamp !== 'number' || isNaN(timestamp)) return '';
  // Simple Date format (e.g., Jan 01)
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatPaceTick = (totalSeconds: number): string => {
  if (typeof totalSeconds !== 'number' || isNaN(totalSeconds) || totalSeconds < 0) return '';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.round(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// --- Component Props ---
type GraphsProps = {
  type: 'line' | 'bar';
  data: Array<Record<string, any>>;
  title: string;
  xDataKey: string;
  yDataKey: string;
  color?: string;
  yAxisLabel?: string;
  inverted?: boolean;
  isXAxisTime?: boolean;
  isYAxisPace?: boolean;
};

export default function Graphs({
  type,
  data,
  title,
  xDataKey,
  yDataKey,
  color = "#8884d8",
  yAxisLabel,
  inverted = false,
  isXAxisTime = false,
  isYAxisPace = false,
}: GraphsProps) {

  if (!data || data.length === 0) {
    return ( // Simplified No Data state
      <div className="bg-white p-4 rounded-lg shadow-md min-h-[360px] flex items-center justify-center">
        <p className="text-gray-500">{`No data available for ${title}`}</p>
      </div>
    );
  }

  // Determine axis formatters based on flags
  const xAxisTickFormatter = isXAxisTime ? formatDateTick : undefined;
  const yAxisTickFormatter = isYAxisPace ? formatPaceTick : undefined;

  // Configure X-axis for time if needed
  const xAxisConfig = {
    dataKey: xDataKey,
    tickFormatter: xAxisTickFormatter,
    ...(isXAxisTime && {
        type: 'number' as const,
        scale: 'time' as const,
        domain: ['dataMin', 'dataMax'] as [string, string],
    }),
    // Common readability props
    angle: -30, textAnchor: 'end' as const, height: 50, dy: 10
  };

  const ChartComponent = type === 'line' ? LineChart : BarChart;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-full min-h-[360px] flex flex-col">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <ChartComponent data={data} margin={{ top: 5, right: 20, left: 30, bottom: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis {...xAxisConfig} />
            <YAxis reversed={inverted} tickFormatter={yAxisTickFormatter}>
              {yAxisLabel && (
                <Label value={yAxisLabel} angle={-90} position='insideLeft' style={{ textAnchor: 'middle' }} dx={-25} />
              )}
            </YAxis>
            <Tooltip
                // Apply formatting within the tooltip if needed
                labelFormatter={isXAxisTime ? (label) => formatDateTick(label as number) : undefined}
                formatter={isYAxisPace ? (value) => {
                    // value is the numeric seconds (e.g., 443)
                    const formattedPace = formatPaceTick(value as number); // Convert 443 -> "07:23"
                    const label = "Best Pace"; 
                    return [formattedPace, label]; 
                } : undefined}
            />
            <Legend verticalAlign="top" height={36}/>
            {type === 'line' ? (
              <Line type="monotone" dataKey={yDataKey} stroke={color} strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 6 }} name={title} connectNulls={false} />
            ) : (
              <Bar dataKey={yDataKey} fill={color} name={title} />
            )}
          </ChartComponent>
        </ResponsiveContainer>
      </div>
    </div>
  );
}