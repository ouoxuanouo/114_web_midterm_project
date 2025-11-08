# 114_web_midterm_project — BookSwap｜校園二手書交換

> 用不到的書，讓它被需要。支援搜尋、提交、收藏、深色模式與 GitHub Pages 展示。

## 組員
- 組長：413637397 魏廷軒
- 組員：413637306 劉品辰

---

## 專案簡介 (Overview)
BookSwap 是一個校園二手書交換的小型 Web App。使用者可以：
- 在「書架」瀏覽/搜尋書籍卡片
- 透過表單提交新書籍（含上傳封面圖片）
- 一鍵收藏，並在「已收藏」清單中查看
- 直接以 Gmail 開新郵件聯絡對方
- 切換深色模式，偏好會記錄在瀏覽器

---

## 使用技術 (Tech Stack)
- **HTML5**：語意化結構（`header/nav/main/section/footer`）
- **CSS3 / Bootstrap 5**：RWD 版面、樣式與元件（Modal、Toast、Badge）
- **JavaScript (ES6+)**：DOM 操作、事件委派、`FileReader`、`localStorage`
- **表單驗證**：HTML5 Constraint Validation + 自訂訊息
- **版本控管**：Git / GitHub，使用 **GitHub Pages** 展示

---

## 功能特色 (Features)
1. **卡片式書架**：卡片 hover 動效、分類徽章、作者/簡介顯示  
2. **搜尋過濾**：即時篩選（書名/作者/分類/簡介）並顯示「共 X 本」  
3. **提交書籍**：表單驗證 + 上傳封面圖（支援 JPG/PNG/WebP，使用 Data URL 存入）  
4. **編輯/刪除**：卡片右下角編輯按鈕、Modal 中更新欄位  
5. **收藏清單**：導覽列「★ 已收藏」，Modal 中集中瀏覽/取消收藏/刪除  
6. **聯絡按鈕**：一鍵開啟 Gmail 撰寫頁（收件人/主旨預填）  
7. **深色模式**：切換與儲存偏好（`localStorage`）  
8. **Toast 通知**：新增、更新、刪除操作會有即時提示