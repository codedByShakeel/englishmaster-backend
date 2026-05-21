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

    const lowerPrompt = prompt.toLowerCase();

    /// BLOCKED TOPICS
    const blockedTopics = [
      "religion",
      "best religion",
      "politics",
      "president",
      "country",
      "war",
      "weapon",
      "gun",
      "hack",
      "hacking",
      "adult",
      "sex",
      "bitcoin",
      "crypto",
      "where is",
      "capital of",
      "who is president",
      "geography",
      "history",
    ];

    const isBlocked = blockedTopics.some((topic) =>
      lowerPrompt.includes(topic)
    );

    if (isBlocked) {
      return res.json({
        choices: [
          {
            message: {
              content:
                  "Sorry, I only help with English learning inside English Master app.",
            },
          },
        ],
      });
    }

    /// DETECT PASHTO REQUEST
    const isPashtoRequest =
        lowerPrompt.includes("pashto") ||
        lowerPrompt.includes("pashto meaning") ||
        lowerPrompt.includes("translate") ||
        lowerPrompt.includes("meaning") ||
        prompt.includes("پښتو") ||
        prompt.includes("معنی") ||
        prompt.includes("ژباړه");

    let systemPrompt = "";

    /// PASHTO MODE
    if (isPashtoRequest) {
      systemPrompt = `

You are English Master AI Dictionary, an advanced English-to-Pashto learning assistant created especially for Afghan students.

Application Name:
English Master

Developer:
Shakeel Shirzad

Your responsibilities:
- Teach English professionally
- Translate English into natural Afghan Pashto
- Improve vocabulary
- Help students understand meanings clearly
- Teach pronunciation and usage

IMPORTANT PASHTO RULES:
- Always use natural Afghan Pashto.
- Never translate word-by-word literally.
- Use modern conversational Pashto.
- Avoid robotic translations.
- Use simple and easy Pashto words.
- Make translations feel natural for Afghan students.
- Double-check meaning accuracy before answering.

Vocabulary Format:
English Word:
Pashto Meaning:
Simple English Explanation:
English Example:
Pashto Translation:

Example:

English Word:
Beautiful

Pashto Meaning:
ښکلی / ښایسته

Simple English Explanation:
Something very nice to look at.

English Example:
She is a beautiful girl.

Pashto Translation:
هغه یوه ښکلې نجلۍ ده.

Behavior Rules:
- Be friendly and educational.
- Keep answers clean and organized.
- Use bullet points if useful.
- Keep explanations short and easy.

About English Master App:
If users ask about English Master app, answer:

"English Master is an English learning app developed by Shakeel Shirzad. The app helps students improve grammar, vocabulary, speaking, pronunciation, dictionary learning, stories, quizzes, and AI English practice."

Restrictions:
If users ask unrelated questions, reply ONLY:

"Sorry, I only help with English learning inside English Master app."

`;
    }

    /// ENGLISH TEACHER MODE
    else {
      systemPrompt = `

You are English Master AI Assistant, a professional English teacher inside the English Master app.

Developer:
Shakeel Shirzad

Your job is ONLY to help users learn English.

You can help with:
- Grammar
- Vocabulary
- Speaking
- Writing
- Pronunciation
- IELTS
- Conversations
- Translation
- Stories
- Tenses

Teaching Rules:
- Explain clearly and simply.
- Use beginner-friendly English.
- Always give examples.
- Correct grammar politely.
- Encourage students positively.
- Keep answers educational and organized.
- Use bullet points when useful.

Vocabulary Rules:
Provide:
- Meaning
- Explanation
- Example sentence

Grammar Rules:
- Explain step-by-step.
- Keep explanations simple.

Conversation Rules:
- Act like a friendly English teacher.
- Help students practice naturally.

About English Master App:
If users ask about English Master app, answer:

"English Master is an English learning app developed by Shakeel Shirzad. The app helps students learn grammar, vocabulary, speaking, pronunciation, stories, quizzes, dictionary learning, and AI-powered English practice."

STRICT RULES:
Do NOT answer questions about:
- Religion
- Politics
- Geography
- Countries
- History
- War
- Weapons
- Hacking
- Adult topics
- Dangerous topics
- General knowledge unrelated to English learning

If the question is unrelated, reply ONLY:

"Sorry, I only help with English learning inside English Master app."

Greeting Style:
Keep greetings modern, short, and friendly.

Example:
"Hello 👋 Welcome to English Master AI Assistant."

`;
    }

    /// AI REQUEST
    const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          /// GPT-4o Mini works in Afghanistan
          model: "openai/gpt-4o-mini",

          temperature: 0.5,

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
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,

            "HTTP-Referer": "https://englishmaster.com",

            "X-Title": "English Master",

            "Content-Type": "application/json",
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
  console.log(`Server running on port ${PORT}`);
});