import json
import boto3
from decimal import Decimal

# Helper class to convert a DynamoDB item to JSON
class JSONEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return str(obj)
        return json.JSONEncoder.default(self, obj)

dynamodb = boto3.resource('dynamodb')
table_name = 'MusicCollection'
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Get the parameters from the request
        start = int(event['queryStringParameters']['start'])
        count = int(event['queryStringParameters']['count'])
        sortField = event['queryStringParameters']['sortField']
        sortOrder = event['queryStringParameters']['sortOrder']
        searchString = event['queryStringParameters']['searchString']
        
        # Calculate start and end indexes
        start_index = (start - 1) * count
        end_index = start_index + count
        
        # Scan the entire table and retrieve all items
        response = table.scan()
        items = response.get('Items', [])
        
        # Filter items based on the search string
        filtered_items = items
        if searchString:
            filtered_items = [item for item in items if searchString.lower() in item.get('Album', '').lower() or searchString.lower() in item.get('Artist', '').lower()]
        
        # Sort filtered items by sortField
        if sortOrder == 'asc':
            if sortField == 'Album' or sortField == 'Artist':
                sorted_items = sorted(filtered_items, key=lambda x: x.get(sortField, '').lower())
            else:
                sorted_items = sorted(filtered_items, key=lambda x: x.get(sortField, float('inf')))
        else:
            if sortField == 'Album' or sortField == 'Artist':
                sorted_items = sorted(filtered_items, key=lambda x: x.get(sortField, '').lower(), reverse=True)
            else:
                sorted_items = sorted(filtered_items, key=lambda x: x.get(sortField, float('inf')), reverse=True)
        
        # Slice the sorted items list to get the desired group of albums
        group_of_albums = sorted_items[start_index:end_index]
        
        # Return success with count and group
        response = {
            'statusCode': 200,
            'body': json.dumps({
                'count': len(filtered_items),
                'group': group_of_albums
            }, cls=JSONEncoder)
        }
    except Exception as e:
        # Return failure
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': f'Error retrieving albums: {str(e)}'})
        }
    
    return response