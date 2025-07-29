from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from knowledge_base import KnowledgeBase
from agents import generate_response
from utils import format_context, parse_uploaded_file
import os
import json
from pydantic import BaseModel  # Add this import


class DebateRequest(BaseModel):
    question: str


app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

kb = KnowledgeBase()


@app.get("/knowledge")
async def get_knowledge():
    """Return list of all knowledge base files with safe content reading"""
    files = []
    for filename in os.listdir("knowledge_base"):
        path = os.path.join("knowledge_base", filename)
        try:
            with open(path, "rb") as f:
                raw_content = f.read()

            # Detect encoding
            try:
                import chardet

                encoding = chardet.detect(raw_content)["encoding"] or "latin-1"
                content = raw_content.decode(encoding)

                if filename.endswith(".json"):
                    try:
                        content = json.loads(content)
                    except json.JSONDecodeError:
                        content = {"raw_content": content}
            except Exception:
                content = "[binary content]"

            files.append(
                {
                    "filename": filename,
                    "content": content,
                    "type": "text" if isinstance(content, str) else "json",
                }
            )

        except Exception as e:
            files.append({"filename": filename, "error": str(e), "type": "error"})

    return files


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    print(f"Received file: {file.filename}")
    try:
        content = await file.read()
        print(f"File content sample: {content[:100]}")

        if file.filename.endswith(".txt"):
            content = content.decode("utf-8")
        elif file.filename.endswith(".json"):
            content = json.loads(content.decode("utf-8"))

        kb.add_document(file.filename, content)
        return {"filename": file.filename, "status": "success", "size": len(content)}

    except Exception as e:
        print(f"Upload error: {str(e)}")
        return {"error": str(e)}


@app.post("/debate")
async def start_debate(request: DebateRequest):
    print(f"Received question: {request.question}")
    try:
        search_results = kb.search(request.question)
        context = format_context(search_results)

        debate_history = []

        optimist = generate_response("optimist", request.question, context)
        debate_history.append(f"Optimist: {optimist}")

        pessimist = generate_response(
            "pessimist", request.question, context, "\n".join(debate_history)
        )
        debate_history.append(f"Pessimist: {pessimist}")

        synthesis = generate_response(
            "synthesizer", request.question, context, "\n".join(debate_history)
        )

        return {
            "optimist": optimist,
            "pessimist": pessimist,
            "synthesis": synthesis,
            "context": context,
        }
    except Exception as e:
        print(f"Debate error: {str(e)}")
        return {"error": str(e)}
