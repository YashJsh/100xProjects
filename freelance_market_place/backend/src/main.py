from fastapi import FastAPI
from src.routes.auth_route import router as AuthRouter
from src.routes.project_route import router as ProjectRouter
from fastapi.middleware.cors import CORSMiddleware
from src.miiddleware.auth_middleware import auth_middleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.middleware("http")(auth_middleware)
app.include_router(AuthRouter)
app.include_router(ProjectRouter)
