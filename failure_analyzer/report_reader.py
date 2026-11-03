import argparse
import base64
import json
import re
from pathlib import Path

ANSI_ESCAPE = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")
FAILURE_STATUSES = {"failed", "timedOut", "interrupted"}


def clean_text(text: str) -> str:
    return ANSI_ESCAPE.sub("", text)


def walk_suites(suites: list):
    for suite in suites:
        yield suite
        yield from walk_suites(suite.get("suites", []))


def read_failures(report_path: Path) -> list[dict]:
    report = json.loads(report_path.read_text(encoding="utf-8"))
    failures = []

    for suite in walk_suites(report.get("suites", [])):
        for spec in suite.get("specs", []):
            for test in spec.get("tests", []):
                for result in test.get("results", []):
                    if result.get("status") not in FAILURE_STATUSES:
                        continue

                    attachments = []

                    for attachment in result.get("attachments", []):
                        item = {
                            "name": attachment.get("name"),
                            "content_type": attachment.get("contentType"),
                        }

                        encoded_body = attachment.get("body")
                        if encoded_body is not None:
                            content = base64.b64decode(encoded_body,
                                                       validate=True)
                            content_type = attachment.get("contentType", "")

                            if (content_type.startswith("text/")
                                    or content_type == "application/json"):
                                item["text"] = content.decode("utf-8")

                        if attachment.get("path"):
                            item["path"] = attachment["path"]

                        attachments.append(item)

                    errors = result.get("errors") or [result.get("error", {})]

                    failures.append({
                        "test_id":
                        spec.get("id"),
                        "title":
                        spec.get("title"),
                        "file":
                        spec.get("file"),
                        "project":
                        test.get("projectName"),
                        "status":
                        result.get("status"),
                        "expected_status":
                        test.get("expectedStatus"),
                        "retry":
                        result.get("retry", 0),
                        "errors": [
                            clean_text(error.get("message", ""))
                            for error in errors if error.get("message")
                        ],
                        "attachments":
                        attachments,
                    })

    return failures


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract failed attempts from a Playwright JSON report.")
    parser.add_argument("report", type=Path)
    args = parser.parse_args()

    try:
        failures = read_failures(args.report)
    except (OSError, ValueError, UnicodeError) as error:
        parser.exit(1, f"Could not read report: {error}\n")

    print(json.dumps(failures, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
