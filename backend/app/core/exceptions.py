"""Custom application domain exceptions."""


class AppException(Exception):
    """Base application exception with machine code and HTTP status code."""

    def __init__(self, code: str, message: str, status_code: int = 400):
        self.code = code
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class TopicNotFoundException(AppException):
    """Raised when a requested topic identifier is not found in the question bank."""

    def __init__(self, topic_id: str):
        super().__init__(
            code="TOPIC_NOT_FOUND",
            message=f"No topic exists with id '{topic_id}'.",
            status_code=404,
        )


class QuestionTopicMismatchException(AppException):
    """Raised when a submitted question does not belong to the submitted topic."""

    def __init__(self, question_id: str, topic_id: str):
        super().__init__(
            code="QUESTION_TOPIC_MISMATCH",
            message=f"Question '{question_id}' does not belong to topic '{topic_id}'.",
            status_code=400,
        )


class InvalidOptionIndexException(AppException):
    """Raised when a selected option index is out of bounds for the question."""

    def __init__(self, question_id: str, option_index: int, max_options: int):
        super().__init__(
            code="INVALID_OPTION_INDEX",
            message=(
                f"Option index {option_index} is out of bounds for question '{question_id}' "
                f"(valid range: 0 to {max_options - 1})."
            ),
            status_code=400,
        )


class InvalidSeniorityException(AppException):
    """Raised when an unrecognized seniority parameter is passed."""

    def __init__(self, seniority: str):
        super().__init__(
            code="INVALID_SENIORITY",
            message=f"Invalid seniority level '{seniority}'. Allowed: junior, mid, senior.",
            status_code=422,
        )


class InvalidDifficultyException(AppException):
    """Raised when an unrecognized difficulty parameter is passed."""

    def __init__(self, difficulty: str):
        super().__init__(
            code="INVALID_DIFFICULTY",
            message=f"Invalid difficulty level '{difficulty}'. Allowed: easy, medium, hard.",
            status_code=422,
        )


class SessionExpiredException(AppException):
    """Raised when an evaluation references an expired or non-existent quiz session."""

    def __init__(self, session_id: str):
        super().__init__(
            code="SESSION_EXPIRED",
            message="This quiz session has expired — please start a new interview.",
            status_code=410,
        )


class LLMGenerationFailedException(AppException):
    """Raised when dynamic LLM question generation fails or times out after retries."""

    def __init__(self, message: str = "Failed to generate interview questions. Please retry."):
        super().__init__(
            code="LLM_GENERATION_FAILED",
            message=message,
            status_code=502,
        )
