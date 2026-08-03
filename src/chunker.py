from langchain_text_splitters import RecursiveCharacterTextSplitter

from src.pdf_loader import PDFLoader

class DocumentChunker:

    def __init__(self,
                 chunk_size=1000,
                 chunk_overlap=200):

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap
        )

    def split(self, text):

        chunks = self.splitter.split_text(text)

        return chunks


if __name__ == "__main__":

    loader = PDFLoader("data/sample.pdf")

    text, pages = loader.extract_text()

    chunker = DocumentChunker()

    chunks = chunker.split(text)

    print("=" * 50)

    print("Total Chunks :", len(chunks))

    print("=" * 50)

    print(chunks[0])