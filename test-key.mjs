import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAxYaMUHZxUJLXHcnkU--SyaZ25jcz5LY4');

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const res = await model.generateContent("Hello?");
    console.log(`SUCCESS with ${modelName}! Response:`, res.response.text());
    return true;
  } catch (err) {
    console.error(`FAILED with ${modelName}:`, err.message);
    return false;
  }
}

async function runTests() {
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash-latest', 'gemini-pro'];
  for (const m of models) {
    const ok = await testModel(m);
    if (ok) process.exit(0);
  }
}

runTests();
