'use client';

import { useEffect, useState } from 'react';
import SideBar from "@/components/sideBar";
import Graphs from "@/components/graphs"; // Use the simplified Graphs component below
import { getTestRunData } from "@/lib/supabaseQueries";
import { processRawDataForBestPaceChart, SimplePaceDataPoint } from "@/utils/runningDataUtils"; // Import processor and type
import ChatWidget from '@/components/chatWidget';

export default function Home() {
  // State holds the processed data ready for the chart
  const [bestPaceChartData, setBestPaceChartData] = useState<SimplePaceDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setErrorMsg(null);
      const { data: rawData, error } = await getTestRunData();

      if (error) {
        console.error("Error fetching test run data:", error);
        setErrorMsg(`Failed to load run data: ${error instanceof Error ? error.message : String(error)}`);
        setBestPaceChartData([]);
      } else if (rawData && rawData.length > 0) {
        // Call the utility function to process the data
        const processedData = processRawDataForBestPaceChart(rawData);
        setBestPaceChartData(processedData);
      } else {
        console.log("No run data found.");
        setBestPaceChartData([]);
      }
      setLoading(false);
    }

    fetchData();
  }, []); // Runs once on mount

  return (
    <div className="flex h-screen">
      <SideBar />
      <div className="flex flex-col flex-1 bg-gray-100">
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Loading and Error States */}
            {loading && <div className="lg:col-span-2 text-center p-10">Loading data...</div>}
            {errorMsg && !loading && (
              <div className="lg:col-span-2 text-center p-10 text-red-600 bg-red-100 border border-red-400 rounded">
                Error: {errorMsg}
              </div>
            )}
            <ChatWidget />

            {/* Best Pace Trend Chart */}
            {!loading && !errorMsg && bestPaceChartData.length > 0 && (
              <Graphs
                type="line"
                title="Best Pace Trend"
                data={bestPaceChartData}
                xDataKey="timestamp"      // Use the numeric timestamp
                yDataKey="bestPaceSeconds"  // Use the numeric seconds
                color="#1E90FF"
                // Label reflects the formatted output from the Graphs component's formatter
                yAxisLabel="Best Pace (MM:SS)"
                inverted={true} // Lower pace value (seconds) is better
                // Tell the Graphs component how to handle the axes
                isXAxisTime={true}
                isYAxisPace={true}
              />
            )}

            {/* No Data State */}
            {!loading && !errorMsg && bestPaceChartData.length === 0 && (
              <div className="bg-white p-4 rounded-lg shadow-md text-center lg:col-span-2">
                No valid Best Pace data found to display.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}