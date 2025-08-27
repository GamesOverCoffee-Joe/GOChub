import json

def update_categories(original_file, target_file, output_file):
    """
    Replaces the 'category' fields in the target JSON file with the correct
    values from the original JSON file.

    Args:
        original_file (str): The path to the source JSON file with correct categories.
        target_file (str): The path to the JSON file to be updated.
        output_file (str): The path to the new file with updated categories.
    """
    try:
        # Load the original data to create a title-to-category map
        with open(original_file, 'r') as f:
            original_data = json.load(f)

        # Create a dictionary mapping video titles to their correct categories
        title_to_category = {item['title']: item['category'] for item in original_data}

        # Load the target data that needs to be updated
        with open(target_file, 'r') as f:
            target_data = json.load(f)

        # Iterate through the target data and update the category field
        for item in target_data:
            title = item.get('title')
            if title in title_to_category:
                item['category'] = title_to_category[title]
        
        # Write the updated data to a new output file
        with open(output_file, 'w') as f:
            json.dump(target_data, f, indent=4)

        print(f"Successfully updated categories and saved the result to '{output_file}'")

    except FileNotFoundError:
        print("Error: One of the files was not found.")
    except json.JSONDecodeError:
        print("Error: The file is not a valid JSON format.")
    except KeyError:
        print("Error: The 'title' or 'category' key is missing from one of the objects.")
    
# Specify the file paths
original_json = 'consult_videos_original.json'
target_json = 'consult_videos.json'
output_json = 'consult_videos_updated.json'

# Run the update function
update_categories(original_json, target_json, output_json)
