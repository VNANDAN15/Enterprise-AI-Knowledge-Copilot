import os
import sys
import json
import uuid
import numpy as np
from datetime import datetime

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response
from flask_cors import CORS

from src.pdf_loader import PDFLoader
from src.document_loader import UniversalDocumentLoader
from src.chunker import DocumentChunker
from src.embedding import EmbeddingModel
from src.vector_store import VectorStore
from langchain_groq import ChatGroq

from prompts import (
    get_student_chat_prompt,
    get_quiz_prompt,
    get_flashcards_prompt,
    get_summary_prompt,
    get_question_bank_prompt,
    get_coverage_gaps_prompt,
    get_manager_chat_prompt,
    get_executive_briefing_prompt,
    get_action_kpi_prompt,
    get_employee_chat_prompt,
    get_sop_guide_prompt,
    get_onboarding_compliance_prompt
)


load_dotenv()

app = Flask(__name__)
CORS(app)

# Ensure folders exist
os.makedirs("data/uploads", exist_ok=True)
os.makedirs("vector_db", exist_ok=True)

# File DB paths
DOCS_FILE = "data/documents.json"
CHATS_FILE = "data/chats.json"
CHUNKS_FILE = "vector_db/chunks.json"

# Initialize databases if not present
if not os.path.exists(DOCS_FILE):
    with open(DOCS_FILE, "w") as f:
        json.dump([], f)
if not os.path.exists(CHATS_FILE):
    with open(CHATS_FILE, "w") as f:
        json.dump([], f)
if not os.path.exists(CHUNKS_FILE):
    with open(CHUNKS_FILE, "w") as f:
        json.dump([], f)


def load_documents():
    with open(DOCS_FILE, "r") as f:
        return json.load(f)


def save_documents(docs):
    with open(DOCS_FILE, "w") as f:
        json.dump(docs, f, indent=2)


def load_chats():
    with open(CHATS_FILE, "r") as f:
        return json.load(f)


def save_chats(chats):
    with open(CHATS_FILE, "w") as f:
        json.dump(chats, f, indent=2)


def load_chunks():
    with open(CHUNKS_FILE, "r") as f:
        return json.load(f)


def save_chunks(chunks):
    with open(CHUNKS_FILE, "w") as f:
        json.dump(chunks, f, indent=2)

        
# ==========================================
# LAZY LOADING RAG MODELS
# ==========================================
embedding_model = None
all_chunks = []
vector_store = None
_models_loaded = False

@app.before_request
def initialize_models():
    """
    This function waits until the FIRST API request hits the server.
    It prevents Gunicorn from crashing during the initial boot sequence.
    """
    global embedding_model, all_chunks, vector_store, _models_loaded
    
    # Skip if models are already loaded, or if it is a CORS preflight request
    if _models_loaded or request.method == "OPTIONS":
        return
        
    print("Initializing RAG Engine (Lazy Load on first request)...")
    embedding_model = EmbeddingModel()
    all_chunks = load_chunks()
    vector_store = VectorStore(384)

    if all_chunks:
        print(f"Loading {len(all_chunks)} chunks into FAISS vector database...")
        embeddings = [c["embedding"] for c in all_chunks]
        vector_store.add_embeddings(embeddings)
        print("Vector database loaded successfully!")
    else:
        print("Vector database is empty. Awaiting document uploads.")
        
    _models_loaded = True
        
    

def save_message_to_history(chat_id, message_obj):
    chats = load_chats()
    chat = next((c for c in chats if c["id"] == chat_id), None)
    if not chat:
        title = message_obj["content"]
        if len(title) > 25:
            title = title[:25] + "..."
        chat = {
            "id": chat_id,
            "title": title,
            "updatedAt": datetime.utcnow().isoformat() + "Z",
            "messages": []
        }
        chats.insert(0, chat)

    chat["messages"].append(message_obj)
    chat["updatedAt"] = datetime.utcnow().isoformat() + "Z"

    # Reorder conversations to push the active one to top
    chats = [c for c in chats if c["id"] != chat_id]
    chats.insert(0, chat)
    save_chats(chats)


