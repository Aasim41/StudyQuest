"""
PDF Parser for StudyQuest - Extracts institution data from AISHE PDFs.
Handles both College and Standalone institution PDFs with different column schemas.
Uses table extraction (not text extraction) for reliability.
"""

import pdfplumber
import json
import os
import re
import sys
import time
from concurrent.futures import ProcessPoolExecutor, as_completed

BASE_DIR = r"C:\Users\aasim\.gemini\antigravity\scratch\StudyQuest\backend"
COLLEGE_PDF = os.path.join(BASE_DIR, "College-ALL COLLEGE.pdf")
STANDALONE_PDF = os.path.join(BASE_DIR, "Standalone-ALL STANDALONE.pdf")
OUTPUT_FILE = os.path.join(BASE_DIR, "universities.json")


def clean_text(val):
    """Clean newline-broken text from PDF table cells."""
    if val is None:
        return ""
    # Replace newlines with spaces, collapse multiple spaces
    cleaned = re.sub(r'\s+', ' ', str(val).replace('\n', ' ')).strip()
    return cleaned


def clean_name(raw_name):
    """Strip the leading numeric code prefix like '100001-' or '061-' from institution names."""
    raw_name = clean_text(raw_name)
    # Remove leading pattern like "100001-" or "061-" or "2548" (some have no dash)
    cleaned = re.sub(r'^\d+-\s*', '', raw_name)
    # If the entire name is the same (no prefix found), return as-is
    return cleaned if cleaned else raw_name


def clean_aishe_code(raw_code):
    """Aishe codes sometimes have newlines breaking them, e.g. 'C-596\\n34' -> 'C-59634'."""
    return clean_text(raw_code).replace(' ', '')


def is_header_or_empty_row(row):
    """Check if a row is a header row or a continuation/empty row."""
    if not row or all(cell is None or str(cell).strip() == '' for cell in row):
        return True
    first_cell = clean_text(row[0]) if row[0] else ''
    # Header rows contain 'Aishe' in the first cell
    if 'Aishe' in first_cell and 'Code' in clean_text(row[1] if len(row) > 1 and row[1] else ''):
        return True
    # Continuation rows from previous page: first cell is empty, but later cells have data
    # These are leftovers from the university name column spanning multiple lines
    if first_cell == '' and (len(row) < 3 or clean_text(row[1]) == ''):
        return True
    return False


def parse_college_row(row):
    """Parse a row from the College PDF.
    Columns: Aishe Code, Name, State, District, Website, Year, Location, College Type, Management, Uni Code, Uni Name, Uni Type
    """
    if len(row) < 8:
        return None
    
    aishe_code = clean_aishe_code(row[0])
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    
    # College PDF has Website at index 4
    website = clean_text(row[4]) if len(row) > 4 else ""
    year = clean_text(row[5]) if len(row) > 5 else ""
    location = clean_text(row[6]) if len(row) > 6 else ""
    college_type = clean_text(row[7]) if len(row) > 7 else ""
    management = clean_text(row[8]) if len(row) > 8 else ""
    university_name = clean_text(row[10]) if len(row) > 10 else ""
    university_type = clean_text(row[11]) if len(row) > 11 else ""

    if not aishe_code or not name or not state:
        return None

    return {
        "aishe_code": aishe_code,
        "name": name,
        "state": state,
        "district": district,
        "website": website if website and website != '-' else "",
        "year_established": year,
        "location": location,
        "institution_type": "College",
        "college_type": college_type,
        "management": management,
        "university": university_name,
        "university_type": university_type,
    }


