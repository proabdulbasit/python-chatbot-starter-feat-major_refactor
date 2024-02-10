import json
import os
from typing import List

from fastapi import APIRouter, File, Request, UploadFile

from ..utils.ingest import load_and_ingest_documents, load_and_ingest_url

router = APIRouter()


@router.post("/ingest")
async def ingest(files: List[UploadFile] = File(...)):
    # Create a temporary directory to store the uploaded files
    temp_dir = "temp_uploads"
    os.makedirs(temp_dir, exist_ok=True)

    try:
        # Save the uploaded files to the temporary directory
        saved_files = []
        for file in files:
            file_path = os.path.join(temp_dir, file.filename)
            with open(file_path, "wb") as f:
                f.write(file.file.read())
            saved_files.append(file_path)

        # Load and ingest documents from the temporary directory
        load_and_ingest_documents(temp_dir, ignored_files=[])

        # For now, we'll just return a success message
        result = {"message": "Documents loaded and ingested successfully"}

        return result

    finally:
        # Clean up: Delete the temporary directory and its contents
        for file_path in saved_files:
            os.remove(file_path)
        os.rmdir(temp_dir)


@router.post("/ingest-url")
async def ingest_url(request: Request):
    body = await request.body()
    data = json.loads(body)
    load_and_ingest_url(data["url"])
    result = {"message": "Documents loaded and ingested successfully"}
    return result
