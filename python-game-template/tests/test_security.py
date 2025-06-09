import os
import sys
import time
import json
import logging
import unittest
from typing import Optional, Dict, Any, List, Tuple, Union
from pathlib import Path
from fastapi.testclient import TestClient
from src.web.app import app
from src.utils.security import validate_input, sanitize_output, check_permissions

def test_input_validation(client: TestClient) -> None:
    """入力値の検証をテスト"""
    payload = {"direction": "invalid_direction"}
    response = client.post("/api/game/action", json=payload)
    assert response.status_code in (400, 422)

def test_invalid_json(client: TestClient) -> None:
    """無効なJSONの処理をテスト"""
    response = client.post("/api/game/action", data={"invalid": "json"})
    assert response.status_code in (400, 422)

def test_large_payload(client: TestClient) -> None:
    """大きなペイロードの処理をテスト"""
    large_data = {"data": "x" * 1000000}  # 1MBのデータ
    response = client.post("/api/game/action", json=large_data)
    # 413 Payload Too Large か 400 Bad Request など
    assert response.status_code in (400, 413, 422)

def test_invalid_method(client: TestClient) -> None:
    """無効なHTTPメソッドの処理をテスト"""
    response = client.put("/api/game/state")
    assert response.status_code in (405, 404)

def test_invalid_content_type(client: TestClient) -> None:
    """無効なContent-Typeの処理をテスト"""
    response = client.post("/api/game/action", data={"text": "plain"}, headers={"Content-Type": "text/plain"})
    assert response.status_code in (400, 415, 422)

def test_invalid_accept(client: TestClient) -> None:
    """無効なAcceptヘッダーの処理をテスト"""
    response = client.get("/api/game/state", headers={"Accept": "text/plain"})
    assert response.status_code in (406, 200, 404)

def test_validate_input() -> None:
    """入力値の検証をテストする"""
    # 正常系のテスト
    assert validate_input("test_input") is True
    assert validate_input("123") is True
    assert validate_input("test@example.com") is True
    
    # エラー系のテスト
    assert validate_input("") is False
    assert validate_input(" " * 100) is False
    assert validate_input("test<script>alert('xss')</script>") is False

def test_sanitize_output() -> None:
    """出力値のサニタイズをテストする"""
    # 正常系のテスト
    assert sanitize_output("test_output") == "test_output"
    assert sanitize_output("123") == "123"
    assert sanitize_output("test@example.com") == "test@example.com"
    
    # エラー系のテスト
    assert sanitize_output("<script>alert('xss')</script>") == "&lt;script&gt;alert('xss')&lt;/script&gt;"
    assert sanitize_output("test\noutput") == "test output"
    assert sanitize_output("test\toutput") == "test output"

def test_check_permissions() -> None:
    """権限チェックをテストする"""
    # 正常系のテスト
    assert check_permissions("admin", "read") is True
    assert check_permissions("admin", "write") is True
    assert check_permissions("user", "read") is True
    
    # エラー系のテスト
    assert check_permissions("user", "write") is False
    assert check_permissions("guest", "read") is False
    assert check_permissions("invalid", "read") is False

if __name__ == '__main__':
    unittest.main() 