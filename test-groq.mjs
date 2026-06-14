import Groq from 'groq-sdk';

console.log("Key prefix:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.substring(0, 8) : "MISSING");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say "hello world"' }],
            model: 'llama3-8b-8192',
        });
        console.log(chatCompletion.choices[0]?.message?.content);
    } catch(e) {
        console.error("ERROR:", e.message);
    }
}
main();
