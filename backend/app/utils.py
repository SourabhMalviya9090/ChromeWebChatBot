from urllib.parse import urlparse, unquote
import os

# Function for extracting file path for pdf
def file_url_to_path(file_url: str) -> str:
    parsed = urlparse(file_url)
    path = unquote(parsed.path)  # Converts %20 to spaces, etc
    return path[1:] if os.name == 'nt' else path

# Function for processing the output in chatMessage format
def parse_chatMessage_output(response):
    output = response.content
    return output