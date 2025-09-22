import os
import csv
import json
import requests
from dotenv import load_dotenv
from datetime import datetime
from typing import List, Dict, Any

load_dotenv()

API_URL = os.getenv("API_URL")
API_KEY = os.getenv("API_KEY")
INSTITUTION_CODE = os.getenv("INSTITUTION_CODE")


def create_api_payload(card_data: Dict[str, Any]) -> Dict[str, Any]:
    """Create the API payload in the required format."""
    now = datetime.now()
    transaction_id = now.strftime("%Y%m%d%H%M%S%f")
    return {
        "Header": {
            "apiName": "createCreditCardProduct",
            "transmissionDate": now.strftime("%Y%m%d"),
            "transmissionTime": now.strftime("%H%M%S"),
            "institutionCode": INSTITUTION_CODE,
            "fintechAppNo": "001",
            "apiServiceCode": "createCreditCardProduct",
            "institutionTransactionUniqueNo": transaction_id,
            "apiKey": API_KEY
        },
        "cardIssuerCode": card_data.get("card_issuer"),
        "cardName": card_data.get("name"),
        "cardTypeCode": "1",
        "cardTypeName": "신용카드",
        "baselinePerformance": "0",
        "maxBenefitLimit": "1000000",
        "cardDescription": "",
        "cardBenefits": [
            {
                "categoryId" : "CG-9ca85f66311a23d",
                "categoryName": "생활",
                "discountRate": "3.0"
            }
        ]
    }

def send_card_data_to_api(card_data: Dict[str, Any]) -> bool:
    """Send card data to the external API."""
    try:
        payload = create_api_payload(card_data)
        headers = {
            "Content-Type": "application/json",
            "x-api-key": API_KEY
        }

        # show api body
        print(json.dumps(payload, indent=4, ensure_ascii=False, sort_keys=True))
        
        # send api request
        response = requests.post(API_URL, headers=headers, json=payload)
        print(f"Response status code: {response.status_code}")
        print(f"Response content: {response.text}")   
        
    except requests.exceptions.RequestException as e:
        print(f"Error sending data for card {card_data.get('name')}: {str(e)}")
        if hasattr(e, 'response') and e.response is not None:
            print(f"Response content: {e.response.text}")
        return False

def read_and_process_csv(file_path: str):
    """Read and process the CSV file."""
    if not os.path.exists(file_path):
        print(f"Error: File not found at {file_path}")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            company = row.get("카드사", "")
            name = row.get("카드명", "")
            benefits = row.get("혜택", "")

            card_data = {
                "company": company,
                "name": name,
                "benefits": benefits,
                "card_issuer": card_name_to_card_code(company)
            }
            # print("Card data:")
            # for key, value in card_data.items():
            #     print(f"{key}: {value}")

            # print(f"Processing card: {card_data}")
            
            # Send data to API
            print("Sending data to API...")
            try:
                send_card_data_to_api(card_data)
            except Exception as e:
                print(f"Error sending data to API: {str(e)}")
                continue

def card_name_to_card_code(name: str) -> str:
    """Convert card name to card code by removing spaces."""
    card_code_map = {
            "KB국민카드": "1001",
            "삼성카드": "1002",
            "롯데카드": "1003",
            "우리카드": "1004",
            "신한카드": "1005",
            "현대카드": "1006",
            "BC 바로카드": "1007",
            "NH농협카드": "1008",
            "하나카드": "1009",
            "IBK기업은행": "1010"
        }
    
    return card_code_map.get(name, "")

def main():
    # Set card info CSV path
    card_info_path = "./card_info/card_info.csv"
    
    # Get absolute path
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(script_dir, card_info_path)
    
    print(f"Starting import from {csv_path}...")
    read_and_process_csv(csv_path)
    print("Import process completed.")

if __name__ == "__main__":
    main()