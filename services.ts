import { GoogleGenAI } from "@google/genai";
import { MOCK_PRODUCTS, MOCK_REVIEWS } from './constants';
import { Product, Review } from './types';

// Mock API for fetching product data
export const mockApi = {
  getProducts: async (): Promise<Product[]> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_PRODUCTS), 500));
  },
  getProductById: async (id: number): Promise<Product | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(MOCK_PRODUCTS.find(p => p.id === id)), 500));
  },
  getReviewsByProductId: async (productId: number): Promise<Review[]> => {
    const reviews = MOCK_REVIEWS.filter(r => r.productId === productId);
    return new Promise(resolve => setTimeout(() => resolve(reviews), 300));
  }
};

// Gemini API Service
export const generateDescription = async (productName: string, category: string): Promise<string> => {
  try {
    // FIX: Aligned with Gemini API guidelines by directly using the API key from environment variables
    // and removing unnecessary pre-checks. The key's availability is assumed.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Generate a short, vibrant, and artistic e-commerce description for a product named "${productName}". It's in the "${category}" category. The description should be about 2-3 sentences long and evoke a sense of creativity and quality. Do not use markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Error generating description:', error);
    return 'Failed to generate AI description. Please try again later.';
  }
};
