import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API!);

/**
 * Health Scanner — Analyzes product ingredients via Gemini AI
 * to detect hidden sugars, harmful additives, and compute an Eco-Health Score.
 */

export interface HealthFlag {
  type: "warning" | "danger" | "info";
  message: string;
}

export interface HealthScanResult {
  ecoHealthScore: number;
  hiddenSugars: string[];
  harmfulAdditives: string[];
  healthFlags: HealthFlag[];
  dietaryCompatibility: {
    isVegan: boolean;
    isGlutenFree: boolean;
    isLowSugar: boolean;
    isNutFree: boolean;
  };
  recommendation: string;
  analyzedProduct: string;
}

/**
 * Scan a single product's ingredients for health analysis.
 */
export async function scanIngredients(
  ingredientsText: string,
  productName: string = "Unknown Product",
  userHealthPreferences: string[] = []
): Promise<HealthScanResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    You are a food health analyzer AI for SmartSpend AI, an Indian grocery app.
    Analyze the following product and its ingredients for health concerns.

    Product: ${productName}
    Ingredients: ${ingredientsText || "Not provided — analyze based on product name"}

    User's dietary preferences: ${userHealthPreferences.length > 0 ? userHealthPreferences.join(", ") : "None specified"}

    Provide your analysis in this EXACT JSON format (no markdown, no backticks):
    {
      "ecoHealthScore": 75,
      "hiddenSugars": ["High Fructose Corn Syrup", "Maltodextrin"],
      "harmfulAdditives": ["MSG", "Sodium Benzoate"],
      "healthFlags": [
        { "type": "warning", "message": "Contains added sugars disguised as corn syrup" },
        { "type": "danger", "message": "High sodium content exceeds daily limit" },
        { "type": "info", "message": "Good source of fiber" }
      ],
      "dietaryCompatibility": {
        "isVegan": true,
        "isGlutenFree": false,
        "isLowSugar": false,
        "isNutFree": true
      },
      "recommendation": "A brief 2-sentence recommendation based on the analysis."
    }

    Scoring rules for ecoHealthScore (0-100):
    - Start at 100
    - Deduct 5-10 points for each hidden sugar
    - Deduct 10-15 points for each harmful additive (preservatives, artificial colors)
    - Deduct 5 points for high sodium
    - Deduct 10 points for trans fats
    - Add 5 points for organic ingredients
    - Add 5 points for high fiber or protein
    - Minimum score: 5

    Be thorough but concise. Focus on Indian market products.
  `;

  const result = await model.generateContent(prompt);
  let textResult = result.response.text();
  textResult = textResult.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    const parsed = JSON.parse(textResult);
    return {
      ecoHealthScore: Math.max(5, Math.min(100, parsed.ecoHealthScore || 50)),
      hiddenSugars: parsed.hiddenSugars || [],
      harmfulAdditives: parsed.harmfulAdditives || [],
      healthFlags: parsed.healthFlags || [],
      dietaryCompatibility: {
        isVegan: parsed.dietaryCompatibility?.isVegan ?? true,
        isGlutenFree: parsed.dietaryCompatibility?.isGlutenFree ?? true,
        isLowSugar: parsed.dietaryCompatibility?.isLowSugar ?? true,
        isNutFree: parsed.dietaryCompatibility?.isNutFree ?? true,
      },
      recommendation: parsed.recommendation || "No specific recommendation.",
      analyzedProduct: productName,
    };
  } catch (err) {
    console.error("Health scanner parse error:", textResult);
    return {
      ecoHealthScore: 50,
      hiddenSugars: [],
      harmfulAdditives: [],
      healthFlags: [
        {
          type: "info",
          message: "Could not fully analyze ingredients. Score is estimated.",
        },
      ],
      dietaryCompatibility: {
        isVegan: true,
        isGlutenFree: true,
        isLowSugar: true,
        isNutFree: true,
      },
      recommendation:
        "Unable to provide detailed analysis. Please check the packaging.",
      analyzedProduct: productName,
    };
  }
}

/**
 * Batch scan multiple products.
 */
export async function batchScanIngredients(
  products: { name: string; ingredients: string }[],
  userHealthPreferences: string[] = []
): Promise<HealthScanResult[]> {
  const results = await Promise.allSettled(
    products.map((p) =>
      scanIngredients(p.ingredients, p.name, userHealthPreferences)
    )
  );

  return results.map((r, i) =>
    r.status === "fulfilled"
      ? r.value
      : {
          ecoHealthScore: 50,
          hiddenSugars: [],
          harmfulAdditives: [],
          healthFlags: [{ type: "info" as const, message: "Scan failed for this product." }],
          dietaryCompatibility: {
            isVegan: true,
            isGlutenFree: true,
            isLowSugar: true,
            isNutFree: true,
          },
          recommendation: "Could not analyze this product.",
          analyzedProduct: products[i].name,
        }
  );
}
