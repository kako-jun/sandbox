/*!
 * CLI (Command Line Interface) モジュール
 * 
 * TUIベースのコマンドラインインターフェースを提供する
 */

use crate::core::AppCore;
use crate::error::{AppError, Result};
use crate::utils::get_localized_text;
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode, KeyEventKind},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::CrosstermBackend,
    layout::{Alignment, Constraint, Direction, Layout},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, List, ListItem, ListState, Paragraph},
    Frame, Terminal,
};
use std::io;

/// CLI アプリケーション構造体
pub struct CliApp {
    /// 共通アプリケーションコア
    app_core: AppCore,
    /// メニューの状態
    menu_state: ListState,
    /// 現在のビュー
    current_view: AppView,
    /// 終了フラグ
    should_quit: bool,
}

/// アプリケーションビューの種類
#[derive(Debug, Clone, PartialEq)]
pub enum AppView {
    /// メインメニュー
    MainMenu,
    /// メインコンテンツ表示
    MainContent,
    /// 設定画面
    Settings,
    /// ヘルプ画面
    Help,
}

/// メニュー項目
const MENU_ITEMS: &[&str] = &[
    "main-content",
    "settings", 
    "help",
    "quit"
];

impl CliApp {
    /// 新しいCliAppインスタンスを作成する
    /// 
    /// # Arguments
    /// * `app_core` - 既に初期化されたアプリケーションコア
    /// 
    /// # Returns
    /// 初期化されたCliAppインスタンス
    pub fn new(app_core: AppCore) -> Result<Self> {
        let mut menu_state = ListState::default();
        menu_state.select(Some(0));
        
        Ok(Self {
            app_core,
            menu_state,
            current_view: AppView::MainMenu,
            should_quit: false,
        })
    }
    
    /// CLIアプリケーションを実行する
    /// 
    /// # Returns
    /// アプリケーションの実行結果
    pub fn run(&mut self) -> Result<()> {
        // ターミナルの初期化
        enable_raw_mode()?;
        let mut stdout = io::stdout();
        execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
        let backend = CrosstermBackend::new(stdout);
        let mut terminal = Terminal::new(backend)
            .map_err(|e| AppError::Tui(format!("ターミナルの初期化エラー: {}", e)))?;
        
        // メインループ
        let result = self.run_app(&mut terminal);
        
        // ターミナルの復元
        disable_raw_mode()?;
        execute!(
            terminal.backend_mut(),
            LeaveAlternateScreen,
            DisableMouseCapture
        )?;
        terminal.show_cursor()
            .map_err(|e| AppError::Tui(format!("カーソル表示エラー: {}", e)))?;
        
        if let Err(err) = result {
            eprintln!("アプリケーションエラー: {}", err);
        }
        
        Ok(())
    }
    
    /// アプリケーションのメインループ
    /// 
    /// # Arguments
    /// * `terminal` - ターミナルインスタンス
    /// 
    /// # Returns
    /// 実行結果
    fn run_app<B: ratatui::backend::Backend>(&mut self, terminal: &mut Terminal<B>) -> Result<()> {
        loop {
            // 画面を描画
            terminal.draw(|f| self.ui(f))
                .map_err(|e| AppError::Tui(format!("描画エラー: {}", e)))?;
            
            // イベントを処理
            if event::poll(std::time::Duration::from_millis(250))
                .map_err(|e| AppError::Tui(format!("イベントポーリングエラー: {}", e)))? {
                if let Event::Key(key) = event::read()
                    .map_err(|e| AppError::Tui(format!("キー読み取りエラー: {}", e)))? {
                    if key.kind == KeyEventKind::Press {
                        self.handle_input(key.code)?;
                    }
                }
            }
            
            // 終了チェック
            if self.should_quit {
                break;
            }
        }
        Ok(())
    }
    
    /// ユーザー入力を処理する
    /// 
    /// # Arguments
    /// * `key` - 押されたキー
    /// 
    /// # Returns
    /// 処理結果
    fn handle_input(&mut self, key: KeyCode) -> Result<()> {
        match self.current_view {
            AppView::MainMenu => {
                match key {
                    KeyCode::Up => {
                        let selected = self.menu_state.selected().unwrap_or(0);
                        let new_index = if selected == 0 {
                            MENU_ITEMS.len() - 1
                        } else {
                            selected - 1
                        };
                        self.menu_state.select(Some(new_index));
                    }
                    KeyCode::Down => {
                        let selected = self.menu_state.selected().unwrap_or(0);
                        let new_index = (selected + 1) % MENU_ITEMS.len();
                        self.menu_state.select(Some(new_index));
                    }
                    KeyCode::Enter => {
                        if let Some(selected) = self.menu_state.selected() {
                            match MENU_ITEMS[selected] {
                                "main-content" => self.current_view = AppView::MainContent,
                                "settings" => self.current_view = AppView::Settings,
                                "help" => self.current_view = AppView::Help,
                                "quit" => self.should_quit = true,
                                _ => {}
                            }
                        }
                    }
                    KeyCode::Char('q') => self.should_quit = true,
                    _ => {}
                }
            }
            _ => {
                match key {
                    KeyCode::Esc => self.current_view = AppView::MainMenu,
                    KeyCode::Char('q') => self.should_quit = true,
                    _ => {}
                }
            }
        }
        Ok(())
    }
    
    /// UIを描画する
    /// 
    /// # Arguments
    /// * `f` - フレーム
    fn ui(&mut self, f: &mut Frame) {
        match self.current_view {
            AppView::MainMenu => self.draw_menu(f),
            AppView::MainContent => self.draw_main_content(f),
            AppView::Settings => self.draw_settings(f),
            AppView::Help => self.draw_help(f),
        }
    }
    
