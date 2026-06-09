from concurrent.futures import ThreadPoolExecutor
from flair.models import SequenceTagger
from flair.data import Sentence
from Sastrawi.Stemmer.StemmerFactory import StemmerFactory
import re

executor = ThreadPoolExecutor(max_workers=8)

factory = StemmerFactory()
stemmer = factory.create_stemmer()

model_anat = None
model_proc = None
model_age = None
model_diso = None
model_chem = None
model_drtn = None
model_frkw = None
model_drcn = None

def load_ner_models():
    global model_anat, model_proc, model_age, model_diso, model_chem, model_drtn, model_frkw, model_drcn

    print("Loading ANAT model...")
    model_anat = SequenceTagger.load("./ner_models/anat/final-model.pt")

    print("Loading PROC model...")
    model_proc = SequenceTagger.load("./ner_models/proc/final-model.pt")

    print("Loading AGE model...")
    model_age = SequenceTagger.load("./ner_models/age/final-model.pt")

    print("Loading DISO model...")
    model_diso = SequenceTagger.load("./ner_models/diso/final-model.pt")
    
    print("Loading CHEM model...")
    model_chem = SequenceTagger.load("./ner_models/chem/final-model.pt")

    print("Loading DRTN model...")
    model_drtn = SequenceTagger.load("./ner_models/drtn/final-model.pt")

    print("Loading FRKW model...")
    model_frkw = SequenceTagger.load("./ner_models/frkw/final-model.pt")

    print("Loading DRCN model...")
    model_drcn = SequenceTagger.load("./ner_models/drcn/final-model.pt")

    print("All NER models loaded successfully!")

def normalize_text_light(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    return text


def stem_indonesian(text: str) -> str:
    return stemmer.stem(text)


def run_model(model, text: str) -> Sentence:
    sentence = Sentence(text)
    model.predict(sentence)
    return sentence

def extract_features(text: str):
    text = normalize_text_light(text)

    futures = [
        executor.submit(run_model, model_anat, text),
        executor.submit(run_model, model_proc, text),
        executor.submit(run_model, model_age, text),
        executor.submit(run_model, model_diso, text),
        executor.submit(run_model, model_chem, text),
        executor.submit(run_model, model_drtn, text),
        executor.submit(run_model, model_frkw, text),
        executor.submit(run_model, model_drcn, text),
    ]

    merged = []

    for future in futures:
        sentence = future.result()
        for ent in sentence.get_spans("ner"):
            merged.append({
                "text": ent.text,
                "label": ent.tag,
                "start_pos": ent.start_position,
                "end_pos": ent.end_position,
                "stem": stem_indonesian(ent.text),
            })

    merged = sorted(merged, key=lambda x: x["start_pos"])

    return merged