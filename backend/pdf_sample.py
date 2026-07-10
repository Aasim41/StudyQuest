"""Sample a few pages from each PDF to understand the structure."""
import subprocess
import sys

# Install pdfplumber if not available
try:
    import pdfplumber
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pdfplumber", "-q"])
    import pdfplumber

import os

BASE = r"C:\Users\aasim\.gemini\antigravity\scratch\StudyQuest\backend"

# Sample from College PDF
print("=" * 80)
print("COLLEGE PDF - First 5 pages")
print("=" * 80)
with pdfplumber.open(os.path.join(BASE, "College-ALL COLLEGE.pdf")) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i in range(min(5, len(pdf.pages))):
        page = pdf.pages[i]
        text = page.extract_text()
        print(f"\n--- Page {i+1} ---")
        if text:
            print(text[:2000])
        else:
            print("[No text extracted]")
        
        # Also check tables
        tables = page.extract_tables()
        if tables:
            print(f"\n  [Tables found: {len(tables)}]")
            for ti, table in enumerate(tables):
                print(f"  Table {ti}: {len(table)} rows")
                for row in table[:5]:
                    print(f"    {row}")

print("\n\n")
print("=" * 80)
print("STANDALONE PDF - First 5 pages")
print("=" * 80)
with pdfplumber.open(os.path.join(BASE, "Standalone-ALL STANDALONE.pdf")) as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    for i in range(min(5, len(pdf.pages))):
        page = pdf.pages[i]
        text = page.extract_text()
        print(f"\n--- Page {i+1} ---")
        if text:
            print(text[:2000])
        else:
            print("[No text extracted]")
        
        tables = page.extract_tables()
        if tables:
            print(f"\n  [Tables found: {len(tables)}]")
            for ti, table in enumerate(tables):
                print(f"  Table {ti}: {len(table)} rows")
                for row in table[:5]:
                    print(f"    {row}")
