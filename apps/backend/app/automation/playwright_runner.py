"""Execute AI-generated pytest + Playwright test scripts safely.

SECURITY: The script comes from an LLM and must be treated as untrusted code.
It is never exec()'d in-process. It runs in a child process with:
  - a hard wall-clock timeout (runaway / infinite scripts are killed),
  - a scrubbed environment (API keys and DB secrets are removed), and
  - an isolated temp working directory that is deleted afterwards.

This subprocess runner is the local-dev backend. For deployment, implement a
DockerRunner with the same run_test_script(script, base_url) signature that runs
the same pytest command inside an ephemeral, network-restricted, non-root
container (e.g. mcr.microsoft.com/playwright/python). The pipeline calling this
function does not need to change.
"""

import os
import re
import sys
import json
import shutil
import tempfile
import subprocess

# Wall-clock ceiling for a whole test run. Kills infinite loops / hangs.
RUN_TIMEOUT_SECONDS = 120

# Debug aid: set TESTPILOT_KEEP_WORKDIR=1 to keep each run's temp folder
# (script + report.json) on disk for inspection instead of deleting it.
KEEP_WORKDIR = os.getenv("TESTPILOT_KEEP_WORKDIR") == "1"

# Environment variables never exposed to the untrusted subprocess.
_SECRET_KEY_PATTERN = re.compile(
    r"(KEY|SECRET|TOKEN|PASSWORD|PASSWD|CREDENTIAL|SUPABASE|GROQ|OPENAI|ANTHROPIC)",
    re.IGNORECASE,
)


def _scrubbed_env() -> dict:
    """Copy the current environment minus anything that looks like a secret.

    Playwright/pytest still need PATH, SystemRoot, TEMP, etc., so we start from
    the real environment and strip only sensitive-looking keys rather than
    allowlisting (which is brittle on Windows).
    """
    return {
        key: value
        for key, value in os.environ.items()
        if not _SECRET_KEY_PATTERN.search(key)
    }


def run_test_script(script: str, base_url: str) -> dict:
    """Run an AI-generated pytest+Playwright module against base_url.

    Returns a normalized dict:
        {
          "status": "completed" | "error" | "timeout",
          "score": int,                       # 0-100, share of tests passed
          "summary": {total, passed, failed, error, skipped},
          "tests": [{"name", "outcome", "message"}],
          "stdout": str, "stderr": str,
          "duration": float,
        }
    """
    work_dir = tempfile.mkdtemp(prefix="testpilot_")
    test_file = os.path.join(work_dir, "test_generated.py")
    report_file = os.path.join(work_dir, "report.json")
    print(f"[playwright_runner] executing generated script in: {work_dir}"
          + (" (kept after run)" if KEEP_WORKDIR else " (deleted after run)"))

    try:
        with open(test_file, "w", encoding="utf-8") as f:
            f.write(script)

        cmd = [
            sys.executable, "-m", "pytest", test_file,
            "--base-url", base_url,
            "--browser", "chromium",
            "--json-report", f"--json-report-file={report_file}",
            "-p", "no:cacheprovider",
            "-q", "--no-header",
        ]

        try:
            proc = subprocess.run(
                cmd,
                cwd=work_dir,
                env=_scrubbed_env(),
                capture_output=True,
                text=True,
                timeout=RUN_TIMEOUT_SECONDS,
            )
        except subprocess.TimeoutExpired as exc:
            return {
                "status": "timeout",
                "score": 0,
                "summary": {"total": 0, "passed": 0, "failed": 0, "error": 0, "skipped": 0},
                "tests": [],
                "stdout": exc.stdout or "",
                "stderr": (exc.stderr or "") + f"\nTest run exceeded {RUN_TIMEOUT_SECONDS}s and was killed.",
                "duration": float(RUN_TIMEOUT_SECONDS),
            }

        return _parse_report(report_file, proc)

    finally:
        if not KEEP_WORKDIR:
            shutil.rmtree(work_dir, ignore_errors=True)


def _parse_report(report_file: str, proc: subprocess.CompletedProcess) -> dict:
    """Turn pytest-json-report output into our normalized result dict."""
    if not os.path.exists(report_file):
        # pytest never produced a report -> the script likely failed to import
        # (syntax error, bad import). Surface stderr so the caller can see why.
        return {
            "status": "error",
            "score": 0,
            "summary": {"total": 0, "passed": 0, "failed": 0, "error": 0, "skipped": 0},
            "tests": [],
            "stdout": proc.stdout,
            "stderr": proc.stderr or "Test script could not be collected/executed.",
            "duration": 0.0,
        }

    with open(report_file, "r", encoding="utf-8") as f:
        report = json.load(f)

    # A collection failure (syntax error, bad import) shows up as a collector
    # whose outcome != "passed" rather than as a test. pytest-json-report still
    # writes a report with 0 tests, so we must detect it explicitly instead of
    # treating the empty run as a success.
    collect_errors = [
        c.get("longrepr", "") or ""
        for c in report.get("collectors", [])
        if c.get("outcome") not in (None, "passed")
    ]
    if collect_errors:
        return {
            "status": "error",
            "score": 0,
            "summary": {"total": 0, "passed": 0, "failed": 0, "error": 0, "skipped": 0},
            "tests": [],
            "stdout": proc.stdout,
            "stderr": "The generated test script could not be collected:\n\n"
                      + "\n".join(collect_errors),
            "duration": 0.0,
        }

    raw_summary = report.get("summary", {})
    summary = {
        "total": raw_summary.get("total", 0),
        "passed": raw_summary.get("passed", 0),
        "failed": raw_summary.get("failed", 0),
        "error": raw_summary.get("error", 0),
        "skipped": raw_summary.get("skipped", 0),
    }

    tests = []
    for test in report.get("tests", []):
        outcome = test.get("outcome", "unknown")
        # The failure message lives in the phase that failed (setup/call/teardown).
        message = ""
        for phase in ("call", "setup", "teardown"):
            phase_data = test.get(phase)
            if phase_data and phase_data.get("outcome") not in (None, "passed"):
                message = phase_data.get("longrepr", "") or ""
                break
        tests.append({
            "name": _clean_nodeid(test.get("nodeid", "")),
            "outcome": outcome,
            "message": message,
        })

    # No tests collected (exit code 5): the script had no `test_` functions or
    # was empty. That is not a passing run — report it as an error.
    if summary["total"] == 0:
        return {
            "status": "error",
            "score": 0,
            "summary": summary,
            "tests": [],
            "stdout": proc.stdout,
            "stderr": (
                "No tests were collected. The generated script was empty or "
                "contained no `test_` functions.\n\n" + (proc.stderr or "")
            ),
            "duration": 0.0,
        }

    total = summary["total"] or 1  # avoid div-by-zero; keeps score at 0 when empty
    score = round((summary["passed"] / total) * 100) if summary["total"] else 0

    return {
        "status": "completed",
        "score": score,
        "summary": summary,
        "tests": tests,
        "stdout": proc.stdout,
        "stderr": proc.stderr,
        "duration": report.get("duration", 0.0),
    }


def _clean_nodeid(nodeid: str) -> str:
    """`test_generated.py::test_homepage_loads` -> `test_homepage_loads`."""
    return nodeid.split("::")[-1] if "::" in nodeid else nodeid
