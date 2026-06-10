from typing import Dict, Any
import json

from langchain_openai import ChatOpenAI
from app.core.config import settings

API_KEYS = [
    key.strip()
    for key in settings.NVIDIA_API_KEYS.split(",")
]

def get_llm(api_key: str):

    return ChatOpenAI(
        model=settings.EXTRACTION_MODEL,
        api_key=api_key,
        base_url="https://integrate.api.nvidia.com/v1",
        temperature=0,
        max_tokens=300
    )

DEFAULT_OUTPUT = {
    "DISO": [],
    "ANAT": [],
    "CHEM": [],
    "AGE": None,
    "FRKW": None,
    "DRCN": [],
    "PROC": [],
    "DRTN": None
}

SYSTEM_PROMPT = """
Kamu adalah sistem Named Entity Recognition (NER) dari teks keluhan pasien medis.

TUGAS UTAMA:
Ekstrak entitas dari teks keluhan pengguna ke dalam TEPAT 8 fitur berikut:
1. DISO = keluhan atau gejala inti yang dirasakan pasien (bukan nama penyakit/diagnosis).
2. ANAT = bagian tubuh atau organ yang menjadi lokasi utama keluhan. (misalnya kaki, kepala, tangan)
3. CHEM = kelas obat atau zat aktif yang disebutkan secara eksplisit.
4. AGE  = kelompok umur pasien berdasarkan informasi usia atau konteks yang jelas.
5. FRKW = seberapa sering keluhan terjadi (misalnya sering, kadang, setiap hari).
6. DRCN = arah, sisi, atau lateralitas keluhan jika disebutkan (misalnya kiri, kanan, atas).
7. PROC = tindakan medis non-obat yang dilakukan atau disarankan (pemeriksaan, tes, prosedur).
8. DRTN = lamanya keluhan berlangsung berdasarkan durasi waktu yang jelas.

ATURAN WAJIB (STRICT):
- HANYA gunakan 8 fitur di atas, jangan menambah atau mengurangi.
- Setiap kata atau frasa HANYA BOLEH muncul di SATU fitur.
- TIDAK BOLEH ada duplikasi kata atau frasa antar fitur.
- Jika satu frasa bisa masuk ke lebih dari satu fitur, pilih fitur PALING RELEVAN.
- Jangan memecah satu frasa ke beberapa fitur.
- Jangan mengarang informasi yang tidak tertulis di teks.
- Jangan melakukan normalisasi, koreksi ejaan, atau penyamaan istilah.
- Jika tidak ada entitas untuk suatu fitur, kembalikan nilai kosong sesuai tipe.

- Untuk fitur AGE, FRKW, dan DRTN, HANYA boleh mengembalikan SATU nilai.
- Jika terdapat lebih dari satu kandidat dalam teks:
  - Pilih nilai yang PALING RELEVAN dengan kondisi keluhan saat ini.
  - Abaikan kandidat lainnya.

ATURAN FORMAT OUTPUT:
- Output HARUS berupa JSON VALID.
- Tanpa Markdown, tanpa backticks, tanpa penjelasan tambahan.
- Struktur JSON HARUS PERSIS seperti berikut.

FORMAT OUTPUT JSON:
{
  "DISO": [],
  "ANAT": [],
  "CHEM": [],
  "AGE": null,
  "FRKW": null,
  "DRCN": [],
  "PROC": [],
  "DRTN": null
}
""".strip()

def _extract_json(raw_text: str) -> dict:

    raw = raw_text.strip()

    try:
        return json.loads(raw)

    except json.JSONDecodeError:
        pass

    if "```" in raw:

        parts = raw.split("```")

        for part in parts:

            part = part.strip()

            if part.startswith("{") and part.endswith("}"):

                try:
                    return json.loads(part)

                except json.JSONDecodeError:
                    continue

    start = raw.find("{")
    end = raw.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = raw[start:end + 1]

        try:
            return json.loads(candidate)

        except json.JSONDecodeError:
            pass

    return DEFAULT_OUTPUT.copy()


def extract_features(teks_keluhan: str) -> Dict[str, Any]:

    last_error = None

    for api_key in API_KEYS:

        try:

            llm = get_llm(api_key)

            response = llm.invoke([
                ("system", SYSTEM_PROMPT),
                ("human", f"Teks keluhan pasien:\n{teks_keluhan}")
            ])

            raw_text = response.content

            data = _extract_json(raw_text)

            return {
                "DISO": data.get("DISO", []),
                "ANAT": data.get("ANAT", []),
                "CHEM": data.get("CHEM", []),
                "AGE": data.get("AGE"),
                "FRKW": data.get("FRKW"),
                "DRCN": data.get("DRCN", []),
                "PROC": data.get("PROC", []),
                "DRTN": data.get("DRTN"),
            }

        except Exception as e:

            print(f"[NER API ERROR] API key gagal: {e}")

            last_error = e

    print(f"[NER API ERROR] Semua API key gagal: {last_error}")

    return DEFAULT_OUTPUT.copy()