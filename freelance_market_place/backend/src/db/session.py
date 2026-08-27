from sqlalchemy.ext.asyncio import async_sessionmaker
from src.db.engine import engine

SessionLocal = async_sessionmaker(
    engine,
    expire_on_commit=False
)

async def get_db():
    async with SessionLocal() as session:
        yield session

