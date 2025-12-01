from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.v1.routes_health import router as health_router
from app.api.v1.routes_pdf import router as pdf_router

def create_application() -> FastAPI:
    app = FastAPI(title=settings.PROJECT_NAME)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(
        health_router,
        prefix=settings.API_V1_PREFIX,
        tags=["health"],
    )

    app.include_router(
        pdf_router,
        prefix=f"{settings.API_V1_PREFIX}/pdf",
        tags=["pdf"]
    )

    return app

app = create_application()