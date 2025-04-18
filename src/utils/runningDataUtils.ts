// src/lib/runningDataUtil.ts

// Interface for the data points the chart will use
export interface SimplePaceDataPoint {
    timestamp: number;        // Numeric timestamp for X-axis (time scale)
    bestPaceSeconds: number;  // Numeric pace in seconds for Y-axis
  }
  
  /**
   * Parses a pace string ("MM:SS") into total seconds.
   * Returns 0 if input is invalid.
   */
  function parsePaceToSeconds(paceString: string | null | undefined): number {
    if (!paceString || typeof paceString !== 'string' || !paceString.includes(':')) {
      return 0;
    }
    try {
      const parts = paceString.split(':');
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return isNaN(minutes) || isNaN(seconds) ? 0 : minutes * 60 + seconds;
    } catch {
      return 0;
    }
  }
  
  /**
   * Processes raw run data to extract and format data specifically for the Best Pace Trend chart.
   * @param rawRunData Array of run objects from Supabase.
   * @returns An array of SimplePaceDataPoint objects, sorted by date.
   */
  export function processRawDataForBestPaceChart(rawRunData: any[] | null): SimplePaceDataPoint[] {
    if (!rawRunData) {
      return [];
    }
  
    // --- ADJUST THESE TO MATCH YOUR SUPABASE COLUMN NAMES ---
    const dateColumn = 'Date';
    const bestPaceColumn = 'Best Pace';
    // --- ---
  
    return rawRunData
      .map(run => {
        const date = new Date(run[dateColumn]);
        const paceSeconds = parsePaceToSeconds(run[bestPaceColumn]);
  
        // Skip invalid entries
        if (isNaN(date.getTime()) || paceSeconds <= 0) {
          return null;
        }
  
        return {
          timestamp: date.getTime(),
          bestPaceSeconds: paceSeconds,
        };
      })
      .filter((item): item is SimplePaceDataPoint => item !== null) // Type guard
      .sort((a, b) => a.timestamp - b.timestamp); // Sort by date
  }