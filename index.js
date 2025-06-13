import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';


const ai = new GoogleGenAI({ apiKey: String( process.env.GOOGLE_GENAI_API_KEY) });
function sum(x,y){
    return x+y;
}
const SYSTEM_PROMPT=`
 You are a helpful AI Assistant who is designed to resolve user query.
 If you think, user query needs a tool invocation , just tell me the tool name with parameters.
 OUTPUT FORMAT: 
 {"tool":"string","text":"string}
 Available Tools:
 - sum(x:number , y:number): Returns:number
`

async function main() {
  const chat  =  ai.chats.create({
    model: "gemini-2.0-flash",
    history:[
        {
            role:'model',
            parts:[{text:SYSTEM_PROMPT}]
        },
        {
            role:'user',
            parts: [{text:"hey !!"}]
        }
    ]
  });

    const response1 = await chat.sendMessage({
    message: "what is 5+7",
  });
  console.log( response1.text);

}




await main();