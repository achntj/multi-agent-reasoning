# Strategic Decision Simulator

![Screenshot of Home Page](/HomePage.png)

A multi-agent AI system that simulates strategic debate to help you make
better decisions. Upload your context (Knowledge Base), ask a question, and
Optimist, Pessimist, and Synthesizer agents will communicate to provide a
balanced recommendation.

## Goal

Most AI tools give you either overly optimistic or generic advice. This system
forces a structured discussion between multiple perspectives, ensuring you get a
more realistic and nuanced analysis of your strategic questions.

## Technologies Used

- **Frontend**: React with TypeScript (Next JS + Tailwind)
- **Backend**: FastAPI (Python)
- **AI Models**: Ollama (Mistral) for local inference
- **Embeddings**: Sentence Transformers for semantic search
- **Storage**: File-based knowledge base (txt/json)

## How It Works

1. Upload relevant documents to the knowledge base
2. Ask strategic questions through the UI
3. Three AI agents independently analyze the question:
   - **Optimist**: Identifies opportunities and growth paths
   - **Pessimist**: Highlights risks and challenges
   - **Synthesizer**: Creates a balanced recommendation
4. Receive a final recommendation that considers all viewpoints.

## Key Features

- Real-time loading of each perspective
- Context-aware responses using RAG
- Balanced synthesis of conflicting viewpoints
- Support for text and JSON knowledge files
