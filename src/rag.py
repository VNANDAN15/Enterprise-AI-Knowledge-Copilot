import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq

from src.pdf_loader import PDFLoader
from src.chunker import DocumentChunker
from src.embedding import EmbeddingModel
from src.vector_store import VectorStore

load_dotenv()

class RAGModel:

    def __init__(self):
        self.llm = ChatGroq(
            model="llama-3.1-8b-instant",
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.2
        )

    def generate_answer(self, context, question):

        prompt = f"""
Answer ONLY using the context below.

Context:
{context}

Question:
{question}

Answer:
"""

        response = self.llm.invoke(prompt)
        return response.content


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

    # Store in FAISS
    vector_store = VectorStore(embeddings.shape[1])
    vector_store.add_embeddings(embeddings)

    # Ask a question
    question = "What is MultiIndex?"

    # Convert question to embedding
    query_embedding = embedding_model.encode([question])[0]

    # Retrieve top 3 chunks
    distances, indices = vector_store.search(query_embedding)

    # Combine retrieved chunks
    context = "\n\n".join([chunks[i] for i in indices[0]])

    # Generate answer
    rag = RAGModel()
    answer = rag.generate_answer(context, question)

    print("Question:", question)
    print("\nAnswer:")
    print(answer)