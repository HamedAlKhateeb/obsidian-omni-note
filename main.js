const { Plugin, ItemView, PluginSettingTab, Setting, Notice } = require('obsidian');

const VIEW_TYPE_OMNI = "omni-note-view";

const ARABIC_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const ARABIC_DAYS_SHORT = ['أح','اث','ثل','أر','خم','جم','سب'];
const ARABIC_DAYS_FULL = ['الأحد','الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];

const DEFAULT_SETTINGS = {
    workDuration: 25,
    shortBreak: 5,
    quoteInterval: 30,
    quotes: [
        { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
        { text: "Stay hungry, stay foolish.", author: "Steve Jobs" },
        { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
        { text: "إن العلم في الصغر كالنقش في الحجر.", author: "مثل عربي" }
    ],
    stickyNotes: {}
};

// ──────────────────────────────────────────
// VIEW
// ──────────────────────────────────────────
class OmniNoteView extends ItemView {
    constructor(leaf, plugin) {
        super(leaf);
        this.plugin = plugin;
        this.timeRemaining = plugin.settings.workDuration * 60;
        this.timerInterval = null;
        this.completedSessions = 0;
        this.isOnBreak = false;
        this.viewDate = new Date();
        this.selectedDate = null;
        this.quoteIndex = Math.floor(Math.random() * plugin.settings.quotes.length);
    }

    getViewType() { return VIEW_TYPE_OMNI; }
    getDisplayText() { return "OmniNote"; }
    getIcon() { return "calendar-clock"; }

    formatTime(sec) {
        const m = Math.floor(sec / 60), s = sec % 60;
        return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    }

    formatDate(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    async onOpen() {
        const root = this.containerEl.children[1];
        root.empty();
        root.setAttribute('dir', 'rtl');
        root.classList.add('omni-root');

        const q = this.plugin.settings.quotes[this.quoteIndex] || { text: '', author: '' };

        root.innerHTML = `
<div class="omni-wrap">

  <!-- ── QUOTE ── -->
  <div class="omni-card omni-quote-card">
    <div class="omni-card-hd">
      <span class="omni-card-ico">💡</span>
      <span class="omni-card-ttl">حكمة اليوم</span>
      <button class="omni-ghost-btn omni-next-q" title="حكمة أخرى">↻</button>
    </div>
    <p class="omni-q-text" id="omni-q-text">"${q.text}"</p>
    <p class="omni-q-author" id="omni-q-author">— ${q.author}</p>
  </div>

  <!-- ── POMODORO ── -->
  <div class="omni-card omni-pomo-card">
    <div class="omni-card-hd">
      <span class="omni-card-ico">⏱️</span>
      <span class="omni-card-ttl">بومودورو</span>
      <span class="omni-mode-badge" id="omni-mode-badge">عمل</span>
    </div>
    <div class="omni-timer" id="omni-timer">${this.formatTime(this.timeRemaining)}</div>
    <div class="omni-pomo-btns">
      <button class="omni-btn omni-btn-accent" id="omni-start">▶ ابدأ</button>
      <button class="omni-btn omni-btn-muted"  id="omni-pause">⏸ إيقاف</button>
      <button class="omni-btn omni-btn-ghost"  id="omni-reset">↺ إعادة</button>
    </div>
    <div class="omni-dur-row">
      <label class="omni-dur-lbl">
        عمل
        <input class="omni-dur-inp" type="number" id="omni-work-inp"
               value="${this.plugin.settings.workDuration}" min="1" max="120"> ق
      </label>
      <label class="omni-dur-lbl">
        استراحة
        <input class="omni-dur-inp" type="number" id="omni-break-inp"
               value="${this.plugin.settings.shortBreak}" min="1" max="60"> ق
      </label>
    </div>
    <div class="omni-sessions-row">
      🔥 جلسات مكتملة: <strong id="omni-sessions">0</strong>
    </div>
  </div>

  <!-- ── CALENDAR ── -->
  <div class="omni-card omni-cal-card">
    <div class="omni-card-hd">
      <span class="omni-card-ico">📅</span>
      <span class="omni-card-ttl">التقويم</span>
    </div>
    <div class="omni-cal-nav">
      <button class="omni-ghost-btn" id="omni-prev-mo">‹</button>
      <span class="omni-month-lbl" id="omni-month-lbl"></span>
      <button class="omni-ghost-btn" id="omni-next-mo">›</button>
    </div>
    <div class="omni-cal-grid" id="omni-cal-grid"></div>

    <!-- Sticky note panel -->
    <div class="omni-sticky-panel" id="omni-sticky-panel" style="display:none">
      <div class="omni-sticky-hd">
        <span id="omni-sticky-lbl" class="omni-sticky-date"></span>
        <button class="omni-ghost-btn" id="omni-sticky-close">✕</button>
      </div>
      <textarea class="omni-sticky-ta" id="omni-sticky-ta"
                placeholder="اكتب ملاحظتك هنا..."></textarea>
      <button class="omni-btn omni-btn-accent omni-sticky-save-btn" id="omni-sticky-save">💾 حفظ</button>
    </div>
  </div>

</div>`;

        this._setupPomodoro(root);
        this._setupCalendar(root);
        this._setupQuote(root);
        this._renderCalendar(root);
    }

    // ── Quote ──────────────────────────────
    _setupQuote(root) {
        root.querySelector('.omni-next-q').onclick = () => {
            const qs = this.plugin.settings.quotes;
            this.quoteIndex = (this.quoteIndex + 1) % qs.length;
            root.querySelector('#omni-q-text').textContent = `"${qs[this.quoteIndex].text}"`;
            root.querySelector('#omni-q-author').textContent = `— ${qs[this.quoteIndex].author}`;
        };
    }

    // ── Pomodoro ───────────────────────────
    _setupPomodoro(root) {
        const display  = root.querySelector('#omni-timer');
        const badge    = root.querySelector('#omni-mode-badge');
        const sessions = root.querySelector('#omni-sessions');
        const workInp  = root.querySelector('#omni-work-inp');
        const brkInp   = root.querySelector('#omni-break-inp');

        const update = () => { display.textContent = this.formatTime(this.timeRemaining); };

        const notify = (title, body) => {
            new Notice(`${title} — ${body}`);
            if (typeof Notification !== 'undefined') {
                if (Notification.permission === 'granted') {
                    new Notification(title, { body });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(p => {
                        if (p === 'granted') new Notification(title, { body });
                    });
                }
            }
        };

        workInp.onchange = async () => {
            this.plugin.settings.workDuration = parseInt(workInp.value) || 25;
            await this.plugin.saveSettings();
            if (!this.timerInterval && !this.isOnBreak) {
                this.timeRemaining = this.plugin.settings.workDuration * 60;
                update();
            }
        };
        brkInp.onchange = async () => {
            this.plugin.settings.shortBreak = parseInt(brkInp.value) || 5;
            await this.plugin.saveSettings();
        };

        root.querySelector('#omni-start').onclick = () => {
            if (this.timerInterval) return;
            this.timerInterval = setInterval(() => {
                if (this.timeRemaining > 0) {
                    this.timeRemaining--;
                    update();
                } else {
                    clearInterval(this.timerInterval);
                    this.timerInterval = null;
                    if (!this.isOnBreak) {
                        this.completedSessions++;
                        sessions.textContent = this.completedSessions;
                        this.isOnBreak = true;
                        this.timeRemaining = this.plugin.settings.shortBreak * 60;
                        badge.textContent = 'استراحة';
                        badge.classList.add('omni-break');
                        notify('OmniNote ⏱️', 'انتهت جلسة العمل! وقت الاستراحة 🎉');
                    } else {
                        this.isOnBreak = false;
                        this.timeRemaining = this.plugin.settings.workDuration * 60;
                        badge.textContent = 'عمل';
                        badge.classList.remove('omni-break');
                        notify('OmniNote ⏱️', 'انتهت الاستراحة! وقت العمل 💪');
                    }
                    update();
                }
            }, 1000);
        };

        root.querySelector('#omni-pause').onclick = () => {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        };

        root.querySelector('#omni-reset').onclick = () => {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
            this.isOnBreak = false;
            this.timeRemaining = this.plugin.settings.workDuration * 60;
            badge.textContent = 'عمل';
            badge.classList.remove('omni-break');
            update();
        };
    }

    // ── Calendar ───────────────────────────
    _setupCalendar(root) {
        root.querySelector('#omni-prev-mo').onclick = () => {
            this.viewDate.setMonth(this.viewDate.getMonth() - 1);
            this._renderCalendar(root);
        };
        root.querySelector('#omni-next-mo').onclick = () => {
            this.viewDate.setMonth(this.viewDate.getMonth() + 1);
            this._renderCalendar(root);
        };
    }

    _renderCalendar(root) {
        const grid  = root.querySelector('#omni-cal-grid');
        const label = root.querySelector('#omni-month-lbl');
        const yr = this.viewDate.getFullYear(), mo = this.viewDate.getMonth();
        const todayStr = this.formatDate(new Date());

        label.textContent = `${ARABIC_MONTHS[mo]} ${yr}`;
        grid.innerHTML = '';

        // Day-name headers
        ARABIC_DAYS_SHORT.forEach(d => {
            const el = document.createElement('div');
            el.className = 'omni-dn';
            el.textContent = d;
            grid.appendChild(el);
        });

        // Leading empty cells
        const firstDow = new Date(yr, mo, 1).getDay(); // 0=Sun
        for (let i = 0; i < firstDow; i++) {
            const el = document.createElement('div');
            el.className = 'omni-dc omni-dc-empty';
            grid.appendChild(el);
        }

        // Date cells
        const total = new Date(yr, mo + 1, 0).getDate();
        for (let d = 1; d <= total; d++) {
            const ds = this.formatDate(new Date(yr, mo, d));
            const el = document.createElement('div');
            el.className = 'omni-dc';
            if (ds === todayStr)          el.classList.add('omni-today');
            if (ds === this.selectedDate) el.classList.add('omni-selected');
            if (this.plugin.settings.stickyNotes[ds]) el.classList.add('omni-has-note');

            el.innerHTML = `<span class="omni-dc-num">${d}</span>`;
            el.onclick = () => this._openSticky(root, ds);
            grid.appendChild(el);
        }
    }

    _openSticky(root, dateStr) {
        this.selectedDate = dateStr;
        const panel   = root.querySelector('#omni-sticky-panel');
        const lbl     = root.querySelector('#omni-sticky-lbl');
        const ta      = root.querySelector('#omni-sticky-ta');
        const saveBtn = root.querySelector('#omni-sticky-save');
        const closeBtn= root.querySelector('#omni-sticky-close');

        const [yr, mo, dy] = dateStr.split('-').map(Number);
        const dow = new Date(yr, mo - 1, dy).getDay();
        lbl.textContent = `${ARABIC_DAYS_FULL[dow]}، ${dy} ${ARABIC_MONTHS[mo-1]} ${yr}`;
        ta.value = this.plugin.settings.stickyNotes[dateStr] || '';
        panel.style.display = 'flex';
        ta.focus();
        this._renderCalendar(root);

        saveBtn.onclick = async () => {
            const txt = ta.value.trim();
            if (txt) this.plugin.settings.stickyNotes[dateStr] = txt;
            else delete this.plugin.settings.stickyNotes[dateStr];
            await this.plugin.saveSettings();
            this._renderCalendar(root);
            new Notice('تم الحفظ ✓');
        };

        closeBtn.onclick = () => {
            panel.style.display = 'none';
            this.selectedDate = null;
            this._renderCalendar(root);
        };
    }

    async onClose() {
        if (this.timerInterval) clearInterval(this.timerInterval);
    }
}

// ──────────────────────────────────────────
// SETTINGS TAB
// ──────────────────────────────────────────
class OmniSettingsTab extends PluginSettingTab {
    constructor(app, plugin) { super(app, plugin); this.plugin = plugin; }

    display() {
        const { containerEl: el } = this;
        el.empty();
        el.createEl('h2', { text: '⚙️ إعدادات OmniNote' });

        el.createEl('h3', { text: '⏱️ البومودورو' });

        new Setting(el).setName('مدة العمل (دقائق)')
            .addText(t => t.setValue(String(this.plugin.settings.workDuration))
                .onChange(async v => { this.plugin.settings.workDuration = parseInt(v)||25; await this.plugin.saveSettings(); }));

        new Setting(el).setName('مدة الاستراحة (دقائق)')
            .addText(t => t.setValue(String(this.plugin.settings.shortBreak))
                .onChange(async v => { this.plugin.settings.shortBreak = parseInt(v)||5; await this.plugin.saveSettings(); }));

        el.createEl('h3', { text: '💡 إشعارات الحكم' });

        new Setting(el).setName('الفترة بين الإشعارات (دقائق)')
            .setDesc('كل كم دقيقة تظهر حكمة جديدة في إشعارات ويندوز')
            .addText(t => t.setValue(String(this.plugin.settings.quoteInterval))
                .onChange(async v => {
                    this.plugin.settings.quoteInterval = parseInt(v)||30;
                    await this.plugin.saveSettings();
                    this.plugin.restartQuoteTimer();
                }));

        el.createEl('h3', { text: '➕ إضافة حكمة' });

        let qt = '', qa = '';
        new Setting(el).setName('نص الحكمة')
            .addTextArea(t => t.setPlaceholder('أدخل الحكمة...').onChange(v => qt = v));
        new Setting(el).setName('المصدر / الكاتب')
            .addText(t => t.setPlaceholder('الكاتب').onChange(v => qa = v));
        new Setting(el).addButton(b => b.setButtonText('إضافة ✓').setCta().onClick(async () => {
            if (!qt.trim()) return;
            this.plugin.settings.quotes.push({ text: qt.trim(), author: qa.trim() || 'مجهول' });
            await this.plugin.saveSettings();
            new Notice('تمت إضافة الحكمة ✓');
            this.display();
        }));

        el.createEl('h3', { text: '📚 الحكم الحالية' });
        this.plugin.settings.quotes.forEach((q, i) => {
            new Setting(el)
                .setName(`${i+1}. ${q.author}`)
                .setDesc(q.text.length > 70 ? q.text.slice(0,70) + '…' : q.text)
                .addButton(b => b.setButtonText('حذف').setWarning().onClick(async () => {
                    this.plugin.settings.quotes.splice(i, 1);
                    await this.plugin.saveSettings();
                    this.display();
                }));
        });
    }
}

// ──────────────────────────────────────────
// PLUGIN
// ──────────────────────────────────────────
class OmniNotePlugin extends Plugin {
    async onload() {
        await this.loadSettings();

        this.registerView(VIEW_TYPE_OMNI, leaf => new OmniNoteView(leaf, this));
        this.addRibbonIcon('calendar-clock', 'OmniNote', () => this.activateView());
        this.addCommand({ id: 'open-omni', name: 'افتح OmniNote', callback: () => this.activateView() });
        this.addSettingTab(new OmniSettingsTab(this.app, this));

        // Request notification permission and start quote timer
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        this.startQuoteTimer();
    }

    startQuoteTimer() {
        if (this._quoteTimer) clearInterval(this._quoteTimer);
        const ms = (this.settings.quoteInterval || 30) * 60 * 1000;
        this._quoteTimer = setInterval(() => {
            const q = this.settings.quotes[Math.floor(Math.random() * this.settings.quotes.length)];
            if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
                new Notification('💡 حكمة اليوم — OmniNote', { body: `"${q.text}" — ${q.author}` });
            }
        }, ms);
    }

    restartQuoteTimer() { this.startQuoteTimer(); }

    async onunload() {
        if (this._quoteTimer) clearInterval(this._quoteTimer);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        if (!this.settings.stickyNotes) this.settings.stickyNotes = {};
    }

    async saveSettings() { await this.saveData(this.settings); }

    async activateView() {
        const { workspace } = this.app;
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_OMNI)[0];
        if (!leaf) {
            const r = workspace.getRightLeaf(false);
            await r.setViewState({ type: VIEW_TYPE_OMNI, active: true });
            leaf = r;
        }
        workspace.revealLeaf(leaf);
    }
}

module.exports = OmniNotePlugin;
