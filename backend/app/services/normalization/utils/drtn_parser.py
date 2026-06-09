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

DRTN_UNIT_PATTERN = f"{DAY_PATTERN}|{WEEK_PATTERN}|{MONTH_PATTERN}|{YEAR_PATTERN}"

DRTN_CATEGORY = {
    "akut": {"sehari", "seminggu", "beberapa hari"},
    "subakut": {"delapan hari", "empat minggu","sebulan", "beberapa minggu"},
    "kronis": {"dua bulan", "setahun", "berkelanjutan", "berkepanjangan"}
}

def parse_duration_to_category(text: str) -> Optional[str]:
    if not text:
        return None

    m = re.match(
        rf"\D*(\d+)\s*({DRTN_UNIT_PATTERN})\s*(?:an)?",
        text
    )

    if m:
        number = int(m.group(1))
        unit = m.group(2)

        if unit in DAY_UNITS:
            days = number
        elif unit in WEEK_UNITS:
            days = number * 7
        elif unit in MONTH_UNITS:
            days = number * 30
        elif unit in YEAR_UNITS:
            days = number * 365
        else:
            days = None

        if days is not None:
            return days_to_category(days)

    for category, examples in DRTN_CATEGORY.items():
        if text in examples:
            return category

    return None

def days_to_category(days: int) -> str:
    if days <= 7:
        return "akut"
    elif days <= 30:
        return "subakut"
    else:
        return "kronis"
