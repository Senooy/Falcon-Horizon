import requests
import json
import schedule
import time

# Constants for Salesforce authentication
TOKEN_URL = "https://login.salesforce.com/services/oauth2/token"
TOKEN_PAYLOAD = {
  "grant_type": "password",
  "client_id": "3MVG9I5UQ_0k_hTlxl9SwXkHaaX5kX0qAYQOq8c.PkG5DFWIFEwsrzI496JZ.GmBIIHFqnwDc75JvefLHSe.7",
  "client_secret": "352231377BC938C6935CBC9E243BF1180120947E65594D9EC35A6F230E3DFAA4",
  "username": "falcon@api.circet",
  "password": "Yfauconapi59-HJ4GRqJAcl9stoSszZ1sa1g1",
}

# Get Salesforce access token
def get_salesforce_access_token():
    response = requests.post(
        TOKEN_URL,
        data=TOKEN_PAYLOAD,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    response.raise_for_status()
    return response.json()["access_token"]

# Retrieve Salesforce data
def get_salesforce_data(access_token, url):
    response = requests.get(
        url, headers={"Authorization": f"Bearer {access_token}"}
    )
    response.raise_for_status()
    return response.json()

# Retrieve vendor IDs
def get_vendor_ids(access_token):
    url = "https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/listviews/00B0O00000AkAHTUA3/results"
    data = get_salesforce_data(access_token, url)
    vendor_ids = []

    print("Data:")
    print(json.dumps(data, indent=2))

    for record in data["records"]:
        print("Record:")
        print(json.dumps(record, indent=2))
        for column in record["columns"]:
            if column["fieldNameOrPath"] == "Id":
                vendor_ids.append(column["value"])

    return vendor_ids


# Retrieve all sales for each vendor ID
def get_all_sales(access_token, vendor_ids):
    all_sales = []

    for vendor_id in vendor_ids:
        sales_url = f"https://circet.my.salesforce.com/services/data/v56.0/sobjects/Contact/{vendor_id}/Sales__r"
        sales_data = get_salesforce_data(access_token, sales_url)
        all_sales.extend(sales_data["records"])

    return all_sales

# Main function
def main():
    access_token = get_salesforce_access_token()
    print(f"Access token: {access_token}")
    vendor_ids = get_vendor_ids(access_token)
    print(f"Vendor IDs: {vendor_ids}")
    all_sales = get_all_sales(access_token, vendor_ids)

    # Compile data into a single JSON file
    with open("all_sales.json", "w") as f:
        json.dump(all_sales, f, indent=2)

    print("All sales have been compiled into all_sales.json")

# Schedule main function to run every 30 minutes
schedule.every(3).minutes.do(main)

# Run the scheduled jobs indefinitely
while True:
    schedule.run_pending()
    time.sleep(1)
