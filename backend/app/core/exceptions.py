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
