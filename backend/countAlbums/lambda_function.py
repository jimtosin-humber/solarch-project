import boto3

# Initialize DynamoDB client
dynamodb = boto3.client('dynamodb')

def lambda_handler(event, context):
    try:
        # DynamoDB table name
        table_name = 'MusicCollection'
        
        # Perform a scan operation to get the total number of items
        response = dynamodb.scan(TableName=table_name, Select='COUNT')
        
        # Extract the count of items from the response
        count = response['Count']
        
        # Return success with the count of items
        return {
            'statusCode': 200,
            'body': f'{count}'
        }
    except Exception as e:
        # Return failure with error message
        return {
            'statusCode': 500,
            'body': f'Error: {str(e)}'
        }