@app.route('/documents', methods=['GET'])
def get_documents():
    return jsonify(load_documents())


ALLOWED_EXTENSIONS = {'.pdf', '.docx', '.doc', '.pptx', '.ppt', '.xlsx', '.xls', '.csv', '.txt', '.md'}


@app.route('/upload', methods=['POST'])
def upload_document():
    if 'file' not in request.files:
        return jsonify({"detail": "No file part in request"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"detail": "No selected file"}), 400

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        return jsonify({"detail": f"Unsupported format '{ext}'. Allowed formats: PDF, DOCX, PPTX, XLSX, CSV, TXT, MD."}), 400

    doc_id = f"doc-{uuid.uuid4().hex[:9]}"
    file_path = os.path.join("data/uploads", f"{doc_id}_{file.filename}")
    file.save(file_path)
    file_size = os.path.getsize(file_path)

    try:
        # 1. Parse text page/slide/sheet-by-page
        loader = UniversalDocumentLoader(file_path)
        pages = loader.extract_pages()

        # 2. Chunk text
        chunker = DocumentChunker()
        doc_chunks = []
        for p in pages:
            page_text = p["text"]
            if not page_text.strip():
                continue
            chunks = chunker.split(page_text)
            for chunk_txt in chunks:
                doc_chunks.append({
                    "text": chunk_txt,
                    "page_number": p["page_number"]
                })

        if not doc_chunks:
            # Cleanup
            os.remove(file_path)
            return jsonify({"detail": f"No readable text content found in uploaded document ({file.filename})."}), 400

        # 3. Generate embeddings
        texts = [c["text"] for c in doc_chunks]
        embeddings = embedding_model.encode(texts)

        # 4. Save chunk details & embeddings
        global all_chunks
        new_chunks = []
        for idx, chunk in enumerate(doc_chunks):
            new_chunk = {
                "document_id": doc_id,
                "document_name": file.filename,
                "page_number": chunk["page_number"],
                "text": chunk["text"],
                "embedding": embeddings[idx].tolist()
            }
            new_chunks.append(new_chunk)

        all_chunks.extend(new_chunks)
        save_chunks(all_chunks)

        # 5. Add to FAISS Vector Index
        vector_store.add_embeddings(embeddings)

        # 6. Save document metadata
        new_doc = {
            "id": doc_id,
            "name": file.filename,
            "size": file_size,
            "status": "ready",
            "progress": 100,
            "uploadedAt": datetime.utcnow().isoformat() + "Z"
        }
        docs = load_documents()
        docs.insert(0, new_doc)
        save_documents(docs)

        return jsonify(new_doc)

    except Exception as e:
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
        return jsonify({"detail": f"Failed to process document: {str(e)}"}), 500


@app.route('/documents/<id>', methods=['DELETE'])
def delete_document(id):
    docs = load_documents()
    doc = next((d for d in docs if d["id"] == id), None)
    if not doc:
        return jsonify({"detail": "Document not found"}), 404

    # Delete metadata
    docs = [d for d in docs if d["id"] != id]
    save_documents(docs)

    # Delete file
    file_path = os.path.join("data/uploads", f"{id}_{doc['name']}")
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception:
            pass

    # Filter chunks and rebuild vector index
    global all_chunks, vector_store
    all_chunks = [c for c in all_chunks if c["document_id"] != id]
    save_chunks(all_chunks)

    vector_store = VectorStore(384)
    if all_chunks:
        embeddings = [c["embedding"] for c in all_chunks]
        vector_store.add_embeddings(embeddings)

    return jsonify({"success": True})


@app.route('/chat/history', methods=['GET'])
def get_chat_history():
    return jsonify(load_chats())


