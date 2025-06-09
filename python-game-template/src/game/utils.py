def generate_random_number(min_value, max_value):
    import random
    return random.randint(min_value, max_value)

def load_game_data(file_path):
    import json
    with open(file_path, 'r') as file:
        return json.load(file)

def save_game_data(file_path, data):
    import json
    with open(file_path, 'w') as file:
        json.dump(data, file)

def format_score(score):
    return f"Score: {score}"