import "../config/env.js";

import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OPENAI_API_KEY is not configured in the root .env file.",
  );
}

export const openaiClient = new OpenAI({
  apiKey,
});