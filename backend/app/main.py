"""FastAPI application entrypoint, CORS configuration, exception handlers, and routing."""

import time
import traceback
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1.endpoints.health import router as health_router
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger

app = FastAPI(
    title="AI Technical Interview Coach API",
    description="Deterministic evaluation engine for software engineering mock interviews.",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ------------------------------------------------------------------------------
# CORS Middleware
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------------------
# Structured Request Logging Middleware
# ------------------------------------------------------------------------------
@app.middleware("http")
async def log_requests_middleware(request: Request, call_next):
    """Log inbound request details, sanitized parameters, latency, and response status codes."""
    start_time = time.perf_counter()
    topic_id = request.query_params.get("topic_id")
    seniority = request.query_params.get("seniority")
    difficulty = request.query_params.get("difficulty")
    param_tags = []
    if topic_id:
        param_tags.append(f"topic_id={topic_id}")
    if seniority:
        param_tags.append(f"seniority={seniority}")
    if difficulty:
        param_tags.append(f"difficulty={difficulty}")
    params_str = f" [{', '.join(param_tags)}]" if param_tags else ""

    logger.info(f"Incoming: {request.method} {request.url.path}{params_str}")

    try:
        response = await call_next(request)
        process_time_ms = (time.perf_counter() - start_time) * 1000
        logger.info(
            f"Completed: {request.method} {request.url.path}{params_str} -> "
            f"Status {response.status_code} (duration_ms={process_time_ms:.2f})"
        )
        return response
    except Exception as exc:
        process_time_ms = (time.perf_counter() - start_time) * 1000
        logger.exception(
            f"Unhandled exception on {request.method} {request.url.path}{params_str} "
            f"(duration_ms={process_time_ms:.2f}): {exc}"
        )
        raise exc


# ------------------------------------------------------------------------------
# Typed Exception Handlers conforming to ErrorDetail schema
# ------------------------------------------------------------------------------
@app.exception_handler(AppException)
async def handle_app_exception(_: Request, exc: AppException) -> JSONResponse:
    """Handle custom application domain exceptions."""
    logger.warning(f"Domain error [{exc.code}]: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": exc.code, "message": exc.message},
    )


@app.exception_handler(RequestValidationError)
async def handle_validation_exception(
    _: Request, exc: RequestValidationError
) -> JSONResponse:
    """Format schema validation errors into standardized ErrorDetail response."""
    errors = exc.errors()
    first_error = errors[0] if errors else {}
    field_loc = " -> ".join(str(loc) for loc in first_error.get("loc", []))
    msg = first_error.get("msg", "Invalid request payload.")
    error_message = f"Validation failed at '{field_loc}': {msg}"

    logger.warning(f"Validation rejection: {error_message}")
    return JSONResponse(
        status_code=422,
        content={"code": "VALIDATION_ERROR", "message": error_message},
    )


@app.exception_handler(StarletteHTTPException)
async def handle_http_exception(
    _: Request, exc: StarletteHTTPException
) -> JSONResponse:
    """Format generic HTTP exceptions into standardized ErrorDetail response."""
    error_code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
    return JSONResponse(
        status_code=exc.status_code,
        content={"code": error_code, "message": str(exc.detail)},
    )


@app.exception_handler(Exception)
async def handle_general_exception(_: Request, exc: Exception) -> JSONResponse:
    """Fallback handler for unhandled exceptions with full stacktrace logging."""
    logger.error(f"Internal server error: {exc}\n{traceback.format_exc()}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "code": "INTERNAL_SERVER_ERROR",
            "message": "An unexpected server error occurred. Please retry.",
        },
    )


# ------------------------------------------------------------------------------
# Route Mounting
# ------------------------------------------------------------------------------
# Root-level health check per PRD §5.3 / §7.1 for Render ping
app.include_router(health_router)

# Versioned API routes under /api/v1
app.include_router(api_router, prefix="/api/v1")
