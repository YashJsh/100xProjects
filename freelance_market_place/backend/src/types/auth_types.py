from pydantic import BaseModel
from src.db.schema import UserRole


class SignUpSchema(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole

class SignInSchema(BaseModel):
    email: str
    password: str



