import os
from operator import itemgetter
from typing import Dict, List, Optional

import pinecone
from dotenv import load_dotenv
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from langchain.chat_models import ChatOpenAI
from langchain.embeddings.openai import OpenAIEmbeddings
from langchain.schema import AIMessage, HumanMessage
from langchain.schema.output_parser import StrOutputParser
from langchain.schema.runnable import (RunnableBranch, RunnableLambda,
                                       RunnableMap, RunnablePassthrough)
from langchain.vectorstores import Pinecone
from pydantic import BaseModel

from .prompts import CONDENSE_QUESTION_PROMPT, QA_PROMPT

# load your credentials from .env file
load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_environment = os.getenv("PINECONE_ENVIRONMENT")
pinecone_index = os.getenv("PINECONE_INDEX_NAME")
pinecone_namespace = os.getenv("PINECONE_NAMESPACE")
# Set the number of documents to retrieve from Pinecone
target_source_docs = 4
context_window = 10

env_vars = [
    "OPENAI_API_KEY",
    "PINECONE_API_KEY",
    "PINECONE_ENVIRONMENT",
    "PINECONE_INDEX_NAME",
]

# initialize Pinecone with credentials
pinecone.init(api_key=pinecone_api_key, environment=pinecone_environment)

# initialize OpenAIEmbeddings and chat models with credentials
embeddings = OpenAIEmbeddings(
    model="text-embedding-ada-002", openai_api_key=openai_api_key
)


def convert_source_documents(source_list: List):
    src_docs = "["
    for ind, document in enumerate(source_list):
        src_doc = (
            "{'pageContent' : "
            + "'"
            + document["page_content"]
            + "',  "
            + "'metadata' : "
            + "{'page' : "
            + document["page"]
            + ", "
            + "'source': "
            + document["source"]
            + "}"
            + "}"
        )
        if ind == len(source_list) - 1:
            src_docs += src_doc + "]"
        else:
            src_docs += src_doc + ","
    return src_docs


# change model to gpt-4 if you have access to the api
llm = ChatOpenAI(
    model_name="gpt-3.5-turbo",
    temperature=0,
    openai_api_key=openai_api_key,
    verbose=True,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

# initialize retrieval chain
if os.getenv("PINECONE_NAMESPACE"):
    vectorstore = Pinecone.from_existing_index(
        index_name=pinecone_index,
        embedding=embeddings,
        text_key="text",
        namespace=pinecone_namespace,
    )
else:
    vectorstore = Pinecone.from_existing_index(pinecone_index, embeddings)

retriever = vectorstore.as_retriever(search_kwargs={"k": 4})


def get_chat_history_window(chat_history: List, context_window=4) -> List:
    return chat_history[-(context_window * 2) :]


def _format_chat_history(
    chat_history: List,
) -> List:
    buffer = []
    for msg in chat_history:
        if msg["role"] == "user":
            buffer.append(HumanMessage(content=msg["content"]))
        else:
            buffer.append(
                AIMessage(content=msg["content"].split("##SOURCE_DOCUMENTS##")[0])
            )

    return get_chat_history_window(buffer, context_window)


# User input
class ChatHistory(BaseModel):
    question: str
    chat_history: Optional[List[Dict[str, str]]]


_search_query = RunnableBranch(
    # If input includes chat_history, we condense it with the follow-up question
    (
        RunnableLambda(lambda x: bool(x.get("chat_history"))).with_config(
            run_name="HasChatHistoryCheck"
        ),  # Condense follow-up question and chat into a standalone_question
        RunnablePassthrough.assign(
            chat_history=lambda x: _format_chat_history(x["chat_history"])
        )
        | CONDENSE_QUESTION_PROMPT
        | ChatOpenAI(temperature=0)
        | StrOutputParser(),
    ),
    # Else, we have no chat history, so just pass through the question
    RunnableLambda(itemgetter("question")),
)

_inputs = RunnableMap(
    {
        "question": lambda x: x["question"],
        "chat_history": lambda x: _format_chat_history(x["chat_history"]),
        "context": _search_query | retriever,
    }
).with_types(input_type=ChatHistory)

chain = QA_PROMPT | ChatOpenAI() | StrOutputParser()
