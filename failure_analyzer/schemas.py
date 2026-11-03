from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class Evidence(BaseModel):
    model_config = ConfigDict(extra="forbid")

    source: str = Field(description="Source field or attachment name.")
    quote: str = Field(description="Exact quote from the supplied evidence.")


class FailureAnalysis(BaseModel):
    model_config = ConfigDict(extra="forbid")

    category: Literal[
        "api_error",
        "authentication",
        "assertion",
        "ui_locator",
        "timeout",
        "environment",
        "unknown",
    ]
    observed_failure: str = Field(
        description="What failed, based only on the report.")
    likely_cause: str = Field(
        description=("Evidence-supported explanation. "
                     "State when the cause cannot be determined."))
    evidence: list[Evidence] = Field(min_length=1)
    missing_information: list[str]
    next_checks: list[str] = Field(min_length=1)
