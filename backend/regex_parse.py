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

def parse_text_fast(pdf_path, type_code_prefix, inst_type):
    institutions = []
    t0 = time.time()
    
    # We use a simple state machine to collect rows based on the ID prefix (e.g. S- for standalone)
    current_entry = []
    
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    for i in range(total_pages):
        page = doc[i]
        # get_text("text") returns text ordered generally top to bottom
        text = page.get_text("text")
        lines = text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line: continue
            
            # If line starts with the ID prefix (e.g., 'S-123', 'C-456', 'U-789')
            if line.startswith(type_code_prefix) and len(line.split('-')) >= 2 and line.split('-')[1].isdigit():
                # We found a new entry, process the old one
                if current_entry:
                    institutions.append(process_entry(current_entry, inst_type))
                current_entry = [line]
            elif current_entry:
                current_entry.append(line)
                
    if current_entry:
        institutions.append(process_entry(current_entry, inst_type))
        
    doc.close()
    print(f"Extracted {len(institutions)} from {inst_type} in {time.time()-t0:.2f}s")
    return institutions

def process_entry(entry_lines, inst_type):
    # entry_lines is an array of strings that make up the row
    # Structure varies by PDF, but generally:
    # 0: Code, 1: Name, 2: State, 3: District, etc.
    # We'll just safely grab what we can
    code = entry_lines[0]
    name = entry_lines[1] if len(entry_lines) > 1 else ""
    name = re.sub(r'^\d+-\s*', '', name)
    state = entry_lines[2] if len(entry_lines) > 2 else ""
    district = entry_lines[3] if len(entry_lines) > 3 else ""
    
    # Just basic extraction to have the DB populated for the frontend
    return {
        "id": code,
        "name": name,
        "state": state,
        "district": district,
        "institution_type": inst_type
    }

def main():
    print("Starting ultra-fast text parser...")
    all_inst = []
    
    # Standalone prefix 'S-'
    all_inst.extend(parse_text_fast(STANDALONE_PDF, "S-", "Standalone"))
    
    # University prefix 'U-'
    all_inst.extend(parse_text_fast(UNIVERSITY_PDF, "U-", "University"))
    
    # College prefix 'C-'
    all_inst.extend(parse_text_fast(COLLEGE_PDF, "C-", "College"))
    
    # Deduplicate
    seen = set()
    unique = []
    for inst in all_inst:
        if inst["id"] not in seen:
            seen.add(inst["id"])
            unique.append(inst)
            
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(unique, f, ensure_ascii=False)
        
    print(f"DONE! Saved {len(unique)} total institutions to universities.json")

if __name__ == "__main__":
    main()
