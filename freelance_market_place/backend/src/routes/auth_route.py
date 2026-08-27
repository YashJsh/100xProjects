from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from src.db.session import get_db
from src.types.auth_types import SignInSchema, SignUpSchema
from src.db.schema import User
from src.utils.password import hash_password, check_password
from src.utils.token import create_token
from sqlalchemy import select


router = APIRouter(
    prefix="/api/auth"
)

@router.post("/signin")
async def signup(
    body: SignUpSchema,
    db: AsyncSession = Depends(get_db)
):
    hashed_password = hash_password(body.password)
    user = User(
        name=body.name,
        email=body.email,
        password=hashed_password,
        role=body.role
    )
    try:
        await db.commit()
        await db.refresh(user)
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="User with this email already exists"
        )

    token = create_token(user.id, user.email, user.role)

    return {
        "success" : True,
        "token" : token
    }

@router.post("/signin")
async def signin(
    body: SignInSchema,
    db: AsyncSession= Depends(get_db)
):
    user = await db.execute(select(User).where(User.email == body.email))
    existing_user = user.scalar_one_or_none()

    if not existing_user:
        raise HTTPException(status_code=409, detail="User already exists")

    verify_password = check_password(body.password, existing_user.password)

    if not verify_password:
        raise HTTPException(403, "Incorrect Password")

    token = create_token(existing_user.id, existing_user.email, existing_user.role)

    return {
        "success" : True,
        "token" : token
    }