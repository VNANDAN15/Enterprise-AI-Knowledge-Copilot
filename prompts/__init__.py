from prompts.student import (
    get_student_chat_prompt,
    get_quiz_prompt,
    get_flashcards_prompt,
    get_summary_prompt
)
from prompts.teacher import (
    get_question_bank_prompt,
    get_coverage_gaps_prompt
)
from prompts.manager import (
    get_manager_chat_prompt,
    get_executive_briefing_prompt,
    get_action_kpi_prompt
)
from prompts.employee import (
    get_employee_chat_prompt,
    get_sop_guide_prompt,
    get_onboarding_compliance_prompt
)

__all__ = [
    "get_student_chat_prompt",
    "get_quiz_prompt",
    "get_flashcards_prompt",
    "get_summary_prompt",
    "get_question_bank_prompt",
    "get_coverage_gaps_prompt",
    "get_manager_chat_prompt",
    "get_executive_briefing_prompt",
    "get_action_kpi_prompt",
    "get_employee_chat_prompt",
    "get_sop_guide_prompt",
    "get_onboarding_compliance_prompt"
]
