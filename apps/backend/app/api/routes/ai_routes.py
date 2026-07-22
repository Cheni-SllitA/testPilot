import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.schemas.ai_schema import AIRequest
from app.services.llm_service import generate_ai_response, InputTooLargeError, EmptyScriptError
from app.automation.playwright_runner import run_test_script
from app.services.report_service import build_run_response, render_report_html, persist_report

router = APIRouter()


@router.post("/generate")
async def generate(request: AIRequest):
    """Full pipeline: generate a test script, execute it against the live URL,
    then return a downloadable HTML test report.

    The structured report also travels in the X-Test-Report response header so
    the UI can render a summary card without parsing the HTML.
    """
    try:
        script = generate_ai_response(
            prompt=request.prompt,
            title=request.title,
            html=request.html,
        )
    except InputTooLargeError as exc:
        raise HTTPException(status_code=413, detail=str(exc))
    except EmptyScriptError as exc:
        raise HTTPException(status_code=422, detail=str(exc))

    result = run_test_script(script, request.url)
    result["generated_script"] = script

    report = build_run_response(request.url, result)
    persist_report(report)

    report_html = render_report_html(report, generated_script=script)

    # Structured summary for the in-app card (script/logs excluded to keep the
    # header small and ASCII-safe).
    report_header = json.dumps(
        report.model_dump(exclude={"generated_script", "logs"}),
        ensure_ascii=True,
    )

    return Response(
        content=report_html,
        media_type="text/html",
        headers={
            "Content-Disposition": 'attachment; filename="test_report.html"',
            "X-Test-Report": report_header,
        },
    )