    /// メインメニューを描画する
    /// 
    /// # Arguments
    /// * `f` - フレーム
    fn draw_menu(&mut self, f: &mut Frame) {
        let chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([
                Constraint::Length(3),
                Constraint::Min(0),
                Constraint::Length(3),
            ])
            .split(f.size());
        
        // タイトル
        let title = Paragraph::new(get_localized_text("app-title"))
            .style(Style::default().fg(Color::Cyan).add_modifier(Modifier::BOLD))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL));
        f.render_widget(title, chunks[0]);
        
        // メニュー項目
        let menu_items: Vec<ListItem> = MENU_ITEMS
            .iter()
            .map(|item| {
                let content = get_localized_text(item);
                ListItem::new(content)
            })
            .collect();
        
        let menu = List::new(menu_items)
            .block(Block::default().title("Menu").borders(Borders::ALL))
            .style(Style::default().fg(Color::White))
            .highlight_style(
                Style::default()
                    .bg(Color::Yellow)
                    .fg(Color::Black)
                    .add_modifier(Modifier::BOLD)
            )
            .highlight_symbol(">> ");
        
        f.render_stateful_widget(menu, chunks[1], &mut self.menu_state);
        
        // ヘルプテキスト
        let help_text = Paragraph::new("Use ↑↓ to navigate, Enter to select, 'q' to quit")
            .style(Style::default().fg(Color::Gray))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL));
        f.render_widget(help_text, chunks[2]);
    }
    
    /// メインコンテンツを描画する
    /// 
    /// # Arguments
    /// * `f` - フレーム
    fn draw_main_content(&self, f: &mut Frame) {
        let content = self.app_core.get_main_content();
        let paragraph = Paragraph::new(content)
            .style(Style::default().fg(Color::White))
            .alignment(Alignment::Center)
            .block(Block::default()
                .title(get_localized_text("main-content"))
                .borders(Borders::ALL));
        
        let area = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Min(0)])
            .split(f.size())[0];
        
        f.render_widget(paragraph, area);
        
        // 戻るためのヘルプテキスト
        let help_chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Min(0), Constraint::Length(3)])
            .split(f.size());
        
        let help = Paragraph::new("Press ESC to return to menu, 'q' to quit")
            .style(Style::default().fg(Color::Gray))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL));
        f.render_widget(help, help_chunks[1]);
    }
    
    /// 設定画面を描画する
    /// 
    /// # Arguments
    /// * `f` - フレーム
    fn draw_settings(&self, f: &mut Frame) {
        let config = self.app_core.config();
        
        let settings_text = vec![
            Line::from(vec![
                Span::styled(
                    format!("{}: ", get_localized_text("language")),
                    Style::default().fg(Color::Yellow)
                ),
                Span::styled(
                    config.language.clone(),
                    Style::default().fg(Color::White)
                ),
            ]),
            Line::from(vec![
                Span::styled(
                    format!("{}: ", get_localized_text("log-level")),
                    Style::default().fg(Color::Yellow)
                ),
                Span::styled(
                    config.log_level.clone(),
                    Style::default().fg(Color::White)
                ),
            ]),
            Line::from(vec![
                Span::styled(
                    format!("{}: ", get_localized_text("force-cli-mode")),
                    Style::default().fg(Color::Yellow)
                ),
                Span::styled(
                    if config.force_cli_mode { get_localized_text("yes") } else { get_localized_text("no") },
                    Style::default().fg(Color::White)
                ),
            ]),
        ];
        
        let paragraph = Paragraph::new(settings_text)
            .block(Block::default()
                .title(get_localized_text("settings"))
                .borders(Borders::ALL));
        
        let area = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Min(0)])
            .split(f.size())[0];
        
        f.render_widget(paragraph, area);
        
        // 戻るためのヘルプテキスト
        let help_chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Min(0), Constraint::Length(3)])
            .split(f.size());
        
        let help = Paragraph::new("Press ESC to return to menu, 'q' to quit")
            .style(Style::default().fg(Color::Gray))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL));
        f.render_widget(help, help_chunks[1]);
    }
    
    /// ヘルプ画面を描画する
    /// 
    /// # Arguments
    /// * `f` - フレーム
    fn draw_help(&self, f: &mut Frame) {
        let help_text = vec![
            Line::from("Keyboard Shortcuts:"),
            Line::from(""),
            Line::from("↑↓ - Navigate menu items"),
            Line::from("Enter - Select menu item"),
            Line::from("ESC - Return to main menu"),
            Line::from("q - Quit application"),
            Line::from(""),
            Line::from(get_localized_text("app-description")),
        ];
        
        let paragraph = Paragraph::new(help_text)
            .block(Block::default()
                .title(get_localized_text("help"))
                .borders(Borders::ALL));
        
        let area = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Min(0)])
            .split(f.size())[0];
        
        f.render_widget(paragraph, area);
        
        // 戻るためのヘルプテキスト
        let help_chunks = Layout::default()
            .direction(Direction::Vertical)
            .constraints([Constraint::Min(0), Constraint::Length(3)])
            .split(f.size());
        
        let help = Paragraph::new("Press ESC to return to menu, 'q' to quit")
            .style(Style::default().fg(Color::Gray))
            .alignment(Alignment::Center)
            .block(Block::default().borders(Borders::ALL));
        f.render_widget(help, help_chunks[1]);
    }
}