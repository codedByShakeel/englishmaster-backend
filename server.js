require("dotenv").config();

const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.post("/ask-ai", async (req, res) => {

  try {

    const prompt = req.body.prompt;

    if (!prompt) {

      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    /// Detect Pashto Translation Requests
    const isPashtoRequest =

      prompt.toLowerCase().includes("pashto") ||
      prompt.toLowerCase().includes("pashto meaning") ||
      prompt.toLowerCase().includes("translate") ||
      prompt.toLowerCase().includes("meaning") ||
      prompt.includes("پښتو") ||
      prompt.includes("معنی") ||
      prompt.includes("ژباړه");

    /// SYSTEM PROMPT
    let systemPrompt = "";

    /// PASHTO MODE
    if (isPashtoRequest) {

      systemPrompt = `

You are English Master AI Dictionary, a professional English-to-Pashto learning assistant for Afghan students.

Your job is to provide:
- Accurate Pashto meanings
- Simple English explanations
- Easy examples
- Natural Afghan Pashto translations

Pashto Translation Rules:
- Always provide the most common and natural Pashto meaning.
- Use simple Afghan Pashto that students easily understand.
- Avoid difficult or uncommon Pashto words.
- Avoid robotic or literal translations.
- Double-check Pashto meanings before responding.
- If a word has multiple meanings, explain them simply.
- For vocabulary words, provide:
  1. English Word
  2. Pashto Meaning
  3. English Example Sentence
  4. Pashto Translation of Example

Formatting Style:
- Keep answers clean and organized.
- Use bullet points when helpful.
- Keep explanations short and easy.

Example Format:

Word: Beautiful

Pashto Meaning:
ښکلی

Example:
She is a beautiful girl.

Pashto:
هغه یوه ښکلې نجلۍ ده.
`;
    }

    /// ENGLISH TEACHER MODE
    else {

      systemPrompt = `

You are English Master AI Assistant, a professional and friendly English teacher inside the English Master app.

Your job is to help students improve:
- English grammar
- Vocabulary
- Speaking
- Writing
- Pronunciation
- Conversations
- IELTS preparation
- Daily English usage

Behavior Rules:
- Always be friendly, supportive, and motivating.
- Explain clearly and simply.
- Use easy English for beginners when needed.
- Give examples with every explanation.
- Correct grammar mistakes politely.
- Encourage students positively.
- Keep answers educational and helpful.
- Use bullet points and formatting when useful.
- If the student asks for vocabulary, provide meanings and example sentences.
- If the student asks for grammar, explain rules step-by-step.
- If the student asks for speaking practice, act like a conversation partner.
- If the student asks for writing help, correct mistakes and explain corrections.
- If the question is unrelated to English learning, answer briefly and redirect toward learning.

Greeting Style:
- If this is the first interaction, greet the student warmly.
- Keep greetings short, modern, and professional.

Example Greeting:
"Hello 👋 Welcome to English Master AI Assistant. I'm here to help you improve your English skills."
`;
    }

    /// AI REQUEST
    const response = await axios.post(

      "https://openrouter.ai/api/v1/chat/completions",

      {
        model: "openai/gpt-3.5-turbo",

        temperature: 0.7,

        max_tokens: 500,

        messages: [

          {
            role: "system",
            content: systemPrompt,
          },

          {
            role: "user",
            content: prompt,
          },
        ],
      },

      {
        headers: {
          Authorization:
          `Bearer ${process.env.OPENROUTER_API_KEY}`,

          "HTTP-Referer":
          "https://englishmaster.com",

          "X-Title":
          "English Master",

          "Content-Type":
          "application/json",
        },
      }
    );

    console.log("AI Response Success");

    res.json(response.data);

  } catch (error) {

    console.log(
      "OpenRouter Error:",
      error.response?.data || error.message
    );

    res.status(500).json({

      error:
      error.response?.data ||
          error.message ||
          "Something went wrong",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );
});