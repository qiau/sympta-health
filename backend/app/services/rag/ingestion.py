import os

import pandas as pd
import re
from langchain_core.documents import Document
from langchain_chroma import Chroma
from app.services.rag.embedding import get_embeddings

def clean_text(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text

def process_embedding_pipeline(csv_path: str, dataset_dir: str):
    chroma_dir = os.path.join(dataset_dir, "chroma")
    df = pd.read_csv(csv_path)

    df.columns = [col.lower().strip() for col in df.columns]
    df["label"] = df["label"].str.lower().str.strip()

    docs = []
    for _, row in df.iterrows():
        # content = clean_text(f"{row['question']} {row['answer']}")

        docs.append(
            Document(
                page_content=row["question"],
                metadata={
                    "answer": row["answer"],
                    "label": row["label"]
                }
            )
        )

    Chroma.from_documents(
        documents=docs,
        embedding=get_embeddings(),
        persist_directory=chroma_dir
    )

    return {
        "chroma_path": chroma_dir,
        "total_docs": len(docs),
        "labels": df["label"].unique().tolist()
    }