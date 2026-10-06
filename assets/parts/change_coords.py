import json
import re

INPUT_FILE = "./data.json"
OUTPUT_FILE = "./output.json"

SHIFT_Y = -2

# Matches M/m followed by an X,Y coordinate
MOVE_RE = re.compile(
    r'([Mm])\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)'
)


def shift_move_y(path):
    def replace(match):
        command = match.group(1)
        x = match.group(2)
        y = float(match.group(3)) + SHIFT_Y

        if y.is_integer():
            y = int(y)

        return f"{command}{x},{y}"

    return MOVE_RE.sub(replace, path)


def process(value):
    if isinstance(value, dict):
        result = {}

        for key, val in value.items():
            if key == "d" and isinstance(val, str):
                result[key] = shift_move_y(val)

            elif key == "modifier" and isinstance(val, list):

                new_modifier = val.copy()

                if new_modifier and isinstance(new_modifier[0], str):
                    new_modifier[0] = shift_move_y(new_modifier[0])

                result[key] = new_modifier

            else:
                result[key] = process(val)

        return result

    elif isinstance(value, list):
        return [process(item) for item in value]

    return value

with open(INPUT_FILE, "r", encoding="utf-8") as f:
    data = json.load(f)

data = process(data)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4, ensure_ascii=False)

print("Done!")
