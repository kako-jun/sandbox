import os
import sys
import time
import logging
import functools
from typing import Optional, Dict, Any, List, Tuple, Union, Callable, TypeVar, cast

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    logging.warning("psutil not available. Performance monitoring will be limited.")

T = TypeVar('T')

def measure_execution_time(func: Callable[..., T]) -> Callable[..., Union[T, float]]:
    """
    関数の実行時間を計測するデコレータ
    
    Args:
        func (Callable[..., T]): 計測対象の関数
        
    Returns:
        Callable[..., Union[T, float]]: 実行時間を返す関数
    """
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> Union[T, float]:
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        execution_time = end_time - start_time
        logging.debug(f"{func.__name__} took {execution_time:.2f} seconds to execute")
        return execution_time
    return cast(Callable[..., Union[T, float]], wrapper)

def check_memory_usage(process_name: Optional[str] = None) -> Dict[str, Union[float, str]]:
    """
    メモリ使用量をチェックする
    
    Args:
        process_name (Optional[str]): プロセス名（Noneの場合は現在のプロセス）
        
    Returns:
        Dict[str, Union[float, str]]: メモリ使用量（MB）またはエラー情報
    """
    if not PSUTIL_AVAILABLE:
        return {"error": "psutil not available"}
    
    if process_name:
        for proc in psutil.process_iter(['name', 'memory_info']):
            if proc.info['name'] == process_name:
                return {
                    "rss": proc.info['memory_info'].rss / 1024 / 1024,
                    "vms": proc.info['memory_info'].vms / 1024 / 1024,
                    "percent": proc.memory_percent()
                }
        raise ValueError(f"Process {process_name} not found")
    
    try:
        process = psutil.Process()
        memory_info = process.memory_info()
        return {
            "rss": memory_info.rss / 1024 / 1024,  # MB
            "vms": memory_info.vms / 1024 / 1024,  # MB
            "percent": process.memory_percent()
        }
    except Exception as e:
        logging.error(f"Error checking memory usage: {e}")
        return {"error": str(e)}

def optimize_performance(func: Callable[..., T]) -> Callable[..., T]:
    """
    関数のパフォーマンスを最適化するデコレータ
    
    Args:
        func (Callable[..., T]): 最適化対象の関数
        
    Returns:
        Callable[..., T]: 最適化された関数
    """
    # メモ化用のキャッシュ
    cache: Dict[Tuple[Any, ...], T] = {}
    
    @functools.wraps(func)
    def wrapper(*args: Any, **kwargs: Any) -> T:
        # キャッシュキーの生成
        key = (args, tuple(sorted(kwargs.items())))
        
        # キャッシュに結果がある場合はそれを返す
        if key in cache:
            return cache[key]
        
        # メモリ使用量のチェック
        if PSUTIL_AVAILABLE:
            before_memory = check_memory_usage()
        
        # 関数を実行して結果をキャッシュ
        result = func(*args, **kwargs)
        cache[key] = result
        
        # メモリ使用量のチェック
        if PSUTIL_AVAILABLE:
            after_memory = check_memory_usage()
            if isinstance(before_memory, dict) and isinstance(after_memory, dict):
                before_rss = before_memory.get("rss")
                after_rss = after_memory.get("rss")
                before_vms = before_memory.get("vms")
                after_vms = after_memory.get("vms")
                
                if (isinstance(before_rss, (int, float)) and 
                    isinstance(after_rss, (int, float)) and
                    isinstance(before_vms, (int, float)) and
                    isinstance(after_vms, (int, float))):
                    memory_diff = {
                        "rss": after_rss - before_rss,
                        "vms": after_vms - before_vms
                    }
                    logging.debug(f"Memory usage change: {memory_diff}")
        
        return result
    
    return cast(Callable[..., T], wrapper) 