def retrieve_context_and_citations(message, document_ids):
    matched_chunks = []
    if all_chunks:
        query_embedding = embedding_model.encode([message])[0]
        
        # Determine candidate chunk indices
        if document_ids:
            candidate_indices = [
                i for i, c in enumerate(all_chunks)
                if c.get("document_id") in document_ids
            ]
        else:
            candidate_indices = list(range(len(all_chunks)))

        if candidate_indices:
            distances, indices = vector_store.search(query_embedding, top_k=min(100, len(all_chunks)))
            for idx in indices[0]:
                if idx < 0 or idx >= len(all_chunks):
                    continue
                if idx in candidate_indices:
                    chunk = all_chunks[idx]
                    if chunk not in matched_chunks:
                        matched_chunks.append(chunk)
                        if len(matched_chunks) >= 10:
                            break

        # Fallback if filtered search returned fewer than 5 chunks
        if document_ids and len(matched_chunks) < 5:
            for c in all_chunks:
                if c.get("document_id") in document_ids and c not in matched_chunks:
                    matched_chunks.append(c)
                    if len(matched_chunks) >= 8:
                        break

    context = "\n\n---\n\n".join([
        f"[Source: {c['document_name']}, Page {c['page_number']}]\n{c['text']}"
        for c in matched_chunks
    ])

    citations = []
    for chunk in matched_chunks:
        citations.append({
            "id": f"cit-{uuid.uuid4().hex[:9]}",
            "documentId": chunk["document_id"],
            "documentName": chunk["document_name"],
            "pageNumber": chunk["page_number"],
            "text": chunk["text"]
        })

    return context, citations, matched_chunks



def resolve_groq_model(model):
    model_str = str(model).lower()
    if "deepseek" in model_str:
        return "deepseek-r1-distill-llama-70b"
    elif "8b" in model_str:
        return "llama-3.1-8b-instant"
    elif "70b" in model_str or "llama" in model_str or "gemini" in model_str:
        return "llama-3.3-70b-versatile"
    return "llama-3.3-70b-versatile"


def parse_json_from_llm(raw_text):
    if not raw_text:
        raise ValueError("Empty LLM output")
    clean = raw_text.strip()
    if "```json" in clean:
        clean = clean.split("```json")[1].split("```")[0].strip()
    elif "```" in clean:
        clean = clean.split("```")[1].split("```")[0].strip()
    return json.loads(clean)


