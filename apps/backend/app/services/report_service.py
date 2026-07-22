"""Turn a raw test-run result (from playwright_runner) into a report.

Maps failed/errored tests onto the Issue schema, computes a score, and assembles
the RunTestsResponse the API returns. Persistence to Supabase is intentionally
left as a follow-up (see persist_report) so this stays independent of the DB.
"""

import uuid
import html
from datetime import datetime

from app.schemas.issue_schema import Issue
from app.schemas.report_schema import RunTestsResponse, RunSummary, TestResult


# pytest outcome -> issue severity
_SEVERITY = {
    "failed": "high",
    "error": "high",
    "skipped": "low",
}


def _short_message(message: str, limit: int = 500) -> str:
    """Playwright tracebacks are long; keep the issue description readable."""
    message = (message or "").strip()
    if len(message) > limit:
        return message[:limit] + " …"
    return message


def build_run_response(url: str, run_result: dict) -> RunTestsResponse:
    report_id = str(uuid.uuid4())

    summary = RunSummary(**run_result["summary"])

    issues = []
    tests = []
    for test in run_result.get("tests", []):
        outcome = test.get("outcome", "unknown")
        tests.append(TestResult(
            name=test.get("name", ""),
            outcome=outcome,
            message=_short_message(test.get("message", "")),
        ))
        if outcome in ("failed", "error"):
            issues.append(Issue(
                title=test.get("name", "Unnamed test"),
                severity=_SEVERITY.get(outcome, "medium"),
                description=_short_message(test.get("message", "")) or "Test failed.",
            ))

    # If the whole run failed to execute (syntax/import/timeout), surface that as
    # a single high-severity issue so the caller isn't left with an empty report.
    if run_result["status"] != "completed" and not issues:
        issues.append(Issue(
            title=f"Test suite did not run ({run_result['status']})",
            severity="high",
            description=_short_message(run_result.get("stderr", "")) or "The generated test script could not be executed.",
        ))

    return RunTestsResponse(
        report_id=report_id,
        url=url,
        status=run_result["status"],
        score=run_result["score"],
        summary=summary,
        issues=issues,
        tests=tests,
        generated_script=run_result.get("generated_script", ""),
        logs=_short_message(
            (run_result.get("stdout", "") + "\n" + run_result.get("stderr", "")).strip(),
            limit=4000,
        ),
    )


def _score_color(score: int) -> str:
    if score >= 80:
        return "#16a34a"   # green
    if score >= 50:
        return "#d97706"   # amber
    return "#dc2626"       # red


_OUTCOME_BADGE = {
    "passed": ("#dcfce7", "#166534"),
    "failed": ("#fee2e2", "#991b1b"),
    "error": ("#fee2e2", "#991b1b"),
    "skipped": ("#f1f5f9", "#475569"),
}


