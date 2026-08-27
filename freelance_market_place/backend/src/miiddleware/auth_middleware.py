from fastapi import Request
from fastapi.responses import JSONResponse
from src.utils.token import verify_token

async def auth_middleware(
    request: Request, 
    call_next
):
    allowed_paths = {"/auth/auth/login", "/auth/auth/signup"}
    if request.url.path in allowed_paths:
        return await call_next(request)
    
    token = request.headers.get("Authorization")

    if (not token):
        return JSONResponse({
            "message" : "No token found"
        }, status_code=401)

    if not token.startswith("Bearer "):
        return JSONResponse({
            "message" : "Invalid authorization header"
        }, 401)
     
    raw_token = token.split(" ")[1]

    data = verify_token(raw_token)
    if not data:
        return JSONResponse(
            {
                "details" : "Token not valid"
            }, 401
        )

    request.state.user = data
    return await call_next(request)