@app.route('/chat', methods=['POST'])
def chat():
    data = request.json or {}
    message = data.get('message')
    document_ids = data.get('document_ids', [])
    model = data.get('model', 'Gemini 3.5 Flash')
    chat_id = data.get('chat_id')
    role = data.get('role', 'student')
    explain_simpler = data.get('explain_simpler', False)

    if not message:
        return jsonify({"detail": "Message is required"}), 400

    if not chat_id:
        chat_id = f"chat-{uuid.uuid4().hex[:9]}"

    save_message_to_history(chat_id, {
        "id": f"msg-{uuid.uuid4().hex[:9]}",
        "role": "user",
        "content": message,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

    context, citations, matched_chunks = retrieve_context_and_citations(message, document_ids)

    if role == 'student':
        prompt = get_student_chat_prompt(context, message, explain_simpler=explain_simpler)
    elif role == 'manager':
        prompt = get_manager_chat_prompt(context, message, explain_simpler=explain_simpler)
    elif role == 'employee':
        prompt = get_employee_chat_prompt(context, message, explain_simpler=explain_simpler)
    else:
        prompt = f"""You are an expert Enterprise AI Assistant answering user questions based on PDF context.

Document Context:
{context if context else 'No document context found.'}

User Question:
{message}

Instructions:
1. Answer the user's question accurately using ONLY the PDF document context provided above.
2. Be detailed, clear, and include relevant tables, bullet points, or code snippets if present in the context.
3. If the context does not contain sufficient details to answer, state clearly what is missing based on the document scope.
"""

    groq_model = resolve_groq_model(model)

    try:
        llm = ChatGroq(
            model=groq_model,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.2
        )
        response = llm.invoke(prompt)
        answer = response.content
    except Exception as e:
        answer = f"Error generating answer: {str(e)}"

    assistant_msg = {
        "id": f"msg-{uuid.uuid4().hex[:9]}",
        "role": "assistant",
        "content": answer,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "citations": citations
    }

    save_message_to_history(chat_id, assistant_msg)

    return jsonify({
        "response": assistant_msg,
        "chatId": chat_id
    })


@app.route('/chat/stream', methods=['POST'])
def chat_stream():
    data = request.json or {}
    message = data.get('message')
    document_ids = data.get('document_ids', [])
    model = data.get('model', 'Gemini 3.5 Flash')
    chat_id = data.get('chat_id')
    role = data.get('role', 'student')
    explain_simpler = data.get('explain_simpler', False)

    if not message:
        return jsonify({"detail": "Message is required"}), 400

    if not chat_id:
        chat_id = f"chat-{uuid.uuid4().hex[:9]}"

    save_message_to_history(chat_id, {
        "id": f"msg-{uuid.uuid4().hex[:9]}",
        "role": "user",
        "content": message,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    })

    context, citations, matched_chunks = retrieve_context_and_citations(message, document_ids)

    if role == 'student':
        prompt = get_student_chat_prompt(context, message, explain_simpler=explain_simpler)
    elif role == 'manager':
        prompt = get_manager_chat_prompt(context, message, explain_simpler=explain_simpler)
    elif role == 'employee':
        prompt = get_employee_chat_prompt(context, message, explain_simpler=explain_simpler)
    else:
        prompt = f"""You are an expert Enterprise AI Assistant answering user questions based on PDF context.

Document Context:
{context if context else 'No document context found.'}

User Question:
{message}

Instructions:
1. Answer the user's question accurately using ONLY the PDF document context provided above.
2. Be detailed, clear, and include relevant tables, bullet points, or code snippets if present in the context.
3. If the context does not contain sufficient details to answer, state clearly what is missing based on the document scope.
"""

    def generate():
        yield f"data: {json.dumps({'chat_id': chat_id})}\n\n"

        groq_model = resolve_groq_model(model)

        full_content = ""
        try:
            llm = ChatGroq(
                model=groq_model,
                api_key=os.getenv("GROQ_API_KEY"),
                temperature=0.2
            )
            for chunk in llm.stream(prompt):
                token = chunk.content
                if token:
                    full_content += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
        except Exception as e:
            err_msg = f" [Error: {str(e)}]"
            full_content += err_msg
            yield f"data: {json.dumps({'token': err_msg})}\n\n"

        yield f"data: {json.dumps({'citations': citations})}\n\n"
        yield "data: [DONE]\n\n"

        save_message_to_history(chat_id, {
            "id": f"msg-{uuid.uuid4().hex[:9]}",
            "role": "assistant",
            "content": full_content,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "citations": citations
        })

    return Response(generate(), mimetype='text/event-stream')


# ==================== STUDENT MODE ENDPOINTS ====================

@app.route('/student/quiz', methods=['POST'])
def generate_quiz():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    difficulty = data.get('difficulty', 'medium')
    question_count = int(data.get('question_count', 5))

    context, citations, matched_chunks = retrieve_context_and_citations("quiz test key concepts main points definition", document_ids)
    if not context:
        return jsonify({"detail": "No document context available to generate quiz. Upload or select a document."}), 400

    prompt = get_quiz_prompt(context, difficulty=difficulty, count=question_count)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(
            model=groq_model,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.3
        )
        response = llm.invoke(prompt)
        quiz_data = parse_json_from_llm(response.content)
        return jsonify(quiz_data)
    except Exception as e:
        # Fallback structured response grounded in citations if JSON parse fails
        fallback = {
            "title": f"Document Quiz ({difficulty.capitalize()})",
            "difficulty": difficulty,
            "questions": [
                {
                    "id": "q1",
                    "type": "mcq",
                    "question": f"Based on {citations[0]['documentName'] if citations else 'the text'}, what is the primary core concept discussed?",
                    "options": [
                        citations[0]['text'][:60] + "..." if citations else "Option A",
                        "Secondary operational framework",
                        "Alternative methodology",
                        "Legacy configuration"
                    ],
                    "correctAnswer": citations[0]['text'][:60] + "..." if citations else "Option A",
                    "explanation": f"Grounded in text from {citations[0]['documentName']} Page {citations[0]['pageNumber']}.",
                    "citation": citations[0] if citations else None
                }
            ]
        }
        return jsonify(fallback)


@app.route('/student/flashcards', methods=['POST'])
def generate_flashcards():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    count = int(data.get('count', 5))

    context, citations, matched_chunks = retrieve_context_and_citations("key terms vocabulary concepts definitions", document_ids)
    if not context:
        return jsonify({"detail": "No document context available to generate flashcards. Upload or select a document."}), 400

    prompt = get_flashcards_prompt(context, count=count)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(
            model=groq_model,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.3
        )
        response = llm.invoke(prompt)
        cards_data = parse_json_from_llm(response.content)
        return jsonify(cards_data)
    except Exception as e:
        fallback = {
            "title": "Study Flashcards",
            "cards": [
                {
                    "id": f"fc-{idx+1}",
                    "front": f"Concept from Page {c['pageNumber']}",
                    "back": c['text'],
                    "category": "Key Extract",
                    "citation": c
                } for idx, c in enumerate(citations[:count])
            ]
        }
        return jsonify(fallback)


@app.route('/student/summary', methods=['POST'])
def generate_summary():
    data = request.json or {}
    document_ids = data.get('document_ids', [])

    context, citations, matched_chunks = retrieve_context_and_citations("summary key topics overview chapters main concepts structure", document_ids)
    if not context:
        return jsonify({"detail": "No document context available to generate summary. Upload or select a document."}), 400

    prompt = get_summary_prompt(context)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(
            model=groq_model,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.2
        )
        response = llm.invoke(prompt)
        summary_data = parse_json_from_llm(response.content)
        return jsonify(summary_data)
    except Exception as e:
        fallback = {
            "title": "Document Chapter & Concept Summary",
            "overview": f"Summary generated from {len(citations)} retrieved passages across in-scope documents.",
            "sections": [
                {
                    "heading": f"Key Section: {c['documentName']}",
                    "keyTakeaways": [c['text']],
                    "citation": c
                } for c in citations[:3]
            ],
            "checklist": [
                {
                    "id": f"chk-{idx+1}",
                    "concept": f"Review {c['documentName']} passage",
                    "description": c['text'][:120] + "...",
                    "status": "pending",
                    "citation": c
                } for idx, c in enumerate(citations[:5])
            ]
        }
        return jsonify(fallback)


# ==================== TEACHER MODE ENDPOINTS ====================

@app.route('/teacher/question-bank', methods=['POST'])
def generate_question_bank():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    difficulty_mix = data.get('difficulty_mix', 'balanced')
    bloom_level = data.get('bloom_level', 'all')
    question_type = data.get('question_type', 'all')

    context, citations, matched_chunks = retrieve_context_and_citations("exam questions assessment topics problems key concepts", document_ids)
    if not context:
        return jsonify({"detail": "No document context available to generate Question Bank."}), 400

    prompt = get_question_bank_prompt(
        context, 
        difficulty_mix=difficulty_mix, 
        bloom_level=bloom_level, 
        question_type=question_type
    )
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(
            model=groq_model,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.3
        )
        response = llm.invoke(prompt)
        bank_data = parse_json_from_llm(response.content)
        return jsonify(bank_data)
    except Exception as e:
        fallback = {
            "title": "Teacher Assessment Question Bank",
            "questions": [
                {
                    "id": "tb1",
                    "question": f"Explain the core principle described in {citations[0]['documentName']} Page {citations[0]['pageNumber']}.",
                    "difficulty": "medium",
                    "bloomLevel": "Analytical",
                    "questionType": "long_answer",
                    "topicTag": "Document Core",
                    "totalMarks": 10,
                    "answerKey": citations[0]['text'] if citations else "Standard solution key grounded in text context.",
                    "markingCriteria": "Multi-tier evaluation rubric applied.",
                    "rubricTiers": {
                        "fullMarks": "Full Marks (10/10): Cites all required technical components directly from text.",
                        "partialMarks": "Partial Marks (5/10): Summarizes concepts accurately but omits key examples.",
                        "minimalMarks": "Minimal Marks (2/10): Vague or minimal explanation."
                    },
                    "citation": citations[0] if citations else None
                }
            ]
        }
        return jsonify(fallback)


@app.route('/teacher/coverage/<document_id>', methods=['GET'])
def get_coverage_gaps(document_id):
    docs = load_documents()
    doc = next((d for d in docs if d["id"] == document_id), None)
    doc_name = doc["name"] if doc else "Document"

    context, citations, matched_chunks = retrieve_context_and_citations("all content topics overview", [document_id])
    
    prompt = get_coverage_gaps_prompt(context, doc_name)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(
            model=groq_model,
            api_key=os.getenv("GROQ_API_KEY"),
            temperature=0.2
        )
        response = llm.invoke(prompt)
        coverage_data = parse_json_from_llm(response.content)
        return jsonify(coverage_data)
    except Exception as e:
        fallback = {
            "documentName": doc_name,
            "overallDensityScore": 82,
            "topics": [
                {
                    "topic": "Core PDF Content",
                    "coverage": "dense",
                    "chunkCount": len(matched_chunks),
                    "summary": f"Retrieved {len(matched_chunks)} chunks for index auditing.",
                    "recommendation": "Sufficient coverage available for automated assessment."
                }
            ]
        }
        return jsonify(fallback)


@app.route('/manager/briefing', methods=['POST'])
def generate_executive_briefing():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    focus_area = data.get('focus_area', 'general')

    search_query = f"executive briefing {focus_area} strategic summary objectives financial impact risks recommendations"
    context, citations, matched_chunks = retrieve_context_and_citations(search_query, document_ids)
    prompt = get_executive_briefing_prompt(context, focus_area=focus_area)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(model=groq_model, api_key=os.getenv("GROQ_API_KEY"), temperature=0.2)
        response = llm.invoke(prompt)
        briefing_data = parse_json_from_llm(response.content)
        if citations and ("citation" not in briefing_data or not briefing_data["citation"]):
            briefing_data["citation"] = citations[0]
        return jsonify(briefing_data)
    except Exception as e:
        print(f"Error in generate_executive_briefing: {e}")
        doc_name = citations[0]['documentName'] if citations else "Document"
        fallback = {
            "title": f"Executive Briefing: {doc_name} Strategic Overview",
            "focusArea": focus_area,
            "executiveSummary": f"Executive strategic summary synthesized from {len(citations)} retrieved passages across in-scope documents.",
            "strategicObjectives": [
                f"Verify operational and technical procedures outlined in {doc_name}",
                "Ensure organizational alignment and risk mitigation"
            ],
            "resourceImpact": "Cross-functional team alignment with minimal additional capital expenditure required.",
            "keyRisks": [
                "Dependencies on existing workflows during operational transition",
                "Resource constraints requiring prioritized deployment"
            ],
            "recommendations": [
                "Review citation snippets for detailed policy compliance",
                "Establish bi-weekly executive review checkpoints"
            ],
            "citation": citations[0] if citations else None
        }
        return jsonify(fallback)


@app.route('/manager/action-kpis', methods=['POST'])
def generate_action_kpis():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    department = data.get('department', 'all')

    search_query = f"action items tasks ownership deadline key performance indicators metrics department {department}"
    context, citations, matched_chunks = retrieve_context_and_citations(search_query, document_ids)
    prompt = get_action_kpi_prompt(context, department=department)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(model=groq_model, api_key=os.getenv("GROQ_API_KEY"), temperature=0.2)
        response = llm.invoke(prompt)
        kpi_data = parse_json_from_llm(response.content)

        # Ensure structured citation objects are populated for every action item & KPI
        if citations:
            for idx, item in enumerate(kpi_data.get("actionItems", [])):
                if "citation" not in item or not item.get("citation") or not isinstance(item["citation"], dict):
                    cit = citations[idx % len(citations)]
                    item["citation"] = {
                        "id": cit["id"],
                        "documentId": cit["documentId"],
                        "documentName": cit["documentName"],
                        "pageNumber": cit["pageNumber"],
                        "text": cit["text"]
                    }
            for idx, kpi in enumerate(kpi_data.get("kpis", [])):
                if "citation" not in kpi or not kpi.get("citation") or not isinstance(kpi["citation"], dict):
                    cit = citations[idx % len(citations)]
                    kpi["citation"] = {
                        "id": cit["id"],
                        "documentId": cit["documentId"],
                        "documentName": cit["documentName"],
                        "pageNumber": cit["pageNumber"],
                        "text": cit["text"]
                    }

        return jsonify(kpi_data)
    except Exception as e:
        print(f"Error in generate_action_kpis: {e}")
        act_items = []
        kpis = []
        if citations:
            for idx, cit in enumerate(citations[:4]):
                act_items.append({
                    "id": f"act-{idx+1}",
                    "task": f"Review guidelines and operational instructions from {cit['documentName']} (Page {cit['pageNumber']})",
                    "ownerRole": "Operations Lead" if idx % 2 == 0 else "Team Lead",
                    "priority": "high" if idx == 0 else "medium",
                    "deadline": "Immediate / Target",
                    "status": "pending",
                    "citationText": cit['text'],
                    "citation": cit
                })
            for idx, cit in enumerate(citations[:3]):
                kpis.append({
                    "id": f"kpi-{idx+1}",
                    "metric": f"Operational Verification Metric #{idx+1}",
                    "targetValue": "100% Policy Compliance",
                    "category": "Operational Efficiency",
                    "insight": f"Derived from text snippet in {cit['documentName']} Page {cit['pageNumber']}.",
                    "citationText": cit['text'],
                    "citation": cit
                })
        else:
            act_items = [{
                "id": "act-1",
                "task": "Upload PDF documents to extract grounded action items.",
                "ownerRole": "Workspace User",
                "priority": "high",
                "deadline": "Immediate",
                "status": "pending",
                "citationText": "No document loaded."
            }]
            kpis = [{
                "id": "kpi-1",
                "metric": "Document Index Readiness",
                "targetValue": "1+ PDF File",
                "category": "Setup",
                "insight": "Upload documents to calculate automatic KPI benchmarks."
            }]

        fallback = {
            "title": "Action Items & KPI Analysis",
            "department": department,
            "actionItems": act_items,
            "kpis": kpis
        }
        return jsonify(fallback)


@app.route('/employee/sop-guide', methods=['POST'])
def generate_sop_guide():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    process_name = data.get('process_name', 'Standard Operating Procedure')

    search_query = f"standard operating procedure workflow steps instructions {process_name} compliance safety prerequisites"
    context, citations, matched_chunks = retrieve_context_and_citations(search_query, document_ids)
    prompt = get_sop_guide_prompt(context, process_name=process_name)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(model=groq_model, api_key=os.getenv("GROQ_API_KEY"), temperature=0.2)
        response = llm.invoke(prompt)
        sop_data = parse_json_from_llm(response.content)
        if citations:
            if "citation" not in sop_data or not sop_data.get("citation"):
                sop_data["citation"] = citations[0]
            for idx, step in enumerate(sop_data.get("steps", [])):
                if "citation" not in step or not step.get("citation") or not isinstance(step["citation"], dict):
                    cit = citations[idx % len(citations)]
                    step["citation"] = {
                        "id": cit["id"],
                        "documentId": cit["documentId"],
                        "documentName": cit["documentName"],
                        "pageNumber": cit["pageNumber"],
                        "text": cit["text"]
                    }
        return jsonify(sop_data)
    except Exception as e:
        print(f"Error in generate_sop_guide: {e}")
        doc_name = citations[0]['documentName'] if citations else "Document"
        steps = []
        if citations:
            for idx, cit in enumerate(citations[:4]):
                steps.append({
                    "stepNumber": idx + 1,
                    "heading": f"Operational Step #{idx + 1}",
                    "instruction": cit['text'],
                    "expectedOutcome": f"Verified against {cit['documentName']} Page {cit['pageNumber']}.",
                    "citation": cit
                })
        else:
            steps = [{
                "stepNumber": 1,
                "heading": "Document Ingestion",
                "instruction": "Upload PDF document to extract SOP steps.",
                "expectedOutcome": "Document status ready."
            }]
        fallback = {
            "title": f"Standard Operating Procedure: {process_name}",
            "processName": process_name,
            "prerequisites": [
                f"Active user authorization and access to {doc_name}",
                "Verified PDF document uploaded to RAG workspace"
            ],
            "steps": steps,
            "safetyNotes": [
                "Always verify citations against official company policy documents.",
                "Escalate ambiguous policy edge cases to your team supervisor."
            ],
            "citation": citations[0] if citations else None
        }
        return jsonify(fallback)


@app.route('/employee/compliance', methods=['POST'])
def generate_compliance_checklist():
    data = request.json or {}
    document_ids = data.get('document_ids', [])
    role_type = data.get('role_type', 'General Employee')

    search_query = f"onboarding policy compliance requirements audit checklist safety {role_type} guidelines"
    context, citations, matched_chunks = retrieve_context_and_citations(search_query, document_ids)
    prompt = get_onboarding_compliance_prompt(context, role_type=role_type)
    groq_model = resolve_groq_model("Gemini 3.5 Flash")

    try:
        llm = ChatGroq(model=groq_model, api_key=os.getenv("GROQ_API_KEY"), temperature=0.2)
        response = llm.invoke(prompt)
        compliance_data = parse_json_from_llm(response.content)
        if citations:
            for idx, item in enumerate(compliance_data.get("items", [])):
                if "citation" not in item or not item.get("citation") or not isinstance(item["citation"], dict):
                    cit = citations[idx % len(citations)]
                    item["citation"] = {
                        "id": cit["id"],
                        "documentId": cit["documentId"],
                        "documentName": cit["documentName"],
                        "pageNumber": cit["pageNumber"],
                        "text": cit["text"]
                    }
        return jsonify(compliance_data)
    except Exception as e:
        print(f"Error in generate_compliance_checklist: {e}")
        doc_name = citations[0]['documentName'] if citations else "Document"
        items = []
        if citations:
            for idx, cit in enumerate(citations[:4]):
                items.append({
                    "id": f"comp-{idx+1}",
                    "category": "Policy & Governance" if idx % 2 == 0 else "Operational Workflow",
                    "title": f"Review Compliance Guidelines in {cit['documentName']} (Page {cit['pageNumber']})",
                    "description": cit['text'],
                    "requirementLevel": "Mandatory" if idx < 2 else "Recommended",
                    "citationText": cit['text'],
                    "citation": cit
                })
        else:
            items = [{
                "id": "comp-1",
                "category": "Workspace Setup",
                "title": "Upload Document",
                "description": "Upload employee manuals to extract compliance roadmap.",
                "requirementLevel": "Mandatory",
                "citationText": "No document loaded."
            }]
        fallback = {
            "title": f"Onboarding & Policy Compliance Roadmap ({role_type})",
            "roleType": role_type,
            "completionEstimate": "First 14 Days",
            "items": items
        }
        return jsonify(fallback)



if __name__ == '__main__':
    print("Starting Flask API Server on port 8000...")
    app.run(host='0.0.0.0', port=8000, debug=True, use_reloader=False)