def render_report_html(report: RunTestsResponse, generated_script: str = "") -> str:
    """Render a self-contained, styled HTML report for download.

    No external assets (CSS/JS/fonts are inlined) so the file opens correctly
    offline and can be printed to PDF from any browser.
    """
    e = html.escape
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    s = report.summary

    # --- test rows ---
    test_rows = ""
    for t in report.tests:
        bg, fg = _OUTCOME_BADGE.get(t.outcome, ("#f1f5f9", "#475569"))
        msg = f'<div class="msg">{e(t.message)}</div>' if t.message else ""
        test_rows += (
            f'<tr><td class="name">{e(t.name)}{msg}</td>'
            f'<td><span class="badge" style="background:{bg};color:{fg}">{e(t.outcome)}</span></td></tr>'
        )
    if not test_rows:
        test_rows = '<tr><td colspan="2" class="muted">No tests were executed.</td></tr>'

    # --- issues ---
    if report.issues:
        issue_items = ""
        for i in report.issues:
            issue_items += (
                f'<li><span class="sev sev-{e(i.severity)}">{e(i.severity)}</span>'
                f'<strong>{e(i.title)}</strong>'
                + (f'<pre class="desc">{e(i.description)}</pre>' if i.description else "")
                + "</li>"
            )
        issues_html = f'<ul class="issues">{issue_items}</ul>'
    else:
        issues_html = '<p class="ok">No issues found — all tests passed.</p>'

    script_section = ""
    if generated_script:
        script_section = (
            '<details class="script"><summary>Generated test script</summary>'
            f'<pre>{e(generated_script)}</pre></details>'
        )

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TestPilot Report — {e(report.url)}</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          margin: 0; background: #f8fafc; color: #0f172a; }}
  .wrap {{ max-width: 820px; margin: 0 auto; padding: 40px 24px; }}
  header {{ display: flex; align-items: center; gap: 28px; background: #fff;
            border: 1px solid #e2e8f0; border-radius: 16px; padding: 28px; }}
  .score {{ font-size: 52px; font-weight: 800; line-height: 1; color: {_score_color(report.score)}; }}
  .score small {{ font-size: 18px; color: #94a3b8; font-weight: 600; }}
  h1 {{ font-size: 20px; margin: 0 0 4px; }}
  .meta {{ color: #64748b; font-size: 13px; word-break: break-all; }}
  .pill {{ display:inline-block; padding:2px 10px; border-radius:999px; font-size:12px;
           font-weight:600; background:#f1f5f9; color:#475569; margin-top:6px; }}
  .cards {{ display:flex; gap:12px; margin:20px 0; flex-wrap:wrap; }}
  .card {{ flex:1; min-width:90px; background:#fff; border:1px solid #e2e8f0;
           border-radius:12px; padding:14px; text-align:center; }}
  .card .n {{ font-size:24px; font-weight:700; }}
  .card .l {{ font-size:12px; color:#64748b; text-transform:uppercase; letter-spacing:.04em; }}
  h2 {{ font-size:15px; text-transform:uppercase; letter-spacing:.05em; color:#475569; margin:28px 0 12px; }}
  table {{ width:100%; border-collapse:collapse; background:#fff; border:1px solid #e2e8f0; border-radius:12px; overflow:hidden; }}
  td {{ padding:12px 16px; border-top:1px solid #f1f5f9; vertical-align:top; }}
  tr:first-child td {{ border-top:none; }}
  .name {{ font-weight:600; font-size:14px; }}
  .msg {{ font-weight:400; font-size:12px; color:#64748b; white-space:pre-wrap; margin-top:6px;
          font-family:ui-monospace, Menlo, Consolas, monospace; }}
  .badge {{ padding:3px 10px; border-radius:999px; font-size:12px; font-weight:700; }}
  .issues {{ list-style:none; padding:0; margin:0; }}
  .issues li {{ background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; margin-bottom:10px; }}
  .sev {{ display:inline-block; padding:2px 8px; border-radius:6px; font-size:11px; font-weight:700;
          text-transform:uppercase; margin-right:8px; }}
  .sev-high {{ background:#fee2e2; color:#991b1b; }}
  .sev-medium {{ background:#fef3c7; color:#92400e; }}
  .sev-low {{ background:#f1f5f9; color:#475569; }}
  .desc {{ white-space:pre-wrap; font-size:12px; color:#64748b; margin:8px 0 0;
           font-family:ui-monospace, Menlo, Consolas, monospace; background:#f8fafc; padding:10px; border-radius:8px; }}
  .ok {{ color:#16a34a; font-weight:600; }}
  .muted {{ color:#94a3b8; text-align:center; }}
  details.script {{ margin-top:28px; background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px 16px; }}
  details.script summary {{ cursor:pointer; font-weight:600; color:#475569; }}
  details.script pre {{ white-space:pre-wrap; font-size:12px; overflow:auto;
                        font-family:ui-monospace, Menlo, Consolas, monospace; }}
  footer {{ margin-top:32px; text-align:center; color:#94a3b8; font-size:12px; }}
</style></head>
<body><div class="wrap">
  <header>
    <div class="score">{report.score}<small>/100</small></div>
    <div>
      <h1>TestPilot Report</h1>
      <div class="meta">{e(report.url)}</div>
      <span class="pill">Status: {e(report.status)}</span>
    </div>
  </header>

  <div class="cards">
    <div class="card"><div class="n">{s.total}</div><div class="l">Total</div></div>
    <div class="card"><div class="n" style="color:#16a34a">{s.passed}</div><div class="l">Passed</div></div>
    <div class="card"><div class="n" style="color:#dc2626">{s.failed}</div><div class="l">Failed</div></div>
    <div class="card"><div class="n" style="color:#dc2626">{s.error}</div><div class="l">Errors</div></div>
    <div class="card"><div class="n" style="color:#64748b">{s.skipped}</div><div class="l">Skipped</div></div>
  </div>

  <h2>Issues ({len(report.issues)})</h2>
  {issues_html}

  <h2>All Tests</h2>
  <table>{test_rows}</table>

  {script_section}

  <footer>Generated by TestPilot · {generated_at} · Report ID {e(report.report_id)}</footer>
</div></body></html>"""


def persist_report(response: RunTestsResponse) -> None:
    """TODO: persist to Supabase once the `reports`/`issues` tables are defined.

    Deliberately a no-op for now so report generation does not depend on a DB
    schema. When ready, insert into the reports table here (report_id, url,
    score, status, summary) and the issues into a related table.
    """
    return None
