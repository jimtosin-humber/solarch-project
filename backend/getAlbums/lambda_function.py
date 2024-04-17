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
        # Get the start parameter from the request
        start = int(event['queryStringParameters']['start'])
        
        # Calculate start and end indexes
        start_index = (start - 1) * 21
        end_index = start_index + 21
        
        # Get items from DynamoDB table
        response = table.scan()
        items = response.get('Items', [])
        
        # Slice the items list to get the desired group of albums
        group_of_albums = items[start_index:end_index]
        
        # Return success
        response = {
            'statusCode': 200,
            'body': json.dumps(group_of_albums, cls=JSONEncoder)
        }
    except Exception as e:
        # Return failure
        response = {
            'statusCode': 500,
            'body': json.dumps({'error': f'Error retrieving albums: {str(e)}'})
        }
    
    return response