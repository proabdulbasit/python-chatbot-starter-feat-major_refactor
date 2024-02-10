import json
from typing import Iterator

import humps
from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse

from ..utils.chat import _inputs, chain

router = APIRouter()


@router.post("/chat")
async def process_chat_request(request: Request):
    request_body = await request.body()
    request_data = json.loads(request_body)
    messages = request_data["messages"]
    current_question = messages[-1]["content"]
    chat_history = [] if len(messages) == 1 else messages[:-1]

    retrieved_data = _inputs.invoke(
        {"question": current_question, "chat_history": chat_history}
    )
    source_documents = [doc.to_json()["kwargs"] for doc in retrieved_data["context"]]
    camelized_source_documents = json.dumps(
        humps.camelize(source_documents)
    )  # Convert dicts to json camel case

    def process_output(output_iterator: Iterator[str]):
        """Yields (stream) the LLM response and the source documents"""
        for chunk in output_iterator:
            yield chunk
        yield f"##SOURCE_DOCUMENTS##{camelized_source_documents}"

    stream_chain = chain | process_output

    # return a StreamingResponse object with the generator and the media type
    return StreamingResponse(
        stream_chain.stream(retrieved_data), media_type="text/plain"
    )
