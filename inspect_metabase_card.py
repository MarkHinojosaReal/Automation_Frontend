#!/usr/bin/env python3
import requests
import json
from datetime import datetime

def main():
    # Metabase card inspection endpoint
    url = "https://metabase.therealbrokerage.com/api/card/5342?ignore_view=true"
    
    # Headers
    headers = {
        "X-API-Key": "mb_OA03ReuCiuld1BeLyMbuZo/QV60U7YBchhtGxj8xemk=",
    }
    
    try:
        # Send the GET request
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Extract and display the SQL query and columns
        data = response.json()
        
        # Print SQL Query
        if 'dataset_query' in data and 'native' in data['dataset_query']:
            native_query = data['dataset_query']['native']
            if 'query' in native_query:
                sql_query = native_query['query']
                print("SQL QUERY:")
                print("-" * 40)
                print(sql_query)
            else:
                print("No 'query' field found in native dataset_query")
        else:
            print("No native SQL query found in dataset_query")
        
        # Print Columns
        if 'result_metadata' in data:
            print("\nCOLUMNS:")
            print("-" * 40)
            columns = data['result_metadata']
            for i, col in enumerate(columns):
                col_name = col.get('name', f'column_{i}')
                col_type = col.get('base_type', 'Unknown')
                print(f"{i+1}. {col_name} ({col_type})")
        else:
            print("\nNo column metadata found")
        
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {e}")
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"Raw Response: {response.text}")
    except Exception as e:
        print(f"Unexpected error: {e}")

if __name__ == "__main__":
    main()
