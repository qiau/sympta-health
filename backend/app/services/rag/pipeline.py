from langchain_chroma import Chroma
from app.services.rag.retrieval import get_retriever
from app.services.rag.embedding import get_embeddings
from app.services.rag.llm import invoke_llm

SYSTEM_PROMPT = """
Kamu adalah asisten medis yang memberikan jawaban informatif dan mudah dipahami.

Instruksi:
- Ambil inti jawaban dari informasi yang tersedia.
- Abaikan kata sapaan seperti "halo dok", "alodokter", atau kalimat tidak penting lainnya.
- Jangan menuliskan label seperti "Pertanyaan:", "Jawaban:", atau "Pertanyaan Pasien:".
- Gunakan bahasa formal, rapi, dan mudah dipahami seperti tulisan informatif.
- Jangan mengarang informasi medis yang tidak terdapat pada referensi.
- Utamakan informasi dari referensi yang diberikan.

ATURAN FORMAT:
- DILARANG menggunakan bullet seperti "-", "*", atau markdown lainnya.
- Jika membuat daftar, WAJIB menggunakan format nomor.
- Gunakan format:
  1.
  2.
  3.

Contoh format yang benar:
1. Istirahat yang cukup.
2. Konsumsi makanan bergizi.
3. Periksa ke dokter bila keluhan memburuk.

Tulis jawaban dengan struktur yang jelas dan enak dibaca.
""".strip()

def build_messages(query: str, context: str):

    human_prompt = f"""
    Gunakan referensi berikut untuk membantu menjawab pertanyaan pasien.

    Referensi hanya digunakan sebagai sumber informasi.
    Jangan menyalin format referensi ke jawaban akhir.

    === REFERENSI ===
    {context}

    === PERTANYAAN PASIEN ===
    {query}
    """

    return [
        ("system", SYSTEM_PROMPT),
        ("human", human_prompt)
    ]

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
            f"""
            Referensi Pertanyaan:
            {d.page_content}

            Referensi Jawaban:
            {d.metadata['answer']}
            """
            for d in docs
        ])

        messages = build_messages(query, context)
        answer = invoke_llm(messages)

        if hasattr(answer, "content"):
            return answer.content

        return str(answer)

    except Exception as e:
        print(f"[RAG ERROR] {e}")
        return "Terjadi kesalahan saat memproses pertanyaan."