/* ================= DOM ================= */

const source =
    document.getElementById("source");

const target =
    document.getElementById("target");

const result =
    document.getElementById("result");

const resultOriginal =
    document.getElementById("resultOriginal");

const resultChecked =
    document.getElementById("resultChecked");

// Line-number gutters removed per user request

const layoutToggle =
    document.getElementById("layoutToggle");

const editorGrid =
    document.querySelector(".editor-grid");

const statusLight =
    document.getElementById("statusLight");

const statusText =
    document.getElementById("statusText");

const resultToggle =
    document.getElementById("resultToggle");

const comparisonGrid =
    document.querySelector(".comparison-grid");

const fontSizeSelect =
    document.getElementById("fontSizeSelect");

const editModeToggle =
    document.getElementById("editModeToggle");

const stickyHeader =
    document.getElementById("stickyHeader");

const widthToggleSticky =
    document.getElementById("widthToggleSticky");

const scrollTopButton =
    document.getElementById("scrollTopButton");

let isEditMode = localStorage.getItem("editMode") === "true";
let isWideLayout = localStorage.getItem("wideLayout") === "true";
let isInputWide = localStorage.getItem("inputWide") === "true";
let isFitHeight = localStorage.getItem("fitHeight") === "true";
const defaultTextareaHeight = "350px";
const heightToggle = document.getElementById("heightToggle");

function scrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function updateStickyHeaderVisibility(){
    if(!stickyHeader) return;

    const shouldShow = window.scrollY > 120;
    stickyHeader.classList.toggle("hidden", !shouldShow);
}

function syncWidthToggleButtons(){
    const text = isInputWide ? "↔" : "⇔";
    const title = isInputWide ? "Thu gọn width của 2 input" : "Mở rộng width của 2 input";

    if(widthToggleSticky){
        widthToggleSticky.textContent = text;
        widthToggleSticky.title = title;
    }
}

function syncFitToggleButtons(){
    const text = isFitHeight ? "⬚" : "⇕";
    const title = isFitHeight ? "Thu gọn chiều cao input" : "Mở hết nội dung input";

    if(heightToggle){
        heightToggle.textContent = text;
        heightToggle.title = title;
    }
}

function toggleEditMode(){
    isEditMode = !isEditMode;
    localStorage.setItem("editMode", isEditMode);
    document.body.classList.toggle("edit-mode", isEditMode);
    editModeToggle.style.opacity = isEditMode ? "1" : "0.5";
    editModeToggle.title = isEditMode ? "Chế độ chỉnh sửa (BẬT) - click để tắt" : "Chế độ xem bình thường - click để bật chỉnh sửa";
    runCompare();
}

// Initialize edit mode
document.body.classList.toggle("edit-mode", isEditMode);
editModeToggle.style.opacity = isEditMode ? "1" : "0.5";
editModeToggle.addEventListener("click", toggleEditMode);

function applyWideLayout(){
    editorGrid.classList.toggle("single", isWideLayout);
    layoutToggle.innerHTML = isWideLayout ? "📊" : "📐";
}

function applyInputWidth(){
    document.body.classList.toggle("input-wide", isInputWide);
}

function applyFitHeight(){
    const textareas = document.querySelectorAll(".editor-wrapper textarea");

    textareas.forEach((ta) => {
        if(isFitHeight){
            ta.style.height = "auto";
            ta.style.minHeight = "auto";
            ta.style.overflowY = "hidden";
            ta.style.height = `${ta.scrollHeight}px`;
            ta.style.minHeight = `${ta.scrollHeight}px`;
        }
        else{
            ta.style.height = defaultTextareaHeight;
            ta.style.minHeight = defaultTextareaHeight;
            ta.style.overflowY = "auto";
        }
    });
}

function toggleWideLayout(){
    isWideLayout = !isWideLayout;
    localStorage.setItem("wideLayout", isWideLayout);
    applyWideLayout();
}

function toggleInputWidth(){
    isInputWide = !isInputWide;
    localStorage.setItem("inputWide", isInputWide);
    applyInputWidth();
    syncWidthToggleButtons();
}

function toggleFitHeight(){
    isFitHeight = !isFitHeight;
    localStorage.setItem("fitHeight", isFitHeight);
    applyFitHeight();
    syncFitToggleButtons();
}

let resultCollapsed = localStorage.getItem("resultCollapsed") === "true";

