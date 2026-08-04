from fastapi import APIRouter

router = APIRouter(
    tags=["meta"]
)


@router.get("/")
def root():
    return {
        "message": "Soil Health Assessment API"
    }


@router.get("/health")
def health():
    return {
        "status": "Healthy",
        "message": "API is running successfully"
    }