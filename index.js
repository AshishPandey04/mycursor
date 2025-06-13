import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";
import {exec} from 'node:child_process'

// 1. Initialize the Google AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_API_KEY);

function getweather(city) {
  return `${city} has 43 degree C`;
}

async function executeCommand(command){
  console.log("👉 Running command:", command); // Add this line

  return new Promise((resolve, reject) => {
    exec(command, function(err, stdout, stderr){
      if (err) {
        return reject(err);
      }
      resolve(`stdout: ${stdout}\nstderr: ${stderr}`);
    });
  });
}

const TOOLS_MAP = {
  getweather: getweather,
  executeCommand:executeCommand,
};



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
 -executeCommand(command): string, Executes a given linux command on user's device and returns the STDOUT and STDERR

 Example:
 START: what is weather in Jaipur?
 THINK: user is asking for the weather in a jaipur city.
 THINK: From the available tools , I must call getweather(city) tool.
 ACTION: call tool getweather("jaipur")
 OBSERVE:43 Degrees
 THINK: the output of getWeather for jai[ur is 43 degrees.
 OUTPUT: The weather in Jaipur is 43 degrees,which is quite hot.

Output Example:
{"role":"user","parts":[{"content":"what is weather in Jaipur?"}]}
{"step":"think","parts":[{"content":"user is asking for the weather in a jaipur city."}]}
{"step":"think","parts":[{"content":"From the available tools , I must call getweather(city) tool."}]}
{"step":"action","tool":"getweather","input":"jaipur"}
{"step":"observe","content":"43 Degrees"}
{"step":"think","parts":[{"content":"the output of getWeather for jaipur is 43 degrees."}]}
{"step":"output","content":"The weather in Jaipur is 43 degrees, which is quite hot."}

Output Format:
{"step":"String", "tool":"string", "input":"string", "content":"string"}


Note: You are running commands on a Windows machine. Use Windows-compatible shell commands (e.g., mkdir, echo with double quotes, .bat syntax). Avoid using Linux commands like 'touch' or 'rm'. You can use echo for html.

`;

async function main() {
  const messages = [];

  const userQuery = "create a folder todo app and create a todo app with HTML CSS and JS fully working";
  messages.push({
    role: "user",
    parts: [{ text: userQuery }],
  });
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  while (true) {
    const chat = model.startChat({
      history: messages,
    });

    const lastMessage = messages[messages.length - 1].parts[0].text;
    const result = await chat.sendMessage(lastMessage);

   if (!result || !result.response || typeof result.response.text !== 'function') {
  console.error("❌ Unexpected structure in Gemini response:", result);
  return;
}

    const text = result.response.text();

    messages.push({
      role: "model",
      parts: [{ text }],
    });

    const parsed_response = JSON.parse(text);

   if (parsed_response.step && parsed_response.step === "think") {
  const thinkContent = parsed_response.parts?.[0]?.content || "No content";
  console.log(`🧠: ${thinkContent}`);
  continue;
}
    if (parsed_response.step && parsed_response.step === "output") {
      console.log(`🤖: ${parsed_response.content}`);
      break;
    }
    if (parsed_response.step && parsed_response.step === "action") {
      const tool = parsed_response.tool;
      const input = parsed_response.input;

      const value =await TOOLS_MAP[tool](input);

           console.log(`⚒️: Tool call ${tool}("${input}") => ${value}`);

      messages.push({
        role: "model",
        parts: [{ text: JSON.stringify({ step: "observe", content: value }) }],
      });
      continue;
    }
  }
}

main();