function toggleResultView(){
    resultCollapsed = !resultCollapsed;
    comparisonGrid.classList.toggle("single-check", resultCollapsed);
    resultToggle.textContent = resultCollapsed ? "⬅" : "➡";
    resultToggle.title = resultCollapsed ? "Hiện cả hai bên" : "Ẩn bản gốc và mở rộng bản kiểm tra";
    
    localStorage.setItem("resultCollapsed", resultCollapsed);
    // Re-render results so original/checked content is repopulated correctly
    syncCheckedPanelWidth();
    runCompare();
}

// Restore result view state on page load
if(resultCollapsed){
    comparisonGrid.classList.add("single-check");
    resultToggle.textContent = "⬅";
    resultToggle.title = "Hiện cả hai bên";
}

if(resultToggle){
    resultToggle.addEventListener("click", toggleResultView);
}

// Keep the checked result panel width in sync with the target textarea when collapsed
function syncCheckedPanelWidth(){
    const panel = resultChecked.closest('.comparison-panel');
    if(!panel) return;

    if(resultCollapsed){
        const ta = document.getElementById('target');
        if(ta){
            // Use the textarea's inner width so the text lines up
            const width = ta.clientWidth;
            // panel.style.width = width + 'px';
            panel.style.maxWidth = '100%';
        }
    }
    else{
        panel.style.width = '';
        panel.style.maxWidth = '';
    }
}

// Ensure the toggle uses the main handler (already attached above)

// Sync on load if collapsed
if(resultCollapsed){
    syncCheckedPanelWidth();
}

// Sync on window resize while collapsed
window.addEventListener('resize', () => {
    if(resultCollapsed) syncCheckedPanelWidth();
});

// Font size control
const fontSizeMap = {
    small: {
        base: "16px",
        result: "18px"
    },
    medium: {
        base: "20px",
        result: "24px"
    },
    large: {
        base: "24px",
        result: "28px"
    }
};

function setFontSize(size){
    const config = fontSizeMap[size];
    if(config){
        document.documentElement.style.setProperty("--font-size-base", config.base);
        document.documentElement.style.setProperty("--font-size-result", config.result);
        localStorage.setItem("fontSize", size);
    }
}

const savedFontSize = localStorage.getItem("fontSize") || "medium";
fontSizeSelect.value = savedFontSize;
setFontSize(savedFontSize);

fontSizeSelect.addEventListener("change", (e) => {
    setFontSize(e.target.value);
    // Re-sync panel width since font/metrics changed
    syncCheckedPanelWidth();
});

/* ================= HEIGHT TOGGLE ================= */

let isCollapsed = localStorage.getItem("heightCollapsed") === "true";
const minHeight = "100px";
const maxHeight = defaultTextareaHeight;

function toggleHeight(){
    toggleFitHeight();
}

// Restore height state on page load
if(isCollapsed){
    const textareas = document.querySelectorAll(".editor-wrapper textarea");
    textareas.forEach(ta => {
        ta.style.height = minHeight;
        ta.style.minHeight = minHeight;
    });
}

isCollapsed = false;
syncWidthToggleButtons();
syncFitToggleButtons();
applyWideLayout();
applyInputWidth();
applyFitHeight();

if(heightToggle){
    heightToggle.addEventListener("click", toggleHeight);
}

if(widthToggleSticky){
    widthToggleSticky.addEventListener("click", toggleInputWidth);
}

if(scrollTopButton){
    scrollTopButton.addEventListener("click", scrollToTop);
}

window.addEventListener("scroll", updateStickyHeaderVisibility, { passive: true });
window.addEventListener("resize", updateStickyHeaderVisibility);
updateStickyHeaderVisibility();

    // Editor line-number elements removed

/* ================= SAVE ================= */

source.value =
    localStorage.getItem("sourceText") || "";

target.value =
    localStorage.getItem("targetText") || "";
source.addEventListener("input", () => {
    const cleaned = stripControlChars(source.value);
    if(cleaned !== source.value){
        source.value = cleaned;
    }

    localStorage.setItem(
        "sourceText",
        source.value
    );

    runCompare();

    if(isFitHeight){
        applyFitHeight();
    }
});
target.addEventListener("input", () => {
    const cleaned = stripControlChars(target.value);
    if(cleaned !== target.value){
        target.value = cleaned;
    }

    localStorage.setItem(
        "targetText",
        target.value
    );

    runCompare();

    if(isFitHeight){
        applyFitHeight();
    }
});

