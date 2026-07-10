"""
Resumable PDF Parser - Standalone, College, and University.
Saves progress so server restarts don't lose work.
"""
import pdfplumber
import json
import os
import re
import time

BASE_DIR = r"C:\Users\aasim\.gemini\antigravity\scratch\StudyQuest\backend"
STANDALONE_PDF = os.path.join(BASE_DIR, "Standalone-ALL STANDALONE.pdf")
COLLEGE_PDF = os.path.join(BASE_DIR, "College-ALL COLLEGE.pdf")
UNIVERSITY_PDF = os.path.join(BASE_DIR, "University.pdf")
OUTPUT_FILE = os.path.join(BASE_DIR, "universities.json")
PROGRESS_FILE = os.path.join(BASE_DIR, "parse_progress.json")

def clean_text(val):
    if val is None:
        return ""
    return re.sub(r'\s+', ' ', str(val).replace('\n', ' ')).strip()

def clean_name(raw_name):
    raw_name = clean_text(raw_name)
    return re.sub(r'^\d+-\s*', '', raw_name) or raw_name

def is_header_or_empty(row):
    if not row or all(cell is None or str(cell).strip() == '' for cell in row):
        return True
    first = clean_text(row[0]) if row[0] else ''
    if 'Aishe' in first or 'aishe' in first.lower():
        return True
    return False

def parse_standalone_row(row):
    if len(row) < 6:
        return None
    code = clean_text(row[0]).replace(' ', '')
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    if not code or not name or not state:
        return None
    return {
        "id": code, "name": name, "state": state, "district": district,
        "website": "", "institution_type": "Standalone",
        "college_type": clean_text(row[6]) if len(row) > 6 else "",
        "management": clean_text(row[7]) if len(row) > 7 else "",
    }

def parse_college_row(row):
    if len(row) < 8:
        return None
    code = clean_text(row[0]).replace(' ', '')
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    if not code or not name or not state:
        return None
    return {
        "id": code, "name": name, "state": state, "district": district,
        "website": clean_text(row[4]) if len(row) > 4 and clean_text(row[4]) != '-' else "",
        "institution_type": "College",
        "college_type": clean_text(row[7]) if len(row) > 7 else "",
        "management": clean_text(row[8]) if len(row) > 8 else "",
        "university": clean_text(row[10]) if len(row) > 10 else "",
    }

def parse_university_row(row):
    if len(row) < 7:
        return None
    code = clean_text(row[0]).replace(' ', '')
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    if not code or not name or not state:
        return None
    return {
        "id": code, "name": name, "state": state, "district": district,
        "website": clean_text(row[4]) if len(row) > 4 and clean_text(row[4]) != '-' else "",
        "institution_type": "University",
        "college_type": "",
        "management": "",
        "university": name,
    }

def process_pdf(pdf_path, parse_fn, label, start_page=0):
    institutions = []
    t0 = time.time()
    print(f"\n{'='*50}")
    print(f"Processing: {label} (from page {start_page})")
    
    with pdfplumber.open(pdf_path) as pdf:
        total = len(pdf.pages)
        print(f"Total pages: {total}")
        for i in range(start_page, total):
            if (i+1) % 100 == 0:
                elapsed = time.time() - t0
                rate = (i - start_page + 1) / elapsed if elapsed > 0 else 0
                print(f"  Page {i+1}/{total} | {len(institutions)} entries | {rate:.1f} pg/s")
                # Intermediary progress save could be added here if needed
            try:
                tables = pdf.pages[i].extract_tables()
                if not tables:
                    continue
                for table in tables:
                    for row in table:
                        if is_header_or_empty(row):
                            continue
                        entry = parse_fn(row)
                        if entry:
                            institutions.append(entry)
            except Exception as e:
                print(f"  [WARN] Page {i+1}: {e}")
    
    print(f"Done: {len(institutions)} entries in {time.time()-t0:.1f}s")
    return institutions

def main():
    all_inst = []

    # Check if we have partial progress
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            progress = json.load(f)
        print(f"Resuming from progress: {progress}")
    else:
        progress = {"standalone_done": False, "college_done": False, "university_done": False}

    # Helper to load existing institutions
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            all_inst = json.load(f)
        print(f"Loaded {len(all_inst)} existing institutions")

    # Step 1: Standalone (small, fast)
    if not progress.get("standalone_done"):
        standalone = process_pdf(STANDALONE_PDF, parse_standalone_row, "Standalone")
        all_inst.extend(standalone)
        # Save intermediate
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_inst, f, ensure_ascii=False)
        progress["standalone_done"] = True
        progress["standalone_count"] = len(standalone)
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress, f)
        print(f"\nSaved {len(standalone)} standalone institutions to universities.json")

    # Step 2: University (fast, only 2MB)
    if not progress.get("university_done"):
        universities = process_pdf(UNIVERSITY_PDF, parse_university_row, "University")
        all_inst.extend(universities)
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_inst, f, ensure_ascii=False)
        progress["university_done"] = True
        progress["university_count"] = len(universities)
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress, f)
        print(f"\nSaved {len(universities)} universities to universities.json")

    # Step 3: College (large, 186MB)
    if not progress.get("college_done"):
        colleges = process_pdf(COLLEGE_PDF, parse_college_row, "College")
        all_inst.extend(colleges)
        
        # Deduplicate by id
        seen = set()
        unique = []
        for inst in all_inst:
            if inst["id"] not in seen:
                seen.add(inst["id"])
                unique.append(inst)
        all_inst = unique

        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(all_inst, f, ensure_ascii=False)
        progress["college_done"] = True
        progress["college_count"] = len(colleges)
        progress["total"] = len(all_inst)
        with open(PROGRESS_FILE, 'w') as f:
            json.dump(progress, f)

    # Summary
    print(f"\n{'='*50}")
    print(f"FINAL: {len(all_inst)} total institutions saved")
    size = os.path.getsize(OUTPUT_FILE) / (1024*1024)
    print(f"File size: {size:.2f} MB")

if __name__ == "__main__":
    main()
