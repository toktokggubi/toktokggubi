import os
import requests
import csv
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from urllib.parse import urljoin
from PIL import Image


def get_card_information(driver, imgfile: str, card_num : str):
    outputDir : str = "./card_info"
    if not os.path.exists(outputDir):
        os.makedirs(outputDir)

    fileName : str= "card_info.csv"
    filePath : str = os.path.join(outputDir, fileName)

    baseUrl : str = "https://www.card-gorilla.com/card/detail/"

    try:
        print("WebDriver initiated successfully.")

        print(f"Fetching card information for card number: {card_num}")

        cardUrl = urljoin(baseUrl, card_num)

        driver.get(cardUrl)
        print(f"Loading card detail page from: {cardUrl}")

        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "contentArea")))

        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')

        section = soup.find('section', class_='padding_top')

        if section:
            title = section.find('strong', class_="card")
            cardIssuer = section.find('p', class_="brand")

            # Get list of benefits
            benefits_container = soup.find('article', class_='cmd_con_benefit')
            benefits_item = soup.find_all('dt', style=True)
            benefits_item.pop()

            benefits_list = []
            for item in benefits_item:
                # Find the <i> tag within each <dt>
                i_tag = item.find('i')
                if i_tag:
                    benefits_list.append(i_tag.get_text(strip=True))

            benefits_str = " | ".join(benefits_list)

        with open(filePath, 'a', encoding='utf-8') as f:
            if title:
                title_text = title.get_text(strip=True)
                cardIssuer_text = cardIssuer.get_text(strip=True)


                f.write(f"{imgfile}, {cardIssuer_text}, {title_text}, \"{benefits_str}\"\n")
                print(f"-> Saved card title: {imgfile}, {cardIssuer_text}, {title_text}, \"{benefits_str}\"")           
    except Exception as e:
        print(f"Failed to fetch card information for card number {card_num}: {e}")

    return

def get_images_from_chart_view(base_url, save_directory="./card_images"):
    """
    Crawls a webpage, finds the 'chart_view' div, and downloads all associated images.

    Args:
        base_url (str): The base URL of the website.
        save_directory (str): The directory to save the downloaded images.
    """
    if not os.path.exists(save_directory):
        os.makedirs(save_directory)

    try:
        service = ChromeService(ChromeDriverManager().install())
        driver = webdriver.Chrome(service=service)
        print("WebDriver initiated successfully.")
    except Exception as e:
        print(f"Failed to initiate WebDriver: {e}")
        return

    try:
        driver.get(base_url)
        print(f"Loading webpage from: {base_url}")
        
        # Use an explicit wait to ensure the 'chart_view' div is loaded
        wait = WebDriverWait(driver, 20)
        wait.until(EC.presence_of_element_located((By.CLASS_NAME, "chart_view")))
        print("'chart_view' section loaded successfully.")
        
        page_source = driver.page_source
        soup = BeautifulSoup(page_source, 'html.parser')
        
        # 1. Find the specific 'chart_view' div
        chart_view_div = soup.find('div', class_='chart_view')
        card_num : list = []

        
        if chart_view_div:
            print("Found the 'chart_view' section.")
            
            # 2. Find all <a> tags with href starting with '/card/detail/' within this div
            card_links = chart_view_div.find_all('a', href=lambda href: href and href.startswith('/card/detail/'))
            
            # From the found links, extract card numbers
            for link in card_links:
                href = link.get('href')
                card_number = href.split('/card/detail/')[-1]
                if card_number.isdigit():
                    card_num.append(card_number)


            print(f"Found {len(card_links)} potential card links within 'chart_view'.")

            # Using enumerate to get both the index (for card_num) and the link object
            for i, link in enumerate(card_links):
                img_tag = link.find('img')
                
                if img_tag and 'src' in img_tag.attrs:
                    img_url = urljoin(base_url, img_tag['src'])
                    raw_filename = os.path.basename(img_url)

                    # Skip files with URL-encoded characters in the name
                    if '%' in raw_filename:
                        print(f"Skipping item with encoded filename: {raw_filename}")
                        continue
                    
                    try:
                        print(f"Downloading image from: {img_url}")
                        img_response = requests.get(img_url, stream=True)
                        img_response.raise_for_status()
                        
                        filename = os.path.basename(img_url)
                        file_path = os.path.join(save_directory, filename)
                        
                        with open(file_path, 'wb') as f:
                            for chunk in img_response.iter_content(chunk_size=8192):
                                f.write(chunk)
                        print(f"  -> Saved to: {file_path}")

                        # --- Image Rotation Logic: Horizontal -> Vertical ---
                        with Image.open(file_path) as img:
                            width, height = img.size
                            if width > height: # Check if the image is horizontal
                                print(f"  -> Rotating horizontal image: {filename}")
                                # Rotate by 90 degrees clockwise
                                img_rotated = img.rotate(270, expand=True) # 270 degrees for clockwise 90 degree rotation
                                # Save the rotated image, overwriting the original
                                img_rotated.save(file_path)
                                print(f"  -> Rotated and saved {filename} vertically.")
                            else:
                                print(f"  -> Image {filename} is already vertical or square, no rotation needed.")

                        # Now save card details to csv
                        get_card_information(driver, filename, card_num[i])

                    except requests.exceptions.RequestException as e:
                        print(f"  -> Failed to download image. Error: {e}")
            else:
                print("No card links found within 'chart_view'.")

    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        
    finally:
        if 'driver' in locals() and driver:
            driver.quit()
            print("WebDriver closed.")


