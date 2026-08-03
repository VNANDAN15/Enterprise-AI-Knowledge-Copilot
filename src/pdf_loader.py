from pypdf import PdfReader


class PDFLoader:

    def __init__(self, pdf_path):
        self.pdf_path = pdf_path

    def extract_text(self):

        reader = PdfReader(self.pdf_path)

        text = ""

        for page in reader.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

        return text, len(reader.pages)

    def extract_pages(self):
        reader = PdfReader(self.pdf_path)
        pages = []
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text() or ""
            pages.append({
                "page_number": idx + 1,
                "text": page_text
            })
        return pages


if __name__ == "__main__":

    loader = PDFLoader("data/sample.pdf")

    text, pages = loader.extract_text()

    print("=" * 40)
    print("PDF INFORMATION")
    print("=" * 40)

    print("Total Pages :", pages)
    print("Characters  :", len(text))
    print("Words       :", len(text.split()))

    print("=" * 40)

    print(text[:1000])