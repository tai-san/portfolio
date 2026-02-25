document.addEventListener("DOMContentLoaded", function() {
    // --- 1. 共通パーツ（広告・フッター）の取得と設定 ---
    const adTop = document.querySelector(".ad-top");
    const adBottom = document.querySelector(".ad-bottom");
    const footerArea = document.querySelector(".mago-footer-nav");

    if (adTop) {
        adTop.innerHTML = `<div style="background:#f9f9f9; padding:20px; color:#ccc; font-size:12px; text-align:center; border:1px dashed #eee;">スポンサーリンク（TOP）</div>`;
    }
    if (adBottom) {
        adBottom.innerHTML = `<div style="background:#f9f9f9; padding:20px; color:#ccc; font-size:12px; text-align:center; border:1px dashed #eee;">スポンサーリンク（BOTTOM）</div>`;
    }

    if (footerArea) {
        const linkDiv = document.createElement("div");
        linkDiv.className = "footer-sub-links";
        linkDiv.style.cssText = "margin-top: 30px; font-size: 0.75rem; text-align: center;";
        linkDiv.innerHTML = `
            <a href="../../about/policy.html" style="color: #999; text-decoration: none;">プライバシーポリシー・免責事項</a>
            <span style="color: #ddd; margin: 0 8px;">|</span>
            <a href="../../about/contact.html" style="color: #999; text-decoration: none;">お問い合わせ</a>
        `;
        const copyP = document.createElement("p");
        copyP.className = "footer-copy";
        copyP.style.cssText = "color: #bbb; font-size: 0.7rem; margin-top: 15px; text-align: center;";
        copyP.innerText = "© らじとく ";
        footerArea.appendChild(linkDiv);
        footerArea.appendChild(copyP);
    }

    // --- 2. 📸 スクショボタン生成機能 ---
    const isMagoPage = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some(link => link.href.includes('mago.css'));
    
    if (isMagoPage) {
        function createSwitchBtn(id) {
            const btn = document.createElement('button');
            btn.id = id;
            btn.innerHTML = '📸 スクショモード切替';
            btn.style.cssText = "background: #333; color: #fff; border: none; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; cursor: pointer; font-weight: bold; transition: 0.3s; display: inline-block;";
            
            btn.onclick = function() {
                document.body.classList.toggle('screenshot-mode');
                const isSS = document.body.classList.contains('screenshot-mode');
                document.querySelectorAll('[id^="ss-toggle-btn"]').forEach(b => {
                    b.innerText = isSS ? "📱 通常モードに戻る" : "📸 スクショモード切替";
                    b.style.background = isSS ? "#f10ae6" : "#333";
                });
            };

            const wrapper = document.createElement('div');
            wrapper.className = "mode-switches-wrapper"; 
            wrapper.style.cssText = "display: block; text-align: right; margin: 15px auto; padding: 0 15px; max-width: 600px; box-sizing: border-box; position: relative; z-index: 9999; width: 100%;";
            wrapper.appendChild(btn);
            return wrapper;
        }

        if (adTop) adTop.parentNode.insertBefore(createSwitchBtn('ss-toggle-btn-1'), adTop.nextSibling);
        if (adBottom) adBottom.parentNode.insertBefore(createSwitchBtn('ss-toggle-btn-2'), adBottom);
    }

    // --- 3. 🛡️ 武器セクション（アコーディオン） ---
    const bukiSection = document.querySelector('.section-buki');
    if (bukiSection) {
        bukiSection.classList.add('buki-closed');
        const toggleTrigger = document.createElement('div');
        toggleTrigger.className = 'buki-toggle-trigger';
        toggleTrigger.innerHTML = '<span>🛡️ 要点（武器）をチェックする</span><span class="arrow-icon">▼</span>';
        bukiSection.insertBefore(toggleTrigger, bukiSection.firstChild);
        toggleTrigger.onclick = function() {
            const isOpen = bukiSection.classList.toggle('buki-open');
            bukiSection.classList.toggle('buki-closed');
            this.querySelector('.arrow-icon').innerText = isOpen ? '▲' : '▼';
        };
    }

// --- 4. 🔍 検索用HTML要素を自動生成 (rakupass.html のみ) ---
    const header = document.querySelector('.insta-profile-header');
    
    // 現在のファイル名が rakupass.html かどうかを判定
    const isTopPage = window.location.pathname.includes('rakupass.html');

    if (header && isTopPage) {
        const searchBox = document.createElement('div');
        searchBox.id = 'dynamic-search-container';
        searchBox.style.cssText = "padding: 20px 15px; background: #fff; border-bottom: 1px solid #eee;";
        searchBox.innerHTML = `
            <div style="max-width: 500px; margin: 0 auto;">
                <input type="text" id="global-search-input" placeholder="🔍 過去問検索（例：77AM56／放射線物理学／心筋）  " 
                       style="width: 100%; padding: 12px 20px; border: 2px solid #f10ae6; border-radius: 25px; outline: none; font-size: 16px; box-sizing: border-box; -webkit-appearance: none;">
                <div id="result-count" style="font-size: 0.75rem; color: #999; margin-top: 8px; text-align: center; min-height: 1em;"></div>
            </div>
            <div id="search-target-area" style="max-width: 600px; margin: 10px auto 0;"></div>
        `;
        header.parentNode.insertBefore(searchBox, header.nextSibling);
    }
    // --- 5. 🔍 検索ロジック (JSON読み込み) ---
    const searchInput = document.getElementById('global-search-input');
    const targetArea = document.getElementById('search-target-area');
    const resultCount = document.getElementById('result-count');
    const mainMenu = document.querySelector('.category-grid');

    if (searchInput) {
        fetch('questions.json')
            .then(response => response.json())
            .then(data => {
                searchInput.addEventListener('input', function() {
                    const keyword = this.value.toLowerCase().trim();
                    targetArea.innerHTML = '';

                    if (keyword.length < 2) {
                        if (resultCount) resultCount.innerText = "";
                        if (mainMenu) mainMenu.style.display = 'grid'; 
                        return;
                    }

                    if (mainMenu) mainMenu.style.display = 'none';

                    const filtered = data.filter(q => 
                        (q.text || "").toLowerCase().includes(keyword) || 
                        (q.header || "").toLowerCase().includes(keyword) ||
                        (q.subject || "").toLowerCase().includes(keyword)
                    );

                    filtered.forEach(q => {
                        const card = document.createElement('div');
                        card.style.cssText = "background:#fff; border:1px solid #f10ae6; border-radius:15px; padding:15px; margin-bottom:15px; box-shadow:0 2px 8px rgba(0,0,0,0.05); text-align:left;";

                        // 画像タグの生成（q.imageがある場合のみ、そのままの名前で使用）
                        const imageTag = q.image ? `<div style="margin: 10px 0; text-align: center;"><img src="images/${q.image}" style="max-width: 100%; border-radius: 8px; border: 1px solid #eee;"></div>` : "";

                        card.innerHTML = `
                            <div style="color:#f10ae6; font-size:0.75rem; font-weight:bold; margin-bottom:4px;">【${q.subject}】</div>
                            <div style="font-size:0.8rem; color:#666; margin-bottom:8px;">${q.header}</div>
                            ${imageTag}
                            <div style="white-space: pre-wrap; font-size:0.95rem; color:#333;">${q.text}</div>
                            <div style="background:#fff9fb; border-top:1px dashed #f10ae6; padding:10px; border-radius:0 0 10px 10px; margin-top:10px; font-weight:bold; color:#f10ae6;">正解：${q.answer}</div>
                        `;
                        targetArea.appendChild(card);
                    });
                    if (resultCount) resultCount.innerText = filtered.length + " 件ヒットしました";
                });
            })
            .catch(err => console.error("JSONデータの読み込みに失敗しました:", err));
    }
});
