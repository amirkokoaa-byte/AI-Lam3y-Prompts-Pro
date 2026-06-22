import json
import time
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

# Disclaimer: This script is for educational purposes. 
# Ensure you comply with the target website's Terms of Service before scraping.

TARGET_URL = "https://www.meigen.ai/"
OUTPUT_FILE = "meigen_data.json"

def init_driver():
    """Initialize the Selenium WebDriver."""
    options = webdriver.ChromeOptions()
    # options.add_argument('--headless') # Uncomment for headless mode
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')
    options.add_argument('window-size=1920x1080')
    driver = webdriver.Chrome(options=options)
    return driver

def scroll_down(driver, pause_time=2):
    """Scroll down to load elements via infinite scroll."""
    last_height = driver.execute_script("return document.body.scrollHeight")
    while True:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause_time)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_height:
            break
        last_height = new_height

def scrape_data():
    driver = init_driver()
    data = []
    try:
        print(f"Navigating to {TARGET_URL}...")
        driver.get(TARGET_URL)
        
        # Wait for initial load
        time.sleep(5)
        
        print("Scrolling to load all items...")
        scroll_down(driver)
        
        print("Parsing content...")
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        
        # NOTE: The exact selectors below need to be adjusted based on the actual 
        # HTML structure of meigen.ai, which cannot be inspected directly by the agent.
        # These are representative placeholders for a typical image gallery structure.
        
        # Example selector: Find all card elements or image containers
        cards = soup.find_all('div', class_=lambda c: c and 'image-card' in c.lower())
        
        if not cards:
            print("Could not find specific card classes. Attempting generic image search...")
            images = soup.find_all('img')
            for i, img in enumerate(images):
                src = img.get('src')
                alt = img.get('alt', '')
                if src and len(alt) > 5: # Assuming long alt text might be the prompt
                    data.append({
                        "id": str(i),
                        "categoryId": "unknown", # Categories might require a different scraping flow
                        "imageUrl": src,
                        "promptText": alt
                    })
        else:
            for i, card in enumerate(cards):
                img_tag = card.find('img')
                # Try to find text container, might be a sibling or child
                prompt_tag = card.find(lambda tag: tag.name in ['p', 'div'] and 'prompt' in (tag.get('class') or [''])[0].lower())
                
                if img_tag:
                    data.append({
                        "id": str(i),
                        "categoryId": "1", # Update extraction logic for categorization
                        "imageUrl": img_tag.get('src'),
                        "promptText": prompt_tag.text.strip() if prompt_tag else img_tag.get('alt', 'No prompt found')
                    })
        
        print(f"Extracted {len(data)} items.")
        
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            
        print(f"Data saved to {OUTPUT_FILE}")
        
    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        driver.quit()

if __name__ == "__main__":
    print("Starting Meigen Scraper...")
    print("Make sure you have installed requirements: pip install selenium beautifulsoup4")
    scrape_data()
