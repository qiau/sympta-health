import re
from typing import Optional

DAY_UNITS = {"hari", "hri", "hr", "h"}
WEEK_UNITS = {"minggu", "mingu", "migu", "mgg", "min", "mg", "m"}
MONTH_UNITS = {"bulan", "buln", "bln", "bl", "b"}
YEAR_UNITS = {"tahun", "taun", "tahn", "thun", "thn", "th", "t"}

DAY_PATTERN = "|".join(DAY_UNITS)
WEEK_PATTERN = "|".join(WEEK_UNITS)
MONTH_PATTERN = "|".join(MONTH_UNITS)
YEAR_PATTERN = "|".join(YEAR_UNITS)

FRKW_UNIT_PATTERN = f"{DAY_PATTERN}|{WEEK_PATTERN}|{MONTH_PATTERN}|{YEAR_PATTERN}"

FRKW_CATEGORY = {
   "jarang": {
        "baru sekali", "sekali", "hanya sekali", "pertama kali", "jarang","seminggu sekali","sebulan sekali", "setahun sekali"
    },
    "kadang": {
        "kadang", "kadang-kadang", "kadang2", "terkadang",
        "tidak selalu", "hilang timbul"
    },
    "sering": {
        "sering", "bolak-balik", "kambuh terus",
        "setiap hari", "tiap hari",
        "setiap pagi", "setiap malam",
        "hampir setiap hari","sehari sekali"
    }
}

def parse_frequency_to_category(text: str) -> Optional[str]:
    if not text:
        return None

    m1 = re.match(
        rf"(\d+)\s*(?:x|kali)?\s*(?:per|se)?\s*(?:-)?\s*({FRKW_UNIT_PATTERN})",
        text
    )
    m2 = re.match( 
        rf"(?:per|se)?\s*(?:-)?\s*({FRKW_UNIT_PATTERN})\s*(\d+)\s*(?:x|kali)?",
        text
    )
      
    if m1:
        number = int(m1.group(1))
        unit = m1.group(2)
    elif m2:
        number = int(m2.group(2))
        unit = m2.group(1)
    else:
        number = None
        unit = None

    if number is not None and unit is not None:
        if unit in DAY_UNITS:
            freq_per_week = number * 7
        elif unit in WEEK_UNITS:
            freq_per_week = number
        elif unit in MONTH_UNITS:
            freq_per_week = number / 4
        elif unit in YEAR_UNITS:
            freq_per_week = number / 52
        else:
            freq_per_week = None
        if freq_per_week is not None:
            return weekly_freq_to_category(freq_per_week)

    for category, examples in FRKW_CATEGORY.items():
        if text in examples:
            return category

    return None

def weekly_freq_to_category(freq_per_week: float) -> str:
    if freq_per_week <= 1:
        return "jarang"
    elif freq_per_week <= 3:
        return "kadang"
    else:
        return "sering"