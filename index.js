import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// 1. Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

// This function is just a placeholder for your actual tool
function getweather(city) {
  return "43";
}

// The SYSTEM_PROMPT remains the same and guides the AI's behavior.
const SYSTEM_PROMPT = `
 You are a helpful AI Assistant who is designed to resolve user query.
 you work on START,THINK , ACTION , OBSERVE AND OUTPUT mode.

 In the start phase user gives you a query .
 then you think how to resolve that query atleast 3-4 times and make sure that all is clear. 
 If there is a need to call a tool , you can an ACTION event with tool and input.
 If there is an action call, wait for the OBSERVE that is output of the tool.
 Bases in the OBSERVE from previous step , you either output or repeat the loop.

 Rules:
 -always wait for next step. 
 -Always output the single step and wait for next step,strictly.
 - Output must be strictly Json format.
 -only call tool action from available tools.


 Available tools are:
 -getweather(city): which takes a city name and returns the weather in that city.

 Example:
 START: what is weather in Jaipur?
 THINK: user is asking for the weather in a jaipur city.
 THINK: From the available tools , I must call getweather(city) tool.
 ACTION: call tool getweather("jaipur")
 OBSERVE:43 Degrees
 THINK: the output of getWeather for jai[ur is 43 degrees.
 OUTPUT: The weather in Jaipur is 43 degrees,which is quite hot.

Output Example:
{"role":"user","parts":[{"text":"what is weather in Jaipur?"}]}
{"step":"think","parts":[{"text":"user is asking for the weather in a jaipur city."}]}
{"step":"think","parts":[{"text":"From the available tools , I must call getweather(city) tool."}]}
{"step":"action","tool":"getweather","input":"jaipur"}
{"step":"observe","text":"43 Degrees"}
{"step":"think","parts":[{"text":"the output of getWeather for jaipur is 43 degrees."}]}
{"step":"output","text":"The weather in Jaipur is 43 degrees, which is quite hot."}

Output Format:
{"step":"String", "tool":"string", "input":"string", "text":"string"}
`;

async function main() {
  // 2. Get the generative model, providing the system prompt and response format here.
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  // 3. Start a new chat session, providing the initial user message in the history.
  const chat = model.startChat({
    history: [
      // The history should only contain user and model turns, not the system prompt.
      {
        role: "user",
        parts: [{ text: "hey !!" }],
      },
      {
        role: "model",
        parts: [{ text: "hello how r u doing" }],
      },
    ],
  });

  // console.log("Chat session started with initial history.");

  // From here, you would continue the conversation by using chat.sendMessage()


  const message = {
"step": "think", "parts": [{"text": "The observe step provides the current weather in Jaipur as 77°F and sunny.  I can now formulate a response."}]
};

const response = await chat.sendMessage(JSON.stringify(message));

  console.log(response.response.text());
   
}

main();
