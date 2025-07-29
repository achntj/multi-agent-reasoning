import torch
from sentence_transformers import SentenceTransformer


# Initialize models
def load_models():
    # For RAG
    embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return embedder

