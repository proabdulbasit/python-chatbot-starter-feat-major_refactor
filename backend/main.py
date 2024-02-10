import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .routers.chat import router as chat_router
from .routers.delete import router as delete_router
from .routers.ingest import router as ingest_router

app = FastAPI(
    title="Chat with your Docs",
    version="1.0",
    description="A simple api server to Chat with your Docs",
)

ALLOWED_HOSTS = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(ingest_router, prefix="/api", tags=["ingest"])
app.include_router(delete_router, prefix="/api", tags=["delete"])


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    exc_str = f"{exc}".replace("\n", " ").replace("   ", " ")
    logging.error(f"{request}: {exc_str}")
    content = {"status_code": 10422, "message": exc_str, "data": None}
    return JSONResponse(
        content=content, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="localhost", port=8000)
