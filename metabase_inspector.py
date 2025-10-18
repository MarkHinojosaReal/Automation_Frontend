#!/usr/bin/env python3
import requests
import json
import sys

def main():
    # Get card ID from user input
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python metabase_inspector.py <card_id>"}))
        sys.exit(1)
    
    card_id = sys.argv[1]
    
    # Metabase card inspection endpoint
    url = f"https://metabase.therealbrokerage.com/api/card/{card_id}?ignore_view=true"
    
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
        
        result = {
            "card_id": card_id,
            "card_title": data.get('name', 'Unknown'),
            "sql_query": "",
            "columns": []
        }
        
        # Extract SQL Query
        if 'dataset_query' in data and 'native' in data['dataset_query']:
            native_query = data['dataset_query']['native']
            if 'query' in native_query:
                result["sql_query"] = native_query['query']
            else:
                result["sql_query"] = "No 'query' field found in native dataset_query"
        else:
            result["sql_query"] = "No native SQL query found in dataset_query"
        
        # Extract Columns
        if 'result_metadata' in data:
            columns = data['result_metadata']
            for i, col in enumerate(columns):
                col_name = col.get('name', f'column_{i}')
                col_type = col.get('base_type', 'Unknown')
                result["columns"].append({
                    "index": i + 1,
                    "name": col_name,
                    "type": col_type
                })
        else:
            result["columns"] = []
        
        # Output as JSON
        print(json.dumps(result, indent=2))
        
    except requests.exceptions.RequestException as e:
        print(json.dumps({"error": f"Request Error: {e}"}))
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"JSON Decode Error: {e}"}))
    except Exception as e:
        print(json.dumps({"error": f"Unexpected error: {e}"}))

if __name__ == "__main__":
    main()