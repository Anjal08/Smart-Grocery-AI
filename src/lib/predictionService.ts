import Groq from 'groq-sdk';

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

export const generatePriceForecast = async (itemName: string) => {
    try {
        const prompt = `You are an expert procurement AI and pricing analyst for quick-commerce platforms.
Your task is to calculate a simulated, hyper-realistic baseline competitive pricing matrix for the item: "${itemName}".
You must compare live instant delivery prices across Blinkit, Zepto, and Flipkart Minutes against a predictive optimized option called "SmartSpend AI Vault".

The "SmartSpend AI Vault" option must represent a dynamically projected optimized price if the user batches this item into their weekly smart cart or unlocks subscription-tier logistics optimization (meaning it should typically be the lowest price).

Ensure the "aiInsight" compares the live instant delivery platforms and explicitly uses the "AI Vault" to show the user how much they could save through automated smart batching instead of ordering instantly.

Return the output STRICTLY as a JSON object matching the exact schema below. Do not include any other text.
{
  "itemName": "String",
  "bestPlatform": "String",
  "predictedPriceDrop": Number, // Expected price drop percentage or absolute amount
  "bestTimeToBuy": "String",
  "breakdown": [
    { "platform": "Blinkit", "price": Number, "eta": "String" },
    { "platform": "Zepto", "price": Number, "eta": "String" },
    { "platform": "Flipkart Minutes", "price": Number, "eta": "String" },
    { "platform": "SmartSpend AI Vault", "price": Number, "eta": "String" }
  ],
  "aiInsight": "String" // Insight highlighting smart batching savings
}`;

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: 'You are a data-driven quick-commerce pricing engine that outputs only valid JSON.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            model: 'llama-3.1-8b-instant',
            temperature: 0.3, 
            max_tokens: 1024,
            response_format: { type: 'json_object' }
        });

        const responseContent = chatCompletion.choices[0]?.message?.content;
        
        if (!responseContent) {
            throw new Error("No content received from Groq API");
        }

        const parsedData = JSON.parse(responseContent);
        return parsedData;

    } catch (error: any) {
        console.error(`[PredictionService Error] Failed to fetch forecast for "${itemName}":`, error.message);
        
        // Robust fallback mechanism returning standardized mock data
        return {
            itemName: itemName,
            bestPlatform: "SmartSpend AI Vault",
            predictedPriceDrop: 12.5,
            bestTimeToBuy: "Unlock Batching",
            breakdown: [
                { platform: "Blinkit", price: 120, eta: "10 mins" },
                { platform: "Zepto", price: 115, eta: "15 mins" },
                { platform: "Flipkart Minutes", price: 110, eta: "20 mins" },
                { platform: "SmartSpend AI Vault", price: 95, eta: "Next-Day Scheduled" }
            ],
            aiInsight: "Fallback insight: Quick commerce networks are congested. Opting for the SmartSpend AI Vault batch routing guarantees a 10-15% cost reduction."
        };
    }
};
