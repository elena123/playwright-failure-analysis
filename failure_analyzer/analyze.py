import argparse
import asyncio
import json
from pathlib import Path
from uuid import uuid4

from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from failure_analyzer.agent import create_agent
from failure_analyzer.report_reader import read_failures
from failure_analyzer.schemas import FailureAnalysis


async def analyze_failure(
    runner: Runner,
    session_service: InMemorySessionService,
    failure: dict,
) -> FailureAnalysis:
    session = await session_service.create_session(
        app_name="failure_analyzer",
        user_id="local_user",
        session_id=str(uuid4()),
    )

    message = types.Content(
        role="user",
        parts=[types.Part(text=json.dumps(failure, ensure_ascii=False))],
    )

    final_text = ""

    async for event in runner.run_async(
            user_id="local_user",
            session_id=session.id,
            new_message=message,
    ):
        if event.is_final_response() and event.content:
            final_text = "".join(part.text
                                 for part in event.content.parts or []
                                 if part.text)

    if not final_text:
        raise RuntimeError("The agent returned no final response.")

    return FailureAnalysis.model_validate_json(final_text)


async def run(report_path: Path) -> list[dict]:
    failures = read_failures(report_path)

    if not failures:
        return []

    session_service = InMemorySessionService()

    async with Runner(
            agent=create_agent(),
            app_name="failure_analyzer",
            session_service=session_service,
    ) as runner:
        analyses = []

        for failure in failures:
            analysis = await analyze_failure(runner, session_service, failure)
            analyses.append({
                "test_id": failure["test_id"],
                "title": failure["title"],
                "project": failure["project"],
                "retry": failure["retry"],
                "analysis": analysis.model_dump(),
            })

    return analyses


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Analyze failed Playwright test attempts.")
    parser.add_argument("report", type=Path)
    args = parser.parse_args()

    analyses = asyncio.run(run(args.report))
    print(json.dumps(analyses, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
