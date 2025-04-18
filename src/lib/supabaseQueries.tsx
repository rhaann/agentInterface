import { supabase } from './supabase';

/**
 * Fetches all records from the test_run_data table
 * @returns Promise containing the data or error
 */
export async function getTestRunData() {
  try {
    const { data, error } = await supabase
      .from('test_run_data')
      .select('*');
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching test run data:', error);
    return { data: null, error };
  }
}

/**
 * Fetches a specific record from test_run_data by id
 * @param id The id of the record to fetch
 * @returns Promise containing the data or error
 */
export async function getTestRunById(id: number) {
  try {
    const { data, error } = await supabase
      .from('test_run_data')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error(`Error fetching test run with id ${id}:`, error);
    return { data: null, error };
  }
}

/**
 * Fetches test run data with filters
 * @param filters Object containing column names and values to filter by
 * @returns Promise containing the filtered data or error
 */
export async function getFilteredTestRunData(filters: Record<string, string | number | boolean | null>) {
  try {
    let query = supabase.from('test_run_data').select('*');
    
    // Apply all filters
    Object.entries(filters).forEach(([column, value]) => {
      query = query.eq(column, value);
    });
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Error fetching filtered test run data:', error);
    return { data: null, error };
  }
} 