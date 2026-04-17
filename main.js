'use strict';
const { Plugin, ItemView, PluginSettingTab, Setting, Notice, Modal } = require('obsidian');

// ═══════════════════════════════════════════════════════════
//  ثوابت
// ═══════════════════════════════════════════════════════════
const VIEW_TYPE_OMNI = 'omni-note-view';
const DATA_DIR       = 'OmniNote-Data';

const MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const DAYS_S = ['أح','اث','ثل','أر','خم','جم','سب'];
const DAYS_F = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

const DEFAULT_SETTINGS = {
    language        : 'ar',
    workDuration    : 25,
    shortBreak      : 5,
    quoteInterval   : 30,
    quoteFontSize   : 16,
    currentQuoteIdx : 0,
    enableMilestoneNotifications : true,
    milestoneNotificationType: 'windows',
    milestoneMessages: {
        25: "ومن يتهيب صعود الجبال — يعش أبد الدهر بين الحفر",
        50: "وما نيل المطالب بالتمني ـــ ولكن تُؤخذ الدنيا غِلابا\\nوما استعصى على قومٍ منالٌ ـــ إذا الإقدام كان لهم ركابا",
        75: "إذا غامرت في شرفٍ مرومِ — فلا تقنع بما دون النجوم",
       100: "ولم أرَ في عيوب الناس شيئًا — كنقص القادرين على التمام",
    },
    quotes          : [],
    stickyNotes    : {},
    calendarTasks  : {},
    progressTasks  : [],
    pomodoroLog    : [],
};

const locales = {
    ar: {
        quote_title: "حكمة اليوم",
        pause_quote: "إيقاف تغيير الحكم",
        resume_quote: "استئناف تغيير الحكم",
        next_quote: "حكمة أخرى",
        inc_font: "تكبير الخط",
        dec_font: "تصغير الخط",
        pomo_title: "بومودورو",
        work: "عمل",
        break: "استراحة",
        start: "▶ ابدأ",
        pause: "⏸ توقف",
        reset: "↺ إعادة",
        skip: "⏭ تخطي",
        minutes: "دقيقة",
        sessions_completed: "🔥 جلسات مكتملة:",
        session_on: "📝 جلسة على:",
        session_work_end: 'انتهت جلسة العمل على "$1"! استرح الآن 🎉',
        session_break_end: "انتهت الاستراحة! وقت العمل 💪",
        active_note: "الملاحظة",
        cal_title: "التقويم",
        delete_note: "حذف الملاحظة",
        close: "إغلاق",
        free_note: "ملاحظة حرة...",
        add_task: "أضف مهمة...",
        save: "💾 حفظ",
        delete: "🗑",
        delete_day_confirm: "تم مسح المهام والملاحظة كلياً 🗑",
        save_confirm: "تم الحفظ ✓",
        prog_title: "متابعة الإنجاز",
        add_task_btn: "+",
        task_name: "اسم المهمة",
        type_steps: "🎯 خطوات",
        type_value: "📖 قيمة",
        type_time: "⏱️ وقت",
        target: "الهدف",
        unit: "وحدة القياس",
        step_val: "مقدار الزيادة (اختياري)",
        add_confirm: "إضافة ✓",
        cancel: "إلغاء",
        no_tasks: "لا توجد مهام بعد",
        done: "✓",
        manual_input: "✏️",
        completed_tasks_sep: "— مكتملة —",
        unit_default: "وحدة",
        unit_pages: "صفحة / كلمة",
        step_ph_time: "مقدار الزيادة (مثلاً 25)",
        enter_task_name: "أدخل اسم المهمة",
        target_gt_zero: "الهدف يجب أن يكون أكبر من صفر",
        manual_input_title: "إدخال يدوي — $1",
        manual_input_label: "أدخل التقدم الحالي ($1):",
        completed_status: "✓ مكتمل — $1%",
        settings_title: "⚙️ إعدادات OmniNote",
        settings_lang: "اللغة / Language",
        settings_lang_desc: "اختر لغة واجهة الإضافة (Choose the UI language)",
        settings_pomo: "⏱️ البومودورو",
        pomo_work_desc: "عدد الدقائق لكل جلسة عمل (١–١٢٠)",
        pomo_break_desc: "عدد الدقائق للاستراحة القصيرة (١–٦٠)",
        settings_quotes: "💡 الحكم والاقتباسات",
        quote_interval: "فترة إشعار الحكمة",
        quote_interval_desc: "كل كم دقيقة تظهر حكمة في إشعارات ويندوز وتتقدم في الويدجت معاً",
        quote_total: "📊 إجمالي الحكم المحفوظة:",
        quote_current: "🔖 الحكمة الحالية المعروضة: رقم",
        quote_quotes: "حكمة",
        quote_from: "من",
        settings_import_export: "📂 استيراد / تصدير الحكم",
        import_csv: "استيراد حكم من ملف CSV",
        import_csv_desc: "تنسيق الملف: عمودان — نص الحكمة، ثم اسم الكاتب (يُضاف إلى القائمة الحالية)",
        import_add: "📥 استيراد وإضافة",
        import_replace: "🔄 استيراد واستبدال",
        export_csv: "تصدير الحكم إلى ملف CSV",
        export_csv_desc: "تنزيل جميع الحكم المحفوظة كملف CSV يمكن تعديله وإعادة استيراده",
        export_btn: "📤 تصدير CSV",
        export_empty: "لا توجد حكم للتصدير",
        export_done: "✅ تم تصدير $1 حكمة",
        settings_add_quote: "✍️ إضافة حكمة يدوياً",
        quote_ph: "نص الحكمة...",
        author_ph: "المؤلف (اختياري)...",
        add_quote_btn: "+ إضافة الحكمة",
        unknown_author: "مجهول",
        empty_quote_text: "يرجى كتابة نص الحكمة",
        quote_added: "✅ تمت إضافة الحكمة",
        settings_quote_list: "📋 قائمة الحكم الحالية",
        no_quotes_list: "لا توجد حكم محفوظة بعد. أضف حكماً يدوياً أو استورد من CSV.",
        th_num: "#",
        th_quote: "الحكمة",
        th_author: "المؤلف",
        th_actions: "إجراءات",
        edit: "تعديل",
        quote_edited: "✅ تم تعديل الحكمة",
        quote_deleted: "تم حذف الحكمة",
        settings_notifs: "🔔 الإشعارات",
        milestone_enable: "تفعيل إشعارات Milestones",
        milestone_enable_desc: "إظهار إشعار عند الوصول إلى 25% — 50% — 75% — 100% من أي مهمة",
        milestone_src: "مصدر إشعارات Milestones",
        milestone_src_desc: "حدد أين تود أن تظهر لك هذه الإشعارات؟",
        src_win: "ويندوز (النظام) فقط",
        src_obs: "أوبسيديان (داخلي) فقط",
        src_both: "كلاهما (ويندوز + أوبسيديان)",
        milestone_msgs: "💬 نصوص إشعارات الإنجاز المخصصة",
        milestone_msg_at: "رسالة الإنجاز عند $1%",
        settings_data_dir: "💾 مجلد البيانات",
        data_dir_desc: "تُحفظ السجلات اليومية تلقائياً في:<br><code>$1/YYYY-MM-DD.md</code> داخل الـ vault",
        file_no_quotes: "⚠️ لم يُعثر على حكم في الملف",
        file_replaced: "✅ تم استبدال الحكم بـ $1 حكمة جديدة",
        file_added: "✅ تم إضافة $1 حكمة جديدة",
        file_error: "⚠️ خطأ في قراءة الملف",
        notif_due_2h: "بعد ساعتين",
        notif_due_12h: "بعد 12 ساعة",
        notif_due_24h: "بعد 24 ساعة",
        notif_reminder: "📅 تذكير — OmniNote",
        notif_reminder_body: '"$1" مستحقة $2',
        stats_header: "إحصائيات يوم",
        pomo_log_header: "## سجل البومودورو\\n| الوقت | الملاحظة | المدة | النوع |\\n| :--- | :--- | :--- | :--- |\\n",
        no_note: "بدون ملاحظة",
        prog_header: "## متابعة الإنجاز (تحديث: $1)\\n\\n",
        prog_log_header: "| المهمة | الإنجاز | النسبة | الحالة |\\n| :--- | :--- | :--- | :--- |\\n",
        status_done: "✅ مكتملة",
        status_running: "⏳ جارية",
        milestone_notif_title: "📊 OmniNote — $1 ($2%)",
        milestone_reached: "وصلت إلى $1%",
        confirm_btn: "✓ تأكيد"
    },
    en: {
        quote_title: "Daily Quote",
        pause_quote: "Pause Quotes",
        resume_quote: "Resume Quotes",
        next_quote: "Next Quote",
        inc_font: "Increase Font",
        dec_font: "Decrease Font",
        pomo_title: "Pomodoro",
        work: "Work",
        break: "Break",
        start: "▶ Start",
        pause: "⏸ Pause",
        reset: "↺ Reset",
        skip: "⏭ Skip",
        minutes: "min",
        sessions_completed: "🔥 Sessions:",
        session_on: "📝 Note:",
        session_work_end: 'Work session on "$1" ended! Take a break 🎉',
        session_break_end: "Break ended! Time to work 💪",
        active_note: "Note",
        cal_title: "Calendar",
        delete_note: "Delete Note",
        close: "Close",
        free_note: "Free note...",
        add_task: "Add task...",
        save: "💾 Save",
        delete: "🗑",
        delete_day_confirm: "Tasks and notes completely deleted 🗑",
        save_confirm: "Saved ✓",
        prog_title: "Progress Tracker",
        add_task_btn: "+",
        task_name: "Task Name",
        type_steps: "🎯 Steps",
        type_value: "📖 Value",
        type_time: "⏱️ Time",
        target: "Target",
        unit: "Unit",
        step_val: "Step value (optional)",
        add_confirm: "Add ✓",
        cancel: "Cancel",
        no_tasks: "No tasks yet",
        done: "✓",
        manual_input: "✏️",
        completed_tasks_sep: "— Completed —",
        unit_default: "unit",
        unit_pages: "page / word",
        step_ph_time: "Step value (e.g. 25)",
        enter_task_name: "Enter task name",
        target_gt_zero: "Target must be greater than zero",
        manual_input_title: "Manual Input — $1",
        manual_input_label: "Enter progress ($1):",
        completed_status: "✓ Done — $1%",
        settings_title: "⚙️ OmniNote Settings",
        settings_lang: "Language / اللغة",
        settings_lang_desc: "Choose the UI language (اختر لغة واجهة الإضافة)",
        settings_pomo: "⏱️ Pomodoro",
        pomo_work_desc: "Duration for each work session (1–120 mins)",
        pomo_break_desc: "Duration for short breaks (1–60 mins)",
        settings_quotes: "💡 Quotes",
        quote_interval: "Quote Notification Interval",
        quote_interval_desc: "Minutes between Windows notifications and widget quote rotations",
        quote_total: "📊 Total saved quotes:",
        quote_current: "🔖 Current displayed quote: number",
        quote_quotes: "quotes",
        quote_from: "out of",
        settings_import_export: "📂 Import Quotes",
        import_csv: "Import from CSV",
        import_csv_desc: "Format: Two columns — Quote text, then Author name",
        import_add: "📥 Import & Add",
        import_replace: "🔄 Import & Replace",
        export_csv: "Export Quotes to CSV",
        export_csv_desc: "Download all saved quotes to CSV",
        export_btn: "📤 Export CSV",
        export_empty: "No quotes to export",
        export_done: "✅ Exported $1 quotes",
        settings_add_quote: "✍️ Add Quote Manually",
        quote_ph: "Quote text...",
        author_ph: "Author (optional)...",
        add_quote_btn: "+ Add Quote",
        unknown_author: "Unknown",
        empty_quote_text: "Please enter quote text",
        quote_added: "✅ Quote added",
        settings_quote_list: "📋 Current Quotes",
        no_quotes_list: "No saved quotes yet.",
        th_num: "#",
        th_quote: "Quote",
        th_author: "Author",
        th_actions: "Actions",
        edit: "Edit",
        quote_edited: "✅ Quote edited",
        quote_deleted: "Quote deleted",
        settings_notifs: "🔔 Notifications",
        milestone_enable: "Enable Milestone Notifications",
        milestone_enable_desc: "Show notification when reaching 25% — 50% — 75% — 100% of any task",
        milestone_src: "Notification Source",
        milestone_src_desc: "Where should notifications appear?",
        src_win: "Windows only",
        src_obs: "Obsidian only",
        src_both: "Both (Windows & Obsidian)",
        milestone_msgs: "💬 Custom Milestone Messages",
        milestone_msg_at: "Message at $1%",
        settings_data_dir: "💾 Data Directory",
        data_dir_desc: "Daily logs are saved automatically in:<br><code>$1/YYYY-MM-DD.md</code>",
        file_no_quotes: "⚠️ No quotes found in file",
        file_replaced: "✅ Replaced with $1 new quotes",
        file_added: "✅ Added $1 new quotes",
        file_error: "⚠️ Error reading file",
        notif_due_2h: "in 2 hours",
        notif_due_12h: "in 12 hours",
        notif_due_24h: "in 24 hours",
        notif_reminder: "📅 Reminder — OmniNote",
        notif_reminder_body: '"$1" is due $2',
        stats_header: "Stats for",
        pomo_log_header: "## Pomodoro Log\\n| Time | Note | Duration | Type |\\n| :--- | :--- | :--- | :--- |\\n",
        no_note: "No note",
        prog_header: "## Progress Tracker (Updated: $1)\\n\\n",
        prog_log_header: "| Task | Progress | Percentage | Status |\\n| :--- | :--- | :--- | :--- |\\n",
        status_done: "✅ Done",
        status_running: "⏳ Running",
        milestone_notif_title: "📊 OmniNote — $1 ($2%)",
        milestone_reached: "Reached $1%",
        confirm_btn: "✓ Confirm"
    }
};

