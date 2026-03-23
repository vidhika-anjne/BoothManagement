#!/usr/bin/env python3
import json
import sys
from pathlib import Path

def remove_duplicates_from_parts(parts):
    """Remove duplicate entries from parts array"""
    if not isinstance(parts, list):
        return parts
    
    # Track seen entries by their unique identifiers
    seen = {}
    unique_parts = []
    
    for part in parts:
        # Skip empty objects
        if isinstance(part, dict) and len(part) == 0:
            continue
        
        if isinstance(part, dict):
            # Create a unique key based on partId and partName
            part_id = part.get('partId')
            part_name = part.get('partName')
            
            # Use partId as primary key if available
            if part_id is not None:
                key = ('id', part_id)
            elif part_name:
                key = ('name', part_name)
            else:
                # For empty or minimal objects, still skip them
                continue
            
            # Only add if not seen before
            if key not in seen:
                seen[key] = True
                unique_parts.append(part)
        else:
            unique_parts.append(part)
    
    return unique_parts

def process_structure(obj):
    """Recursively process the JSON structure to remove duplicates"""
    if isinstance(obj, dict):
        # Process each value in the dictionary
        for key, value in obj.items():
            if key == 'parts' and isinstance(value, list):
                # Remove duplicates from parts
                obj[key] = remove_duplicates_from_parts(value)
            elif isinstance(value, (dict, list)):
                # Recursively process nested structures
                process_structure(value)
    elif isinstance(obj, list):
        # Process each item in the list
        for item in obj:
            if isinstance(item, (dict, list)):
                process_structure(item)
    
    return obj

def main():
    file_path = Path('/Users/abhilashakumari/Desktop/school/booth/BoothManagement/backend/src/main/resources/json/final_data (1).json')
    
    if not file_path.exists():
        print(f"Error: File not found at {file_path}")
        sys.exit(1)
    
    print(f"Reading file: {file_path}")
    print("This may take a moment for large files...")
    
    try:
        # Read the JSON file
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print(f"✓ Successfully loaded JSON")
        
        # Process and remove duplicates
        print("Processing and removing duplicates...")
        cleaned_data = process_structure(data)
        
        # Write the cleaned data back
        output_path = file_path
        print(f"Writing cleaned data to: {output_path}")
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(cleaned_data, f, indent=2, ensure_ascii=False)
        
        print("✓ Successfully removed duplicates and saved file")
        print("\nDuplicate removal complete!")
        
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format - {e}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
