import json
with open('eslint_errors.json') as f:
    data = json.load(f)
for file_info in data:
    errors = [m for m in file_info['messages'] if m['severity'] == 2]
    if errors:
        print(file_info['filePath'])
        for m in errors:
            print(f"  {m['line']}:{m['column']} {m['message']}")
