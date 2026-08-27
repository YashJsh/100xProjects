import jwt
import os
from src.db.schema import UserRole

JWT_SECRET = os.getenv("JWT_SECRET")

def create_token(user_id : int, email : str, role : UserRole):
    token = jwt.encode({
        "user_id" : user_id,
        "email" : email,
        "role" : role
    }, JWT_SECRET, algorithm="HS256")
    return token

def verify_token(token: str):
    check = jwt.decode(token, JWT_SECRET, ["HS256"])
    return check



