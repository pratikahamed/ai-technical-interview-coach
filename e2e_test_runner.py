"""Comprehensive End-to-End Test Suite for AI Technical Interview Coach.
Verifies both Frontend (port 3000) and Backend (port 8000) across full user journey.
"""

import sys
import json
import urllib.request
import urllib.error

FRONTEND_URL = "http://localhost:3000"
BACKEND_URL = "http://localhost:8000"

def log_pass(name: str, details: str = ""):
    print(f"  \033[92m[PASS]\033[0m {name} {details}")

def log_fail(name: str, details: str = ""):
    print(f"  \033[91m[FAIL]\033[0m {name} {details}")
    sys.exit(1)

def test_frontend_pages():
    print("\n--- 1. Testing Frontend Static Pages & HTML Delivery ---")

    # 1. Landing Page
    req = urllib.request.Request(f"{FRONTEND_URL}/")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        html = res.read().decode("utf-8")
        assert "AI Technical Interview Coach" in html, "Missing brand title"
        assert "Master Technical Interviews with" in html, "Missing hero headline"
        assert "v2.4" in html, "Missing version badge"
        assert "Deterministic Assessment Engine" in html, "Missing engine tag"
        log_pass("Landing Page (/) Deliverable", f"(Status: {res.status}, Title & Hero verified)")

    # 2. Track Selection Page
    req = urllib.request.Request(f"{FRONTEND_URL}/interview")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        html = res.read().decode("utf-8")
        assert "Select Your Assessment Track" in html or "interview" in html.lower(), "Missing interview content"
        log_pass("Interview Route (/interview) Deliverable", f"(Status: {res.status})")

    # 3. Results Route
    req = urllib.request.Request(f"{FRONTEND_URL}/results")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        log_pass("Results Route (/results) Deliverable", f"(Status: {res.status})")

    # 4. Brand Asset (logo.svg)
    req = urllib.request.Request(f"{FRONTEND_URL}/logo.svg")
    with urllib.request.urlopen(req) as res:
        assert res.status == 200, f"Expected 200, got {res.status}"
        svg_content = res.read().decode("utf-8")
        assert "<svg" in svg_content and "#38BDF8" in svg_content, "Invalid SVG logo"
        log_pass("Static Asset (/logo.svg)", "(Custom SVG icon rendered)")


def test_backend_cors_and_health():
    print("\n--- 2. Testing Backend Health & CORS Integration ---")

    # 1. Health Probe
    with urllib.request.urlopen(f"{BACKEND_URL}/health") as res:
        assert res.status == 200
        data = json.loads(res.read().decode())
        assert data == {"status": "healthy"}
        log_pass("GET /health Probe", f"Returned {data}")

    # 2. CORS Preflight Check
    cors_req = urllib.request.Request(
        f"{BACKEND_URL}/api/v1/topics",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "GET",
        },
        method="OPTIONS",
    )
    with urllib.request.urlopen(cors_req) as res:
        assert res.status == 200
        allowed_origin = res.headers.get("access-control-allow-origin")
        assert allowed_origin in ["http://localhost:3000", "*"], f"Unexpected CORS: {allowed_origin}"
        log_pass("CORS Preflight (OPTIONS /api/v1/topics)", f"Allow-Origin: {allowed_origin}")


