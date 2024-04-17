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
        # Get item key from path parameter
        album = event['pathParameters']['album']
        year = int(event['pathParameters']['year'])
        
        # Get item from DynamoDB table
        response = table.get_item(Key={'Album': album,'Year': year})
        item = response.get('Item', {})
        
        # Return success
        response = {
            'statusCode': 200,
            'body': json.dumps(item, cls=JSONEncoder)
        }
    except Exception as e:
        # Return fail
        response = {
            'statusCode': 500,
            'body': json.dumps(f'Error reading item: {str(e)}')
        }
    
    return response