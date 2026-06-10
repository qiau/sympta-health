import re
from typing import Optional

AGE_MONTH_UNITS = {"bulan", "buln", "bln", "bl", "b"}
AGE_YEAR_UNITS = {"tahun", "taun", "tahn", "thun", "thn", "th", "t", ""}

MONTH_PATTERN = "|".join(AGE_MONTH_UNITS)
YEAR_PATTERN = "|".join(AGE_YEAR_UNITS)
AGE_UNIT_PATTERN = f"{MONTH_PATTERN}|{YEAR_PATTERN}"

AGE_CATEGORY = {
    "bayi_balita": {"seminggu", "sebulan", "setahun","balita", "batita", "anak bayi"},
    "anak": {"anak", "anak-anak", "usia anak"},
    "remaja": {"remaja", "anak remaja", "usia remaja"},
    "dewasa": {"dewasa", "orang dewasa"},
    "lansia": {"lansia", "orang tua", "usia lanjut"}
}

def parse_age_to_category(text: str) -> Optional[str]:
    if not text:
        return None

    m = re.match(
        rf"\D*(\d+)\s*({AGE_UNIT_PATTERN})\s*(?:an)?",
        text
    )
    
    if m:
        number = int(m.group(1))
        unit = m.group(2)

        if unit in AGE_MONTH_UNITS:
            age_years = number / 12
        elif unit in AGE_YEAR_UNITS:
            age_years = number
        else:
            age_years = None

        if age_years is not None:
            return age_to_category(age_years)

    for category, examples in AGE_CATEGORY.items():
        if text in examples:
            return category

    return None

def age_to_category(age_years: float) -> str:
    if age_years < 5:
        return "bayi_balita"
    elif age_years < 10:
        return "anak"
    elif age_years < 18:
        return "remaja"
    elif age_years < 60:
        return "dewasa"
    else:
        return "lansia"