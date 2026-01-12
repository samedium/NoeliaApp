import * as XLSX from 'xlsx';
import { RawSurveyRow } from '../types';

export const parseFile = async (file: File): Promise<RawSurveyRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);

        // Normalize data: Look for a column that likely contains the "comment" or "review"
        // For this demo, we assume the longest string column or one named 'comment', 'review', 'feedback'
        const normalizedData: RawSurveyRow[] = json.map((row: any, index) => {
          let commentText = '';
          
          // Heuristic to find the comment field
          const keys = Object.keys(row);
          const feedbackKey = keys.find(k => 
            k.toLowerCase().includes('comment') || 
            k.toLowerCase().includes('review') || 
            k.toLowerCase().includes('feedback') ||
            k.toLowerCase().includes('text')
          );

          if (feedbackKey) {
            commentText = String(row[feedbackKey]);
          } else {
             // Fallback: Find the longest string
             let maxLength = 0;
             keys.forEach(k => {
               const val = String(row[k]);
               if (val.length > maxLength) {
                 maxLength = val.length;
                 commentText = val;
               }
             });
          }

          return {
            id: index,
            comment: commentText,
            ...row
          };
        }).filter(r => r.comment && r.comment.length > 2); // Filter empty rows

        resolve(normalizedData);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file); // Better for pure CSV
    } else {
        reader.readAsBinaryString(file);
    }
  });
};