from fastapi import APIRouter

from .v1.transactions import transactions_router

v1_router = APIRouter(tags=["v1"], prefix="/api/v1")


v1_router.include_router(transactions_router)
