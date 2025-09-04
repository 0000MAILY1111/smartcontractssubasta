import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    INFURA_URL = os.getenv('INFURA_URL', 'https://sepolia.infura.io/v3/key')
    CONTRACT_ADDRESS = os.getenv('CONTRACT_ADDRESS', '0x17e3ba058f8583f90157a262b49624c9cb40e8fa')
    SECRET_KEY = os.getenv('SECRET_KEY', 'hacker2025')