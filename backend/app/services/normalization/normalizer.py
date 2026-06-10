import json
import os
from typing import Dict, List, Optional

from .utils.frkw_parser import parse_frequency_to_category
from .utils.age_parser import parse_age_to_category
from .utils.drtn_parser import parse_duration_to_category

class MedicalNormalizer:
    MULTI_LABEL_FIELDS = {"DISO", "ANAT", "CHEM", "DRCN", "PROC"}
    SINGLE_LABEL_FIELDS = {"AGE", "FRKW", "DRTN"}

    def __init__(self, dict_dir: str):
        self.dictionaries = self._load_dictionaries(dict_dir)

    def normalize(self, ner_output: Dict) -> Dict:
        normalized = {}

        for field, value in ner_output.items():
            if field in self.MULTI_LABEL_FIELDS:
                normalized[field] = self._normalize_multi(field, value)
            elif field in self.SINGLE_LABEL_FIELDS:
                normalized[field] = self._normalize_single(field, value)
            else:
                normalized[field] = value

        return normalized

    def _normalize_multi(self, field: str, values: List[str]) -> List[str]:
        if not values:
            return []

        dictionary = self.dictionaries.get(field, {})
        normalized = []

        for v in values:
            key = v.lower().strip()
            if key in dictionary:
                normalized.append(dictionary[key])

        return list(dict.fromkeys(normalized))

    def _normalize_single(self, field: str, value: Optional[str]) -> str:
        if not value:
            return "unknown"
        
        value = value.lower().strip()

        if field == "AGE":
            return parse_age_to_category(value) or "unknown"
        elif field == "DRTN":
            return parse_duration_to_category(value) or "unknown"
        elif field == "FRKW":
            return parse_frequency_to_category(value) or "unknown"
        else:
            return "unknown"

    def _invert_dictionary(self, raw_dict: Dict[str, List[str]]) -> Dict[str, str]:
        inverted = {}
        for label, synonyms in raw_dict.items():
            for s in synonyms:
                inverted[s.lower().strip()] = label
        return inverted

    def _load_dictionaries(self, dict_dir: str) -> Dict[str, Dict]:
        dictionaries = {}

        for filename in os.listdir(dict_dir):
            if not filename.endswith(".json"):
                continue

            field = filename.replace(".json", "").upper()
            path = os.path.join(dict_dir, filename)

            with open(path, "r", encoding="utf-8") as f:
                raw_dict = json.load(f)
                dictionaries[field] = self._invert_dictionary(raw_dict)

        return dictionaries

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_DEFAULT_DICT_DIR = os.path.join(_BASE_DIR, "dictionaries")

_default_normalizer = MedicalNormalizer(_DEFAULT_DICT_DIR)

def normalize_extraction(ner_output: Dict) -> Dict:
    return _default_normalizer.normalize(ner_output)