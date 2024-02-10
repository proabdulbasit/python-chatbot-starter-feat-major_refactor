import glob
import os
from multiprocessing import Pool
from typing import List

import pinecone
from dotenv import load_dotenv
from langchain.docstore.document import Document
from langchain.document_loaders import (CSVLoader, PyPDFLoader, TextLoader,
                                        UnstructuredHTMLLoader,
                                        UnstructuredMarkdownLoader,
                                        UnstructuredPowerPointLoader,
                                        UnstructuredWordDocumentLoader,
                                        WebBaseLoader)
from langchain.embeddings import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import Pinecone
from tqdm import tqdm

# load your credentials from .env file
load_dotenv()

openai_api_key = os.getenv("OPENAI_API_KEY")
pinecone_api_key = os.getenv("PINECONE_API_KEY")
pinecone_environment = os.getenv("PINECONE_ENVIRONMENT")
pinecone_index = os.getenv("PINECONE_INDEX_NAME")
pinecone_namespace = os.getenv("PINECONE_NAMESPACE")

CHUNK_SIZE = 1000
CHUNK_OVERLAP = 0

"""
Ingest your documents into Pinecone vectorstore
"""

source_directory = "docs"  # path to folder containing documents to ingest

# Map file extensions to document loaders and their arguments
LOADER_MAPPING = {
    ".csv": (CSVLoader, {}),
    ".doc": (UnstructuredWordDocumentLoader, {}),
    ".docx": (UnstructuredWordDocumentLoader, {}),
    ".html": (UnstructuredHTMLLoader, {}),
    ".md": (UnstructuredMarkdownLoader, {}),
    ".pdf": (PyPDFLoader, {}),
    ".ppt": (UnstructuredPowerPointLoader, {}),
    ".pptx": (UnstructuredPowerPointLoader, {}),
    ".txt": (TextLoader, {"encoding": "utf8"}),
    # Add more mappings for other file extensions and loaders as needed
}


def load_single_document(file_path: str) -> List[Document]:
    """
    load a single document from a file path
    """
    ext = "." + file_path.rsplit(".", 1)[-1]
    if ext in LOADER_MAPPING:
        loader_class, loader_args = LOADER_MAPPING[ext]
        loader = loader_class(file_path, **loader_args)
        return loader.load()

    raise ValueError(f"Unsupported file extension '{ext}'")


def load_documents(source_dir: str, ignored_files: List[str] = []) -> List[Document]:
    """
    Loads all documents from the source documents directory, ignoring specified files
    """
    all_files = []
    for ext in LOADER_MAPPING:
        all_files.extend(
            glob.glob(os.path.join(source_dir, f"**/*{ext}"), recursive=True)
        )
    filtered_files = [
        file_path for file_path in all_files if file_path not in ignored_files
    ]

    with Pool(processes=os.cpu_count()) as pool:
        results = []
        with tqdm(
            total=len(filtered_files), desc="Loading new documents", ncols=80
        ) as pbar:
            for i, docs in enumerate(
                pool.imap_unordered(load_single_document, filtered_files)
            ):
                results.extend(docs)
                pbar.update()

    return results


def process_url(url_path: str) -> List[str]:
    """
    Load url, split in chunks and return processed texts
    """
    loader = WebBaseLoader(url_path)
    documents = loader.load()
    if not documents:
        print("No new documents to load")
        return []

    print(f"Loaded {len(documents)} new documents from {url_path}")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
    )
    texts = text_splitter.split_documents(documents)
    print(f"Split into {len(texts)} chunks of text (max. {CHUNK_SIZE} tokens each)")
    return texts


def process_documents(
    source_directory: str, ignored_files: List[str] = []
) -> List[str]:
    """
    Load documents, split in chunks, and return processed texts
    """
    print(f"Loading documents from {source_directory}")
    documents = load_documents(source_directory, ignored_files)
    if not documents:
        print("No new documents to load")
        return []

    print(f"Loaded {len(documents)} new documents from {source_directory}")
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP
    )
    texts = text_splitter.split_documents(documents)
    print(f"Split into {len(texts)} chunks of text (max. {CHUNK_SIZE} tokens each)")
    return texts


def ingest_docs(texts):
    # throw error if environment variables are not set
    env_vars = [
        "OPENAI_API_KEY",
        "PINECONE_API_KEY",
        "PINECONE_ENVIRONMENT",
        "PINECONE_INDEX_NAME",
    ]

    for var in env_vars:
        if not os.getenv(var):
            raise ValueError(f"Please set {var} in .env file.")

    # initialize pinecone if not already initialized
    pinecone.init(
        api_key=os.getenv("PINECONE_API_KEY"),
        environment=os.getenv("PINECONE_ENVIRONMENT"),
    )

    try:
        print("Ingesting documents into Pinecone vectorstore...")
        # # create embeddings
        embeddings = OpenAIEmbeddings(
            model="text-embedding-ada-002", openai_api_key=os.getenv("OPENAI_API_KEY")
        )

        # # ingest documents into pinecone
        if os.getenv("PINECONE_NAMESPACE"):
            Pinecone.from_documents(
                texts,
                embeddings,
                index_name=os.getenv("PINECONE_INDEX_NAME"),
                namespace=os.getenv("PINECONE_NAMESPACE"),
            )
        else:
            Pinecone.from_documents(
                texts,
                embeddings,
                index_name=os.getenv("PINECONE_INDEX_NAME"),
                namespace="",
            )
        print("Documents ingested into Pinecone vectorstore.")
        return True
    except Exception as e:
        print(f"An error occurred whilst ingesting your files: {str(e)}")
        raise e


def load_and_ingest_documents(source_dir: str, ignored_files: List[str] = []):
    loaded_texts = process_documents(source_dir, ignored_files=ignored_files)
    if not loaded_texts:
        print("No texts to ingest")
        return

    # Process the loaded texts using the ingest_docs function
    ingest_docs(loaded_texts)


def load_and_ingest_url(url: str):
    loaded_texts = process_url(url_path=url)
    if not loaded_texts:
        print("No texts to ingest")
        return

    # Process the loaded texts using the ingest_docs function
    ingest_docs(loaded_texts)
