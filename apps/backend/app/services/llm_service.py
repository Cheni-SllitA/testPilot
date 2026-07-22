import os
import re

from groq import Groq, APIStatusError

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# Groq on-demand tier limit is 8000 tokens/minute (input + output combined).
# We reserve room for the model's output and keep the HTML input well under budget.
# ~4 chars per token, so 8000 chars of HTML ~= 2000 input tokens.
MAX_HTML_CHARS = 6000
# Reasoning tokens are billed as completion tokens, so a high reasoning effort
# can consume the whole budget and leave NO room for the actual code (empty
# output, finish_reason="length"). Keep enough headroom for the script itself.
MAX_COMPLETION_TOKENS = 4500


class InputTooLargeError(Exception):
    """Raised when the request exceeds the model provider's token budget."""


class EmptyScriptError(Exception):
    """Raised when the model returns no usable test code."""


# The model must return a runnable pytest + Playwright module, nothing else.
# The runner supplies the live URL via pytest's --base-url, so tests use relative
# paths like page.goto("/"). This keeps output deterministic and executable.
SYSTEM_PROMPT = (
    "You are an expert software testing assistant. You are given the title and "
    "cleaned HTML of a web page. Generate an automated test suite for it.\n\n"
    "STRICT OUTPUT RULES:\n"
    "1. Output ONLY valid Python code. No explanations, no markdown, no code fences.\n"
    "2. Write a pytest module using pytest-playwright's sync `page` fixture.\n"
    "3. Every test function must ALSO take the `base_url` fixture and open the page "
    "under test with `page.goto(base_url)` as its first step. `base_url` is the exact "
    "URL (including its path, e.g. /login) supplied by the runner. NEVER hardcode a "
    "URL or domain. Use relative paths only when navigating to OTHER pages.\n"
    "4. Import from playwright.sync_api (e.g. `from playwright.sync_api import Page, expect`).\n"
    "5. Each test function name must start with `test_` and clearly describe what it checks.\n"
    "6. Cover meaningful behaviour visible in the HTML: page loads, headings/titles, "
    "key links and buttons exist and are visible, forms and inputs are present, etc.\n"
    "7. Use web-first assertions (expect(...).to_be_visible(), etc.) with default timeouts. "
    "Keep each test small and independent.\n"
    "8. Do not read files, spawn processes, make network calls other than via `page`, "
    "or access environment variables.\n"
    "9.generate test cases depending on the page you receive in the python testing code"
)

""
def strip_code_fences(text: str) -> str:
    """Remove ```python ... ``` markdown fences a model may wrap code in."""
    if not text:
        return ""
    text = text.strip()
    # Leading ```python / ``` and trailing ```
    text = re.sub(r"^```[a-zA-Z]*\s*\n?", "", text)
    text = re.sub(r"\n?```\s*$", "", text)
    return text.strip()


def clean_html(html: str) -> str:
    """Strip noise from raw HTML and cap its size to stay within the token budget.

    Removes <script>, <style>, <svg>, and comments (which carry almost no signal
    for test generation but eat a huge share of tokens), collapses whitespace,
    then truncates to MAX_HTML_CHARS.
    """
    if not html:
        return ""

    # Drop elements whose contents are pure noise for this task.
    html = re.sub(r"<script\b[^>]*>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<style\b[^>]*>.*?</style>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<svg\b[^>]*>.*?</svg>", "", html, flags=re.DOTALL | re.IGNORECASE)
    html = re.sub(r"<!--.*?-->", "", html, flags=re.DOTALL)

    # Collapse runs of whitespace introduced by the removals above.
    html = re.sub(r"\s+", " ", html).strip()

    if len(html) > MAX_HTML_CHARS:
        html = html[:MAX_HTML_CHARS] + "\n<!-- [truncated: HTML exceeded size limit] -->"

    return html


def generate_ai_response(prompt: str, title: str, html: str) -> str:
    cleaned_html = clean_html(html)

    try:
        completion = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": f"title: {title}\nhtml: {cleaned_html}",
                },
            ],
            max_completion_tokens=MAX_COMPLETION_TOKENS,
            reasoning_effort="low",   # low: reserve the token budget for the code, not hidden reasoning
            reasoning_format="hidden",   # return only the final answer
        )
    except APIStatusError as exc:
        # 413 = payload/token-per-minute limit exceeded on Groq.
        if exc.status_code == 413:
            raise InputTooLargeError(
                "The web page is too large to analyze within the current model token limit. "
                "Try a smaller page or upgrade the Groq tier."
            ) from exc
        raise

    choice = completion.choices[0]
    script = strip_code_fences(choice.message.content or "")
    print(f"finish_reason: {choice.finish_reason} | script_chars: {len(script)}")

    if not script:
        # Empty completion — almost always because reasoning consumed the whole
        # token budget (finish_reason == 'length'). Surface it clearly instead
        # of running pytest on an empty file.
        raise EmptyScriptError(
            "The model returned no test code "
            f"(finish_reason={choice.finish_reason}). "
            "Try lowering reasoning_effort or raising max_completion_tokens."
        )

    return script