// Removed scroll syncing for editor line numbers
/* ================= LAYOUT ================= */

// Editor line-number syncing removed


layoutToggle.onclick = () => {
    toggleWideLayout();
};

/* ================= UTIL ================= */

function escapeHtml(text){

    return (text || "")
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;");
}

function stripControlChars(text){
    return (text || "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/* ================= NORMALIZE ================= */

function normalizeText(text){

    return stripControlChars(
        (text || "")
            .replace(/\r\n/g,"\n")
            .replace(/\r/g,"\n")
    );
}

function normalizeForCompare(text){

    const raw = normalizeText(text);

    const normalizedChars = [];
    const indexMap = [];
    const whitespaceRegex = /[\s\u00A0\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]/;
    // Expanded regex to catch more PDF artifacts: soft hyphens, RTL marks, PDF control chars, etc.
    const invisibleRegex = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u00AD\u200B\u200C\u200D\u2060\u2061\u2062\u2063\u206A-\u206F\uFEFF\uFFF9-\uFFFB]/g;
    const urlRegex = /https?:\/\/[^\s<>\)\(\[\]]+/ig;

    function toAsciiChars(char){
        const code = char.charCodeAt(0);

        // Additional CJK character mappings not covered by NFKC
        const additionalMap = {
            0x2ED1: "長",  // ⻑ → 長
        };

        if(additionalMap[code]){
            return [additionalMap[code]];
        }

        if(code === 0x3000){
            return [" "];
        }

        if(code === 0xFF0F){
            return ["／"];
        }

        if(char === "、" || char === "。"){
            return [char];
        }

        if(char === "…" || char === "‥" || char === "。" || char === "｡" || char === "．"){
            return [char];
        }

        if(char === "、" || char === "､"){
            return [char];
        }

        if(char === "，"){
            return [char];
        }

        if(char === "（"){
            return [char];
        }

        if(char === "）"){
            return [char];
        }

        if(char === "ー" || char === "ｰ" || char === "−" || char === "–" || char === "—" || char === "〜" || char === "～"){
            return [char];
        }

        if(char === "・" || char === "･"){
            return [char];
        }

        if(char === "｢" || char === "｣" || char === "「" || char === "」" || char === "『" || char === "』"){
            return [char];
        }

        if(char === "＜" || char === "＞" || char === "【" || char === "】" || char === "〈" || char === "〉" || char === "《" || char === "》" || char === "〔" || char === "〕"){
            return [char];
        }

        if(char === "¥" || char === "￥"){
            return ["¥"];
        }

        // Fullwidth punctuation marks (Nhật Bản/Trung Quốc)
        if(char === "：" || char === "；" || char === "？" || char === "！"){
            return [char];
        }

        // Curly/smart quotes (thường gặp từ PDF)
        if(char === "'" || char === "'"){
            return ["'"];
        }

        if(char === "\u201C" || char === "\u201D"){
            return ["\""];
        }

        if(code >= 0xFF01 && code <= 0xFF5E){
            return [String.fromCharCode(code - 0xFEE0)];
        }

        return [char];
    }

    const cleaned = raw.replace(invisibleRegex, "");

    const preserveFullwidthPunctuation = new Set([
        "…","‥","。","｡","．",
        "、","､","，",
        "（","）",
        "＜","＞",
        "【","】",
        "〈","〉","《","》","〔","〕",
        "～","ー","ｰ","−","–","—","〜",
        "・","･",
        "｢","｣","「","」","『","』",
        "：","；","？","！"
    ]);

    // // Clean up orphaned/mismatched brackets from PDF artifacts
    // // This handles cases like "text(R)（)" → "text(R)"
    // let bracketCleaned = cleaned;
    
    // // Normalize fullwidth brackets to ASCII equivalents
    // bracketCleaned = bracketCleaned
    //     .replace(/（/g, "(")
    //     .replace(/）/g, ")");
    
    // // Remove orphaned closing brackets with no opening match
    // let bracketStack = [];
    // let charArray = bracketCleaned.split("");
    // let result = [];
    
    // for(let i = 0; i < charArray.length; i++){
    //     const char = charArray[i];
        
    //     if(char === "("){
    //         bracketStack.push(i);
    //         result.push(char);
    //     }
    //     else if(char === ")"){
    //         if(bracketStack.length > 0){
    //             bracketStack.pop();
    //             result.push(char);
    //         }
    //         // Skip orphaned closing bracket
    //     }
    //     else{
    //         result.push(char);
    //     }
    // }
    
    // // Remove unmatched opening brackets at the end
    // bracketCleaned = result.join("");
    // bracketStack = [];
    // result = [];
    
    // for(let i = bracketCleaned.length - 1; i >= 0; i--){
    //     const char = bracketCleaned[i];
        
    //     if(char === ")"){
    //         bracketStack.push(i);
    //         result.unshift(char);
    //     }
    //     else if(char === "("){
    //         if(bracketStack.length > 0){
    //             bracketStack.pop();
    //             result.unshift(char);
    //         }
    //         // Skip unmatched opening bracket
    //     }
    //     else{
    //         result.unshift(char);
    //     }
    // }
    
    // // Remove consecutive whitespace that might come from cleaned brackets
    // bracketCleaned = result.join("")
    //     .replace(/\s{2,}/g, " ")
    //     .trim();
    let bracketCleaned = cleaned;

    // Pre-scan URLs so we can treat them as atomic (preserve exact characters)
    const urlRanges = [];
    for(const m of bracketCleaned.matchAll(urlRegex)){
        urlRanges.push({ start: m.index, end: m.index + m[0].length, text: m[0] });
    }

    let urlPtr = 0;

    for(let i = 0; i < bracketCleaned.length; i++){

        // If next URL starts here, push the raw URL characters unchanged
        if(urlPtr < urlRanges.length && i === urlRanges[urlPtr].start){
            const txt = urlRanges[urlPtr].text;
            for(let k = 0; k < txt.length; k++){
                normalizedChars.push(txt[k]);
                indexMap.push(i + k);
            }
            i = urlRanges[urlPtr].end - 1;
            urlPtr++;
            continue;
        }

        const char = bracketCleaned[i];

        if(char === "／"){
            normalizedChars.push("／");
            indexMap.push(i);
            continue;
        }

        if(whitespaceRegex.test(char)){
            continue;
        }

        if(preserveFullwidthPunctuation.has(char)){
            const asciiChars = toAsciiChars(char);
            for(const finalChar of asciiChars){
                normalizedChars.push(finalChar);
                indexMap.push(i);
            }
            continue;
        }

        const normalizedCharInput = char.normalize("NFKC");
        for(const normalizedChar of normalizedCharInput){
            const asciiChars = toAsciiChars(normalizedChar);
            for(const finalChar of asciiChars){
                normalizedChars.push(finalChar);
                indexMap.push(i);
            }
        }
    }

    return {
        raw: bracketCleaned,
        normalized: normalizedChars.join(""),
        map: indexMap
    };
}

function safeRender(text){

    return escapeHtml(text || "")

        .replace(/\r\n/g,"\n")
        .replace(/\r/g,"")
        .replace(/\n/g,"<br>")
        .replace(/\t/g,"    ");
}

// Line-number generation removed (editor/result gutters deleted)

/* ================= SWAP ================= */

function isSwapPair(a1,a2,b1,b2){

    return (
        a1 === b2 &&
        a2 === b1
    );
}

/* ================= DIFF ================= */

function diff(a,b){
    const m = a.length;
    const n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

    for(let i = m - 1; i >= 0; i--){
        for(let j = n - 1; j >= 0; j--){
            if(a[i] === b[j]){
                dp[i][j] = dp[i + 1][j + 1] + 1;
            }
            else{
                dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
            }
        }
    }

    const result = [];
    let i = 0;
    let j = 0;

    while(i < m && j < n){
        if(a[i] === b[j]){
            result.push({type:"same", char:a[i]});
            i++;
            j++;
            continue;
        }

        if(dp[i + 1][j] >= dp[i][j + 1]){
            result.push({type:"missing", char:a[i]});
            i++;
        }
        else{
            result.push({type:"extra", char:b[j]});
            j++;
        }
    }

    while(i < m){
        result.push({type:"missing", char:a[i]});
        i++;
    }

    while(j < n){
        result.push({type:"extra", char:b[j]});
        j++;
    }

    // List of brackets that should never be merged (always report separately)
    const bracketChars = new Set([
        "（","）","＜","＞","【","】",
        "〈","〉","《","》","〔","〕",
        "｢","｣","「","」","『","』",
        "（","）"
    ]);

    const merged = [];
    for(let k = 0; k < result.length; k++){
        const op = result[k];
        const next = result[k + 1];
        
        // Don't merge if either char is a bracket - always report separately
        const isBracket = bracketChars.has(op.char) || (next && bracketChars.has(next.char));
        
        if(
            !isBracket &&
            op.type === "missing" &&
            next?.type === "extra"
        ){
            merged.push({
                type: "replace",
                from: op.char,
                to: next.char
            });
            k++;
            continue;
        }

        merged.push(op);
    }

    return merged;
}

/* ================= SCROLL TO POSITION ================= */

function scrollToPosition(panel, position){
    const targetTextarea = panel === "original" ? source : target;
    const resultPanel = panel === "original" ? resultOriginal : resultChecked;
    
    // Clear previous highlights
    resultPanel.querySelectorAll("span").forEach(s => s.classList.remove("highlighted"));
    
    // Highlight the clicked element
    const elements = resultPanel.querySelectorAll(`[data-position="${position}"][data-panel="${panel}"]`);
    elements.forEach(el => el.classList.add("highlighted"));
    
    // Scroll textarea to position
    targetTextarea.focus();
    targetTextarea.setSelectionRange(position, position + 1);
    
    // Scroll into view
    const lineHeight = parseFloat(getComputedStyle(targetTextarea).lineHeight);
    const lines = targetTextarea.value.substring(0, position).split("\n").length - 1;
    targetTextarea.scrollTop = lines * lineHeight - targetTextarea.clientHeight / 2;
    
    // Remove highlight after 2 seconds
    setTimeout(() => {
        elements.forEach(el => el.classList.remove("highlighted"));
    }, 2000);
}

/* ================= COMPARE ================= */

function runCompare(){

    const originalData =
        normalizeForCompare(source.value);

    const testData =
        normalizeForCompare(target.value);

    const diffs =
        diff(originalData.normalized, testData.normalized);

    let hasError = false;
    let originalIndex = 0;
    let testIndex = 0;
    let originalRawPos = 0;
    let testRawPos = 0;

    resultOriginal.innerHTML = "";
    resultChecked.innerHTML = "";

    // Result gutters removed — no line-number population

    const appendChar = (container, char, className, panel, position) => {
        if(resultCollapsed && panel === "original"){
            return;
        }

        if(char === "\n"){
            const br = document.createElement("br");
            br.setAttribute("data-position", position);
            br.setAttribute("data-panel", panel);
            container.appendChild(br);
            return;
        }

        const span = document.createElement("span");
        span.className = className || "";
        span.setAttribute("data-position", position);
        span.setAttribute("data-panel", panel);
        span.style.cursor = isEditMode ? "pointer" : "default";
        span.style.transition = "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)";
        span.textContent = char;
        
        if(isEditMode){
            span.addEventListener("click", (e) => {
                e.stopPropagation();
                scrollToPosition(panel, position);
            });
        }
        
        container.appendChild(span);
    };

    const appendMissingSpace = (container, panel, position) => {
        if(resultCollapsed && panel === "original"){
            return;
        }
        const span = document.createElement("span");
        span.className = "missing-char";
        span.setAttribute("data-position", position);
        span.setAttribute("data-panel", panel);
        span.style.cursor = isEditMode ? "pointer" : "default";
        if(isEditMode){
            span.addEventListener("click", (e) => {
                e.stopPropagation();
                scrollToPosition(panel, position);
            });
        }
        container.appendChild(span);
    };

    const flushRawLeft = (targetRawIndex) => {
        while(originalRawPos < targetRawIndex){
            appendChar(resultOriginal, originalData.raw[originalRawPos], "", "original", originalRawPos);
            originalRawPos++;
        }
    };

    const flushRawRight = (targetRawIndex) => {
        while(testRawPos < targetRawIndex){
            appendChar(resultChecked, testData.raw[testRawPos], "", "checked", testRawPos);
            testRawPos++;
        }
    };

    if(originalData.normalized === testData.normalized){
        for(let i = 0; i < originalData.raw.length; i++){
            appendChar(resultOriginal, originalData.raw[i], "", "original", i);
        }
        for(let i = 0; i < testData.raw.length; i++){
            appendChar(resultChecked, testData.raw[i], "", "checked", i);
        }
        // we've already appended all raw chars; advance raw pointers
        originalRawPos = originalData.raw.length;
        testRawPos = testData.raw.length;
    }
    else{
        diffs.forEach(d => {

            if(d.type === "same"){

                flushRawLeft(originalData.map[originalIndex]);
                flushRawRight(testData.map[testIndex]);

                const originalPos = originalData.map[originalIndex];
                const testPos = testData.map[testIndex];

                appendChar(
                    resultOriginal,
                    originalData.raw[originalPos],
                    "",
                    "original",
                    originalPos
                );

                appendChar(
                    resultChecked,
                    testData.raw[testPos],
                    "",
                    "checked",
                    testPos
                );

                originalRawPos = originalPos + 1;
                testRawPos = testPos + 1;

                originalIndex++;
                testIndex++;
            }

        if(d.type === "extra"){

            hasError = true;

            flushRawRight(testData.map[testIndex]);
            flushRawLeft(
                originalData.map[originalIndex] ?? originalData.raw.length
            );

            const testPos = testData.map[testIndex];

            appendChar(
                resultChecked,
                testData.raw[testPos],
                "error-char",
                "checked",
                testPos
            );

            testRawPos = testPos + 1;
            testIndex++;
        }

        if(d.type === "missing"){

            hasError = true;

            flushRawLeft(originalData.map[originalIndex]);
            flushRawRight(
                testData.map[testIndex] ?? testData.raw.length
            );

            const originalPos = originalData.map[originalIndex];
            const missingChar = originalData.raw[originalPos];

            appendChar(
                resultOriginal,
                missingChar,
                "error-char",
                "original",
                originalPos
            );

            if(
                missingChar === " " ||
                missingChar === "　" ||
                missingChar === "\t"
            ){
                appendMissingSpace(resultChecked, "checked", originalPos);
            }
            else{
                appendChar(
                    resultChecked,
                    missingChar,
                    "missing-char-text",
                    "checked",
                    originalPos
                );
            }

            originalRawPos = originalPos + 1;
            originalIndex++;
        }

        if(d.type === "replace"){

            hasError = true;

            flushRawLeft(originalData.map[originalIndex]);
            flushRawRight(testData.map[testIndex]);

            const originalPos = originalData.map[originalIndex];
            const testPos = testData.map[testIndex];

            appendChar(
                resultOriginal,
                originalData.raw[originalPos],
                "error-char",
                "original",
                originalPos
            );

            appendChar(
                resultChecked,
                testData.raw[testPos],
                "error-char",
                "checked",
                testPos
            );

            originalRawPos = originalPos + 1;
            testRawPos = testPos + 1;

            originalIndex++;
            testIndex++;
        }
    });
    }

    flushRawLeft(originalData.raw.length);
    flushRawRight(testData.raw.length);

    if(hasError){

        statusLight.classList.remove("ok");
        statusLight.classList.add("error");

        statusText.innerHTML =
            "Phát hiện lỗi";
    }
    else{

        statusLight.classList.remove("error");
        statusLight.classList.add("ok");

        statusText.innerHTML =
            "Không có lỗi";
    }
}

/* ================= THEME ================= */

const themeToggle =
    document.getElementById("themeToggle");

const savedTheme =
    localStorage.getItem("theme") || "dark";

document.body.classList.toggle(
    "dark",
    savedTheme === "dark"
);

updateThemeIcon();

function toggleTheme(){

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        isDark ? "dark" : "light"
    );

    updateThemeIcon();
}

function updateThemeIcon(){

    const isDark =
        document.body.classList.contains("dark");

    const icon =
        isDark ? "☀️" : "🌙";

    themeToggle.innerHTML = icon;
}

themeToggle.onclick = toggleTheme;

/* ================= HELP MODAL ================= */

const helpToggle =
    document.getElementById("helpToggle");

const helpModal =
    document.getElementById("helpModal");

const closeHelp =
    document.getElementById("closeHelp");

function openHelp(){

    helpModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeHelpModal(){

    helpModal.classList.add("hidden");
    document.body.style.overflow = "auto";
}

helpToggle.onclick = openHelp;

closeHelp.onclick = closeHelpModal;

helpModal.onclick = (e) => {

    if(e.target === helpModal){

        closeHelpModal();
    }
};

/* ================= INIT ================= */

runCompare();