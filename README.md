# 🔮 Chrome Web ChatBot

An intelligent sidebar chatbot that interacts with any webpage or PDF opened in Chrome — providing summaries, answering queries, and extracting key points using AI (LangChain + Gemini/GPT). Built with a Chrome Extension frontend and a FastAPI backend.

---
## Demo

https://github.com/user-attachments/assets/b30db0ef-ba57-431b-a21e-f3e9719ebefb


## 📌 Features

- ✅ Chrome extension sidebar that launches on any webpage or PDF
- 🔍 Automatically detects whether the page is a webpage or PDF
- 📄 Loads the content using appropriate LangChain document loaders
- 💬 Chat interface for asking contextual queries
- 🧠 Maintains message history using LangChain Messages
- ✨ Options to auto-generate:
  - Summary
  - Key Points
  - Any iser query response
- 🌐 Backend powered by FastAPI + LangChain + Gemini

---

## Tech Stack
- Frontend: React + Vite + Chrome Extension API

- Backend: FastAPI, LangChain

- LLM: Gemini (via LangChain)

- Document Loaders: LangChain (WebBaseLoader, PyPDFLoader)
  

