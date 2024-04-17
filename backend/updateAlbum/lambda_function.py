import json
import boto3

dynamodb = boto3.resource('dynamodb')
table_name = 'MusicCollection'
table = dynamodb.Table(table_name)

def lambda_handler(event, context):
    try:
        # Get item key from path parameters
        album = event['pathParameters']['album']
        year = int(event['pathParameters']['year'])
        
        # Parse request body
        body = event['body']
        
        # Update item in DynamoDB table
        update_expression = "SET "
        expression_attribute_values = {}
        for key, value in body.items():
            update_expression += f"{key} = :{key}, "
            expression_attribute_values[f":{key}"] = value
        update_expression = update_expression[:-2]  # Remove trailing comma and space
        
        table.update_item(
            Key={'Album': album, 'Year': year},
            UpdateExpression=update_expression,
            ExpressionAttributeValues=expression_attribute_values
        )
        
        # Return success
        response = {
            'statusCode': 204,
            'body': ""
        }
    except Exception as e:
        # Return fail
        response = {
            'statusCode': 500,
            'body': json.dumps(f'Error updating item: {str(e)}')
        }
    
    return response