def parse_standalone_row(row):
    """Parse a row from the Standalone PDF.
    Columns: Aishe Code, Name, State, District, Year, Location, Standalone Type, Management
    """
    if len(row) < 6:
        return None

    aishe_code = clean_aishe_code(row[0])
    name = clean_name(row[1])
    state = clean_text(row[2])
    district = clean_text(row[3])
    year = clean_text(row[4])
    location = clean_text(row[5])
    standalone_type = clean_text(row[6]) if len(row) > 6 else ""
    management = clean_text(row[7]) if len(row) > 7 else ""

    if not aishe_code or not name or not state:
        return None

    return {
        "aishe_code": aishe_code,
        "name": name,
        "state": state,
        "district": district,
        "website": "",
        "year_established": year,
        "location": location,
        "institution_type": "Standalone",
        "college_type": standalone_type,
        "management": management,
        "university": "",
        "university_type": "",
    }


def process_pdf(pdf_path, pdf_type):
    """Process a single PDF and extract all institution entries."""
    institutions = []
    parse_fn = parse_college_row if pdf_type == "College" else parse_standalone_row
    
    print(f"\n{'='*60}")
    print(f"Processing: {os.path.basename(pdf_path)} ({pdf_type})")
    print(f"{'='*60}")
    
    start_time = time.time()
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")
        
        for page_num in range(total_pages):
            page = pdf.pages[page_num]
            
            # Progress every 500 pages
            if (page_num + 1) % 500 == 0 or page_num == 0:
                elapsed = time.time() - start_time
                rate = (page_num + 1) / elapsed if elapsed > 0 else 0
                eta = (total_pages - page_num - 1) / rate if rate > 0 else 0
                print(f"  Page {page_num + 1}/{total_pages} | {len(institutions)} entries | {rate:.1f} pg/s | ETA: {eta:.0f}s")
            
            try:
                tables = page.extract_tables()
                if not tables:
                    continue
                    
                for table in tables:
                    for row in table:
                        if is_header_or_empty_row(row):
                            continue
                        
                        entry = parse_fn(row)
                        if entry:
                            institutions.append(entry)
            except Exception as e:
                print(f"  [WARN] Error on page {page_num + 1}: {e}")
                continue
    
    elapsed = time.time() - start_time
    print(f"\nCompleted {pdf_type}: {len(institutions)} institutions in {elapsed:.1f}s")
    return institutions


def deduplicate(institutions):
    """Deduplicate by aishe_code, keeping the first occurrence."""
    seen = set()
    unique = []
    for inst in institutions:
        code = inst["aishe_code"]
        if code not in seen:
            seen.add(code)
            unique.append(inst)
    return unique


def main():
    all_institutions = []
    
    # Process Standalone first (smaller, faster for validation)
    standalone = process_pdf(STANDALONE_PDF, "Standalone")
    all_institutions.extend(standalone)
    
    # Process College (large)
    colleges = process_pdf(COLLEGE_PDF, "College")
    all_institutions.extend(colleges)
    
    # Deduplicate
    before_dedup = len(all_institutions)
    all_institutions = deduplicate(all_institutions)
    after_dedup = len(all_institutions)
    
    print(f"\n{'='*60}")
    print(f"SUMMARY")
    print(f"{'='*60}")
    print(f"Standalone institutions: {len(standalone)}")
    print(f"College institutions:    {len(colleges)}")
    print(f"Total before dedup:      {before_dedup}")
    print(f"Total after dedup:       {after_dedup}")
    print(f"Duplicates removed:      {before_dedup - after_dedup}")
    
    # Sample some states to verify
    states = {}
    for inst in all_institutions:
        s = inst["state"]
        states[s] = states.get(s, 0) + 1
    
    print(f"\nInstitutions by state (top 15):")
    for state, count in sorted(states.items(), key=lambda x: -x[1])[:15]:
        print(f"  {state}: {count}")
    
    # Write output
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(all_institutions, f, ensure_ascii=False, indent=None)
    
    file_size = os.path.getsize(OUTPUT_FILE) / (1024 * 1024)
    print(f"\nSaved to: {OUTPUT_FILE}")
    print(f"File size: {file_size:.2f} MB")
    print(f"Total institutions: {len(all_institutions)}")


if __name__ == "__main__":
    main()
