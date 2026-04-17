import sys

# Translations map
locales_str = """
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
        manual_input_label: "Enter current progress ($1):",
        completed_status: "✓ Completed — $1%",
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
        settings_import_export: "📂 Import / Export Quotes",
        import_csv: "Import from CSV",
        import_csv_desc: "Format: Two columns — Quote text, then Author name (Appended to current list)",
        import_add: "📥 Import & Add",
        import_replace: "🔄 Import & Replace",
        export_csv: "Export Quotes to CSV",
        export_csv_desc: "Download all saved quotes to edit or re-import",
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
        no_quotes_list: "No saved quotes yet. Add manually or import.",
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
        src_both: "Both (Windows + Obsidian)",
        milestone_msgs: "💬 Custom Milestone Messages",
        milestone_msg_at: "Message at $1%",
        settings_data_dir: "💾 Data Directory",
        data_dir_desc: "Daily logs are saved automatically in:<br><code>$1/YYYY-MM-DD.md</code> inside the vault",
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
"""

with open('e:/omni-v3/main.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Add translation helpers after constants
top_insert_marker = "const DEFAULT_SETTINGS = {"
top_idx = text.find(top_insert_marker)

# Insert language into default settings
text = text.replace(top_insert_marker, top_insert_marker + "\\n    language        : 'ar',")

# Insert locales and t function before helpers
helpers_marker = "// ═══════════════════════════════════════════════════════════\\n//  مساعدات"
repl_helpers = locales_str + "\\n" + helpers_marker
text = text.replace(helpers_marker, repl_helpers)

# Perform dictionary replacements

reps = {
    "'✓ تأكيد'": "t('confirm_btn')",
    "'إلغاء'": "t('cancel')",
    "'مجهول'": "t('unknown_author')",

    # Quotes HTML
    "حكمة اليوم": "${t('quote_title')}",
    "استئناف تغيير الحكم": "${t('resume_quote')}",
    "إيقاف تغيير الحكم": "${t('pause_quote')}",
    "حكمة أخرى": "${t('next_quote')}",
    "تكبير الخط": "${t('inc_font')}",
    "تصغير الخط": "${t('dec_font')}",

    # Pomodoro HTML
    ">بومودورو<": ">${t('pomo_title')}<",
    ">عمل<": ">${t('work')}<",
    "▶ ابدأ": "${t('start')}",
    "⏸ توقف": "${t('pause')}",
    "↺ إعادة": "${t('reset')}",
    "⏭ تخطي": "${t('skip')}",
    ">عمل<": ">${t('work')}<",
    ">استراحة<": ">${t('break')}<",
    ">دقيقة<": ">${t('minutes')}<",
    "🔥 جلسات مكتملة: ": "${t('sessions_completed')} ",
    "📝 جلسة على: ": "${t('session_on')} ",

    # Pomodoro Logic JS
    "badge.textContent = 'استراحة'": "badge.textContent = t('break')",
    "badge.textContent = 'عمل'": "badge.textContent = t('work')",
    "`انتهت جلسة العمل على \\"${this._activeNote || 'الملاحظة'}\\"! استرح الآن 🎉`": "t('session_work_end', this._activeNote || t('active_note'))",
    "'انتهت الاستراحة! وقت العمل 💪'": "t('session_break_end')",

    # Cal HTML
    ">التقويم<": ">${t('cal_title')}<",
    "حذف الملاحظة": "${t('delete_note')}",
    "إغلاق": "${t('close')}",
    "ملاحظة حرة...": "${t('free_note')}",
    "أضف مهمة...": "${t('add_task')}",
    "💾 حفظ": "${t('save')}",
    "🗑": "${t('delete')}",

    # Cal Logic
    "'تم مسح المهام والملاحظة كلياً 🗑'": "t('delete_day_confirm')",
    "'تم الحفظ ✓'": "t('save_confirm')",

    # Progress HTML
    ">متابعة الإنجاز<": ">${t('prog_title')}<",
    'title="إضافة مهمة"': 'title="${t(\\'add_task_btn\\')}"',
    'placeholder="اسم المهمة"': 'placeholder="${t(\\'task_name\\')}"',
    ">🎯 خطوات<": ">${t('type_steps')}<",
    ">📖 قيمة<": ">${t('type_value')}<",
    ">⏱️ وقت<": ">${t('type_time')}<",
    'placeholder="الهدف"': 'placeholder="${t(\\'target\\')}"',
    'placeholder="وحدة القياس"': 'placeholder="${t(\\'unit\\')}"',
    'placeholder="مقدار الزيادة (اختياري)"': 'placeholder="${t(\\'step_val\\')}"',
    ">إضافة ✓<": ">${t('add_confirm')}<",
    ">إلغاء<": ">${t('cancel')}<",

    # Progress Logic
    "'دقيقة'": "t('minutes')",
    "'وحدة'": "t('unit_default')",
    "'صفحة / كلمة'": "t('unit_pages')",
    "'مقدار الزيادة (اختياري)'": "t('step_val')",
    "'مقدار الزيادة (مثلاً 25)'": "t('step_ph_time')",
    "'وحدة القياس'": "t('unit')",

    "'أدخل اسم المهمة'": "t('enter_task_name')",
    "'الهدف يجب أن يكون أكبر من صفر'": "t('target_gt_zero')",
    "'لا توجد مهام بعد'": "t('no_tasks')",
    "'✏️'": "t('manual_input')",
    "'اكتمل'": "t('done')",
    "'حذف'": "t('delete')",
    
    "`✓ مكتمل — ${pct}%`": "t('completed_status', pct)",
    "'— مكتملة —'": "t('completed_tasks_sep')",
    "`إدخال يدوي — ${t.name}`": "t('manual_input_title', t.name)",
    "`أدخل التقدم الحالي (${unit}):`": "t('manual_input_label', unit)",
    
    # Settings Render
    "'⚙️ إعدادات OmniNote'": "t('settings_title')",
    "'⏱️ البومودورو'": "t('settings_pomo')",
    "'مدة العمل'": "t('work')",
    "'عدد الدقائق لكل جلسة عمل (١–١٢٠)'": "t('pomo_work_desc')",
    "'مدة الاستراحة'": "t('break')",
    "'عدد الدقائق للاستراحة القصيرة (١–٦٠)'": "t('pomo_break_desc')",
    "'💡 الحكم والاقتباسات'": "t('settings_quotes')",
    "'فترة إشعار الحكمة'": "t('quote_interval')",
    "'كل كم دقيقة تظهر حكمة في إشعارات ويندوز وتتقدم في الويدجت معاً'": "t('quote_interval_desc')",
    "`\\n📊 إجمالي الحكم المحفوظة: <strong>${qs.length} حكمة</strong><br>\\n🔖 الحكمة الحالية المعروضة: رقم <strong>${(this.plugin.settings.currentQuoteIdx % Math.max(qs.length,1))+1}</strong> من ${qs.length}`": "`\\n${t('quote_total')} <strong>${qs.length} ${t('quote_quotes')}</strong><br>\\n${t('quote_current')} <strong>${(this.plugin.settings.currentQuoteIdx % Math.max(qs.length,1))+1}</strong> ${t('quote_from')} ${qs.length}`",
    "'📂 استيراد / تصدير الحكم'": "t('settings_import_export')",
    "'استيراد حكم من ملف CSV'": "t('import_csv')",
    "'تنزيل جميع الحكم المحفوظة كملف CSV يمكن تعديله وإعادة استيراده'": "t('export_csv_desc')",
    "'تنسيق الملف: عمودان — نص الحكمة، ثم اسم الكاتب (يُضاف إلى القائمة الحالية)'": "t('import_csv_desc')",
    "'تصدير الحكم إلى ملف CSV'": "t('export_csv')",
    "'📥 استيراد وإضافة'": "t('import_add')",
    "'🔄 استيراد واستبدال'": "t('import_replace')",
    "'📤 تصدير CSV'": "t('export_btn')",
    "'لا توجد حكم للتصدير'": "t('export_empty')",
    "`✅ تم تصدير ${qs.length} حكمة`": "t('export_done', qs.length)",
    "'✍️ إضافة حكمة يدوياً'": "t('settings_add_quote')",
    "'نص الحكمة...'": "t('quote_ph')",
    "'المؤلف (اختياري)...'": "t('author_ph')",
    "'+ إضافة الحكمة'": "t('add_quote_btn')",
    "'يرجى كتابة نص الحكمة'": "t('empty_quote_text')",
    "'✅ تمت إضافة الحكمة'": "t('quote_added')",
    "'📋 قائمة الحكم الحالية'": "t('settings_quote_list')",
    "'لا توجد حكم محفوظة بعد. أضف حكماً يدوياً أو استورد من CSV.'": "t('no_quotes_list')",
    "['#','الحكمة','المؤلف','إجراءات']": "[t('th_num'), t('th_quote'), t('th_author'), t('th_actions')]",
    "editBtn.title = 'تعديل';": "editBtn.title = t('edit');",
    "delBtn.title = 'حذف';": "delBtn.title = t('delete');",
    "'نص الحكمة لا يمكن أن يكون فارغاً'": "t('empty_quote_text')",
    "'✅ تم تعديل الحكمة'": "t('quote_edited')",
    "'تم حذف الحكمة'": "t('quote_deleted')",
    "'🔔 الإشعارات'": "t('settings_notifs')",
    "'تفعيل إشعارات Milestones'": "t('milestone_enable')",
    "'إظهار إشعار عند الوصول إلى 25% — 50% — 75% — 100% من أي مهمة'": "t('milestone_enable_desc')",
    "'مصدر إشعارات Milestones'": "t('milestone_src')",
    "'حدد أين تود أن تظهر لك هذه الإشعارات؟'": "t('milestone_src_desc')",
    "'ويندوز (النظام) فقط'": "t('src_win')",
    "'أوبسيديان (داخلي) فقط'": "t('src_obs')",
    "'كلاهما (ويندوز + أوبسيديان)'": "t('src_both')",
    "'💬 نصوص إشعارات الإنجاز المخصصة'": "t('milestone_msgs')",
    "`رسالة الإنجاز عند ${p}%`": "t('milestone_msg_at', p)",
    "'💾 مجلد البيانات'": "t('settings_data_dir')",
    "`تُحفظ السجلات اليومية تلقائياً في:<br><code>${DATA_DIR}/YYYY-MM-DD.md</code> داخل الـ vault`": "t('data_dir_desc', DATA_DIR)",
    "'⚠️ لم يُعثر على حكم في الملف'": "t('file_no_quotes')",
    "`✅ تم استبدال الحكم بـ ${parsed.length} حكمة جديدة`": "t('file_replaced', parsed.length)",
    "`✅ تم إضافة ${parsed.length} حكمة جديدة`": "t('file_added', parsed.length)",
    "'⚠️ خطأ في قراءة الملف'": "t('file_error')",

    # Backend strings
    "'بعد ساعتين'": "t('notif_due_2h')",
    "'بعد 12 ساعة'": "t('notif_due_12h')",
    "'بعد 24 ساعة'": "t('notif_due_24h')",
    "'📅 تذكير — OmniNote'": "t('notif_reminder')",
    "`\\\"${task.text}\\\" مستحقة ${toNotify.label}`": "t('notif_reminder_body', task.text, toNotify.label)",
    "`# إحصائيات يوم ${today}\\n\\n`": "`# ${t('stats_header')} ${today}\\n\\n`",
    "`# إحصائيات يوم ${today}\\n`": "`# ${t('stats_header')} ${today}\\n`",
    "entry.type==='work'?'عمل':'استراحة'": "entry.type==='work'?t('work'):t('break')",
    "'بدون ملاحظة'": "t('no_note')",
    "'## سجل البومودورو\\n| الوقت | الملاحظة | المدة | النوع |\\n| :--- | :--- | :--- | :--- |\\n'": "t('pomo_log_header')",
    "'| المهمة | الإنجاز | النسبة | الحالة |\\n| :--- | :--- | :--- | :--- |\\n'": "t('prog_log_header')",
    "'✅ مكتملة'": "t('status_done')",
    "'⏳ جارية'": "t('status_running')",
    "`## متابعة الإنجاز (تحديث: ${timeStr})\\n\\n${taskSummary}\\n`": "`${t('prog_header', timeStr)}${taskSummary}\\n`",
    "`📊 OmniNote — ${t.name} (${highest}%)`": "t('milestone_notif_title', t.name, highest)",
    "`وصلت إلى ${highest}%`": "t('milestone_reached', highest)"
}

for k, v in reps.items():
    text = text.replace(k, v)

# Update _activeView setViewState translation reload
# We need to add setTranslationsLang(this.settings.language) in onload
onload_marker = "async onload() {"
onload_repl = onload_marker + "\\n        await this.loadSettings();\\n        setTranslationsLang(this.settings.language || 'ar');"
text = text.replace("await this.loadSettings();", "")
text = text.replace(onload_marker, onload_repl)

# Add Language Dropdown in Display Setting
display_top_marker = "el.createEl('h2', { text: t('settings_title') });"
lang_dropdown = \"\"\"
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
\"\"\"
text = text.replace(display_top_marker, display_top_marker + lang_dropdown)

# One more for 💡 حكمة اليوم — OmniNote
text = text.replace("'💡 حكمة اليوم — OmniNote'", "t('quote_title') + ' — OmniNote'")

with open('e:/omni-v3/main.js', 'w', encoding='utf-8') as f:
    f.write(text)
