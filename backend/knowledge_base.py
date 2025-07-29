import os
import json
import chardet  # For encoding detection
from pathlib import Path
from typing import List, Dict
import torch
from sentence_transformers import SentenceTransformer, util
from models import load_models

embedder = load_models()


class KnowledgeBase:
    def __init__(self, directory: str = "knowledge_base"):
        self.directory = Path(directory)
        self.documents = []
        self.embeddings = None
        self.directory.mkdir(parents=True, exist_ok=True)
        self._load_documents()

    def _read_file_content(self, path: Path):
        """Safe file reading with encoding detection"""
        try:
            with open(path, "rb") as f:
                raw_data = f.read()

            # Detect encoding
            result = chardet.detect(raw_data)
            encoding = result["encoding"] if result["confidence"] > 0.7 else "latin-1"

            try:
                content = raw_data.decode(encoding)
                if path.suffix == ".json":
                    try:
                        return json.loads(content)
                    except json.JSONDecodeError:
                        return {"content": content}
                return content
            except UnicodeError:
                return f"[Binary file content - {path.name}]"

        except Exception as e:
            print(f"Error reading {path}: {str(e)}")
            return f"[Error loading file: {path.name}]"

    def _load_documents(self):
        self.documents = []
        embeddings_list = []

        for filepath in self.directory.glob("*"):
            if filepath.is_file():
                content = self._read_file_content(filepath)
                embedding = embedder.encode(str(content), convert_to_tensor=True)
                self.documents.append(
                    {
                        "filename": filepath.name,
                        "content": content,
                    }
                )
                embeddings_list.append(embedding)

        if embeddings_list:
            self.embeddings = torch.stack(embeddings_list)

    def add_document(self, filename: str, content: str):
        path = self.directory / filename
        try:
            if isinstance(content, dict):
                with open(path, "w") as f:
                    json.dump(content, f)
            else:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
            self._load_documents()
        except Exception as e:
            print(f"Error saving {filename}: {str(e)}")

    def search(self, query: str, top_k: int = 3) -> List[Dict]:
        if not self.documents:
            return []

        query_embedding = embedder.encode(query, convert_to_tensor=True)
        scores = util.cos_sim(query_embedding, self.embeddings)[0]

        return [
            {
                "filename": self.documents[idx]["filename"],
                "content": self.documents[idx]["content"],
                "score": scores[idx].item(),
            }
            for idx in scores.argsort(descending=True)[:top_k]
        ]