let currentLang = 'ar';
function setTranslationsLang(lang) {
    if (locales[lang]) currentLang = lang;
}

function t(key, ...args) {
    let str = locales[currentLang][key] || key;
    args.forEach((arg, i) => {
        str = str.replace('$' + (i + 1), arg);
    });
    return str;
}

// ═══════════════════════════════════════════════════════════
//  مساعدات
// ═══════════════════════════════════════════════════════════
const uid      = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const pad      = n  => String(n).padStart(2, '0');
const fmtDate  = d  => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const fmtTime  = s  => `${pad(Math.max(0, Math.floor(s/60)))}:${pad(Math.max(0, s%60))}`;
const escapeHTML = str => String(str).replace(/[&<>'"]/g, tag =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag] || tag));

/** تحويل وقت HH:MM (24h) إلى نظام 12 ساعة مع AM/PM */
function fmt12(time) {
    if (!time) return '';
    const [hStr, mStr] = time.split(':');
    let h = parseInt(hStr, 10);
    const m = mStr || '00';
    const period = h >= 12 ? 'م' : 'ص';
    h = h % 12 || 12;
    return `${h}:${m} ${period}`;
}

/** حساب الخطوة الذكية بناءً على إعداد المهمة أو الإجمالي */
function getStep(task) {
    if (task.config && task.config.step) return task.config.step;
    const total = (task.config && task.config.total) || task.total || 1;
    if (total <= 20)  return 1;
    if (total <= 100) return 5;
    return Math.max(1, Math.round(total / 50)); // ≈ 2%
}

function buildCSV(quotes) {
    return quotes.map(q => {
        const needsQuote = s => s.includes(',') || s.includes('"') || s.includes('\n');
        const wrap = s => needsQuote(s) ? `"${s.replace(/"/g,'""')}"` : s;
        return `${wrap(q.text)},${wrap(q.author || 'مجهول')}`;
    }).join('\n');
}

function parseCSV(raw) {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const results = [];
    for (const line of lines) {
        const cols = []; let cur = '', inQ = false;
        for (const ch of line) {
            if (ch === '"') { inQ = !inQ; }
            else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
            else cur += ch;
        }
        cols.push(cur.trim());
        const text   = (cols[0] || '').replace(/^"|"$/g, '').trim();
        const author = (cols[1] || 'مجهول').replace(/^"|"$/g, '').trim();
        if (text) results.push({ text, author });
    }
    return results;
}

function sendNotif(title, body, hideAppNotice = false) {
    try {
        if (!hideAppNotice) {
            new Notice(`${title} — ${body}`, 8000);
        }
        if (typeof Notification === 'undefined') return;
        if (Notification.permission === 'granted') {
            new Notification(title, { body, silent: false });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(p => {
                if (p === 'granted') new Notification(title, { body });
            });
        }
    } catch (_) {}
}

// ═══════════════════════════════════════════════════════════
//  موديال إدخال يدوي (بديل prompt)
// ═══════════════════════════════════════════════════════════
class OmniInputModal extends Modal {
    constructor(app, title, label, defaultVal, onSubmit) {
        super(app);
        this._title = title;
        this._label = label;
        this._default = defaultVal || '';
        this._onSubmit = onSubmit;
    }
    onOpen() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.setAttribute('dir', 'rtl');
        contentEl.createEl('h3', { text: this._title }).style.cssText = 'margin:0 0 10px;color:var(--text-accent);';
        contentEl.createEl('p', { text: this._label }).style.cssText = 'margin:0 0 8px;font-size:0.9em;color:var(--text-muted);';
        const inp = contentEl.createEl('input', { type: 'number' });
        inp.value = this._default;
        inp.style.cssText = 'width:100%;padding:8px 10px;border-radius:6px;border:1px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-normal);font-size:1em;direction:ltr;text-align:center;box-sizing:border-box;outline:none;';
        inp.focus();
        inp.select();
        const btns = contentEl.createDiv();
        btns.style.cssText = 'display:flex;gap:8px;margin-top:12px;justify-content:flex-end;';
        const ok = btns.createEl('button', { text: t('confirm_btn') });
        ok.classList.add('mod-cta');
        ok.style.cssText = 'padding:6px 18px;cursor:pointer;';
        const cancel = btns.createEl('button', { text: t('cancel') });
        cancel.style.cssText = 'padding:6px 18px;cursor:pointer;';
        const submit = () => { this._onSubmit(inp.value); this.close(); };
        ok.onclick = submit;
        cancel.onclick = () => this.close();
        inp.onkeydown = (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') this.close(); };
    }
    onClose() { this.contentEl.empty(); }
}

// ═══════════════════════════════════════════════════════════
//  العرض الرئيسي
// ═══════════════════════════════════════════════════════════
class OmniNoteView extends ItemView {

    constructor(leaf, plugin) {
        super(leaf);
        this.plugin   = plugin;
        this.S        = plugin.settings;
        this.timeRem  = this.S.workDuration * 60;
        this.timerInt = null;
        this.isBreak  = false;
        this.sessions = 0;
        this.viewDate = new Date();
        this.selDate  = null;
        this._activeNote = null;
    }

    getViewType()    { return VIEW_TYPE_OMNI; }
    getDisplayText() { return 'OmniNote'; }
    getIcon()        { return 'calendar-clock'; }

    async onOpen() {
        const root = this.containerEl.children[1];
        root.empty();
        root.setAttribute('dir', 'rtl');
        root.classList.add('omni-root');
        this.root = root;
        this.plugin._activeView = this;
        this._build();
    }

    _build() {
        this.root.innerHTML = '';
        const wrap = this.root.createDiv('omni-wrap');
        this._buildQuote(wrap);
        this._buildPomo(wrap);
        this._buildCalendar(wrap);
        this._buildProgress(wrap);
    }

    // ─────────────────────────────────────────
    //  بطاقة الحكمة
    // ─────────────────────────────────────────
    _buildQuote(wrap) {
        const card = wrap.createDiv('omni-card omni-quote-card');
        const q    = this.plugin.getCurrentQuote();

        card.innerHTML = `
<div class="omni-card-hd">
  <span class="omni-card-ico">💡</span>
  <span class="omni-card-ttl">${t('quote_title')}</span>
  <button class="omni-ghost-btn" id="oq-pause" title="${this.S.isQuotePaused ? t('resume_quote') : t('pause_quote')}">${this.S.isQuotePaused ? '▶️' : '⏸️'}</button>
  <button class="omni-ghost-btn" id="oq-next" title="${t('next_quote')}">↻</button>
</div>
<p class="omni-q-text"   id="oq-text"   style="font-size: ${this.S.quoteFontSize || 16}px">"${escapeHTML(q.text)}"</p>
<p class="omni-q-author" id="oq-author" style="font-size: ${(this.S.quoteFontSize || 16) * 0.8}px">— ${escapeHTML(q.author)}</p>
<div style="text-align: left; margin-top: 5px;">
  <button class="omni-ghost-btn" id="oq-font-inc" title="${t('inc_font')}"  style="padding: 0 5px; font-size: 1.1em;">+</button>
  <button class="omni-ghost-btn" id="oq-font-dec" title="${t('dec_font')}" style="padding: 0 5px; font-size: 1.1em;">−</button>
</div>`;

        const updateFont = async (d) => {
            this.S.quoteFontSize = Math.max(10, Math.min(48, (this.S.quoteFontSize || 16) + d));
            card.querySelector('#oq-text').style.fontSize   = `${this.S.quoteFontSize}px`;
            card.querySelector('#oq-author').style.fontSize = `${this.S.quoteFontSize * 0.8}px`;
            await this.plugin.saveSettings();
        };
        card.querySelector('#oq-font-inc').onclick = () => updateFont(+1);
        card.querySelector('#oq-font-dec').onclick = () => updateFont(-1);

        const toggleBtn = card.querySelector('#oq-pause');
        toggleBtn.onclick = async () => {
            this.S.isQuotePaused = !this.S.isQuotePaused;
            await this.plugin.saveSettings();
            toggleBtn.textContent = this.S.isQuotePaused ? '▶️' : '⏸️';
            toggleBtn.title = this.S.isQuotePaused ? t('resume_quote') : t('pause_quote');
        };

        card.querySelector('#oq-next').onclick = async () => {
            const nq = await this.plugin.advanceQuote();
            card.querySelector('#oq-text').textContent   = `"${nq.text}"`;
            card.querySelector('#oq-author').textContent = `— ${nq.author}`;
        };

        this._quoteTextEl   = card.querySelector('#oq-text');
        this._quoteAuthorEl = card.querySelector('#oq-author');
    }

    /** يُستدعى من البلاجن عند تقدم الإشعار ليحدث الويدجت تلقائياً */
    updateQuoteDisplay(q) {
        if (this._quoteTextEl)   this._quoteTextEl.textContent   = `"${q.text}"`;
        if (this._quoteAuthorEl) this._quoteAuthorEl.textContent = `— ${q.author}`;
    }

    // ─────────────────────────────────────────
    //  بطاقة البومودورو
    // ─────────────────────────────────────────
    _buildPomo(wrap) {
        const card = wrap.createDiv('omni-card omni-pomo-card');
        card.innerHTML = `
<div class="omni-card-hd">
  <span class="omni-card-ico">⏱️</span>
  <span class="omni-card-ttl">${t('pomo_title')}</span>
  <span class="omni-mode-badge" id="op-badge">${t('work')}</span>
</div>
<div class="omni-timer" id="op-timer">${fmtTime(this.timeRem)}</div>
<div class="omni-pomo-center">
  <div class="omni-pomo-btns">
    <button class="omni-btn omni-btn-accent" id="op-start">${t('start')}</button>
    <button class="omni-btn omni-btn-muted"  id="op-pause">${t('pause')}</button>
    <button class="omni-btn omni-btn-ghost"  id="op-reset">${t('reset')}</button>
    <button class="omni-btn omni-btn-ghost"  id="op-skip">${t('skip')}</button>
  </div>
  <div class="omni-dur-row">
    <div class="omni-dur-lbl">
      <span>${t('work')}</span>
      <div class="omni-stepper">
        <button class="omni-step-btn" id="op-wd">−</button>
        <input  class="omni-dur-inp" type="number" id="op-wi"
                value="${this.S.workDuration}" min="1" max="120">
        <button class="omni-step-btn" id="op-wi2">+</button>
      </div>
      <span>${t('minutes')}</span>
    </div>
    <div class="omni-dur-lbl">
      <span>${t('break')}</span>
      <div class="omni-stepper">
        <button class="omni-step-btn" id="op-bd">−</button>
        <input  class="omni-dur-inp" type="number" id="op-bi"
                value="${this.S.shortBreak}" min="1" max="60">
        <button class="omni-step-btn" id="op-bi2">+</button>
      </div>
      <span>${t('minutes')}</span>
    </div>
  </div>
  <div class="omni-sessions-row">${t('sessions_completed')} <strong id="op-sessions">0</strong></div>
</div>
<div class="omni-note-row" id="op-note-row" style="display:none">
  ${t('session_on')} <span id="op-note-name" class="omni-note-chip"></span>
</div>`;

        const disp    = card.querySelector('#op-timer');
        const badge   = card.querySelector('#op-badge');
        const sessEl  = card.querySelector('#op-sessions');
        const noteRow = card.querySelector('#op-note-row');
        const noteNm  = card.querySelector('#op-note-name');
        const upd     = () => { disp.textContent = fmtTime(this.timeRem); };

        const clampWork = v => Math.max(1, Math.min(120, v));
        const clampBrk  = v => Math.max(1, Math.min(60,  v));

        const stepW = async d => {
            this.S.workDuration = clampWork(this.S.workDuration + d);
            card.querySelector('#op-wi').value = this.S.workDuration;
            await this.plugin.saveSettings();
            if (!this.timerInt && !this.isBreak) { this.timeRem = this.S.workDuration*60; upd(); }
        };
        const stepB = async d => {
            this.S.shortBreak = clampBrk(this.S.shortBreak + d);
            card.querySelector('#op-bi').value = this.S.shortBreak;
            await this.plugin.saveSettings();
        };

        card.querySelector('#op-wd').onclick  = () => stepW(-1);
        card.querySelector('#op-wi2').onclick = () => stepW(+1);
        card.querySelector('#op-bd').onclick  = () => stepB(-1);
        card.querySelector('#op-bi2').onclick = () => stepB(+1);
        card.querySelector('#op-wi').oninput = async e => {
            this.S.workDuration = clampWork(parseInt(e.target.value) || 25);
            await this.plugin.saveSettings();
            if (!this.timerInt && !this.isBreak) { this.timeRem = this.S.workDuration*60; upd(); }
        };
        card.querySelector('#op-bi').oninput = async e => {
            this.S.shortBreak = clampBrk(parseInt(e.target.value) || 5);
            await this.plugin.saveSettings();
        };

        const completeSession = async () => {
            if (this.timerInt) { clearInterval(this.timerInt); this.timerInt = null; }
            if (!this.isBreak) {
                this.sessions++;
                sessEl.textContent = this.sessions;
                await this.plugin.logPomodoro({
                    date: fmtDate(new Date()), note: this._activeNote || '—',
                    duration: this.S.workDuration, type: 'work',
                });
                // ربط البومودورو بمهمة time تلقائياً
                const activeTask = this.S.progressTasks.find(t => !t.meta?.completed);
                if (activeTask && activeTask.type === 'time') {
                    activeTask.progress.current = Math.min(
                        activeTask.config.total,
                        (activeTask.progress.current || 0) + this.S.workDuration
                    );
                    if (activeTask.progress.current >= activeTask.config.total) {
                        activeTask.meta.completed = true;
                    }
                    this.plugin._checkMilestones(activeTask);
                    await this.plugin.saveSettings();
                    if (this.plugin._activeView) this.plugin._activeView._rebuildProgress();
                }
                this.isBreak = true;
                this.timeRem = this.S.shortBreak * 60;
                badge.textContent = t('break');
                badge.classList.add('omni-break');
                sendNotif('OmniNote ⏱️', t('session_work_end', this._activeNote || t('active_note')));
            } else {
                this.isBreak = false;
                this.timeRem = this.S.workDuration * 60;
                badge.textContent = t('work'); badge.classList.remove('omni-break');
                noteRow.style.display = 'none';
                sendNotif('OmniNote ⏱️', t('session_break_end'));
            }
            upd();
        };

        card.querySelector('#op-start').onclick = () => {
            if (this.timerInt) return;
            const active = this.app.workspace.getActiveFile();
            this._activeNote = active?.basename || null;
            if (this._activeNote) { noteNm.textContent = this._activeNote; noteRow.style.display = 'flex'; }
            const endTime = Date.now() + (this.timeRem * 1000);
            this.timerInt = setInterval(async () => {
                this.timeRem = Math.ceil((endTime - Date.now()) / 1000);
                if (this.timeRem > 0) { upd(); return; }
                this.timeRem = 0; upd();
                await completeSession();
            }, 1000);
            this.plugin.registerInterval(this.timerInt);
        };
        card.querySelector('#op-pause').onclick = () => { clearInterval(this.timerInt); this.timerInt = null; };
        card.querySelector('#op-skip').onclick  = async () => { await completeSession(); };
        card.querySelector('#op-reset').onclick = () => {
            clearInterval(this.timerInt); this.timerInt = null;
            this.isBreak = false; this.timeRem = this.S.workDuration * 60;
            badge.textContent = t('work'); badge.classList.remove('omni-break');
            noteRow.style.display = 'none'; upd();
        };
    }

    // ─────────────────────────────────────────
    //  بطاقة التقويم
    // ─────────────────────────────────────────
    _buildCalendar(wrap) {
        const card = wrap.createDiv('omni-card omni-cal-card');
        card.innerHTML = `
<div class="omni-card-hd">
  <span class="omni-card-ico">📅</span>
  <span class="omni-card-ttl">${t('cal_title')}</span>
</div>
<div class="omni-cal-nav">
  <button class="omni-ghost-btn" id="oc-prev">‹</button>
  <span class="omni-month-lbl" id="oc-lbl"></span>
  <button class="omni-ghost-btn" id="oc-next">›</button>
</div>
<div class="omni-cal-grid" id="oc-grid"></div>
<div class="omni-sticky-panel" id="oc-panel" style="display:none">
  <div class="omni-sticky-hd">
    <span class="omni-sticky-date" id="oc-date-lbl"></span>
    <div style="display: flex; gap: 4px; align-items: center;">
      <button class="omni-ghost-btn omni-del-day-btn" id="oc-del-day" title="${t('delete_note')}">${t('delete')}</button>
      <button class="omni-ghost-btn" id="oc-close" title="${t('close')}">✕</button>
    </div>
  </div>
  <textarea class="omni-sticky-ta" id="oc-note-ta" placeholder="${t('free_note')}"></textarea>
  <div class="omni-task-list" id="oc-task-list"></div>
  <div class="omni-task-add-row">
    <input type="text"  class="omni-field omni-task-inp"  id="oc-task-txt"  placeholder="${t('add_task')}">
    <input type="time"  class="omni-field omni-time-inp"  id="oc-task-time" value="09:00">
    <button class="omni-btn omni-btn-accent omni-add-task-btn" id="oc-task-add">+</button>
  </div>
  <button class="omni-btn omni-btn-accent omni-sticky-save-btn" id="oc-save">${t('save')}</button>
</div>`;

        card.querySelector('#oc-prev').onclick = () => { this.viewDate.setMonth(this.viewDate.getMonth()-1); this._drawGrid(card); };
        card.querySelector('#oc-next').onclick = () => { this.viewDate.setMonth(this.viewDate.getMonth()+1); this._drawGrid(card); };
        card.querySelector('#oc-close').onclick = () => { card.querySelector('#oc-panel').style.display='none'; this.selDate=null; this._drawGrid(card); };
        card.querySelector('#oc-del-day').onclick = async () => {
            if (!this.selDate) return;
            delete this.S.stickyNotes[this.selDate];
            delete this.S.calendarTasks[this.selDate];
            card.querySelector('#oc-note-ta').value = '';
            await this.plugin.saveSettings();
            new Notice(t('delete_day_confirm'));
            card.querySelector('#oc-panel').style.display = 'none';
            this.selDate = null; this._drawGrid(card);
        };
        card.querySelector('#oc-save').onclick = async () => {
            if (!this.selDate) return;
            const txt = card.querySelector('#oc-note-ta').value.trim();
            if (txt) this.S.stickyNotes[this.selDate] = txt;
            else     delete this.S.stickyNotes[this.selDate];
            await this.plugin.saveSettings();
            this._drawGrid(card);
            new Notice(t('save_confirm'));
        };
        card.querySelector('#oc-task-add').onclick    = () => this._addTask(card);
        card.querySelector('#oc-task-txt').onkeypress = e => { if (e.key==='Enter') this._addTask(card); };
        this._drawGrid(card);
    }

    _drawGrid(card) {
        const grid  = card.querySelector('#oc-grid');
        const lbl   = card.querySelector('#oc-lbl');
        const yr    = this.viewDate.getFullYear(), mo = this.viewDate.getMonth();
        const today = fmtDate(new Date());
        lbl.textContent = `${MONTHS[mo]} ${yr}`;
        grid.innerHTML  = '';
        DAYS_S.forEach(d => { grid.createDiv('omni-dn').textContent = d; });
        const firstDow = new Date(yr, mo, 1).getDay();
        for (let i = 0; i < firstDow; i++) grid.createDiv('omni-dc omni-dc-empty');
        const total = new Date(yr, mo+1, 0).getDate();
        for (let d = 1; d <= total; d++) {
            const ds = `${yr}-${pad(mo+1)}-${pad(d)}`;
            const el = grid.createDiv('omni-dc');
            if (ds === today)        el.classList.add('omni-today');
            if (ds === this.selDate) el.classList.add('omni-selected');
            const hasNote = !!this.S.stickyNotes[ds];
            const taskCnt = (this.S.calendarTasks[ds] || []).length;
            
            el.createSpan('omni-dc-num').textContent = d;
            
            // توزيع النقاط أسفل رقم اليوم بناءً على المهام
            let dotsCount = taskCnt > 0 ? taskCnt : (hasNote ? 1 : 0);
            if (dotsCount > 0) {
                const dotsWrap = el.createDiv('omni-dots-wrap');
                const maxDots = Math.min(dotsCount, 5); // حد أقصى بصري حتى لا تخرج عن الدائرة
                for (let k = 0; k < maxDots; k++) dotsWrap.createSpan('omni-dc-dot');
            }
            // ضغطة واحدة: تمييز بصري فقط مع تأخير لتفادي تداخل الدبل كليك
            let clickTimer = null;
            el.onclick = () => {
                if (clickTimer) clearTimeout(clickTimer);
                clickTimer = setTimeout(() => {
                    grid.querySelectorAll('.omni-dc-peek').forEach(c => c.classList.remove('omni-dc-peek'));
                    el.classList.add('omni-dc-peek');
                }, 200);
            };
            // ضغطتان: فتح اللوح
            el.ondblclick = () => {
                if (clickTimer) clearTimeout(clickTimer);
                this._openDay(card, ds);
            };
        }
    }

    _openDay(card, ds) {
        this.selDate = ds;
        const [yr, mo, dy] = ds.split('-').map(Number);
        const dow = new Date(yr, mo-1, dy).getDay();
        card.querySelector('#oc-date-lbl').textContent = `${DAYS_F[dow]}، ${dy} ${MONTHS[mo-1]} ${yr}`;
        card.querySelector('#oc-note-ta').value = this.S.stickyNotes[ds] || '';
        card.querySelector('#oc-panel').style.display = 'flex';
        this._drawTaskList(card, ds);
        this._drawGrid(card);
        card.querySelector('#oc-task-txt').focus();
    }

    _drawTaskList(card, ds) {
        const list = card.querySelector('#oc-task-list');
        list.innerHTML = '';
        const tasks = this.S.calendarTasks[ds] || [];
        if (!tasks.length) return;
        tasks.forEach(t => {
            const row = list.createDiv('omni-ctask-row');
            const timeDisplay = fmt12(t.time);
            row.innerHTML = `
<span class="omni-ctask-time">${escapeHTML(timeDisplay)}</span>
<span class="omni-ctask-text">${escapeHTML(t.text)}</span>
<button class="omni-ghost-btn omni-ctask-del" data-id="${t.id}" title="${t('delete')}">${t('delete')}</button>`;
            row.querySelector('.omni-ctask-del').onclick = async () => {
                this.S.calendarTasks[ds] = (this.S.calendarTasks[ds]||[]).filter(x=>x.id!==t.id);
                if (!this.S.calendarTasks[ds].length) delete this.S.calendarTasks[ds];
                await this.plugin.saveSettings();
                this._drawTaskList(card, ds); this._drawGrid(card);
            };
        });
    }

    async _addTask(card) {
        const txtEl  = card.querySelector('#oc-task-txt');
        const timeEl = card.querySelector('#oc-task-time');
        const text   = txtEl.value.trim();
        if (!text || !this.selDate) return;
        if (!this.S.calendarTasks[this.selDate]) this.S.calendarTasks[this.selDate] = [];
        this.S.calendarTasks[this.selDate].push({ id:uid(), text, time:timeEl.value||'09:00', notifsSent:{} });
        txtEl.value = '';
        await this.plugin.saveSettings();
        this._drawTaskList(card, this.selDate); this._drawGrid(card);
    }

    // ─────────────────────────────────────────
    //  بطاقة متابعة الإنجاز
    // ─────────────────────────────────────────
    _buildProgress(wrap) {
        const card = wrap.createDiv('omni-card omni-prog-card');
        this._progressCard = card;
        card.innerHTML = `
<div class="omni-card-hd">
  <span class="omni-card-ico">📊</span>
  <span class="omni-card-ttl">${t('prog_title')}</span>
  <button class="omni-ghost-btn" id="opr-add-btn" title="${t('add_task_btn')}">+</button>
</div>
<div class="omni-prog-form" id="opr-form" style="display:none">
  <input type="text" class="omni-field" id="opr-name" placeholder="${t('task_name')}">
  <div class="omni-prog-form-row">
    <select class="omni-field omni-field-sm" id="opr-type">
      <option value="steps">${t('type_steps')}</option>
      <option value="value">${t('type_value')}</option>
      <option value="time">${t('type_time')}</option>
    </select>
  </div>
  <div class="omni-prog-form-row">
    <input type="number" class="omni-field omni-field-sm" id="opr-total" placeholder="${t('target')}" min="1" value="">
    <input type="text"   class="omni-field omni-field-sm" id="opr-unit"  placeholder="${t('unit')}">
  </div>
  <div class="omni-prog-form-row">
    <input type="number" class="omni-field omni-field-sm" id="opr-step" placeholder="${t('step_val')}" min="1" value="">
  </div>
  <div class="omni-prog-form-btns">
    <button class="omni-btn omni-btn-accent" id="opr-submit">${t('add_confirm')}</button>
    <button class="omni-btn omni-btn-ghost"  id="opr-cancel">${t('cancel')}</button>
  </div>
</div>
<div class="omni-prog-list" id="opr-list"></div>`;

        card.querySelector('#opr-add-btn').onclick = () => {
            const f = card.querySelector('#opr-form');
            f.style.display = f.style.display === 'none' ? 'flex' : 'none';
            if (f.style.display === 'flex') card.querySelector('#opr-name').focus();
        };
        card.querySelector('#opr-cancel').onclick = () => { card.querySelector('#opr-form').style.display='none'; };

        // تحديث placeholder الوحدة حسب النوع
        card.querySelector('#opr-type').onchange = (e) => {
            const unitInp = card.querySelector('#opr-unit');
            const stepInp = card.querySelector('#opr-step');
            if (e.target.value === 'time') {
                unitInp.placeholder = t('minutes');
                stepInp.placeholder = t('step_ph_time');
            } else if (e.target.value === 'value') {
                unitInp.placeholder = t('unit_pages');
                stepInp.placeholder = t('step_val');
            } else {
                unitInp.placeholder = 'وحدة القياس';
                stepInp.placeholder = 'مقدار الزيادة (اختياري)';
            }
        };

        card.querySelector('#opr-submit').onclick = async () => {
            const name  = card.querySelector('#opr-name').value.trim();
            const type  = card.querySelector('#opr-type').value;
            const total = parseInt(card.querySelector('#opr-total').value) || 1;
            const unit  = card.querySelector('#opr-unit').value.trim() || (type==='time' ? t('minutes') : t('unit_default'));
            const stepV = parseInt(card.querySelector('#opr-step').value);
            if (!name) { new Notice(t('enter_task_name')); return; }
            if (total < 1) { new Notice(t('target_gt_zero')); return; }
            const newTask = {
                id: uid(),
                name,
                type,
                config: { total, unit, ...(stepV > 0 ? { step: stepV } : {}) },
                progress: { current: 0, history: [] },
                meta: { completed: false, archived: false, createdAt: fmtDate(new Date()), completedAt: null, milestones: {} },
            };
            this.S.progressTasks.push(newTask);
            card.querySelector('#opr-name').value  = '';
            card.querySelector('#opr-total').value = '';
            card.querySelector('#opr-unit').value  = '';
            card.querySelector('#opr-step').value  = '';
            card.querySelector('#opr-form').style.display = 'none';
            await this.plugin.saveSettings();
            await this.plugin.writeProgressFile();
            this._drawProgress(card);
        };
        this._drawProgress(card);
    }

    /** يُستدعى من البومودورو لإعادة رسم بطاقة الإنجاز */
    _rebuildProgress() {
        if (this._progressCard) this._drawProgress(this._progressCard);
    }

    _drawProgress(card) {
        const list     = card.querySelector('#opr-list');
        list.innerHTML = '';
        const active    = this.S.progressTasks.filter(t => !t.meta?.completed && !t.meta?.archived);
        const completed = this.S.progressTasks.filter(t =>  t.meta?.completed && !t.meta?.archived);
        if (!active.length && !completed.length) {
            list.createDiv('omni-prog-empty').textContent = t('no_tasks');
            return;
        }

        const typeLabels = { steps: '🎯', value: '📖', time: '⏱️' };

        const renderItem = (task, isDone) => {
            const current = task.progress?.current ?? 0;
            const total   = task.config?.total ?? 1;
            const unit    = task.config?.unit ?? t('unit_default');
            const pct     = Math.min(100, Math.round((current / Math.max(total, 1)) * 100));
            const typeLbl = typeLabels[task.type] || '📊';
            const item    = list.createDiv(`omni-prog-item${isDone ? ' omni-prog-done' : ''}`);
            item.innerHTML = `
<div class="omni-prog-item-hd">
  <span class="omni-prog-name-lbl">${typeLbl} ${escapeHTML(task.name)}</span>
  <span class="omni-prog-units">${escapeHTML(String(current))}/${escapeHTML(String(total))} ${escapeHTML(unit)}</span>
</div>
<div class="omni-prog-bar-wrap">
  <div class="omni-prog-bar" style="width:${pct}%"></div>
</div>
<div class="omni-prog-item-ft">
  ${!isDone ? `
  <div class="omni-stepper omni-prog-stepper">
    <button class="omni-step-btn" data-id="${task.id}" data-a="dec">−</button>
    <span class="omni-prog-pct">${pct}%</span>
    <button class="omni-step-btn omni-step-accent" data-id="${task.id}" data-a="inc">+</button>
  </div>
  <div class="omni-prog-side-btns">
    <button class="omni-ghost-btn" data-id="${task.id}" data-a="set" title="${t('manual_input')}">✏️</button>
    <button class="omni-ghost-btn" data-id="${task.id}" data-a="done" title="${t('status_done')}">✓</button>
    <button class="omni-ghost-btn" data-id="${task.id}" data-a="del"  title="${t('delete')}">🗑</button>
  </div>` : `
  <span class="omni-prog-pct omni-pct-done">${t('completed_status', pct)}</span>
  <button class="omni-ghost-btn" data-id="${task.id}" data-a="del" title="${t('delete')}">🗑</button>`}
</div>`;
            item.querySelectorAll('[data-a]').forEach(btn => {
                btn.onclick = async () => {
                    const { id, a } = btn.dataset;
                    const t = this.S.progressTasks.find(x => x.id === id);
                    if (!t) return;
                    const step = getStep(t);
                    if (a === 'inc') {
                        t.progress.current = Math.min(t.config.total, t.progress.current + step);
                        this.plugin._checkMilestones(t);
                        if (t.progress.current >= t.config.total) {
                            t.meta.completed = true;
                            t.meta.completedAt = fmtDate(new Date());
                        }
                    }
                    if (a === 'dec') {
                        t.progress.current = Math.max(0, t.progress.current - step);
                    }
                    if (a === 'set') {
                        const unit = t.config?.unit ?? t('unit_default');
                        const modal = new OmniInputModal(this.app, t('manual_input_title', t.name), t('manual_input_label', unit), String(t.progress.current), async (val) => {
                            const num = parseFloat(val);
                            if (!isNaN(num)) {
                                t.progress.current = Math.max(0, Math.min(t.config.total, num));
                                this.plugin._checkMilestones(t);
                                if (t.progress.current >= t.config.total) {
                                    t.meta.completed = true;
                                    t.meta.completedAt = fmtDate(new Date());
                                }
                                await this.plugin.saveSettings();
                                await this.plugin.writeProgressFile();
                                this._drawProgress(card);
                            }
                        });
                        modal.open();
                        return; // skip the save/draw below, modal handles it
                    }
                    if (a === 'done') {
                        t.meta.completed = true;
                        t.meta.completedAt = fmtDate(new Date());
                        t.progress.current = t.config.total;
                        this.plugin._checkMilestones(t);
                    }
                    if (a === 'del') {
                        t.meta.archived = true;
                        t.meta.archivedDate = fmtDate(new Date());
                    }
                    await this.plugin.saveSettings();
                    await this.plugin.writeProgressFile();
                    this._drawProgress(card);
                };
            });
        };

        active.forEach(t => renderItem(t, false));
        if (completed.length) {
            list.createDiv('omni-prog-sep').textContent = t('completed_tasks_sep');
            completed.forEach(t => renderItem(t, true));
        }
    }

    async onClose() {
        if (this.timerInt) clearInterval(this.timerInt);
        if (this.plugin._activeView === this) this.plugin._activeView = null;
    }
}

// ═══════════════════════════════════════════════════════════
//  صفحة الإعدادات — احترافية
// ═══════════════════════════════════════════════════════════
class OmniSettingsTab extends PluginSettingTab {
    constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }

    display() {
        const { containerEl: el } = this;
        el.empty();
        el.setAttribute('dir', 'rtl');
        el.createEl('h2', { text: t('settings_title') });

        // Language
        new Setting(el)
            .setName(t('settings_lang'))
            .setDesc(t('settings_lang_desc'))
            .addDropdown(d => d
                .addOption('ar', 'العربية (Arabic)')
                .addOption('en', 'English')
                .setValue(this.plugin.settings.language || 'ar')
                .onChange(async v => {
                    this.plugin.settings.language = v;
                    setTranslationsLang(v);
                    await this.plugin.saveSettings();
                    this.display(); // re-render settings tab
                    if (this.plugin._activeView) this.plugin._activeView._build(); // re-render view
                }));

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ١. البومودورو
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_pomo'));

        new Setting(el)
            .setName(t('work'))
            .setDesc(t('pomo_work_desc'))
            .addText(t => t.setPlaceholder('25').setValue(String(this.plugin.settings.workDuration))
                .onChange(async v => {
                    this.plugin.settings.workDuration = Math.max(1, Math.min(120, parseInt(v)||25));
                    await this.plugin.saveSettings();
                }));

        new Setting(el)
            .setName(t('break'))
            .setDesc(t('pomo_break_desc'))
            .addText(t => t.setPlaceholder('5').setValue(String(this.plugin.settings.shortBreak))
                .onChange(async v => {
                    this.plugin.settings.shortBreak = Math.max(1, Math.min(60, parseInt(v)||5));
                    await this.plugin.saveSettings();
                }));

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٢. الحكم والاقتباسات
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٢. الحكم والاقتباسات
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_quotes'));

        new Setting(el)
            .setName(t('quote_interval'))
            .setDesc(t('quote_interval_desc'))
            .addText(t => t.setPlaceholder('30').setValue(String(this.plugin.settings.quoteInterval))
                .onChange(async v => {
                    this.plugin.settings.quoteInterval = Math.max(1, parseInt(v)||30);
                    await this.plugin.saveSettings();
                    this.plugin.restartQuoteTimer();
                }));

        const qs = this.plugin.settings.quotes;
        const infoDiv = el.createDiv('omni-settings-note');
        infoDiv.innerHTML = `
${t('quote_total')} <strong>${qs.length} ${t('quote_quotes')}</strong><br>
${t('quote_current')} <strong>${(this.plugin.settings.currentQuoteIdx % Math.max(qs.length,1))+1}</strong> ${t('quote_from')} ${qs.length}`;

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٣. استيراد / تصدير الحكم
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_import_export'));

        // استيراد (إضافة)
        new Setting(el)
            .setName(t('import_csv'))
            .setDesc(t('import_csv_desc'))
            .addButton(btn => { btn.setButtonText(t('import_add')).setCta(); btn.onClick(() => this._pickCSV(false)); })
            .addButton(btn => { btn.setButtonText(t('import_replace')); btn.onClick(() => this._pickCSV(true)); });

        // تصدير
        new Setting(el)
            .setName(t('export_csv'))
            .setDesc(t('export_csv_desc'))
            .addButton(btn => {
                btn.setButtonText(t('export_btn'));
                btn.onClick(() => {
                    if (!qs.length) { new Notice(t('export_empty')); return; }
                    const csv  = buildCSV(qs);
                    const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
                    const url  = URL.createObjectURL(blob);
                    const a    = Object.assign(document.createElement('a'), { href:url, download:`omni-quotes-${fmtDate(new Date())}.csv` });
                    document.body.appendChild(a); a.click();
                    document.body.removeChild(a); URL.revokeObjectURL(url);
                    new Notice(t('export_done', qs.length));
                });
            });

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٤. إضافة حكمة يدوياً
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_add_quote'));

        const manualDiv = el.createDiv();
        manualDiv.style.cssText = 'display:flex;flex-direction:column;gap:10px;padding:12px;background:var(--background-secondary);border-radius:8px;margin-bottom:8px;';
        const qTextInp = manualDiv.createEl('textarea', { placeholder:t('quote_ph') });
        qTextInp.style.cssText = 'width:100%;height:64px;direction:rtl;resize:vertical;';
        const qAuthInp = manualDiv.createEl('input', { type:'text', placeholder:t('author_ph') });
        qAuthInp.style.cssText = 'width:100%;direction:rtl;';
        const addBtn = manualDiv.createEl('button', { text:t('add_quote_btn') });
        addBtn.classList.add('mod-cta');
        addBtn.onclick = async () => {
            const text   = qTextInp.value.trim();
            const author = qAuthInp.value.trim() || t('unknown_author');
            if (!text) { new Notice(t('empty_quote_text')); return; }
            this.plugin.settings.quotes.push({ text, author });
            await this.plugin.saveSettings();
            qTextInp.value = ''; qAuthInp.value = '';
            new Notice(t('quote_added'));
            if (this.plugin._activeView) this.plugin._activeView.updateQuoteDisplay(this.plugin.getCurrentQuote());
            this.display();
        };

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٥. قائمة الحكم الحالية
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_quote_list'));

        if (!qs.length) {
            el.createDiv('omni-settings-note').textContent = t('no_quotes_list');
        } else {
            const tableWrap = el.createDiv();
            tableWrap.style.cssText = 'max-height:320px;overflow-y:auto;border:1px solid var(--background-modifier-border);border-radius:8px;margin-top:8px;';
            const table = tableWrap.createEl('table');
            table.style.cssText = 'width:100%;border-collapse:collapse;font-size:0.85em;';
            const hr = table.createEl('thead').createEl('tr');
            hr.style.background = 'var(--background-secondary-alt)';
            [t('th_num'), t('th_quote'), t('th_author'), t('th_actions')].forEach(h => {
                const th = hr.createEl('th', { text:h });
                th.style.cssText = 'padding:8px 10px;text-align:right;';
            });
            const tbody = table.createEl('tbody');
            qs.forEach((q, idx) => {
                const isCurrent = idx === (this.plugin.settings.currentQuoteIdx % Math.max(qs.length,1));

                // ── الصف الرئيسي ──
                const row = tbody.createEl('tr');
                row.style.borderTop = '1px solid var(--background-modifier-border)';
                if (isCurrent) row.style.background = 'var(--background-secondary)';

                const numTd = row.createEl('td', { text: isCurrent ? `▶ ${idx+1}` : `${idx+1}` });
                numTd.style.cssText = `padding:8px 10px;white-space:nowrap;color:${isCurrent ? 'var(--interactive-accent)' : 'var(--text-muted)'};`;

                const txtTd = row.createEl('td', { text:q.text });
                txtTd.style.cssText = 'padding:8px 10px;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';

                const authTd = row.createEl('td', { text:q.author });
                authTd.style.cssText = 'padding:8px 10px;white-space:nowrap;color:var(--text-muted);max-width:100px;overflow:hidden;text-overflow:ellipsis;';

                const actTd = row.createEl('td');
                actTd.style.cssText = 'padding:4px 10px;text-align:center;white-space:nowrap;';

                const editBtn = actTd.createEl('button', { text:'✏️' });
                editBtn.title = t('edit');
                editBtn.style.cssText = 'padding:2px 6px;cursor:pointer;margin-left:4px;';

                const delBtn = actTd.createEl('button', { text:'🗑' });
                delBtn.title = t('delete');
                delBtn.style.cssText = 'padding:2px 6px;cursor:pointer;';

                // ── صف التعديل (مخفي بالبداية) ──
                const editRow = tbody.createEl('tr');
                editRow.style.cssText = 'display:none;background:var(--background-secondary);';
                const editCell = editRow.createEl('td');
                editCell.colSpan = 4;
                editCell.style.cssText = 'padding:10px 12px;';
                const editWrap = editCell.createDiv();
                editWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
                const eText = editWrap.createEl('textarea');
                eText.value = q.text;
                eText.style.cssText = 'width:100%;height:60px;direction:rtl;resize:vertical;font-size:0.9em;padding:6px;border-radius:4px;border:1px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-normal);';
                const eAuth = editWrap.createEl('input', { type:'text' });
                eAuth.value = q.author;
                eAuth.style.cssText = 'width:100%;direction:rtl;font-size:0.9em;padding:5px 8px;border-radius:4px;border:1px solid var(--background-modifier-border);background:var(--background-primary);color:var(--text-normal);';
                const eBtns = editWrap.createDiv();
                eBtns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
                const eSave = eBtns.createEl('button', { text:t('save') });
                eSave.classList.add('mod-cta');
                eSave.style.cssText = 'padding:4px 14px;cursor:pointer;font-size:0.85em;';
                const eCancel = eBtns.createEl('button', { text:t('cancel') });
                eCancel.style.cssText = 'padding:4px 14px;cursor:pointer;font-size:0.85em;';

                // منطق الأزرار
                editBtn.onclick = () => {
                    const isOpen = editRow.style.display !== 'none';
                    editRow.style.display = isOpen ? 'none' : 'table-row';
                    if (!isOpen) eText.focus();
                };
                eCancel.onclick = () => { editRow.style.display = 'none'; };
                eSave.onclick = async () => {
                    const newText = eText.value.trim();
                    const newAuth = eAuth.value.trim() || t('unknown_author');
                    if (!newText) { new Notice(t('empty_quote_text')); return; }
                    this.plugin.settings.quotes[idx] = { text: newText, author: newAuth };
                    await this.plugin.saveSettings();
                    new Notice(t('quote_edited'));
                    if (this.plugin._activeView) this.plugin._activeView.updateQuoteDisplay(this.plugin.getCurrentQuote());
                    this.display();
                };
                delBtn.onclick = async () => {
                    this.plugin.settings.quotes.splice(idx, 1);
                    if (this.plugin.settings.currentQuoteIdx >= this.plugin.settings.quotes.length)
                        this.plugin.settings.currentQuoteIdx = Math.max(0, this.plugin.settings.quotes.length-1);
                    await this.plugin.saveSettings();
                    new Notice(t('quote_deleted'));
                    if (this.plugin._activeView) this.plugin._activeView.updateQuoteDisplay(this.plugin.getCurrentQuote());
                    this.display();
                };
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٦. الإشعارات
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_notifs'));

        new Setting(el)
            .setName(t('milestone_enable'))
            .setDesc(t('milestone_enable_desc'))
            .addToggle(t => t
                .setValue(this.plugin.settings.enableMilestoneNotifications)
                .onChange(async v => {
                    this.plugin.settings.enableMilestoneNotifications = v;
                    await this.plugin.saveSettings();
                    this.display();
                }));

        if (this.plugin.settings.enableMilestoneNotifications) {
            new Setting(el)
                .setName(t('milestone_src'))
                .setDesc(t('milestone_src_desc'))
                .addDropdown(d => d
                    .addOption('windows', t('src_win'))
                    .addOption('obsidian', t('src_obs'))
                    .addOption('both', t('src_both'))
                    .setValue(this.plugin.settings.milestoneNotificationType)
                    .onChange(async v => {
                         this.plugin.settings.milestoneNotificationType = v;
                         await this.plugin.saveSettings();
                    }));

            const msgsBox = el.createDiv();
            msgsBox.style.cssText = 'display:flex;flex-direction:column;gap:12px;padding:12px;background:var(--background-secondary);border-radius:8px;margin-bottom:12px;margin-top:8px;';
            msgsBox.createEl('span', { text: t('milestone_msgs') }).style.cssText = 'color: var(--text-accent); font-weight: bold; margin-bottom: 4px; font-size: 1.05em;';
            
            const msgGrid = msgsBox.createDiv();
            msgGrid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 12px;';
            
            [25, 50, 75, 100].forEach(p => {
                const item = msgGrid.createDiv();
                item.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
                item.createEl('span', { text: t('milestone_msg_at', p) }).style.cssText = 'font-size: 0.9em; color: var(--text-normal); font-weight: 500;';
                
                const ta = item.createEl('textarea');
                ta.value = this.plugin.settings.milestoneMessages[p];
                ta.style.cssText = 'width: 100%; height: 75px; direction: rtl; resize: vertical; padding: 8px; border-radius: 6px; border: 1px solid var(--background-modifier-border); background: var(--background-primary); font-size: 0.9em;';
                
                ta.onchange = async () => {
                    this.plugin.settings.milestoneMessages[p] = ta.value.trim() || DEFAULT_SETTINGS.milestoneMessages[p];
                    if (!ta.value.trim()) ta.value = DEFAULT_SETTINGS.milestoneMessages[p];
                    await this.plugin.saveSettings();
                };
            });
        }

        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        //  ٧. مجلد البيانات
        // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        this._section(el, t('settings_data_dir'));
        el.createDiv('omni-settings-note').innerHTML = t('data_dir_desc', DATA_DIR);
    }

    _section(el, title) {
        el.createEl('h3', { text:title }).style.cssText =
            'margin-top:20px;margin-bottom:4px;padding-bottom:4px;border-bottom:1px solid var(--background-modifier-border);';
    }

    _pickCSV(replace) {
        const fileInp = Object.assign(document.createElement('input'), { type:'file', accept:'.csv' });
        fileInp.style.display = 'none';
        document.body.appendChild(fileInp);
        fileInp.click();
        fileInp.onchange = async e => {
            const file = e.target.files[0];
            document.body.removeChild(fileInp);
            if (!file) return;
            try {
                const parsed = parseCSV(await file.text());
                if (!parsed.length) { new Notice(t('file_no_quotes')); return; }
                if (replace) {
                    this.plugin.settings.quotes = parsed;
                    this.plugin.settings.currentQuoteIdx = 0;
                    new Notice(t('file_replaced', parsed.length));
                } else {
                    this.plugin.settings.quotes = [...this.plugin.settings.quotes, ...parsed];
                    new Notice(t('file_added', parsed.length));
                }
                await this.plugin.saveSettings();
                if (this.plugin._activeView) this.plugin._activeView.updateQuoteDisplay(this.plugin.getCurrentQuote());
                this.display();
            } catch (_) { new Notice(t('file_error')); }
        };
    }
}

// ═══════════════════════════════════════════════════════════
//  البلاجن الرئيسي
// ═══════════════════════════════════════════════════════════
class OmniNotePlugin extends Plugin {

    _activeView = null;  // مرجع للـ View المفتوحة حالياً

    async onload() {
        await this.loadSettings();
        setTranslationsLang(this.settings.language || 'ar');
        this.registerView(VIEW_TYPE_OMNI, leaf => new OmniNoteView(leaf, this));
        this.addRibbonIcon('calendar-clock', 'OmniNote', () => this.activateView());
        this.addCommand({ id:'open-omni-view', name:'افتح OmniNote', callback:() => this.activateView() });
        this.addSettingTab(new OmniSettingsTab(this.app, this));
        if (typeof Notification !== 'undefined' && Notification.permission === 'default')
            Notification.requestPermission();
        this.startQuoteTimer();
        this.startNotifCheck();
        await this._ensureDataDir();
    }

    // ── إدارة الحكم — مصدر الحقيقة الوحيد ────────────────

    /** الحكمة الحالية بدون تغيير الفهرس */
    getCurrentQuote() {
        const qs = this.settings.quotes;
        if (!qs.length) return { text:'...', author:'' };
        return qs[this.settings.currentQuoteIdx % qs.length];
    }

    /**
     * تقدم إلى الحكمة التالية وتحفظ الفهرس،
     * ثم تحدث الويدجت تلقائياً إن كان مفتوحاً.
     * تُستدعى من: زر ↻ في الويدجت + مؤقت الإشعارات.
     */
    async advanceQuote() {
        const qs = this.settings.quotes;
        if (!qs.length) return { text:'...', author:'' };
        this.settings.currentQuoteIdx = (this.settings.currentQuoteIdx + 1) % qs.length;
        await this.saveSettings();
        const q = this.getCurrentQuote();
        if (this._activeView) this._activeView.updateQuoteDisplay(q);
        return q;
    }

    // ── مؤقت الحكم ────────────────────────────────────────
    startQuoteTimer() {
        if (this._qTimer) clearInterval(this._qTimer);
        const ms = (this.settings.quoteInterval || 30) * 60 * 1000;
        this._qTimer = window.setInterval(async () => {
            if (this.settings.isQuotePaused) return; // لا تغير الحكمة إذا كانت متوقفة
            const q = await this.advanceQuote();
            sendNotif(t('quote_title') + ' — OmniNote', `"${escapeHTML(q.text)}" — ${escapeHTML(q.author)}`, true);
        }, ms);
        this.registerInterval(this._qTimer);
    }
    restartQuoteTimer() { this.startQuoteTimer(); }

    // ── فحص إشعارات المهام ────────────────────────────────
    startNotifCheck() {
        if (this._nTimer) clearInterval(this._nTimer);
        this._doNotifCheck();
        this._nTimer = window.setInterval(() => this._doNotifCheck(), 60*1000);
        this.registerInterval(this._nTimer);
    }

    async _doNotifCheck() {
        const now     = Date.now();
        const windows = [
            { key:'h2',  ms: 2*60*60*1000, label:t('notif_due_2h')  },
            { key:'h12', ms:12*60*60*1000, label:t('notif_due_12h') },
            { key:'h24', ms:24*60*60*1000, label:t('notif_due_24h') },
        ];
        let dirty = false;
        for (const [ds, tasks] of Object.entries(this.settings.calendarTasks || {})) {
            for (const task of tasks) {
                const [yr,mo,dy] = ds.split('-').map(Number);
                const [h,m]      = (task.time||'23:59').split(':').map(Number);
                const dueTs = new Date(yr, mo-1, dy, h, m).getTime();
                const diff  = dueTs - now;
                if (!task.notifsSent) task.notifsSent = {};
                
                let toNotify = null;
                for (const w of windows) {
                    if (diff > 0 && diff <= w.ms && !task.notifsSent[w.key]) {
                        toNotify = w;
                        for (const w2 of windows) {
                            if (w2.ms >= w.ms) task.notifsSent[w2.key] = true;
                        }
                        dirty = true;
                        break;
                    }
                }
                if (toNotify) {
                    sendNotif(t('notif_reminder'), t('notif_reminder_body', task.text, toNotify.label));
                }
            }
        }
        if (dirty) await this.saveSettings();
    }

    // ── مجلد البيانات ──────────────────────────────────────
    async _ensureDataDir() {
        try {
            const a = this.app.vault.adapter;
            if (!(await a.exists(DATA_DIR))) await a.mkdir(DATA_DIR);
        } catch (e) { console.error('OmniNote: Failed to create data dir:', e); }
    }

    async logPomodoro(entry) {
        if (!Array.isArray(this.settings.pomodoroLog)) this.settings.pomodoroLog = [];
        this.settings.pomodoroLog.push(entry);
        if (this.settings.pomodoroLog.length > 500)
            this.settings.pomodoroLog = this.settings.pomodoroLog.slice(-500);
        await this.saveSettings();
        try {
            await this._ensureDataDir();
            const today    = fmtDate(new Date());
            const filePath = `${DATA_DIR}/${today}.md`;
            const adapter  = this.app.vault.adapter;
            let content = await adapter.exists(filePath)
                ? await adapter.read(filePath)
                : `# ${t('stats_header')} ${today}\n\n`;
            const timeStr  = new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' });
            const newRow   = `| ${timeStr} | ${escapeHTML(entry.note||t('no_note'))} | ${entry.duration} دقيقة | ${entry.type==='work'?t('work'):t('break')} |\n`;
            const pomoHeader = t('pomo_log_header');
            if (content.includes('## سجل البومودورو') || content.includes(t('pomo_title'))) {
                // If finding in english, fallback might need a stricter regex, but keeping simple for now.
                const searchTxt = content.includes('## سجل البومودورو') ? '## سجل البومودورو' : t('pomo_log_header').split('\n')[0];
                const nextIdx = content.indexOf('\n## ', content.indexOf(searchTxt)+5);
                content = nextIdx !== -1
                    ? content.substring(0,nextIdx).trimEnd()+'\n'+newRow+content.substring(nextIdx)
                    : content.trimEnd()+'\n'+newRow;
            } else { content += `\n${pomoHeader}${newRow}`; }
            await adapter.write(filePath, content);
        } catch (e) { console.error('OmniNote: Failed to log pomodoro:', e); }
    }

    async writeProgressFile() {
        try {
            await this._ensureDataDir();
            const adapter    = this.app.vault.adapter;
            const legacyPath = `${DATA_DIR}/progress-tasks.json`;
            if (await adapter.exists(legacyPath)) await adapter.remove(legacyPath);
            const today    = fmtDate(new Date());
            const filePath = `${DATA_DIR}/${today}.md`;
            let content = await adapter.exists(filePath)
                ? await adapter.read(filePath)
                : `# ${t('stats_header')} ${today}\n`;
            let taskSummary = t('prog_log_header');
            this.settings.progressTasks.filter(t => !t.meta?.archived || t.meta?.archivedDate===today).forEach(tsk => {
                const current = tsk.progress?.current ?? 0;
                const total   = tsk.config?.total ?? 1;
                const unit    = tsk.config?.unit ?? t('unit_default');
                const pct     = Math.min(100, Math.round((current / Math.max(total, 1)) * 100));
                const status  = tsk.meta?.completed ? t('status_done') : t('status_running');
                taskSummary  += `| ${escapeHTML(tsk.name)} | ${escapeHTML(String(current))}/${escapeHTML(String(total))} ${escapeHTML(unit)} | ${pct}% | ${status} |\n`;
            });
            const timeStr     = new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' });
            const fullSection = t('prog_header', timeStr) + taskSummary + '\n';
            const progressRegex = /## متابعة الإنجاز(?:.*\n)+?(?=\n## |\Z)/;
            const progressEnRegex = /## Progress Tracker(?:.*\n)+?(?=\n## |\Z)/;
            if (progressRegex.test(content)) content = content.replace(progressRegex, fullSection);
            else if (progressEnRegex.test(content)) content = content.replace(progressEnRegex, fullSection);
            else content = content.trimEnd()+'\n\n'+fullSection;
            await adapter.write(filePath, content);
        } catch (e) { console.error('OmniNote: Failed to write progress:', e); }
    }

    // ── دورة الحياة ────────────────────────────────────────
    async onunload() {
        if (this._qTimer) clearInterval(this._qTimer);
        if (this._nTimer) clearInterval(this._nTimer);
    }

    async loadSettings() {
        const saved = await this.loadData();
        this.settings = Object.assign({}, DEFAULT_SETTINGS, saved);
        if (!this.settings.stickyNotes)                       this.settings.stickyNotes   = {};
        if (!this.settings.calendarTasks)                     this.settings.calendarTasks = {};
        if (!Array.isArray(this.settings.progressTasks))      this.settings.progressTasks = [];
        if (!Array.isArray(this.settings.pomodoroLog))        this.settings.pomodoroLog   = [];
        if (!Array.isArray(this.settings.quotes)||!this.settings.quotes.length)
            this.settings.quotes = DEFAULT_SETTINGS.quotes;
        if (typeof this.settings.currentQuoteIdx !== 'number') this.settings.currentQuoteIdx = 0;
        if (typeof this.settings.enableMilestoneNotifications !== 'boolean')
            this.settings.enableMilestoneNotifications = true;
        if (!this.settings.milestoneNotificationType) this.settings.milestoneNotificationType = 'windows';
        if (!this.settings.milestoneMessages) this.settings.milestoneMessages = DEFAULT_SETTINGS.milestoneMessages;

        // ═══ Migration: تحويل Schema القديم إلى الجديد ═══
        this.settings.progressTasks = this.settings.progressTasks.map(t => {
            if (t.type) return t; // already migrated
            return {
                id   : t.id,
                name : t.name,
                type : 'steps',
                config: {
                    total : t.total  ?? 1,
                    unit  : t.unit   || 'وحدة',
                },
                progress: {
                    current : t.done || 0,
                    history : [],
                },
                meta: {
                    completed   : t.completed  || false,
                    archived    : t.archived   || false,
                    createdAt   : t.createdAt  || fmtDate(new Date()),
                    completedAt : null,
                    milestones  : {},
                },
            };
        });
    }

    /** فحص وإطلاق إشعارات Milestones */
    _checkMilestones(t) {
        if (!this.settings.enableMilestoneNotifications) return;
        const pct = Math.round((t.progress.current / Math.max(t.config.total, 1)) * 100);
        if (!t.meta.milestones) t.meta.milestones = {};
        const msgs = this.settings.milestoneMessages || DEFAULT_SETTINGS.milestoneMessages;
        let highest = 0;
        [25, 50, 75, 100].forEach(m => {
            if (pct >= m && !t.meta.milestones[m]) {
                t.meta.milestones[m] = true;
                highest = m;
            }
        });
        if (highest > 0) {
            const notifType = this.settings.milestoneNotificationType || 'windows';
            const title = t('milestone_notif_title', t.name, highest);
            const body = msgs[highest] || t('milestone_reached', highest);
            
            try {
                if (notifType === 'obsidian' || notifType === 'both') {
                    new Notice(`${title}\n${body}`, 8000);
                }
                if (notifType === 'windows' || notifType === 'both') {
                    if (typeof Notification !== 'undefined') {
                        if (Notification.permission === 'granted') {
                            new Notification(title, { body: body });
                        } else if (Notification.permission !== 'denied') {
                            Notification.requestPermission().then(p => {
                                if (p === 'granted') new Notification(title, { body });
                            });
                        }
                    }
                }
            } catch (_) {}
        }
    }

    async saveSettings() { await this.saveData(this.settings); }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_OMNI)[0];
        if (!leaf) {
            const r = workspace.getRightLeaf(false);
            await r.setViewState({ type:VIEW_TYPE_OMNI, active:true });
            leaf = r;
        }
        workspace.revealLeaf(leaf);
    }
}

module.exports = OmniNotePlugin;
