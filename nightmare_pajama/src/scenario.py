class Scenario:
    def __init__(self):
        self.current_scene = "start"
        self.scene_data = self.load_scenario()
        self.variables = {}  # ゲーム内変数（フラグなど）
    
    def load_scenario(self):
        # 悪夢のパジャマのシナリオデータ - すべての選択肢を最後まで完成
        return {
            "start": {
                "text": "深夜、ベッドで目を覚ました。\\n身に着けているのは、昨日買ったばかりの黒いパジャマ。\\n店員は「とても人気の商品です」と笑顔で勧めてくれたが...\\n見慣れた部屋なのに、何かが違う。微かに聞こえるのは、虫の羽音のような音。",
                "background": "bedroom_night",
                "choices": [
                    {"text": "パジャマを確認する", "next": "check_pajama"},
                    {"text": "音の正体を確かめる", "next": "investigate_sound"},
                    {"text": "部屋から出る", "next": "leave_room"}
                ]
            },
            "check_pajama": {
                "text": "黒いパジャマを見下ろすと、\\n生地に奇妙な模様が浮かび上がっている。\\n昼間には気づかなかった不可解な刺繍が、\\n暗闇の中で淡く光っているようにも見える。\\n触れると、ひんやりとして不気味だ。\\nパジャマの内側に小さなタグが縫い付けられているのに気づく。",
                "background": "nightmare_pajama",
                "choices": [
                    {"text": "タグを読む", "next": "read_tag"},
                    {"text": "パジャマを脱ごうとする", "next": "try_remove_pajama"},
                    {"text": "そのまま部屋を出る", "next": "leave_room"}
                ]
            },
            "read_tag": {
                "text": "小さなタグには、薄れかけた文字で\\n「夢見る者に安らぎを」と書かれている。\\nしかし、よく見ると文字が滲んで見える。\\n「悪夢を見る者に永遠を」\\nそう読めるような気もする。\\n急に背筋が寒くなり、パジャマが重く感じられた。",
                "background": "mysterious_tag",
                "choices": [
                    {"text": "パジャマを脱ぐ", "next": "try_remove_pajama"},
                    {"text": "気にせず眠ろうとする", "next": "try_sleep"},
                    {"text": "部屋から逃げ出す", "next": "escape_room"}
                ]
            },
            "try_remove_pajama": {
                "text": "パジャマを脱ごうとするが、\\n生地が肌に張り付いて離れない。\\nまるで生きているかのように、\\nパジャマが体にまとわりついてくる。\\n必死に引っ張るが、逆にさらに締め付けられていく。\\n恐怖が心を支配し始める...",
                "background": "pajama_stuck",
                "next": "pajama_curse"
            },
            "try_sleep": {
                "text": "気にしないことにして、再びベッドに横たわる。\\n目を閉じた瞬間、\\n周囲の空気が重くなったような感覚に襲われた。\\n耳を澄ますと、虫の羽音がより大きくなっている。\\nそして、ベッドの下から何かが這い上がってくる音が聞こえた。",
                "background": "bed_horror",
                "choices": [
                    {"text": "ベッドから飛び起きる", "next": "jump_from_bed"},
                    {"text": "そのまま耐える", "next": "endure_horror"}
                ]
            },
            "jump_from_bed": {
                "text": "ベッドから飛び起きると、\\n床に大量の虫が這い回っているのが見えた。\\nその中に、異常に大きな蜂が一匹混じっている。\\n蜂は人間の声で話し始めた。\\n「君もこのパジャマの犠牲者なのですね...\\n私と同じ運命を辿るのですか？」",
                "background": "floor_insects",
                "choices": [
                    {"text": "蜂と会話する", "next": "talk_floor_bee"},
                    {"text": "部屋から逃げる", "next": "flee_bedroom"}
                ]
            },
            "endure_horror": {
                "text": "恐怖に耐えながら、そのままベッドに留まった。\\n這い上がってくるのは、過去の記憶だった。\\n子供の頃、暗闇を怖がっていた自分。\\n大人になって忘れていた純粋な恐怖が蘇る。\\nしかし、今度は逃げずに向き合ってみよう。",
                "background": "childhood_fear",
                "next": "face_childhood_fear"
            },
            "face_childhood_fear": {
                "text": "子供の頃の恐怖と向き合うことで、\\n心の奥にあった傷が癒えていく。\\n暗闇はもう怖くない。\\n自分の一部として受け入れることができた。\\nナイトメアパジャマが温かい光に包まれ、\\n普通のパジャマに戻った。\\n\\n恐怖から逃げずに向き合うことで、\\n真の成長を遂げることができた。\\n\\n【エンディング: 勇気の光】",
                "background": "courage_light",
                "choices": []
            },
            "talk_floor_bee": {
                "text": "「君は誰なの？」\\n蜂は悲しそうに羽を震わせた。\\n「私は以前、このパジャマを着た人間でした。\\n恐怖に負けて、虫になってしまったのです。\\nしかし、君にはまだ希望があります。\\n恐怖を乗り越える方法を教えましょう。」",
                "background": "wise_floor_bee",
                "choices": [
                    {"text": "方法を教えてもらう", "next": "learn_method"},
                    {"text": "一人で解決したい", "next": "solve_alone"}
                ]
            },
            "learn_method": {
                "text": "蜂は優しく説明してくれた。\\n「恐怖は否定するものではありません。\\n受け入れ、理解することで\\n それは力に変わります。\\n最後の部屋で、真の試練が待っています。\\n行きますか？」\\n光る扉が現れた。",
                "background": "learning_moment",
                "choices": [
                    {"text": "試練の部屋に向かう", "next": "trial_room_entrance"},
                    {"text": "もう少し準備したい", "next": "prepare_more"}
                ]
            },
            "trial_room_entrance": {
                "text": "光る扉を開けると、\\nそこは鏡張りの部屋だった。\\n無数の自分が映し出され、\\nそれぞれ異なる感情を表している。\\n中央に台座があり、\\n そこには白いパジャマが置かれている。\\n蜂の声が響く。「真の自分を選んでください。」",
                "background": "mirror_trial_room",
                "choices": [
                    {"text": "白いパジャマを選ぶ", "next": "choose_white_pajama"},
                    {"text": "鏡の自分たちと話す", "next": "talk_to_mirrors"},
                    {"text": "ナイトメアパジャマを受け入れる", "next": "accept_nightmare_final"}
                ]
            },
            "choose_white_pajama": {
                "text": "白いパジャマを選んだ瞬間、\\n鏡の部屋が光に包まれた。\\n過去の恐怖や不安が消え去り、\\n心に平安が訪れる。\\n目を覚ますと、朝の光が差し込んでいた。\\n\\n純粋な心を取り戻し、\\n新しい人生を歩むことができる。\\n\\n【エンディング: 純粋の白】",
                "background": "pure_white_ending",
                "choices": []
            },
            "talk_to_mirrors": {
                "text": "鏡の中の自分たちに話しかける。\\n「君たちは僕の一部だ。\\n恐怖も、怒りも、悲しみも、\\nすべて大切な感情だ。」\\n鏡の自分たちが微笑み、\\n一つに重なり合う。\\nナイトメアパジャマが虹色に輝いた。\\n\\n自分のすべてを受け入れることで、\\n真の調和を得ることができた。\\n\\n【エンディング: 調和の虹】",
                "background": "harmony_rainbow",
                "choices": []
            },
            "accept_nightmare_final": {
                "text": "「この悪夢も僕自身だ。」\\nそう宣言した瞬間、\\n部屋が温かい闇に包まれた。\\nナイトメアパジャマは黒いままだが、\\nもう恐怖を感じることはない。\\n闇と光の完璧なバランスを得た。\\n\\n悪夢さえも愛することで、\\n真の強さを手に入れた。\\n\\n【エンディング: 愛する闇】",
                "background": "loving_darkness",
                "choices": []
            },
            "solve_alone": {
                "text": "「ありがとう。でも自分の力で解決したい。」\\n蜂は理解したように頷いた。\\n「それも一つの道です。\\n勇気を持って進んでください。」\\n蜂は光となって消え、\\n部屋に一人残された。",
                "background": "alone_determination",
                "choices": [
                    {"text": "瞑想して心を整える", "next": "meditate"},
                    {"text": "積極的に行動する", "next": "take_action"}
                ]
            },
            "meditate": {
                "text": "静かに座り、心を落ち着ける。\\n呼吸を整え、内なる声に耳を傾ける。\\nすると、心の奥から\\n「恐怖は学びの機会だ」\\nという声が聞こえてきた。\\nナイトメアパジャマが柔らかく光る。\\n\\n内省を通じて、\\n真の平安を見つけることができた。\\n\\n【エンディング: 内なる平安】",
                "background": "inner_peace",
                "choices": []
            },
            "take_action": {
                "text": "積極的に行動することにした。\\nパジャマに向かって大声で叫ぶ。\\n「もう君に支配されない！\\n僕は自分の人生の主人公だ！」\\nパジャマが光り、\\n美しい金色に変化した。\\n\\n行動力と意志の力で、\\n自分の運命を切り開いた。\\n\\n【エンディング: 意志の金】",
                "background": "golden_will",
                "choices": []
            },
            "flee_bedroom": {
                "text": "部屋から急いで逃げ出した。\\n廊下に出ると、\\nそこは見知らぬ建物だった。\\n長い廊下の向こうに\\n大きな駅のような空間が見える。\\n足音が響く中、\\n選択を迫られる。",
                "background": "escape_corridor",
                "choices": [
                    {"text": "駅に向かう", "next": "approach_dream_station"},
                    {"text": "別の方向を探る", "next": "explore_other_direction"}
                ]
            },
            "approach_dream_station": {
                "text": "駅に向かうと、\\nそこは巨大な空間だった。\\nしかし電車は来ない。\\n代わりに、遠くに自分の家が見える。\\n駅のアナウンスが響く。\\n「最終電車は...もう出発しました。\\n でも、歩いて帰ることができます。」",
                "background": "final_station",
                "choices": [
                    {"text": "家に向かって歩く", "next": "walk_to_home"},
                    {"text": "駅で待ち続ける", "next": "wait_at_station"}
                ]
            },
            "walk_to_home": {
                "text": "家に向かって歩き始めた。\\n長い道のりだったが、\\n一歩一歩踏みしめて進む。\\n途中で疲れても、\\n立ち止まらずに歩き続けた。\\nやがて家に到着し、\\n目を覚ますことができた。\\n\\n努力と忍耐で、\\n自分の道を歩み抜いた。\\n\\n【エンディング: 歩む道】",
                "background": "walking_path",
                "choices": []
            },
            "wait_at_station": {
                "text": "駅で待つことにした。\\n長い時間が過ぎたが、\\n諦めずに待ち続けた。\\nすると、光る電車が現れた。\\n「お待たせしました。\\n希望行きの電車です。」\\n電車に乗ると、\\n明るい未来へ向かった。\\n\\n希望を失わずに待ち続けることで、\\n新しい可能性を掴んだ。\\n\\n【エンディング: 希望の電車】",
                "background": "hope_train",
                "choices": []
            },
            "explore_other_direction": {
                "text": "別の方向を探ると、\\n巨大な子供向けアスレチックがあった。\\n天井まで届く滑り台や\\nジャングルジムが立ち並んでいる。\\n子供たちの笑い声が聞こえるが、\\n姿は見えない。",
                "background": "giant_playground",
                "choices": [
                    {"text": "アスレチックで遊ぶ", "next": "play_athletic"},
                    {"text": "子供たちを探す", "next": "search_children"}
                ]
            },
            "play_athletic": {
                "text": "大人になって忘れていた\\n遊ぶ楽しさを思い出した。\\n滑り台を滑り、\\nジャングルジムを登る。\\n心が軽やかになり、\\n子供の頃の純粋な喜びが蘇る。\\nナイトメアパジャマが\\n虹色に輝いた。\\n\\n遊び心を取り戻すことで、\\n人生に彩りが戻った。\\n\\n【エンディング: 遊び心の虹】",
                "background": "playful_rainbow",
                "choices": []
            },
            "search_children": {
                "text": "子供たちを探して回ると、\\n遊具の奥で\\n一人の子供が泣いているのを見つけた。\\nそれは幼い頃の自分だった。\\n\"どうして僕を忘れちゃったの？\"\\n優しく抱きしめて慰める。\\n\\n内なる子供と再び繋がることで、\\n失っていた純真さを取り戻した。\\n\\n【エンディング: 再会の抱擁】",
                "background": "reunion_embrace",
                "choices": []
            },
            "escape_room": {
                "text": "急いで部屋から逃げ出そうとドアに向かう。\\nしかし、ドアノブが異常に冷たく、\\n触れた瞬間に手が凍りつくような痛みが走った。\\nドアの向こうから、誰かの足音が聞こえてくる。\\nゆっくりと、確実に、こちらに近づいている。",
                "background": "frozen_door",
                "choices": [
                    {"text": "ドアを開ける", "next": "open_frozen_door"},
                    {"text": "窓から逃げる", "next": "escape_window"}
                ]
            },
            "open_frozen_door": {
                "text": "勇気を出してドアを開けると、\\nそこには鏡があった。\\n鏡に映っているのは\\n恐怖に震える自分の姿。\\n\"君が一番怖いのは、\\n自分自身じゃないか？\"\\n鏡の中の自分が語りかける。",
                "background": "mirror_confrontation",
                "choices": [
                    {"text": "鏡の自分と向き合う", "next": "face_mirror_self"},
                    {"text": "鏡を割る", "next": "break_mirror"}
                ]
            },
            "face_mirror_self": {
                "text": "鏡の中の自分と向き合った。\\n\"そうだ。僕が一番怖いのは\\n自分の弱さだった。\"\\n認めた瞬間、\\n鏡の中の自分が微笑んだ。\\n恐怖が勇気に変わり、\\nパジャマが金色に輝く。\\n\\n自分の弱さを受け入れることで、\\n真の強さを得ることができた。\\n\\n【エンディング: 受容の金】",
                "background": "acceptance_gold",
                "choices": []
            },
            "break_mirror": {
                "text": "鏡を拳で割った。\\n鏡の破片が飛び散るが、\\nそれぞれの破片に\\n異なる自分が映っている。\\n\"逃げても無駄だ\"\\n\"向き合うしかない\"\\n破片が光となって消え、\\n心に静寂が訪れた。\\n\\n破壊を通じて、\\n新しい自分を見つけることができた。\\n\\n【エンディング: 破壊と再生】",
                "background": "destruction_rebirth",
                "choices": []
            },
            "escape_window": {
                "text": "窓に向かうと、\\n外は真っ暗な虚無が広がっていた。\\nしかし、遠くに小さな光が見える。\\n窓を開けて飛び降りる。\\n落下する感覚の中で、\\n光に向かって手を伸ばした。",
                "background": "void_fall",
                "choices": [
                    {"text": "光を掴む", "next": "grab_light"},
                    {"text": "落下を受け入れる", "next": "accept_fall"}
                ]
            },
            "grab_light": {
                "text": "必死に光を掴んだ。\\n温かい光が全身を包み、\\n落下が止まった。\\n光の中で、\\n大切な人たちの声が聞こえる。\\n\"君は一人じゃない\"\\n\"みんなが支えている\"\\n\\n他者との繋がりによって、\\n絶望から救われた。\\n\\n【エンディング: 繋がりの光】",
                "background": "connection_light",
                "choices": []
            },
            "accept_fall": {
                "text": "落下を受け入れることにした。\\n風を感じながら\\n静かに落ちていく。\\n途中で気づく。\\n落ちることも\\n一つの体験だということに。\\nやがて柔らかな雲に着地した。\\n\\n全てを受け入れることで、\\n平安を得ることができた。\\n\\n【エンディング: 受容の雲】",
                "background": "acceptance_cloud",
                "choices": []
            },
            "pajama_curse": {
                "text": "パジャマの呪いが本格的に始まった。\\n部屋の隅から、大量の虫の羽音が聞こえてくる。\\n壁という壁を這い回る黒い影。\\nその中に、一匹の異常に大きな蜂が混じっているのが見えた。\\n蜂はこちらをじっと見つめている。",
                "background": "curse_begins",
                "choices": [
                    {"text": "蜂と向き合う", "next": "face_curse_bee"},
                    {"text": "部屋から逃げる", "next": "flee_from_insects"}
                ]
            },
            "face_curse_bee": {
                "text": "蜂と向き合うことにした。\\n\"君は何を伝えたいんだ？\"\\n蜂は人の声で答えた。\\n\"君の恐怖が私を生み出した。\\nでも、君が恐怖を受け入れれば\\n私も変わることができる。\"\\n蜂が美しい蝶に変身した。\\n\\n恐怖と対話することで、\\nそれを美しいものに変えることができた。\\n\\n【エンディング: 変身の蝶】",
                "background": "transformation_butterfly",
                "choices": []
            },
            "flee_from_insects": {
                "text": "虫たちから逃げて部屋を出た。\\n廊下を走っていると、\\n突然床が崩れ落ちた。\\n落ちた先は\\n大きな建物の地下駐車場だった。\\n車は一台もなく、\\n薄暗い照明が点滅している。",
                "background": "basement_parking",
                "choices": [
                    {"text": "駐車場を探索する", "next": "explore_parking"},
                    {"text": "出口を探す", "next": "find_parking_exit"}
                ]
            },
            "explore_parking": {
                "text": "駐車場を歩き回ると、\\n奥の壁に隠し扉を発見した。\\n扉の向こうから\\n温かい光が漏れている。\\n扉を開けると、\\nそこは子供時代の自分の部屋だった。\\nベッドで子供の自分が\\n安らかに眠っている。",
                "background": "childhood_bedroom",
                "choices": [
                    {"text": "子供の自分を起こす", "next": "wake_child"},
                    {"text": "静かに見守る", "next": "watch_child"}
                ]
            },
            "wake_child": {
                "text": "子供の自分を優しく起こした。\\n\"もう大丈夫だよ\"\\n子供の自分は微笑んで\\n\"ありがとう、僕を迎えに来てくれて\"\\n二人が重なり合い、\\n完全な自分になった。\\nパジャマが純白に輝く。\\n\\n過去と現在が統合され、\\n完全な自己を取り戻した。\\n\\n【エンディング: 統合の白】",
                "background": "integration_white",
                "choices": []
            },
            "watch_child": {
                "text": "静かに子供の自分を見守った。\\n平和な寝顔を見ていると、\\n自分の中にも\\nこんな純粋な部分があったことを\\n思い出した。\\n子供は自然に目を覚まし、\\n\"ずっと待ってたよ\"と微笑んだ。\\n\\n忍耐強く見守ることで、\\n自然な癒しを得ることができた。\\n\\n【エンディング: 見守りの愛】",
                "background": "watching_love",
                "choices": []
            },
            "find_parking_exit": {
                "text": "出口を探して駐車場を歩き回ると、\\n螺旋階段を発見した。\\n階段を上がっていくと、\\n屋上に出た。\\nそこには美しい星空が広がっている。\\n夜空を見上げていると、\\n心が穏やかになった。",
                "background": "rooftop_stars",
                "choices": [
                    {"text": "星に願いをかける", "next": "wish_on_star"},
                    {"text": "深呼吸して瞑想する", "next": "meditate_stars"}
                ]
            },
            "wish_on_star": {
                "text": "流れ星に向かって願った。\\n\"この悪夢が終わりますように\"\\n星が一際輝き、\\n温かい光が降り注いだ。\\n気づくと、\\n自分のベッドで目を覚ましていた。\\n朝日が窓から差し込んでいる。\\n\\n純粋な願いが叶い、\\n新しい朝を迎えることができた。\\n\\n【エンディング: 星の願い】",
                "background": "star_wish",
                "choices": []
            },
            "meditate_stars": {
                "text": "星空の下で瞑想した。\\n宇宙の広がりを感じながら、\\n自分の小ささと\\n同時に存在の尊さを実感した。\\n恐怖も悩みも\\n宇宙から見れば小さなもの。\\n心に深い平安が宿った。\\n\\n瞑想によって、\\n宇宙的な視点を得ることができた。\\n\\n【エンディング: 宇宙の平安】",
                "background": "cosmic_peace",
                "choices": []
            },
            "investigate_sound": {
                "text": "部屋の隅を見ると、大量の虫が壁を這っている。\\n黒い影がうごめき、不気味な羽音が響く。\\nよく見ると、虫たちは何かの文字を\\n描くように動いているようにも見える。\\nその中に、一匹の大きな蜂が混じっていた。\\n蜂の目が、こちらを見つめている。",
                "background": "insects_wall",
                "choices": [
                    {"text": "虫の動きを観察する", "next": "observe_insects"},
                    {"text": "蜂から逃げる", "next": "escape_bee"},
                    {"text": "立ち向かう", "next": "face_bee"}
                ]
            },
            "observe_insects": {
                "text": "虫たちの動きを注意深く観察していると、\\n確かに何かの文字を描いている。\\n「HELP」\\n「TRAPPED」\\n「WAKE UP」\\n様々な言葉が壁に浮かんでは消えていく。\\n最後に現れた文字は「FIND YOURSELF」だった。\\n蜂がより近づいてくる。",
                "background": "insect_messages",
                "choices": [
                    {"text": "蜂に話しかける", "next": "talk_to_observe_bee"},
                    {"text": "メッセージの意味を考える", "next": "think_message"}
                ]
            },
            "talk_to_observe_bee": {
                "text": "\"君が書かせているの？\"\\n蜂は羽を震わせて答えた。\\n\"私たちは過去の持ち主たちの魂です。\\n皆、自分自身を見失ってしまった。\\n君には同じ道を歩んでほしくない。\\n真の自分を見つけてください。\"\\n蜂が光の道を作り出した。",
                "background": "soul_guidance",
                "choices": [
                    {"text": "光の道を歩く", "next": "follow_soul_path"},
                    {"text": "過去の持ち主について聞く", "next": "ask_about_past"}
                ]
            },
            "follow_soul_path": {
                "text": "光の道を歩いていくと、\\n心の奥底にある\\n本当の自分に出会った。\\n\"ようこそ、本当の僕のところへ\"\\n真の自分と握手を交わすと、\\nすべての偽りが剥がれ落ちた。\\nナイトメアパジャマが\\n透明に変化した。\\n\\n真の自分を見つけることで、\\n完全な透明性を得ることができた。\\n\\n【エンディング: 透明な真実】",
                "background": "transparent_truth",
                "choices": []
            },
            "ask_about_past": {
                "text": "\"過去の持ち主たちは\\nどうなったの？\"\\n蜂は悲しそうに答えた。\\n\"皆、恐怖に負けて\\n自分を見失った。\\nでも、君が成功すれば\\n私たちも救われる。\"\\nその言葉に責任を感じた。",
                "background": "responsibility_weight",
                "choices": [
                    {"text": "みんなを救うと約束する", "next": "promise_to_save"},
                    {"text": "まず自分を救うことに集中する", "next": "focus_on_self"}
                ]
            },
            "promise_to_save": {
                "text": "\"みんなを救う。約束する。\"\\n蜂たちが喜びの舞を踊った。\\n\"ありがとう！\"\\n強い意志を持った瞬間、\\nナイトメアパジャマが\\n黄金に輝いた。\\nその光で、\\n過去の魂たちが解放された。\\n\\n他者への愛と責任感で、\\n真のヒーローになることができた。\\n\\n【エンディング: 英雄の黄金】",
                "background": "hero_gold",
                "choices": []
            },
            "focus_on_self": {
                "text": "\"まず自分を救うことから始める\"\\n蜂は理解したように頷いた。\\n\"それも正しい選択です。\\n自分を愛せない者は\\n他者も救えません。\"\\n自分を大切にする決意が\\nパジャマを銀色に変えた。\\n\\n自己愛の大切さを学び、\\n真の自立を得ることができた。\\n\\n【エンディング: 自立の銀】",
                "background": "independence_silver",
                "choices": []
            },
            "think_message": {
                "text": "\"FIND YOURSELF\"\\nこの言葉の意味を考えた。\\n自分は本当は何者なのか？\\n何を求めているのか？\\n静かに内省していると、\\n答えが心の奥から浮かんできた。\\n\"愛されたい\"\\nそれが一番の願いだった。",
                "background": "inner_reflection",
                "choices": [
                    {"text": "自分を愛することから始める", "next": "start_self_love"},
                    {"text": "他者からの愛を求める", "next": "seek_others_love"}
                ]
            },
            "start_self_love": {
                "text": "\"まず自分を愛そう\"\\n鏡に向かって\\n\"君は大切な存在だ\"と言った。\\n最初は恥ずかしかったが、\\n段々と心から思えるようになった。\\n自己愛が芽生えると、\\nパジャマがピンク色に輝いた。\\n\\n自分を愛することで、\\n真の幸せを見つけることができた。\\n\\n【エンディング: 自愛のピンク】",
                "background": "self_love_pink",
                "choices": []
            },
            "seek_others_love": {
                "text": "他者からの愛を求めて\\n周りを見回した。\\nすると、今まで気づかなかった\\n温かい視線を感じた。\\n家族、友人、\\n多くの人が自分を\\n見守ってくれていたのだ。\\n\\n他者の愛に気づくことで、\\n孤独感が癒された。\\n\\n【エンディング: 愛の発見】",
                "background": "love_discovery",
                "choices": []
            },
            "escape_bee": {
                "text": "蜂から逃げようとした瞬間、\\n突然足元の床が崩れる。\\n落下する感覚に襲われながら、\\n気がつくと巨大な子供向け\\nアスレチックの上にいた。\\n滑り台やジャングルジムが\\n天井まで届いている。",
                "background": "athletic_landing",
                "choices": [
                    {"text": "アスレチックを楽しむ", "next": "enjoy_athletic"},
                    {"text": "出口を探す", "next": "find_athletic_exit"}
                ]
            },
            "enjoy_athletic": {
                "text": "せっかくなので\\nアスレチックを楽しむことにした。\\n滑り台を滑り、\\nジャングルジムを登る。\\n大人になって忘れていた\\n純粋な楽しさが蘇る。\\n笑顔でいると、\\nパジャマが虹色に輝いた。\\n\\n遊び心を取り戻すことで、\\n人生に彩りが戻った。\\n\\n【エンディング: 遊びの虹】",
                "background": "play_rainbow",
                "choices": []
            },
            "find_athletic_exit": {
                "text": "出口を探してアスレチックを\\n移動していると、\\n最上部に光る扉を発見した。\\n扉を開けると、\\nそこは自分の家の屋上だった。\\n夜空には満天の星が輝いている。\\n家族の温かい声が下から聞こえてくる。\\n\\n家族の愛に包まれて、\\n安心感を得ることができた。\\n\\n【エンディング: 家族の愛】",
                "background": "family_love",
                "choices": []
            },
            "face_bee": {
                "text": "蜂と向き合うことにした。\\n\"君は何者なの？\"\\n蜂は人間の声で答えた。\\n\"私は君の恐怖の化身です。\\nでも同時に、\\n君の勇気の可能性でもあります。\\n私を受け入れますか？\\nそれとも戦いますか？\"",
                "background": "bee_confrontation",
                "choices": [
                    {"text": "蜂を受け入れる", "next": "accept_bee"},
                    {"text": "蜂と戦う", "next": "fight_bee"}
                ]
            },
            "accept_bee": {
                "text": "\"君も僕の一部だ。\\n受け入れるよ。\"\\n蜂は嬉しそうに羽ばたいた。\\n\"ありがとう。\\n恐怖を受け入れてくれて。\"\\n蜂が光となって\\n胸の中に入ってきた。\\n恐怖が勇気に変わった。\\n\\n恐怖を受け入れることで、\\nそれを勇気に変換することができた。\\n\\n【エンディング: 勇気への変換】",
                "background": "courage_transformation",
                "choices": []
            },
            "fight_bee": {
                "text": "\"君とは戦う！\"\\n蜂との激しい戦いが始まった。\\n最初は劣勢だったが、\\n諦めずに戦い続けた。\\nやがて蜂は\\n\"君の意志の強さに負けた\"\\nと言って消えていった。\\n\\n不屈の意志で、\\n困難を乗り越えることができた。\\n\\n【エンディング: 不屈の意志】",
                "background": "indomitable_will",
                "choices": []
            },
            "leave_room": {
                "text": "ドアを開けると、そこは見知らぬ建物の廊下だった。\\n長い廊下の向こうに、駅のような大きな空間が見える。\\n天井は異様に高く、薄暗い照明が不気味に揺れている。\\n足音が廊下に響き、\\nどこからともなく子供たちの笑い声が聞こえてくる。",
                "background": "strange_corridor",
                "choices": [
                    {"text": "駅の方へ向かう", "next": "approach_station"},
                    {"text": "笑い声の方向へ行く", "next": "follow_laughter"},
                    {"text": "部屋に戻る", "next": "return_to_room"}
                ]
            },
            "approach_station": {
                "text": "駅のような空間に入ると、そこは確かに大きな駅だった。\\nしかし、電車は来ない。\\n代わりに、駅の向こうに見慣れた自分の家が見える。\\nホームには他の人の姿はなく、\\n電光掲示板には\\n「心の故郷行き - まもなく出発」\\nと表示されている。",
                "background": "heart_station",
                "choices": [
                    {"text": "家に向かう", "next": "go_to_heart_home"},
                    {"text": "電車を待つ", "next": "wait_heart_train"}
                ]
            },
            "go_to_heart_home": {
                "text": "家に向かって歩いた。\\n近づくにつれて、\\n懐かしい香りがしてくる。\\n母の手料理の匂い、\\n父のタバコの匂い、\\n家族の温かさ。\\n玄関を開けると、\\n\"おかえり\"の声が聞こえた。\\n\\n心の故郷に帰ることで、\\n真の安らぎを得ることができた。\\n\\n【エンディング: 心の帰郷】",
                "background": "heart_homecoming",
                "choices": []
            },
            "wait_heart_train": {
                "text": "電車を待つことにした。\\nしばらくすると、\\n光に包まれた電車がやってきた。\\n乗り込むと、\\n車内には過去に出会った\\n大切な人たちがいた。\\n\"一緒に新しい場所へ行こう\"\\n\\n大切な人たちと共に、\\n新しい人生の旅を始めることができた。\\n\\n【エンディング: 共に歩む旅】",
                "background": "journey_together",
                "choices": []
            },
            "follow_laughter": {
                "text": "子供たちの笑い声を頼りに歩いていくと、\\n巨大な子供向けアスレチック施設に出た。\\n天井まで届くような巨大な滑り台や\\nジャングルジムが立ち並んでいる。\\n笑い声はより大きくなったが、\\n子供たちの姿は見えない。",
                "background": "laughter_athletic",
                "choices": [
                    {"text": "声の主を探す", "next": "find_laughter_source"},
                    {"text": "一人で遊ぶ", "next": "play_alone"}
                ]
            },
            "find_laughter_source": {
                "text": "声の主を探していると、\\n滑り台の上で\\n透明な子供たちを発見した。\\n彼らは過去に\\nアスレチックで遊んだ\\nすべての子供たちの魂だった。\\n\"一緒に遊ぼう！\"\\n手を取り合って遊んだ。\\n\\n過去の楽しい記憶と繋がることで、\\n永遠の喜びを得ることができた。\\n\\n【エンディング: 永遠の遊び】",
                "background": "eternal_play",
                "choices": []
            },
            "play_alone": {
                "text": "一人でアスレチックで遊んだ。\\n最初は寂しかったが、\\n次第に\\n一人の時間の価値に気づいた。\\n自分のペースで、\\n自分の好きなように遊ぶ。\\n それもまた素晴らしいことだ。\\n\\n孤独を楽しむことで、\\n真の自立を得ることができた。\\n\\n【エンディング: 孤独の美学】",
                "background": "solitude_beauty",
                "choices": []
            },
            "return_to_room": {
                "text": "やはり部屋に戻ることにした。\\n逃げることはできない。\\nここで解決しなければならない。\\n部屋に戻ると、\\nすべてが元通りになっていた。\\nしかし、心境は変わっていた。\\nもう恐怖はない。",
                "background": "returned_room",
                "choices": [
                    {"text": "ベッドで安らかに眠る", "next": "peaceful_sleep"},
                    {"text": "窓を開けて新鮮な空気を吸う", "next": "fresh_air"}
                ]
            },
            "peaceful_sleep": {
                "text": "ベッドに横たわり、\\n安らかに眠りについた。\\n今度見る夢は\\n美しい夢になるだろう。\\nナイトメアパジャマは\\n優しいピンク色に変わり、\\n sweet dreams を約束してくれた。\\n\\n平安を得ることで、\\n美しい夢を見ることができるようになった。\\n\\n【エンディング: 美夢のピンク】",
                "background": "sweet_dreams_pink",
                "choices": []
            },
            "fresh_air": {
                "text": "窓を開けて\\n新鮮な空気を深く吸い込んだ。\\n外は美しい朝焼けが始まっている。\\n新しい一日の始まりだ。\\nナイトメアパジャマは\\n朝日の色に変わり、\\n希望を与えてくれた。\\n\\n新鮮な始まりを得ることで、\\n希望に満ちた未来を歩むことができる。\\n\\n【エンディング: 希望の朝日】",
                "background": "hope_sunrise",
                "choices": []
            }
        }
    
    def get_current_scene(self):
        return self.scene_data.get(self.current_scene, None)
    
    def advance_scene(self, choice_index=None):
        current = self.get_current_scene()
        if not current:
            return False
        
        if "choices" in current and choice_index is not None:
            if 0 <= choice_index < len(current["choices"]):
                next_scene = current["choices"][choice_index]["next"]
                self.current_scene = next_scene
                return True
        elif "next" in current:
            self.current_scene = current["next"]
            return True
        
        return False
    
    def set_variable(self, name, value):
        self.variables[name] = value
    
    def get_variable(self, name, default=None):
        return self.variables.get(name, default)