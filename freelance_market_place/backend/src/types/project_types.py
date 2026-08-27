from pydantic import BaseModel, model_validator, field_validator
from datetime import date

class CreateProjectSchema(BaseModel):
    title : str
    description: str
    category: str
    budgetMin: int
    budgetMax: int
    deadline: date

    @model_validator(mode="after")
    def validate_budget(self):
        if self.budgetMin <= 0:
            raise ValueError("budgetMin must be greater than 0")
        if self.budgetMin > self.budgetMax:
            raise ValueError("budgetMax must be greater than or equal to budgetMin")
        return self

    @field_validator("deadline")
    def validate_date(self, value):
        if value <= date.today():
            raise ValueError("Deadline must be greater than today's date")
        return value


class CreateProposalSchema(BaseModel):
    coverLetter: str
    proposedPrice: int
    estimatedDuration: int

