import json

def add_game_links(file_path):
    """
    Adds an empty 'gameLink' field to each entry in a JSON array.

    Args:
        file_path (str): The path to the input JSON file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        if not isinstance(data, list):
            print("Error: The JSON file does not contain a list of objects.")
            return

        for entry in data:
            if isinstance(entry, dict):
                # Add the 'gameLink' field with an empty string as the default value
                if "gameLink" not in entry:
                    entry["gameLink"] = ""

        new_file_path = "consult_videos_with_links.json"
        with open(new_file_path, 'w', encoding='utf-8') as f:
            # Use an indentation of 4 for a human-readable format
            json.dump(data, f, indent=4)
        
        print(f"Successfully added 'gameLink' field and saved to {new_file_path}")

    except FileNotFoundError:
        print(f"Error: The file at {file_path} was not found.")
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from the file at {file_path}.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")

# Call the function with your JSON file name
add_game_links("consult_videos.json")