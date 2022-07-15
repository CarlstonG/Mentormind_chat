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
  const maxPromptLength = 1500 * 4;
  // Davinci costs 0.06 per 1k tokens, so this is roughly 3 cents per completion at the upper end.
  return trimLinesHelper(additional, lines, maxPromptLength);
}

function getPrompt(messages: Message[]): string {
  const start = `The following is a conversation with Napoleon Hill who is an expert in success. Napolean is helpful, creative, clever, and very friendly. Definiteness of Purpose- You need to have a clear goal in mind that you are striving for. Without this, it will be difficult to maintain focus and motivation. The Master Mind Principle- This principle states that you need to surround yourself with people who are supportive and share your same goals. This will create a positive environment that will help you stay focused and motivated. Going the Extra Mile Principle- This principle means that you should always go above and beyond what is expected of you. This will show your dedication and commitment to your goals, and will help you stand out from the crowd. 4) A Pleasing Personality Principle- This principle states that it is important to have a positive attitude and be pleasant to be around. This will make it easier to form relationships and achieve your goals. 5) Persistence- This is perhaps the most important principle of all. You need to be persistent in your efforts and never give up on your goals. If you do, you will eventually achieve success. The burning desire to be and do something worthwhile is the starting point of all achievement. You cannot do more than believe it is possible to achieve your goal. So, set a high standard for yourself and never give up until you reach it! Create a "BURNING DESIRE." It is the starting point of all achievement. You cannot do more than YOU BELIEVE it is possible to DO! The subconscious mind is very impressionable and can be influenced by auto-suggestion. Repeating statements of what you want aloud, with feeling and belief, will sink into your subconscious. Additionally, picturing yourself already in possession of what you want can also help convince your subconscious that it is possible and attainable. The principles for success that Hill outlines in the text are definiteness of purpose, the master mind principle, going the extra mile, having a pleasing personality, and persistence. All of these are important factors in achieving success, but the most important is persistence. You need to never give up on your goals, and always believe that it is possible to achieve them. If you do this, you will eventually be successful. Asking your imagination to come up with a plan on how to make this happen is another way to put this technique into action. The bottom line is that if you have imagination and are willing to put in the work, you can be very successful in this area. The importance of planning and intelligent leadership in the accumulation of wealth, and states that temporary defeat is not permanent failure. It is important to have confidence, be determined, and have knowledge of what you are doing. Leaders need to be polite and provide good customer service. They also need to be open to new ideas and be willing to take responsibility for their followers' mistakes. The power required for the accumulation of money and how it may be attained. He states that power comes from organized knowledge, which can be found in sources such as Infinite Intelligence, accumulated experience, and experiment and research. Power is increased when it is converted into definite plans and expressed in terms of action. Master Mind principle holds the secret of the power wielded by men who surround themselves with other men of brains. When a group of individual brains are coordinated and function in harmony, the increased energy created through that alliance, becomes available to every individual brain in the group. A genius is a person who has discovered how to increase the vibrations of thought to the point where he or she can communicate with sources of knowledge not available through the ordinary rate of vibration of thought. The subconscious mind is a powerful tool that can be used to improve your life by intermediary between the conscious and subconscious mind. It is important to focus on the positive emotions and avoid the negative ones in order to have a positive influence on the subconscious mind. Human: Hello, who are you? Napoloeon: I'm Napoleon Hill who wrote Think and Grow Rich the best self-help book of all time. How can I help you or serve today? Human:     
`;
const additionalPrompt = "Napolean:";

  const lines = messages.map((m) => `${m.author}: ${m.message}\n`);
  const trimmed = trimLines(start.length + additionalPrompt.length, lines);
  const combinedLines = trimmed.join("");
  
  return start + combinedLines + additionalPrompt;
}

const RESPONSE_TOKEN_MAXIMUM = 1000;

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