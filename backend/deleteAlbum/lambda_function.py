import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_name = 'MusicCollection'
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Get item key from path parameters
        album = event['pathParameters']['album'].replace('+', ' ')
        year = int(event['pathParameters']['year'])
        
        # Delete item from DynamoDB table
        table.delete_item(Key={'Album': album, 'Year': year})
        
        # Return success response
        response = {
            'statusCode': 204,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': ""
        }
    except Exception as e:
        # Return error response
        response = {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'OPTIONS,POST'
            },
            'body': json.dumps(f'Error deleting item: {str(e)}')
        }
    
    return response