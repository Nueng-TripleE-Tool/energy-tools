#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pack_book.py — เครื่องมือแปลงเอกสาร Word/PDF เป็นหนังสือสำหรับ E-Book Reader
                ของเว็บ Energy Engineering Tools (Triple E Technology)

วิธีใช้
-------
    python pack_book.py <ไฟล์ต้นฉบับ.pdf|.docx> --slug boiler-tuning \
           --title "คู่มือการปรับแต่งการเผาไหม้" \
           --subtitle "Solid Fuel Combustion Tuning Manual" \
           --author "อ.หนึ่ง กลับทวี" \
           --category thermal

ผลลัพธ์ที่ได้ (ในโฟลเดอร์ books/<slug>/)
    book.eeb    ไฟล์หนังสือที่ผ่านการเข้ารหัสแบบ obfuscate แล้ว (เปิดตรง ๆ ไม่ได้)
    book.json   ข้อมูลหนังสือ (ชื่อ ผู้แต่ง จำนวนหน้า สารบัญ)
    cover.webp  ภาพปกที่ตัดมาจากหน้าแรก

ข้อกำหนดเบื้องต้น
    - .docx  ต้องมี libreoffice ติดตั้งอยู่ (แปลงเป็น PDF อัตโนมัติ)
    - cover  ต้องมี pdftoppm (poppler-utils) หรือ PyMuPDF
