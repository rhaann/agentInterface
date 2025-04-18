// src/utils/runningDataUtils.ts // Or adjust path if needed (e.g., src/lib/)

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
      return 0; // Return 0 for null, undefined, non-string, or invalid format
  }
  try {
      const parts = paceString.split(':');
      // Ensure exactly two parts exist
      if (parts.length !== 2) {
          return 0;
      }
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      // Check if parsing resulted in NaN or if values are negative
      if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds >= 60) {
          return 0;
      }
      return minutes * 60 + seconds;
  } catch {
      // Catch any unexpected errors during split or parseInt
      return 0;
  }
}

/**
* Interface for raw run data expected from Supabase.
* Define ONLY the properties explicitly used by this utility.
*/
export interface RawRunData {
  // Removed the index signature: [key: string]: string | number | null | undefined;
  'Date': string;      // Expecting a date string parsable by new Date()
  'Best Pace': string; // Expecting pace in "MM:SS" format
  // Add definitions for any other properties you might access from the 'run' object
}

/**
* Processes raw run data to extract and format data specifically for the Best Pace Trend chart.
* Handles potential null input and invalid data points gracefully.
* @param rawRunData Array of run objects potentially from Supabase.
* @returns An array of SimplePaceDataPoint objects, sorted chronologically.
*/
export function processRawDataForBestPaceChart(rawRunData: RawRunData[] | null | undefined): SimplePaceDataPoint[] {
  // Handle null or undefined input array
  if (!rawRunData) {
      return [];
  }

  return rawRunData
      .map(run => {
          // Basic check if 'run' object itself is valid (might be needed depending on Supabase client)
          if (!run || typeof run !== 'object') {
              return null;
          }

          // Use direct property access with bracket notation due to spaces in keys
          const dateString = run['Date'];
          const bestPaceString = run['Best Pace'];

          // Validate that the expected properties exist and are strings
          if (typeof dateString !== 'string' || typeof bestPaceString !== 'string') {
              console.warn('Skipping run due to missing or invalid Date/Best Pace properties:', run);
              return null;
          }

          const date = new Date(dateString);
          const paceSeconds = parsePaceToSeconds(bestPaceString);

          // Validate the parsed data
          // Check if date parsing was successful (isNaN(date.getTime()))
          // Check if pace is valid (greater than 0, as 0 is our indicator for parse failure)
          if (isNaN(date.getTime()) || paceSeconds <= 0) {
              console.warn(`Skipping run due to invalid date or pace: Date='${dateString}', Pace='${bestPaceString}'`);
              return null;
          }

          // If all checks pass, return the formatted data point
          return {
              timestamp: date.getTime(), // Use milliseconds since epoch for charting
              bestPaceSeconds: paceSeconds,
          };
      })
      // Filter out any entries that resulted in null (due to validation failures)
      // Use a type guard to assure TypeScript the remaining items are SimplePaceDataPoint
      .filter((item): item is SimplePaceDataPoint => item !== null)
      // Sort the valid data points chronologically by timestamp
      .sort((a, b) => a.timestamp - b.timestamp);
}