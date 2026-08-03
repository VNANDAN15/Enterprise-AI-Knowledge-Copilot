"""
Teacher Persona System Prompt Registry
Wraps FAISS-retrieved document context with role-specific teacher prompts.
"""

def get_question_bank_prompt(
    context: str, 
    difficulty_mix: str = "balanced", 
    bloom_level: str = "all", 
    question_type: str = "all"
) -> str:
    """
    Generate prompt for Teacher Question Bank generation with multi-tier evaluation rubrics.
    Returns JSON string with tagged questions, difficulty, Bloom's level, marks, answer key, and itemized rubrics.
    """
    return f"""You are an AI Curriculum & Assessment Specialist creating a university-grade Question Bank for teachers.

Document Context:
{context if context else 'No document context available.'}

Assessment Configuration:
- Difficulty Mix: {difficulty_mix}
- Target Bloom's Taxonomy Level: {bloom_level}
- Target Question Type: {question_type}

Instructions:
1. Generate an academic Question Bank with questions grounded STRICTLY in the Document Context.
2. Formulate clear, formal academic question phrasing suitable for college/university exam papers.
3. For each question, provide:
   - Topic tag and explicit total mark allocation (e.g., 5 Marks, 10 Marks).
   - Difficulty pill (easy / medium / hard) and Bloom's Taxonomy level (e.g., "Recall", "Analytical", "Synthesis").
   - Direct, factual Answer Key / Solution.
   - Itemized Multi-Tier Evaluation Rubric (Full Marks, Partial Marks, Minimal Marks).
4. Return ONLY a valid JSON object matching the exact format below, with NO extra text outside the JSON.

Expected JSON Format:
{{
  "title": "Document Assessment Question Bank",
  "questions": [
    {{
      "id": "tb1",
      "question": "Formulate a comprehensive explanation of...",
      "difficulty": "medium",
      "bloomLevel": "Analytical",
      "questionType": "long_answer",
      "topicTag": "System Architecture",
      "totalMarks": 10,
      "answerKey": "Detailed step-by-step solution grounded in document context.",
      "markingCriteria": "Multi-tier rubric applied based on explicit criteria.",
      "rubricTiers": {{
        "fullMarks": "Full Marks (10/10): Explains all core components with exact domain examples.",
        "partialMarks": "Partial Marks (5/10): Explains main concepts but omits architectural details.",
        "minimalMarks": "Minimal Marks (2/10): Vague overview with minor or ungrounded statements."
      }},
      "citation": {{
        "documentName": "Doc Name",
        "pageNumber": 1,
        "text": "Source context snippet."
      }}
    }}
  ]
}}
"""


def get_coverage_gaps_prompt(context: str, document_name: str) -> str:
    """
    Generate prompt for Teacher Coverage Gaps analysis.
    Returns JSON string with topic density analysis (sparse vs dense coverage).
    """
    return f"""You are an AI Academic Content Auditor analyzing topic coverage density for a document.

Document Name: {document_name}
Document Context:
{context if context else 'No document context available.'}

Instructions:
1. Analyze the retrieved content chunks to identify topics with dense coverage (well-explained) vs sparse coverage (gaps or minimal detail).
2. Return ONLY a valid JSON object matching the exact format below, with NO extra text outside the JSON.

Expected JSON Format:
{{
  "documentName": "{document_name}",
  "overallDensityScore": 78,
  "topics": [
    {{
      "topic": "Topic Name",
      "coverage": "dense",
      "chunkCount": 8,
      "summary": "Thorough coverage of concepts.",
      "recommendation": "Ready for test generation."
    }},
    {{
      "topic": "Another Topic",
      "coverage": "sparse",
      "chunkCount": 2,
      "summary": "Only mentioned briefly without detailed examples.",
      "recommendation": "Add supplementary lecture materials."
    }}
  ]
}}
"""
