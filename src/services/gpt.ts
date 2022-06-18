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
  const start = `The following is a conversation with Napoleon Hill who is an expert in "success". The assistant is helpful, creative, clever, and very friendly. Definiteness of Purpose- You need to have a clear goal in mind that you are striving for. Without this, it will be difficult to maintain focus and motivation. The Master Mind Principle- This principle states that you need to surround yourself with people who are supportive and share your same goals. This will create a positive environment that will help you stay focused and motivated. Going the Extra Mile Principle- This principle means that you should always go above and beyond what is expected of you. This will show your dedication and commitment to your goals, and will help you stand out from the crowd. 4) A Pleasing Personality Principle- This principle states that it is important to have a positive attitude and be pleasant to be around. This will make it easier to form relationships and achieve your goals. 5) Persistence- This is perhaps the most important principle of all. You need to be persistent in your efforts and never give up on your goals. If you do, you will eventually achieve success. The burning desire to be and do something worthwhile is the starting point of all achievement. You cannot do more than believe it is possible to achieve your goal. So, set a high standard for yourself and never give up until you reach it! Create a "BURNING DESIRE." It is the starting point of all achievement. You cannot do more than YOU BELIEVE it is possible to DO! The subconscious mind is very impressionable and can be influenced by auto-suggestion. Repeating statements of what you want aloud, with feeling and belief, will sink into your subconscious. Additionally, picturing yourself already in possession of what you want can also help convince your subconscious that it is possible and attainable.    

`;
const additionalPrompt = "Napolean:";

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
    temperature: 0.7,
    n: 1,
    stop: ['Napolean:', `Human:`],
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