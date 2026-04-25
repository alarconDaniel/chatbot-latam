import json
import re
from pathlib import Path
from bs4 import BeautifulSoup

ROOT = Path("/home/labewbew/Documentos/chatbot-latam/knowledge_base/raw/mirror")
OUT = Path("/home/labewbew/Documentos/chatbot-latam/knowledge_base/processed/corpus_from_httrack.jsonl")

SKIP_PATTERNS = [
    "login", "logout", "admin", "wp-admin", "wp-login",
    "/user/", "/my/", "/calendar/", "/grade/", "sesskey"
]

def clean_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def guess_country(path: Path) -> str:
    p = str(path).lower()

    if "countries/colombia" in p or "colombiacomparte" in p:
        return "co"
    if "countries/ecuador" in p or "ecuadorcomparte" in p:
        return "ec"
    if "countries/chile" in p or "chilecomparte" in p:
        return "cl"
    if "countries/argentina" in p or "argentinacomparte" in p:
        return "ar"

    return "latam"

def should_skip(path: Path) -> bool:
    p = str(path).lower()
    return any(pattern in p for pattern in SKIP_PATTERNS)

records = []

for html_file in ROOT.rglob("*"):
    if html_file.suffix.lower() not in [".html", ".htm"]:
        continue

    if should_skip(html_file):
        continue

    try:
        raw = html_file.read_text(encoding="utf-8", errors="ignore")
    except Exception:
        continue

    soup = BeautifulSoup(raw, "lxml")

    for tag in soup(["script", "style", "noscript", "svg", "form"]):
        tag.decompose()

    title = clean_text(soup.title.get_text(" ")) if soup.title else html_file.stem

    headings = []
    for h in soup.find_all(["h1", "h2", "h3"]):
        t = clean_text(h.get_text(" "))
        if t:
            headings.append(t)

    text = clean_text(soup.get_text(" "))

    if len(text) < 120:
        continue

    records.append({
        "title": title,
        "headings": headings[:10],
        "text": text,
        "country": guess_country(html_file),
        "source_file": str(html_file),
        "source_type": "public_website_httrack"
    })

OUT.parent.mkdir(parents=True, exist_ok=True)

with OUT.open("w", encoding="utf-8") as f:
    for r in records:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

print(f"OK: {len(records)} documentos extraídos")
print(f"Salida: {OUT}")
