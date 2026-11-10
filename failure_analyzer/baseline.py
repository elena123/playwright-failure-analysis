import argparse
import json
from pathlib import Path
from urllib.parse import urlsplit

from failure_analyzer.report_reader import read_failures


def classify(failure: dict) -> str:
    for attachment in failure["attachments"]:
        if attachment["name"] != "products-response.json":
            continue

        try:
            response = json.loads(attachment.get("text", ""))
        except json.JSONDecodeError:
            continue

        if (isinstance(response, dict) and isinstance(response.get("url"), str)
                and urlsplit(response["url"]).path == "/api/products"
                and response.get("status") == 500):
            return "api_error"

    wrong_locator = any(
        "getByRole('list', { name: 'Productz', exact: true })" in error
        for error in failure["errors"])
    products_were_visible = any(
        attachment["name"] == "catalog-state.txt" and
        "The Products list was visible before the failing locator assertion."
        in attachment.get("text", "") for attachment in failure["attachments"])

    if wrong_locator and products_were_visible:
        return "ui_locator"

    return "unknown"


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Classify Playwright failures using deterministic rules.")
    parser.add_argument("report", type=Path)
    args = parser.parse_args()

    results = [{
        "test_id": failure["test_id"],
        "title": failure["title"],
        "project": failure["project"],
        "retry": failure["retry"],
        "analysis": {
            "category": classify(failure)
        },
    } for failure in read_failures(args.report)]

    print(json.dumps(results, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
