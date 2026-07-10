import json
import re
import os

log_file = r"C:\Users\aasim\.gemini\antigravity\brain\b37c17a4-8a4c-4b1b-824f-c4ad068b4118\.system_generated\logs\transcript.jsonl"

ocr_text = ""
with open(log_file, 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
            if data.get('type') == 'USER_INPUT' and '==Start of OCR for page 1==' in data.get('content', ''):
                ocr_text = data['content']
        except:
            pass

universities = []
lines = ocr_text.split('\n')

states = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", 
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", 
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", 
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
    "Jammu And Kashmir", "Andaman And Nicobar Islands"
]
state_pattern = re.compile(r'\b(' + '|'.join([s.lower() for s in states]) + r')\b', re.IGNORECASE)

for line in lines:
    line = line.strip()
    # Try strict match first
    match = re.match(r'^(U-\d{4})\s+(.+?)\s+((?:http|https|www)[^\s]+|-)\s+(\d{4}|-)\s+(Rural|Urban|[-]?)$', line, re.IGNORECASE)
    if match:
        code = match.group(1)
        rest = match.group(2)
        website = match.group(3)
        year = match.group(4)
        location_type = match.group(5)
        
        state_match = list(state_pattern.finditer(rest))
        if state_match:
            sm = state_match[-1]
            name = rest[:sm.start()].strip()
            state = sm.group(1).title()
            district = rest[sm.end():].strip()
        else:
            name = rest
            state = "Unknown"
            district = "Unknown"
            
        universities.append({
            "id": code,
            "name": name,
            "state": state,
            "district": district,
            "website": website
        })
    else:
        # Fallback for lines that don't perfectly match the end pattern
        if re.match(r'^U-\d{4}', line):
            parts = line.split()
            code = parts[0]
            rest = " ".join(parts[1:])
            # Just extract name and state roughly
            state_match = list(state_pattern.finditer(rest))
            if state_match:
                sm = state_match[-1]
                name = rest[:sm.start()].strip()
                state = sm.group(1).title()
            else:
                name = rest
                state = "Unknown"
            
            universities.append({
                "id": code,
                "name": name,
                "state": state,
                "district": "Unknown",
                "website": ""
            })

out_dir = r"C:\Users\aasim\.gemini\antigravity\scratch\StudyQuest\backend"
os.makedirs(out_dir, exist_ok=True)
with open(os.path.join(out_dir, "universities.json"), "w", encoding="utf-8") as f:
    json.dump(universities, f, indent=2)

print(f"Extracted {len(universities)} universities.")
