import zipfile
from xml.etree import ElementTree as ET

path = r'c:\Users\ansab\Downloads\AquaVista_PoC_PRD (1).docx'
with zipfile.ZipFile(path) as z:
    xml = z.read('word/document.xml')
root = ET.fromstring(xml)
texts = []
for p in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
    para_text = ''.join(t.text or '' for t in p.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'))
    if para_text.strip():
        texts.append(para_text)

with open(r'c:\Users\ansab\OneDrive\Desktop\gogo-next-mui-admin\prd.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(texts))

print(f'Extracted {len(texts)} paragraphs to prd.txt')