"""

import argparse, json, os, re, shutil, subprocess, sys, tempfile
from pathlib import Path

MAGIC   = b"EEB1"
VERSION = 1
SALT    = "TripleE-EnergyTools-EBook-v1"


# ─────────────────────────── keystream (ต้องตรงกับฝั่ง JS ใน reader.html) ───────────────────────────
def fnv1a32(s: str) -> int:
    h = 0x811C9DC5
    for ch in s.encode("utf-8"):
        h ^= ch
        h = (h * 0x01000193) & 0xFFFFFFFF
    return h


def keystream(seed: int, n: int) -> bytearray:
    s = seed & 0xFFFFFFFF
    out = bytearray(n)
    for i in range(n):
        s = (s * 1664525 + 1013904223) & 0xFFFFFFFF
        out[i] = (s >> 24) & 0xFF
    return out


def pack(pdf_bytes: bytes, slug: str) -> bytes:
    seed = fnv1a32(slug + "|" + SALT)
    ks   = keystream(seed, len(pdf_bytes))
    body = bytes(b ^ k for b, k in zip(pdf_bytes, ks))
    head = MAGIC + bytes([VERSION]) + len(pdf_bytes).to_bytes(4, "little")
    return head + body


# ─────────────────────────── helpers ───────────────────────────
def docx_to_pdf(src: Path, workdir: Path) -> Path:
    soffice = shutil.which("soffice") or shutil.which("libreoffice")
    if not soffice:
        sys.exit("ไม่พบ libreoffice — กรุณาแปลงไฟล์ Word เป็น PDF ก่อน แล้วส่ง PDF เข้ามาแทน")
    subprocess.run(
        [soffice, "--headless", "--convert-to", "pdf", "--outdir", str(workdir), str(src)],
        check=True, capture_output=True,
    )
    out = workdir / (src.stem + ".pdf")
    if not out.exists():
        sys.exit("แปลง Word เป็น PDF ไม่สำเร็จ")
    return out


def pdf_page_count(pdf: Path) -> int:
    try:
        info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
        m = re.search(r"Pages:\s+(\d+)", info)
        if m:
            return int(m.group(1))
    except FileNotFoundError:
        pass
    try:
        import fitz  # PyMuPDF
        return fitz.open(str(pdf)).page_count
    except Exception:
        return 0


def pdf_outline(pdf: Path):
    """ดึงสารบัญ (bookmark) จาก PDF ถ้ามี"""
    try:
        import fitz
        doc = fitz.open(str(pdf))
        return [{"title": t.strip(), "page": p, "level": lv}
                for lv, t, p in doc.get_toc() if p > 0][:800]
    except Exception:
        return []


def build_search_index(pdf: Path, dest: Path, pages: int):
    """สร้าง search.json (ข้อความรายหน้า) เพื่อให้การค้นหาในเล่มหนาเป็นแบบทันที
       ไม่ต้องให้เบราว์เซอร์สแกน PDF ทีละหน้าตอนผู้ใช้ค้นหา"""
    import re as _re
    if not shutil.which("pdftotext"):
        print("  (ข้าม search index: ไม่พบ pdftotext — reader จะค้นสดแทน ซึ่งช้ากับเล่มหนา)")
        return False
    out = {}
    try:
        txt = subprocess.run(["pdftotext", "-enc", "UTF-8", str(pdf), "-"],
                             capture_output=True, text=True, check=True).stdout
        for i, chunk in enumerate(txt.split("\f"), start=1):
            c = _re.sub(r"\s+", " ", chunk).strip()
            if c:
                out[str(i)] = c[:20000]
    except Exception as e:
        print(f"  (ข้าม search index: {e})")
        return False

    payload = {"pages": out, "count": pages}
    dest.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")),
                    encoding="utf-8")
    size = dest.stat().st_size / 1024
    print(f"→ เขียน search.json ({len(out)} หน้า, {size:.0f} KB)")
    return True


def make_cover(pdf: Path, dest: Path):
    tmp = dest.parent / "_cover_tmp"
    try:
        subprocess.run(["pdftoppm", "-png", "-r", "80", "-f", "1", "-l", "1",
                        str(pdf), str(tmp)], check=True, capture_output=True)
        png = next(dest.parent.glob("_cover_tmp*.png"), None)
        if png:
            try:
                from PIL import Image
                Image.open(png).convert("RGB").save(dest, "WEBP", quality=82)
                png.unlink()
                return True
            except ImportError:
                png.rename(dest.with_suffix(".png"))
                return True
    except Exception as e:
        print(f"  (ข้ามการทำปก: {e})")
    return False


# ─────────────────────────── main ───────────────────────────
def main():
    ap = argparse.ArgumentParser(description="แปลงเอกสารเป็น E-Book สำหรับเว็บ Energy Tools")
    ap.add_argument("source", help="ไฟล์ต้นฉบับ .pdf หรือ .docx")
    ap.add_argument("--slug", required=True, help="ชื่อโฟลเดอร์/รหัสหนังสือ (ภาษาอังกฤษ ตัวเล็ก ขีดกลาง)")
    ap.add_argument("--title", required=True, help="ชื่อหนังสือภาษาไทย")
    ap.add_argument("--subtitle", default="", help="ชื่อรอง / ชื่อภาษาอังกฤษ")
    ap.add_argument("--author", default="อ.หนึ่ง กลับทวี", help="ผู้เรียบเรียง")
    ap.add_argument("--category", default="general",
                    help="หมวด: thermal / electrical / ghg / refrig / training / general")
    ap.add_argument("--desc", default="", help="คำอธิบายสั้นสำหรับการ์ดหน้าแรก")
    ap.add_argument("--tags", default="", help="แท็ก คั่นด้วยจุลภาค เช่น 'หม้อไอน้ำ,ASME PTC 4'")
    ap.add_argument("--books-dir", default=str(Path(__file__).resolve().parent.parent),
                    help="โฟลเดอร์ books/ (ค่าเริ่มต้นคือโฟลเดอร์แม่ของสคริปต์นี้)")
    args = ap.parse_args()

    src = Path(args.source).expanduser().resolve()
    if not src.exists():
        sys.exit(f"ไม่พบไฟล์: {src}")

    books_dir = Path(args.books_dir).resolve()
    out_dir   = books_dir / args.slug
    out_dir.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        work = Path(td)
        pdf = docx_to_pdf(src, work) if src.suffix.lower() in (".docx", ".doc") else src
        print(f"→ ต้นฉบับ: {pdf.name}")

        pages = pdf_page_count(pdf)
        toc   = pdf_outline(pdf)
        print(f"→ จำนวนหน้า: {pages}   สารบัญที่ดึงได้: {len(toc)} รายการ")

        raw = pdf.read_bytes()
        (out_dir / "book.eeb").write_bytes(pack(raw, args.slug))
        print(f"→ เขียน book.eeb ({len(raw)/1048576:.2f} MB)")

        has_index = build_search_index(pdf, out_dir / "search.json", pages)
        has_cover = make_cover(pdf, out_dir / "cover.webp")

        if pages > 400:
            mb = len(raw) / 1048576
            print(f"\n  หมายเหตุเล่มหนา ({pages} หน้า / {mb:.1f} MB):")
            print("    - ผู้อ่านต้องดาวน์โหลดไฟล์ทั้งเล่มก่อนเปิดหน้าแรก")
            if mb > 60:
                print("    - ขนาดเกิน 60 MB แนะนำให้แยกเป็นเล่มย่อย (เช่น ภาค 1/ภาค 2)")
            print("    - ถ้าต้นฉบับมีรูปมาก ลองลดความละเอียดรูปก่อน export PDF")

    # เก็บสารบัญที่แก้ด้วยมือไว้ ถ้ารอบนี้ดึง bookmark จาก PDF ไม่ได้
    old_meta_path = out_dir / "book.json"
    if not toc and old_meta_path.exists():
        try:
            old = json.loads(old_meta_path.read_text(encoding="utf-8"))
            if old.get("toc"):
                toc = old["toc"]
                print(f"\u2192 \u0e04\u0e07\u0e2a\u0e32\u0e23\u0e1a\u0e31\u0e0d\u0e40\u0e14\u0e34\u0e21\u0e17\u0e35\u0e48\u0e41\u0e01\u0e49\u0e14\u0e49\u0e27\u0e22\u0e21\u0e37\u0e2d\u0e44\u0e27\u0e49 ({len(toc)} \u0e23\u0e32\u0e22\u0e01\u0e32\u0e23)")
        except Exception:
            pass

    import time as _time
    meta = {
        "slug": args.slug,
        "built": _time.strftime("%Y%m%d-%H%M%S"),   # ใช้เป็นตัวล้างแคชเบราว์เซอร์
        "title": args.title,
        "subtitle": args.subtitle,
        "author": args.author,
        "category": args.category,
        "description": args.desc,
        "tags": [t.strip() for t in args.tags.split(",") if t.strip()],
        "file": "book.eeb",
        "pages": pages,
        "cover": "cover.webp" if has_cover else "",
        "toc": toc,
        "watermark": "Triple E Technology Co., Ltd.",
    }
    (out_dir / "book.json").write_text(
        json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\nเสร็จเรียบร้อย → {out_dir}")
    print(f"เปิดอ่านได้ที่:  books/reader.html?b={args.slug}")
    print("\nขั้นตอนสุดท้าย: เพิ่มการ์ดหนังสือในกลุ่ม Knowledge Library ของ index.html")
    print("               พร้อมเพิ่ม key ใน TOOL_KEYS  ->  book_%s: 'Book_%s'"
          % (args.slug.replace('-', '_'), args.slug))


if __name__ == "__main__":
    main()
