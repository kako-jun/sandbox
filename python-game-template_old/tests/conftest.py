import os
import sys
import pytest
from typing import Generator
from fastapi.testclient import TestClient
from src.web.app import app

@pytest.fixture
def client() -> Generator[TestClient, None, None]:
    """
    FastAPIのテストクライアントを提供するフィクスチャ
    
    Yields:
        Generator[TestClient, None, None]: テストクライアント
    """
    with TestClient(app) as test_client:
        yield test_client 