import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_name = 'MusicCollection'
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Parse request body to get item data
        album_data = event['body']
        
        # Insert item into DynamoDB table
        table.put_item(Item=album_data)
        
        # Return success
        response = {
            'statusCode': 200,
            'body': 'Create successful'
        }
    except Exception as e:
        # Return fail
        response = {
            'statusCode': 500,
            'body': 'Create fail'
        }
    
    return response