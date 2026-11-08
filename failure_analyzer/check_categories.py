import json
import sys

EXPECTED_CATEGORIES = {
    "catalog displays products": "api_error",
    "catalog fails with an incorrect products locator": "ui_locator",
}


def main() -> int:
    try:
        results = json.load(sys.stdin)
    except json.JSONDecodeError as error:
        print(f"Invalid analyzer JSON: {error}", file=sys.stderr)
        return 2

    all_passed = True
    for title, expected in EXPECTED_CATEGORIES.items():
        matches = [result for result in results if result["title"] == title]

        if not matches:
            print(f"FAIL {title}: missing from analyzer output")
            all_passed = False
            continue

        actual = [result["analysis"]["category"] for result in matches]
        passed = all(category == expected for category in actual)
        print(
            f"{'PASS' if passed else 'FAIL'} {title}: expected {expected}, got {', '.join(actual)}"
        )
        all_passed = all_passed and passed

    return 0 if all_passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