def remove_duplicates_from_csv(file_path: str, key_column_index: int = 0):
    """
    Removes duplicate rows from a CSV file based on a key column, keeping the first occurrence.

    Args:
        file_path (str): The path to the CSV file.
        key_column_index (int): The index of the column to use for checking duplicates.
                                Defaults to 0 (imgfile).
    """
    if not os.path.exists(file_path):
        print(f"File '{file_path}' not found. Nothing to de-duplicate.")
        return

    temp_file_path = file_path + ".tmp"
    seen_keys = set()

    try:
        with open(file_path, 'r', encoding='utf-8', newline='') as infile, \
             open(temp_file_path, 'w', encoding='utf-8', newline='') as outfile:

            reader = csv.reader(infile, skipinitialspace=True)
            writer = csv.writer(outfile)

            unique_rows_count = 0
            for row in reader:
                if row and len(row) > key_column_index:
                    key = row[key_column_index]
                    if key not in seen_keys:
                        writer.writerow(row)
                        seen_keys.add(key)
                        unique_rows_count += 1

        os.replace(temp_file_path, file_path)
        print(f"Duplicate removal complete. {unique_rows_count} unique rows in '{os.path.basename(file_path)}'.")
    except Exception as e:
        print(f"An error occurred while removing duplicates: {e}")
        if os.path.exists(temp_file_path):
            os.remove(temp_file_path)

# credit card url
urls = [
    'https://www.card-gorilla.com/chart/top100',
    'https://www.card-gorilla.com/chart/check100',
    'https://www.card-gorilla.com/chart/corp?sub=1&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=2&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=3&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=4&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=5&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=6&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=7&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=8&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=9&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=10&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=32&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/corp?sub=23&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=23&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=16&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=23&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=26&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=185&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=35term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=168&term=monthly&date=2025-08-11',
    'https://www.card-gorilla.com/chart/benefit?sub=11,12term=monthly&date=2025-08-11'
]
# url_to_crawl = "https://www.card-gorilla.com/chart/top100"
# get_images_from_chart_view(url_to_crawl)

# # check card url
# url_to_crawl = "https://www.card-gorilla.com/chart/check100"
# get_images_from_chart_view(url_to_crawl)

for url in urls:
    get_images_from_chart_view(url)

# After scraping, remove duplicates from the generated CSV.
outputDir = "./card_info"
fileName = "card_info.csv"
filePath = os.path.join(outputDir, fileName)
remove_duplicates_from_csv(filePath, key_column_index=0) # De-duplicate based on imgfile (column 0)