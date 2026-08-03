import faiss
import numpy as np

from src.pdf_loader import PDFLoader
from src.chunker import DocumentChunker
from src.embedding import EmbeddingModel


class VectorStore:

    def __init__(self, dimension):
        self.index = faiss.IndexFlatL2(dimension)

    def add_embeddings(self, embeddings):
        embeddings = np.array(embeddings).astype("float32")
        self.index.add(embeddings)

    def search(self, query_embedding, top_k=3):
        query_embedding = np.array([query_embedding]).astype("float32")
        distances, indices = self.index.search(query_embedding, top_k)
        return distances, indices


if __name__ == "__main__":

    # Load PDF
    loader = PDFLoader("data/sample.pdf")
    text, pages = loader.extract_text()

    # Split into chunks
    chunker = DocumentChunker()
    chunks = chunker.split(text)

    # Generate embeddings
    embedding_model = EmbeddingModel()
    embeddings = embedding_model.encode(chunks)

    # Create FAISS index
    vector_store = VectorStore(embeddings.shape[1])

    # Store embeddings
    vector_store.add_embeddings(embeddings)

    print("Embeddings stored successfully!")

    # Test query
    query = "What is MultiIndex?"

    query_embedding = embedding_model.encode([query])[0]

    distances, indices = vector_store.search(query_embedding)

    print("\nTop Matching Chunks:\n")

    for i in indices[0]:
        print("-" * 50)
        print(chunks[i])