use std::fs;
use std::io::Write;
use std::process::{Command, Stdio};
use tempfile::TempDir;
mod test_utils;
use test_utils::TestUtils;

#[test]
fn test_interactive_orientation() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // テスト用の画像ファイルを生成
    let test_file = input_dir.join("test.jpg");
    TestUtils::create_test_image(&test_file, 100, 100, None);

    // 対話的な入力をシミュレート
    let mut child = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--orientation",
            "interactive",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    // 対話的な入力を送信
    if let Some(mut stdin) = child.stdin.take() {
        stdin.write_all(b"y\n").unwrap();
    }

    // プロセスの終了を待機
    let output = child.wait_with_output().unwrap();
    assert!(output.status.success());

    // 出力ディレクトリの内容を確認
    let files = fs::read_dir(&output_dir).unwrap();
    let file_count = files.count();
    assert_eq!(file_count, 1);
}

#[test]
fn test_batch_processing() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    
    // テスト用のディレクトリ構造を生成
    TestUtils::create_test_directory_structure(&input_dir, 10);

    // バッチ処理を実行
    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--orientation",
            "auto",
        ])
        .output()
        .unwrap();

    assert!(output.status.success());

    // 出力ディレクトリの内容を確認
    let files = fs::read_dir(&output_dir).unwrap();
    let file_count = files.count();
    assert_eq!(file_count, 10);
}

#[test]
fn test_backup_functionality() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    let backup_dir = temp_dir.path().join("backup");
    
    // テスト用のディレクトリ構造を生成
    TestUtils::create_test_directory_structure(&input_dir, 5);
    TestUtils::create_test_backup_directory(&backup_dir);

    // バックアップ機能付きで処理を実行
    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--backup",
            backup_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());

    // バックアップディレクトリの内容を確認
    let files = fs::read_dir(&backup_dir).unwrap();
    let file_count = files.count();
    assert_eq!(file_count, 5);
}

#[test]
fn test_cleanup_functionality() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    
    // テスト用のディレクトリ構造を生成
    TestUtils::create_test_directory_structure(&input_dir, 5);
    TestUtils::create_test_temp_files(&output_dir);

    // クリーンアップ機能付きで処理を実行
    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--cleanup",
        ])
        .output()
        .unwrap();

    assert!(output.status.success());

    // 一時ファイルが削除されたことを確認
    let files = fs::read_dir(&output_dir).unwrap();
    let file_count = files.count();
    assert_eq!(file_count, 5); // 一時ファイルは削除され、画像ファイルのみ残る
}

#[test]
fn test_error_handling() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 存在しないファイルを指定
    let mut child = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.join("non_existent.jpg").to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    // プロセスの終了を待機
    let output = child.wait_with_output().unwrap();
    assert!(!output.status.success());

    // エラーメッセージを確認
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("エラー"));
}

#[test]
fn test_large_file_handling() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 大きなテストファイルを生成（100MB）
    let test_file = input_dir.join("large.jpg");
    TestUtils::create_test_image(&test_file, 10000, 10000, None);

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_special_characters() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 特殊文字を含むファイル名のテスト
    let special_names = [
        "test ファイル.jpg",
        "test@file.jpg",
        "test#file.jpg",
        "test$file.jpg",
        "test%file.jpg",
        "test&file.jpg",
        "test*file.jpg",
        "test+file.jpg",
        "test,file.jpg",
        "test;file.jpg",
    ];

    for name in special_names.iter() {
        let test_file = input_dir.join(name);
        TestUtils::create_test_image(&test_file, 100, 100, None);
    }

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_symlink_handling() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 通常のファイルを作成
    let original_file = input_dir.join("original.jpg");
    TestUtils::create_test_image(&original_file, 100, 100, None);

    // シンボリックリンクを作成
    let symlink_file = input_dir.join("symlink.jpg");
    #[cfg(unix)]
    std::os::unix::fs::symlink(&original_file, &symlink_file).unwrap();
    #[cfg(windows)]
    std::os::windows::fs::symlink_file(&original_file, &symlink_file).unwrap();

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_performance() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 大量のファイルを生成（1000ファイル）
    TestUtils::create_test_directory_structure(&input_dir, 1000);

    let start = std::time::Instant::now();
    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--parallel",
        ])
        .output()
        .unwrap();

    let duration = start.elapsed();
    assert!(output.status.success());
    assert!(duration < std::time::Duration::from_secs(30)); // 30秒以内に完了することを確認
}

#[test]
fn test_invalid_paths() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 不正なパスを含むファイル名のテスト
    let invalid_paths = [
        "../../../etc/passwd",
        "C:\\Windows\\System32\\config\\SAM",
        "\\\\.\\PhysicalDrive0",
        "\\\\?\\C:\\Windows\\System32\\config\\SAM",
    ];

    for path in invalid_paths.iter() {
        let output = Command::new("cargo")
            .args(&[
                "run",
                "--",
                "-i",
                path,
                "-o",
                output_dir.to_str().unwrap(),
            ])
            .output()
            .unwrap();

        assert!(!output.status.success());
        let stderr = String::from_utf8_lossy(&output.stderr);
        assert!(stderr.contains("エラー"));
    }
}

