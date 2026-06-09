from langchain_chroma import Chroma
from app.services.rag.retrieval import get_retriever
from app.services.rag.embedding import get_embeddings
from app.services.rag.llm import get_llm


def build_prompt(query: str, context: str) -> str:
    return f"""
    Kamu adalah asisten medis.

    Gunakan informasi berikut untuk menjawab pertanyaan pasien.

    Informasi:
    {context}

    Pertanyaan Pasien:
    {query}

    Instruksi:
    - Ambil inti jawaban dari informasi yang tersedia.
    - Abaikan kata sapaan seperti "halo dok", "alodokter", atau kalimat tidak penting lainnya.
    - Gunakan bahasa formal, rapi, dan mudah dipahami seperti tulisan informatif.
    - Jangan menggunakan simbol markdown seperti *, **, atau tanda bullet (-).
    - Jika perlu membuat daftar, gunakan format kalimat bernomor (1., 2., 3.).
    - Tulis jawaban dengan struktur yang jelas dan enak dibaca.

    Jawaban:
    """


def run_rag(query: str, penyakit: str, dataset_dir: str):
    chroma_path = f"{dataset_dir}/chroma"

    try:
        db = Chroma(
            persist_directory=chroma_path,
            embedding_function=get_embeddings()
        )

        retriever = get_retriever(db, penyakit, k=1)

        docs = retriever.invoke(query)

        if not docs:
            return "Maaf, data tidak ditemukan."

        context = "\n\n---\n\n".join([
            f"Pertanyaan: {d.page_content}\nJawaban: {d.metadata['answer']}"
            for d in docs
        ])

        prompt = build_prompt(query, context)

        llm = get_llm()
        answer = llm.invoke(prompt)

        return answer

    except Exception as e:
        print(f"[RAG ERROR] {e}")
        return "Terjadi kesalahan saat memproses pertanyaan."