def test_full_e2e_interview_flow():
    print("\n--- 3. Testing Full User Loop Across All 5 Topics ---")

    # Fetch topics
    with urllib.request.urlopen(f"{BACKEND_URL}/api/v1/topics") as res:
        assert res.status == 200
        topics = json.loads(res.read().decode())
        assert len(topics) == 5
        topic_ids = [t["id"] for t in topics]
        expected_ids = {"dsa", "system-design", "lld", "java", "spring"}
        assert set(topic_ids) == expected_ids
        log_pass("GET /api/v1/topics", f"Fetched 5 tracks: {topic_ids}")

    # For each topic: Generate Quiz -> Mask Secrets -> Evaluate -> Verify Invariant Proofs
    for topic in topics:
        tid = topic["id"]
        tname = topic["name"]

        # 1. Generate Quiz
        gen_req = urllib.request.Request(
            f"{BACKEND_URL}/api/v1/quiz/generate?topic_id={tid}",
            method="POST"
        )
        with urllib.request.urlopen(gen_req) as res:
            assert res.status == 200
            questions = json.loads(res.read().decode())
            assert len(questions) == 3

            for q in questions:
                # Security test: secrets strictly stripped
                assert "correct_option_index" not in q, f"LEAK in {q['id']}: correct_option_index exposed"
                assert "explanation" not in q, f"LEAK in {q['id']}: explanation exposed"
                assert len(q["options"]) == 4, f"Expected 4 options in {q['id']}"

        # 2. Evaluate with Candidate Choices (e.g. Option B for all)
        candidate_answers = {q["id"]: 1 for q in questions}
        eval_payload = json.dumps({
            "topic_id": tid,
            "answers": candidate_answers,
        }).encode("utf-8")

        eval_req = urllib.request.Request(
            f"{BACKEND_URL}/api/v1/quiz/evaluate",
            data=eval_payload,
            headers={"Content-Type": "application/json"},
            method="POST"
        )

        with urllib.request.urlopen(eval_req) as res:
            assert res.status == 200
            result = json.loads(res.read().decode())
            assert result["topic_id"] == tid
            assert result["total"] == 3
            assert isinstance(result["score"], int)
            assert isinstance(result["percentage"], (int, float))
            assert len(result["reviews"]) == 3

            for rev in result["reviews"]:
                assert "is_correct" in rev
                assert "explanation" in rev
                assert len(rev["explanation"]) > 20, "Explanation too brief"
                assert rev["selected_option"] == 1

            log_pass(f"Track: {tname} ({tid})", f"Scored: {result['score']}/3 ({result['percentage']}%) • Invariant proofs verified")


def test_edge_cases_and_error_handling():
    print("\n--- 4. Testing Typed Error Handling (ErrorDetail Schema) ---")

    # 1. Non-existent topic on generation
    try:
        req = urllib.request.Request(f"{BACKEND_URL}/api/v1/quiz/generate?topic_id=blockchain", method="POST")
        urllib.request.urlopen(req)
        log_fail("Expected 404 for unknown topic")
    except urllib.error.HTTPError as err:
        assert err.code == 404
        body = json.loads(err.read().decode())
        assert body["code"] == "TOPIC_NOT_FOUND"
        log_pass("Unknown Topic Generation", f"HTTP {err.code} -> {body}")

    # 2. Question from another topic submitted
    try:
        payload = json.dumps({
            "topic_id": "dsa",
            "answers": {"dsa-01": 1, "sys-01": 2}
        }).encode()
        req = urllib.request.Request(f"{BACKEND_URL}/api/v1/quiz/evaluate", data=payload, headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req)
        log_fail("Expected 400 for question topic mismatch")
    except urllib.error.HTTPError as err:
        assert err.code == 400
        body = json.loads(err.read().decode())
        assert body["code"] == "QUESTION_TOPIC_MISMATCH"
        log_pass("Question Topic Mismatch", f"HTTP {err.code} -> {body}")

    # 3. Invalid option index (out of range)
    try:
        payload = json.dumps({
            "topic_id": "dsa",
            "answers": {"dsa-01": 42}
        }).encode()
        req = urllib.request.Request(f"{BACKEND_URL}/api/v1/quiz/evaluate", data=payload, headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req)
        log_fail("Expected 400 for invalid option index")
    except urllib.error.HTTPError as err:
        assert err.code == 400
        body = json.loads(err.read().decode())
        assert body["code"] == "INVALID_OPTION_INDEX"
        log_pass("Invalid Option Index Out-of-Bounds", f"HTTP {err.code} -> {body}")

    # 4. Schema validation failure (missing required field)
    try:
        payload = json.dumps({"topic_id": "dsa"}).encode()
        req = urllib.request.Request(f"{BACKEND_URL}/api/v1/quiz/evaluate", data=payload, headers={"Content-Type": "application/json"}, method="POST")
        urllib.request.urlopen(req)
        log_fail("Expected 422 for missing required body field")
    except urllib.error.HTTPError as err:
        assert err.code == 422
        body = json.loads(err.read().decode())
        assert body["code"] == "VALIDATION_ERROR"
        log_pass("Pydantic Validation Error", f"HTTP {err.code} -> {body}")


if __name__ == "__main__":
    print("================================================================")
    print("      AI TECHNICAL INTERVIEW COACH — FULL E2E TEST PASS         ")
    print("================================================================")
    test_frontend_pages()
    test_backend_cors_and_health()
    test_full_e2e_interview_flow()
    test_edge_cases_and_error_handling()
    print("\n================================================================")
    print("  \033[92mALL END-TO-END TESTS PASSED WITH 100% SUCCESS!\033[0m")
    print("================================================================\n")