#[test]
fn test_timezone_handling() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 異なるタイムゾーンのテスト
    let timezones = ["UTC", "Asia/Tokyo", "America/New_York", "Europe/London"];
    
    for tz in timezones.iter() {
        let test_file = input_dir.join(format!("test_{}.jpg", tz));
        TestUtils::create_test_image(&test_file, 100, 100, Some(tz));

        let output = Command::new("cargo")
            .args(&[
                "run",
                "--",
                "-i",
                input_file.to_str().unwrap(),
                "-o",
                output_dir.to_str().unwrap(),
                "--timezone",
                tz,
            ])
            .output()
            .unwrap();

        assert!(output.status.success());
    }
}

#[test]
fn test_malicious_filenames() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 悪意のある可能性のあるファイル名のテスト
    let malicious_names = [
        "file; rm -rf /;.jpg",           // コマンドインジェクション
        "file\nrm -rf /;.jpg",           // 改行を含む
        "file\0null.jpg",                // null文字を含む
        "file/../../etc/passwd.jpg",     // パストラバーサル
        "file\u{0000}null.jpg",          // Unicode null
        "file\u{202E}gpj.elif",          // RTL文字（右から左）
        "file\u{202D}jpg.elif",          // LTR文字（左から右）
        "file\u{FEFF}jpg",               // BOM
        "file\u{200B}jpg",               // ゼロ幅スペース
        "file\u{200C}jpg",               // ゼロ幅非結合子
        "file\u{200D}jpg",               // ゼロ幅結合子
        "file\u{200E}jpg",               // 左から右マーク
        "file\u{200F}jpg",               // 右から左マーク
        "file\u{2060}jpg",               // 単語結合子
        "file\u{2061}jpg",               // 関数適用
        "file\u{2062}jpg",               // 不可視乗算
        "file\u{2063}jpg",               // 不可視セパレータ
        "file\u{2064}jpg",               // 不可視プラス
        "file\u{2066}jpg",               // 左から右分離
        "file\u{2067}jpg",               // 右から左分離
        "file\u{2068}jpg",               // 第一強制分離
        "file\u{2069}jpg",               // 第二強制分離
        "file\u{206A}jpg",               // 禁止分離
        "file\u{206B}jpg",               // 活性化分離
        "file\u{206C}jpg",               // 非活性化分離
        "file\u{206D}jpg",               // 非活性化分離
        "file\u{206E}jpg",               // 非活性化分離
        "file\u{206F}jpg",               // 非活性化分離
    ];

    for name in malicious_names.iter() {
        let test_file = input_dir.join(name);
        TestUtils::create_test_image(&test_file, 100, 100, None);
    }

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_circular_symlinks() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 循環シンボリックリンクを作成
    let link1 = input_dir.join("link1");
    let link2 = input_dir.join("link2");
    #[cfg(unix)]
    {
        std::os::unix::fs::symlink(&link2, &link1).unwrap();
        std::os::unix::fs::symlink(&link1, &link2).unwrap();
    }
    #[cfg(windows)]
    {
        std::os::windows::fs::symlink_file(&link2, &link1).unwrap();
        std::os::windows::fs::symlink_file(&link1, &link2).unwrap();
    }

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_deep_directory_structure() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 深いディレクトリ構造を作成（100階層）
    let mut current_dir = input_dir.clone();
    for i in 0..100 {
        current_dir = current_dir.join(format!("dir{}", i));
        fs::create_dir_all(&current_dir).unwrap();
        let test_file = current_dir.join("test.jpg");
        TestUtils::create_test_image(&test_file, 100, 100, None);
    }

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_concurrent_file_access() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 同じファイルを同時に処理
    let test_file = input_dir.join("test.jpg");
    TestUtils::create_test_image(&test_file, 100, 100, None);

    // 複数のプロセスで同時に処理
    let mut handles = vec![];
    for _ in 0..10 {
        let input_dir = input_dir.clone();
        let output_dir = output_dir.clone();
        handles.push(std::thread::spawn(move || {
            Command::new("cargo")
                .args(&[
                    "run",
                    "--",
                    "-i",
                    input_dir.to_str().unwrap(),
                    "-o",
                    output_dir.to_str().unwrap(),
                ])
                .output()
                .unwrap()
        }));
    }

    for handle in handles {
        let output = handle.join().unwrap();
        assert!(output.status.success());
    }
}

