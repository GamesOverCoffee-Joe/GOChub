import json
import requests
from bs4 import BeautifulSoup

def get_youtube_title(video_link):
    """Fetches the title of a YouTube video from its URL."""
    try:
        response = requests.get(video_link)
        response.raise_for_status()  # Raise an exception for bad status codes
        soup = BeautifulSoup(response.text, 'html.parser')
        title_tag = soup.find('meta', property='og:title')
        if title_tag:
            return title_tag['content']
    except requests.exceptions.RequestException as e:
        print(f"Error fetching {video_link}: {e}")
    return "Title Not Found"

def add_titles_to_json(input_file, output_file):
    """
    Reads a JSON file, fetches YouTube titles for each video link,
    adds a 'source' field with the title, and saves the new JSON to a file.
    """
    try:
        with open(input_file, 'r') as f:
            data = json.load(f)

        for item in data:
            video_link = item.get('videoLink')
            if video_link:
                title = get_youtube_title(video_link)
                item['source'] = title
            else:
                item['source'] = 'No Video Link'

        with open(output_file, 'w') as f:
            json.dump(data, f, indent=2)

        print(f"Successfully added titles to '{output_file}'")

    except FileNotFoundError:
        print(f"Error: The file '{input_file}' was not found.")
    except json.JSONDecodeError:
        print(f"Error: The file '{input_file}' is not a valid JSON file.")

if __name__ == "__main__":
    input_json_file = 'feed_1.9.json'  # Replace with your input file name
    output_json_file = 'feed_1.9_with_titles.json'  # Replace with your desired output file name
    add_titles_to_json(input_json_file, output_json_file)