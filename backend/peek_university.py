import pdfplumber

with pdfplumber.open("University.pdf") as pdf:
    for page in pdf.pages[:2]:
        tables = page.extract_tables()
        if tables:
            for table in tables:
                for row in table[:5]:
                    print(row)
