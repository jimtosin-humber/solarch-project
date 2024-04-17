import json
import boto3

# Initialize DynamoDB client
dynamodb = boto3.resource('dynamodb')
table_name = 'MusicCollection'

# Create table
table = dynamodb.create_table(
    TableName=table_name,
    KeySchema=[
        {
            'AttributeName': 'Album',
            'KeyType': 'HASH'  # Partition key
        },
        {
            'AttributeName': 'Year',
            'KeyType': 'RANGE'  # Sort key
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'Album',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'Year',
            'AttributeType': 'N'
        },
    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

# Wait until the table is created
table.meta.client.get_waiter('table_exists').wait(TableName=table_name)

# Load data from JSON file
with open('albumlist.json', 'r') as f:
    data = json.load(f)

# Insert data into the table
table = dynamodb.Table(table_name)
with table.batch_writer() as batch:
    for item in data:
        batch.put_item(Item=item)

print("Table created and data inserted successfully!")