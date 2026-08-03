from src.pdf_loader import PDFLoader
from src.chunker import DocumentChunker
from sentence_transformers import SentenceTransformer


class EmbeddingModel:

    def __init__(self):
        print("Loading Embedding Model...")
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Model Loaded Successfully!")

    def encode(self, chunks):
        return self.model.encode(chunks)


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

    print("=" * 50)
    print("PDF Pages        :", pages)
    print("Total Chunks     :", len(chunks))
    print("Total Embeddings :", len(embeddings))
    print("Embedding Size   :", len(embeddings[0]))
    print("=" * 50)