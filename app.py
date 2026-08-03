import streamlit as st

from src.pdf_loader import PDFLoader
from src.chunker import DocumentChunker
from src.embedding import EmbeddingModel
from src.vector_store import VectorStore
from src.rag import RAGModel

st.set_page_config(page_title="Enterprise AI Knowledge Copilot")

st.title("📚 Enterprise AI Knowledge Copilot")

# Load PDF and prepare RAG pipeline
loader = PDFLoader("data/sample.pdf")
text, pages = loader.extract_text()

chunker = DocumentChunker()
chunks = chunker.split(text)

embedding_model = EmbeddingModel()
embeddings = embedding_model.encode(chunks)

vector_store = VectorStore(embeddings.shape[1])
vector_store.add_embeddings(embeddings)

rag = RAGModel()

# User question
question = st.text_input("Ask a question from the PDF:")

if question:

    # Convert question to embedding
    query_embedding = embedding_model.encode([question])[0]

    # Retrieve relevant chunks
    distances, indices = vector_store.search(query_embedding)

    context = "\n\n".join([chunks[i] for i in indices[0]])

    # Generate answer
    answer = rag.generate_answer(context, question)

    st.subheader("Answer")
    st.write(answer)

    with st.expander("View Retrieved Context"):
        st.write(context)