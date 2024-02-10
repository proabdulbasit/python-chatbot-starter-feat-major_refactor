# AI chatbot starter kit version 3.0 (Python)

This is a full-stack application that allows you to load PDF file(s) and chat with your docs. Built with [LangChain](https://github.com/langchain-ai/langchain), [FastAPI](https://fastapi.tiangolo.com/), and [Next.js](https://nextjs.org).


## Installation

Prelude:
a. Make sure you have [Python installed on your system](https://www.python.org/downloads/)

1. (optional) Set up a Python virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Windows script to activate virtual environment:

```bash
.venv\scripts\activate
```

2. Install Poetry: 

```bash
pip install poetry
```

3. Install the project dependencies using Poetry

```bash
poetry install --no-root
```

4. Copy the `example.env` file into a `.env` and fill in your credentials:

```
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=
PINECONE_NAMESPACE=
```

## Usage

5. Start the Python backend with `poetry run make start`.

6. Open a new terminal window, then install frontend dependencies by running `cd frontend`, then `yarn install`.

7. Run the frontend with `yarn dev` for frontend.

8. Open [localhost:3000](http://localhost:3000) in your browser.

A new server should run locally. To stop the server press `ctrl-C`

## Folder structure

- `docs`: Insert your pdf files in this folder.
- `.env`: After creating this file, add your credentials including the pinecone namespace and environment.
- `utils`: Change the prompts sent to the model to generate outputs in `prompts.py`
- `manual_ingestion.py`: Perform the ingestion of your PDF files manually, run `python manual_ingestion.py.` Once the ingestion is complete and added to a namespace, you can use the app to chat with your data without uploading files.
- `backend`: This directory contains the backend code of your application. Ensure all the necessary API endpoints, data processing logic, and model integration are implemented here.
- `frontend`: Here lies the frontend code of your application. This includes user interfaces, templates, and any client-side logic. Make sure to integrate with the backend for seamless communication.

**Note: `manual_ingestion.py` is a work in progress and may throw some errors until fully tested**