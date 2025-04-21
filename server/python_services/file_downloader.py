# services/file_downloader.py
import requests
import os

class FileDownloader:
    def __init__(self, download_directory='downloads'):
        self.download_directory = download_directory
        if not os.path.exists(self.download_directory):
            os.makedirs(self.download_directory)

    def download_file(self, file_url):
        local_filename = os.path.join(self.download_directory, file_url.split('/')[-1])
        with requests.get(file_url, stream=True) as r:
            r.raise_for_status()
            with open(local_filename, 'wb') as f:
                for chunk in r.iter_content(chunk_size=8192): 
                    f.write(chunk)
        return local_filename