import fitz  # PyMuPDF
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
    if not val: return ""
    return re.sub(r'\s+', ' ', str(val).replace('\n', ' ')).strip()

def clean_name(raw_name):
    raw_name = clean_text(raw_name)
    return re.sub(r'^\d+-\s*', '', raw_name) or raw_name

def is_header(row):
    if not row or all(not cell for cell in row):
        return True
    first = clean_text(row[0]).lower()
    return 'aishe' in first

def parse_standalone_row(row):
    if len(row) < 6: return None
    code = clean_text(row[0]).replace(' ', '')
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    if not code or not name or not state: return None
    return {
        "id": code, "name": name, "state": state, "district": district,
        "website": "", "institution_type": "Standalone",
        "college_type": clean_text(row[6]) if len(row) > 6 else "",
        "management": clean_text(row[7]) if len(row) > 7 else "",
    }

def parse_college_row(row):
    if len(row) < 8: return None
    code = clean_text(row[0]).replace(' ', '')
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    if not code or not name or not state: return None
    return {
        "id": code, "name": name, "state": state, "district": district,
        "website": clean_text(row[4]) if len(row) > 4 and clean_text(row[4]) != '-' else "",
        "institution_type": "College",
        "college_type": clean_text(row[7]) if len(row) > 7 else "",
        "management": clean_text(row[8]) if len(row) > 8 else "",
        "university": clean_text(row[10]) if len(row) > 10 else "",
    }

def parse_university_row(row):
    if len(row) < 7: return None
    code = clean_text(row[0]).replace(' ', '')
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    if not code or not name or not state: return None
    return {
        "id": code, "name": name, "state": state, "district": district,
        "website": clean_text(row[4]) if len(row) > 4 and clean_text(row[4]) != '-' else "",
        "institution_type": "University",
        "college_type": "", "management": "", "university": name,
    }

def process_pdf_fast(pdf_path, parse_fn, label):
    institutions = []
    t0 = time.time()
    print(f"\\n{'='*50}\\nProcessing: {label}\\n{'='*50}")
    
    doc = fitz.open(pdf_path)
    total = len(doc)
    print(f"Total pages: {total}")
    
    for i in range(total):
        page = doc[i]
        if (i+1) % 500 == 0:
            elapsed = time.time() - t0
            rate = (i + 1) / elapsed if elapsed > 0 else 0
            print(f"  Page {i+1}/{total} | {len(institutions)} entries | {rate:.0f} pg/s")
            
        tables = page.find_tables()
        for table in tables:
            rows = table.extract()
            for row in rows:
                if is_header(row): continue
                entry = parse_fn(row)
                if entry: institutions.append(entry)
                
    doc.close()
    print(f"Done: {len(institutions)} entries in {time.time()-t0:.1f}s")
    return institutions

def main():
    all_inst = []
    progress = {}
    
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r') as f:
            progress = json.load(f)
            
    if os.path.exists(OUTPUT_FILE):
        with open(OUTPUT_FILE, 'r', encoding='utf-8') as f:
            all_inst = json.load(f)

    # 1. Standalone
    if not progress.get("standalone_done"):
        data = process_pdf_fast(STANDALONE_PDF, parse_standalone_row, "Standalone")
        all_inst.extend(data)
        progress["standalone_done"] = True
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f: json.dump(all_inst, f, ensure_ascii=False)
        with open(PROGRESS_FILE, 'w') as f: json.dump(progress, f)
        print(f"Saved {len(data)} Standalone")

    # 2. University
    if not progress.get("university_done"):
        data = process_pdf_fast(UNIVERSITY_PDF, parse_university_row, "University")
        all_inst.extend(data)
        progress["university_done"] = True
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f: json.dump(all_inst, f, ensure_ascii=False)
        with open(PROGRESS_FILE, 'w') as f: json.dump(progress, f)
        print(f"Saved {len(data)} University")

    # 3. College (Deduplicate at the end)
    if not progress.get("college_done"):
        data = process_pdf_fast(COLLEGE_PDF, parse_college_row, "College")
        all_inst.extend(data)
        
        seen = set()
        unique = []
        for inst in all_inst:
            if inst["id"] not in seen:
                seen.add(inst["id"])
                unique.append(inst)
        all_inst = unique
        
        progress["college_done"] = True
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f: json.dump(all_inst, f, ensure_ascii=False)
        with open(PROGRESS_FILE, 'w') as f: json.dump(progress, f)
        print(f"Saved College. Total unique: {len(all_inst)}")

    print("ALL DONE!")

if __name__ == "__main__":
    main()
