import json
import os
import sys

# Reconfigure stdout to use utf-8 to avoid encoding errors on windows terminal
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

files = [
    r"C:\Users\prama\Downloads\Untitled1 (1).ipynb",
    r"C:\Users\prama\Downloads\Untitled1.ipynb",
    r"C:\Users\prama\Downloads\house price prediction\house price prediction\Untitled1.ipynb",
    r"C:\Users\prama\OneDrive\Desktop\House Price prediction\House-Price-Prediction\Untitled1.ipynb"
]

for filepath in files:
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        continue
    print(f"\n=========================================\nFILE: {filepath}\n=========================================")
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            nb = json.load(f)
        for i, cell in enumerate(nb.get('cells', [])):
            if cell.get('cell_type') == 'code':
                source = "".join(cell.get('source', []))
                if 'sample_data' in source or 'model.predict' in source or 'predict(' in source:
                    print(f"--- Cell {i} ---")
                    print(source)
                    print("-" * 20)
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
