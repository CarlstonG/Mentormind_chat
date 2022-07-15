import { Message } from "../components/MessageList";
import axios from "axios";
import _ from 'lodash';
const GPTService = {
    async getAIResponse(messages: Message[]): Promise<string> {
        const prompt = getPrompt(messages);
        const result = await getCompletion(prompt);
        return result;
    }
};

export function trimLinesHelper(additional: number, lines: string[], hardMax: number): string[] {
  let characterCount = additional;
  const trimmedLines = _.takeRightWhile(lines, (line) => {
    characterCount += line.length;
    return characterCount <= hardMax;
  });
  return trimmedLines;
}

function trimLines(additional: number, lines: string[]): string[] {
  // As the chat continues, there's a tradeoff:
  // More lines == higher cost + better result
  // 2048 - 300 is upper bound for tokens.
  // We will assume 1 token ~= 4 characters and keep a window of ~500 tokens.
  const maxPromptLength = 500 * 4;
  // Davinci costs 0.06 per 1k tokens, so this is roughly 3 cents per completion at the upper end.
  return trimLinesHelper(additional, lines, maxPromptLength);
}

function getPrompt(messages: Message[]): string {
  const start = `The following is a conversation with an HUBMIND AI assistant. The assistant is helpful, creative, clever, and very friendly. HubMind - AI Services Made Easy. The power to get stuff done without lifting a finger. HubMind - the best way to connect with your customers. Use HubMind AI to Create a AI assisant to manage your business. HubMind AI Artificial Intelligence will be approachable, informative and conversational. No more boring or outdated information, HubMind AI is designed to grow along with our customers development needs. HubMind can help your business gain more followers or likes automatically. The amount of services HubMind will provide is limitless. HubMind can increase leads by 400 percent and convert them into customers. HubMind easy automation tools gives you the power to get stuff done. Automate whatever slows you down with HubMind. Minds handle work for you automatically, so you can focus on things that matter. You can create and customize your Minds in minutes.     

`;
const additionalPrompt = "AI:";

  const lines = messages.map((m) => `${m.author}: ${m.message}\n`);
  const trimmed = trimLines(start.length + additionalPrompt.length, lines);
  const combinedLines = trimmed.join("");
  
  return start + combinedLines + additionalPrompt;
}

const RESPONSE_TOKEN_MAXIMUM = 300;

// IMPORTANT: Please only use this for local testing. If you are deploying
// your app onto the internet, you should route requests through your own
// backend server to avoid exposing your OpenAI API key in your client
// side code.
async function getCompletion(prompt: string): Promise<string> {
  const data = {
    prompt,
    max_tokens: RESPONSE_TOKEN_MAXIMUM,
    temperature: 0.9,
    n: 1,
    stop: ['AI:', `Human:`],
  };
  const result = await axios({
    method: "post",
    url: "https://api.openai.com/v1/engines/davinci/completions",
    data,
    headers: {
      Authorization: "Bearer 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",
    },
  });
  return result.data.choices[0].text;
}

export default GPTService;