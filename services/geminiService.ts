import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, SentimentType } from "../types";

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    sentimentCounts: {
      type: Type.OBJECT,
      properties: {
        [SentimentType.POSITIVE]: { type: Type.NUMBER },
        [SentimentType.NEGATIVE]: { type: Type.NUMBER },
        [SentimentType.NEUTRAL]: { type: Type.NUMBER },
        [SentimentType.INSIGHTFUL]: { type: Type.NUMBER },
        [SentimentType.URGENT]: { type: Type.NUMBER },
      },
      required: [SentimentType.POSITIVE, SentimentType.NEGATIVE, SentimentType.NEUTRAL, SentimentType.INSIGHTFUL, SentimentType.URGENT]
    },
    wordCloud: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          count: { type: Type.NUMBER },
          sentiment: { type: Type.STRING, enum: ['positive', 'negative'] }
        },
        required: ['word', 'count', 'sentiment']
      }
    },
    actionItems: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] },
          department: { type: Type.STRING, enum: ['Product', 'Sales', 'Support', 'Marketing'] }
        },
        required: ['title', 'description', 'priority', 'department']
      }
    },
    opportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          potentialRevenueImpact: { type: Type.STRING, enum: ['High', 'Medium', 'Low'] }
        },
        required: ['title', 'description', 'potentialRevenueImpact']
      }
    },
    keyCorrelations: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Statistical or thematic correlations observed, e.g., 'Mention of pricing highly correlated with negative churn risk'"
    },
    marketingHooks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Catchy marketing copy generated from the most positive user sentiments."
    },
    rowAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
           index: { type: Type.NUMBER },
           sentiment: { type: Type.STRING, enum: ['Positive', 'Negative', 'Neutral', 'Insightful', 'Urgent'] },
           category: { type: Type.STRING }
        }
      }
    }
  },
  required: ['sentimentCounts', 'wordCloud', 'actionItems', 'opportunities', 'keyCorrelations', 'marketingHooks', 'rowAnalysis']
};

export const analyzeSurveyData = async (comments: string[]): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  // Limit to 50 items for this demo to save tokens and ensure speed
  const sampleSize = Math.min(comments.length, 50);
  const sampleData = comments.slice(0, sampleSize).map((c, i) => `ID ${i}: ${c}`).join('\n');

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert Chief Product Officer and Data Scientist. 
    Analyze the following customer survey comments (Voice of Customer data).
    
    1. Categorize each review into: Positive, Negative, Neutral, Insightful (constructive feedback), or Urgent (churn risk/severe bug).
    2. Extract key themes and create a "word cloud" list of the most impactful positive (Green) and negative (Red) words/phrases.
    3. Identify correlations (e.g., does poor support correlate with churn?).
    4. Suggest specific Action Items for different departments.
    5. Identify New Business Opportunities (e.g., new product lines, upsells).
    6. Create Marketing Hooks based on what people love.

    Data Sample:
    ${sampleData}
  `;

  try {
    // Using gemini-3-flash-preview as the cost-efficient high-performance model
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
      },
    });

    const result = JSON.parse(response.text || '{}');
    
    const processedRows = result.rowAnalysis?.map((r: any) => ({
      original: comments[r.index],
      sentiment: r.sentiment as SentimentType,
      category: r.category
    })) || [];

    return {
      sentimentCounts: result.sentimentCounts,
      totalAnalyzed: sampleSize,
      wordCloud: result.wordCloud,
      actionItems: result.actionItems,
      opportunities: result.opportunities,
      keyCorrelations: result.keyCorrelations,
      marketingHooks: result.marketingHooks,
      processedRows: processedRows
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze data with Gemini.");
  }
};