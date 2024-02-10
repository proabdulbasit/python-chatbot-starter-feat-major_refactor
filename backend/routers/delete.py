from fastapi import APIRouter, Request

from ..utils.delete import delete_all

router = APIRouter()


@router.post("/delete-documents")
def delete(request: Request):
    # initialize pinecone if not already initialized
    response = delete_all()
    return {"message": response}
