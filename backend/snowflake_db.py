import os
import snowflake.connector
import csv
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def connect_to_snowflake():
    """
    Connect to Snowflake using credentials from .env file
    """
    try:
        # Get Snowflake credentials from environment variables
        user = os.getenv('SNOWFLAKE_USER')
        password = os.getenv('SNOWFLAKE_PASSWORD')
        account = os.getenv('SNOWFLAKE_ACCOUNT')
        warehouse = os.getenv('SNOWFLAKE_WAREHOUSE')
        database = os.getenv('SNOWFLAKE_DATABASE')
        schema = os.getenv('SNOWFLAKE_SCHEMA')
        
        # Establish connection
        conn = snowflake.connector.connect(
            user=user,
            password=password,
            account=account,
            warehouse=warehouse,
            database=database,
            schema=schema
        )
        
        print("Successfully connected to Snowflake!")
        return conn
    
    except Exception as e:
        print(f"Error connecting to Snowflake: {e}")
        return None

def query_suicidal_or_not(conn, query=None):
    """
    Query the CRISISVOICE.PUBLIC.SUICIDALORNOT table
    
    Args:
        conn: Snowflake connection object
        query: SQL query string (optional)
    """
    try:
        cursor = conn.cursor()
        
        # Default query if none provided
        if not query:
            query = "SELECT * FROM \"CRISISVOICE\".\"PUBLIC\".\"SUICIDALORNOT\""
        
        # Execute query
        cursor.execute(query)
        
        # Fetch results
        results = cursor.fetchall()
        
        # Get column names
        column_names = [desc[0] for desc in cursor.description]
        
        # Print column names
        print("\nColumns:", column_names)
        
        # Print number of rows fetched
        print(f"\nFetched {len(results)} rows from the database.")
            
        return results, column_names
    
    except Exception as e:
        print(f"Error executing query: {e}")
        return None, None
    
    finally:
        if 'cursor' in locals():
            cursor.close()

def save_to_csv(data, output_path):
    """
    Save data to a CSV file
    
    Args:
        data: List of tuples containing the data
        output_path: Path to save the CSV file
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Write data to CSV file
        with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
            csv_writer = csv.writer(csvfile)
            csv_writer.writerows(data)
        
        print(f"Data successfully saved to {output_path}")
        return True
    
    except Exception as e:
        print(f"Error saving to CSV: {e}")
        return False

def main():
    # Connect to Snowflake
    conn = connect_to_snowflake()
    
    if conn:
        # Query to get all data from the table
        query = """
        SELECT * FROM "CRISISVOICE"."PUBLIC"."SUICIDALORNOT"
        LIMIT 10;
        """
        
        # Execute query
        results, columns = query_suicidal_or_not(conn, query)
        
        if results:
            # Get the absolute path to the project root
            project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
            
            # Create the output path
            output_path = os.path.join(project_root, 'datasets', 'Suicide_Detection_Sanitized.csv')
            
            # Save results to CSV file
            save_to_csv(results, output_path)
        
        # Close connection
        conn.close()
        print("\nSnowflake connection closed.")

if __name__ == "__main__":
    main() 