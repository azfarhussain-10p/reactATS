import axios from 'axios';
import { ParsedCVData } from './CVParsingService';

// Use import.meta.env instead of process.env for browser environment
const API_URL = import.meta.env.VITE_CV_PARSING_URL || 'http://localhost:5001';
const CV_PARSING_ENDPOINT = `${API_URL}/api/parse-cv`;

/**
 * Service for handling server-side CV parsing
 */
class CVParsingAPI {
  /**
   * Sends a CV file to the server for parsing
   * @param file The CV file to parse
   * @returns Promise with the parsed data
   */
  public static async parseCV(file: File): Promise<ParsedCVData> {
    try {
      const formData = new FormData();
      formData.append('cvFile', file);

      const response = await axios.post(CV_PARSING_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error parsing CV via API:', error);
      throw new Error('Failed to parse CV. Please try again later.');
    }
  }

  /**
   * Check if server-side parsing is available
   * @returns Promise<boolean> True if server-side parsing is available
   */
  public static async isAvailable(): Promise<boolean> {
    try {
      const response = await axios.get(`${CV_PARSING_ENDPOINT}/status`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

export default CVParsingAPI;
