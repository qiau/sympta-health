def get_retriever(db, penyakit: str, k: int):
    return db.as_retriever(
        search_kwargs = {
            "k": k,
            "filter": {"label": penyakit} 
        }
    )