#[test]
fn test_corrupted_files() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 破損したファイルを作成
    let corrupted_files = [
        ("empty.jpg", vec![]),
        ("invalid.jpg", vec![0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10]), // 不完全なJPEGヘッダー
        ("truncated.jpg", vec![0xFF, 0xD8, 0xFF, 0xE0]), // 途中で切れたJPEG
        ("garbage.jpg", vec![0x00, 0x01, 0x02, 0x03, 0x04, 0x05]), // ランダムなデータ
    ];

    for (name, data) in corrupted_files.iter() {
        let test_file = input_dir.join(name);
        fs::write(&test_file, data).unwrap();
    }

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_permission_issues() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 読み取り専用ファイルを作成
    let test_file = input_dir.join("readonly.jpg");
    TestUtils::create_test_image(&test_file, 100, 100, None);
    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        fs::set_permissions(&test_file, fs::Permissions::from_mode(0o444)).unwrap();
    }
    #[cfg(windows)]
    {
        use std::os::windows::fs::PermissionsExt;
        let mut perms = fs::metadata(&test_file).unwrap().permissions();
        perms.set_readonly(true);
        fs::set_permissions(&test_file, perms).unwrap();
    }

    let output = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
        ])
        .output()
        .unwrap();

    assert!(output.status.success());
}

#[test]
fn test_complex_interactive_sequence() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 複数の画像ファイルを生成
    for i in 0..3 {
        let test_file = input_dir.join(format!("test{}.jpg", i));
        TestUtils::create_test_image(&test_file, 100, 100, None);
    }

    // 複数の対話的な入力をシミュレート
    let mut child = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--orientation",
            "interactive",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    // 複数の対話的な入力を送信
    if let Some(mut stdin) = child.stdin.take() {
        // 最初のファイル: 回転90度
        stdin.write_all(b"1\n").unwrap();
        // 2番目のファイル: 回転180度
        stdin.write_all(b"2\n").unwrap();
        // 3番目のファイル: 元の向きを保持
        stdin.write_all(b"0\n").unwrap();
    }

    // プロセスの終了を待機
    let output = child.wait_with_output().unwrap();
    assert!(output.status.success());

    // 出力ディレクトリの内容を確認
    let files: Vec<_> = fs::read_dir(&output_dir).unwrap().collect();
    assert_eq!(files.len(), 3);

    // ファイル名に回転情報が含まれていることを確認
    let filenames: Vec<_> = files
        .iter()
        .map(|entry| entry.as_ref().unwrap().file_name().to_string_lossy().into_owned())
        .collect();
    
    assert!(filenames.iter().any(|name| name.contains("_90")));
    assert!(filenames.iter().any(|name| name.contains("_180")));
    assert!(filenames.iter().any(|name| !name.contains("_90") && !name.contains("_180")));
}

#[test]
fn test_interactive_error_handling() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // テスト用の画像ファイルを生成
    let test_file = input_dir.join("test.jpg");
    TestUtils::create_test_image(&test_file, 100, 100, None);

    // 不正な入力をシミュレート
    let mut child = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--orientation",
            "interactive",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    // 不正な入力を送信
    if let Some(mut stdin) = child.stdin.take() {
        // 不正な値
        stdin.write_all(b"invalid\n").unwrap();
        // 範囲外の値
        stdin.write_all(b"9\n").unwrap();
        // 空の入力
        stdin.write_all(b"\n").unwrap();
        // 正しい値
        stdin.write_all(b"1\n").unwrap();
    }

    // プロセスの終了を待機
    let output = child.wait_with_output().unwrap();
    assert!(output.status.success());

    // エラーメッセージが出力されていることを確認
    let stderr = String::from_utf8_lossy(&output.stderr);
    assert!(stderr.contains("無効な入力") || stderr.contains("Invalid input"));
}

#[test]
fn test_parallel_interactive_processing() {
    let temp_dir = TempDir::new().unwrap();
    let input_dir = temp_dir.path().join("input");
    let output_dir = temp_dir.path().join("output");
    fs::create_dir_all(&input_dir).unwrap();
    fs::create_dir_all(&output_dir).unwrap();

    // 複数の画像ファイルを生成
    for i in 0..5 {
        let test_file = input_dir.join(format!("test{}.jpg", i));
        TestUtils::create_test_image(&test_file, 100, 100, None);
    }

    // 並列処理モードで実行
    let mut child = Command::new("cargo")
        .args(&[
            "run",
            "--",
            "-i",
            input_dir.to_str().unwrap(),
            "-o",
            output_dir.to_str().unwrap(),
            "--orientation",
            "interactive",
            "--parallel",
        ])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .unwrap();

    // 対話的な入力を送信
    if let Some(mut stdin) = child.stdin.take() {
        // 最初のファイルの向きを決定（他のファイルにも適用）
        stdin.write_all(b"1\n").unwrap();
    }

    // プロセスの終了を待機
    let output = child.wait_with_output().unwrap();
    assert!(output.status.success());

    // 出力ディレクトリの内容を確認
    let files: Vec<_> = fs::read_dir(&output_dir).unwrap().collect();
    assert_eq!(files.len(), 5);

    // すべてのファイルが同じ向きで処理されていることを確認
    let filenames: Vec<_> = files
        .iter()
        .map(|entry| entry.as_ref().unwrap().file_name().to_string_lossy().into_owned())
        .collect();
    
    assert!(filenames.iter().all(|name| name.contains("_90")));
} 