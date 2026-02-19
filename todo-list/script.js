// 1. VERİ YÖNETİMİ
let tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
let editIndex = null;

// 2. ELEMENTLER
const todoList = document.querySelector("#todo-list");
const quickForm = document.querySelector("#quick-add-form");
const detailedForm = document.querySelector("#detailed-add-form");
const modal = document.querySelector("#detailed-modal");

// 3. MODAL AÇ/KAPAT
document.querySelector("#open-details-btn").onclick = () => {
    editIndex = null;
    detailedForm.reset();
    document.querySelector("#modal-title").innerText = "Yeni Detaylı Görev";
    modal.showModal();
};
document.querySelector("#close-modal-btn").onclick = () => modal.close();

// 4. ANA RENDER FONKSİYONU
function renderTasks() {
    const searchVal = document.querySelector("#search-input").value.toLowerCase();
    const statusFilter = document.querySelector("#status-filter").value;
    const sortVal = document.querySelector("#sort-select").value;

    let filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchVal);
        const matchesStatus = statusFilter === "all" || 
                             (statusFilter === "active" && !t.completed) || 
                             (statusFilter === "completed" && t.completed);
        return matchesSearch && matchesStatus;
    });

    // SIRALAMA
    filtered.sort((a, b) => {
        if (sortVal === "alpha-asc") return a.title.localeCompare(b.title);
        if (sortVal === "date-asc") return new Date(a.endDate) - new Date(b.endDate);
        if (sortVal === "date-desc") return new Date(b.endDate) - new Date(a.endDate);
        return 0;
    });

    todoList.innerHTML = "";
    filtered.forEach(task => {
        const realIdx = tasks.indexOf(task);
        const statusClass = getStatusClass(task.endDate, task.completed);
        
        const card = document.createElement("article");
        card.className = `task-card ${statusClass}`;
        card.innerHTML = `
            <div class="card-header">
                <span class="category-badge">${task.category || 'Genel'}</span>
                <input type="checkbox" id="check-${realIdx}" ${task.completed ? "checked" : ""} onchange="toggleTask(${realIdx})">
            </div>
            <label for="check-${realIdx}" class="task-title ${task.completed ? 'completed-text' : ''}">${task.title}</label>
            <div class="task-info">
                <small><b>Başlangıç:</b> ${task.startDate || '-'}</small><br>
                <small><b>Bitiş:</b> ${task.endDate || '-'}</small>
            </div>
            <div class="card-actions">
                <button onclick="openEditModal(${realIdx})" class="edit-btn">Güncelle</button>
                <button onclick="deleteTask(${realIdx})" class="delete-btn">Sil</button>
            </div>
        `;
        todoList.appendChild(card);
    });
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
}

// 5. YARDIMCI FONKSİYONLAR
function getStatusClass(endDate, isCompleted) {
    if (isCompleted) return "completed-card";
    if (!endDate) return "";
    const now = new Date();
    const end = new Date(endDate);
    const diffDays = (end - now) / (1000 * 60 * 60 * 24);
    if (end < now) return "overdue"; // KIRMIZI
    if (diffDays <= 1) return "warning"; // SARI
    return "";
}

window.toggleTask = (i) => { tasks[i].completed = !tasks[i].completed; renderTasks(); };
window.deleteTask = (i) => { if(confirm("Silinsin mi?")) { tasks.splice(i, 1); renderTasks(); }};

window.openEditModal = (i) => {
    editIndex = i;
    const t = tasks[i];
    document.querySelector("#det-title").value = t.title;
    document.querySelector("#det-category").value = t.category;
    document.querySelector("#det-starting").value = t.startDate;
    document.querySelector("#det-ending").value = t.endDate;
    document.querySelector("#modal-title").innerText = "Görevi Güncelle";
    modal.showModal();
};

// 6. FORM GÖNDERME & TARİH DOĞRULAMA
detailedForm.onsubmit = (e) => {
    e.preventDefault();
    const start = document.querySelector("#det-starting").value;
    const end = document.querySelector("#det-ending").value;

    // --- KRİTİK TARİH KONTROLÜ ---
    if (start && end && new Date(end) < new Date(start)) {
        alert("Hata: Bitiş tarihi başlangıçtan önce olamaz!");
        return;
    }

    const data = {
        title: document.querySelector("#det-title").value,
        category: document.querySelector("#det-category").value || "Genel",
        startDate: start,
        endDate: end,
        completed: editIndex !== null ? tasks[editIndex].completed : false
    };

    if (editIndex !== null) tasks[editIndex] = data;
    else tasks.push(data);

    modal.close();
    renderTasks();
};

// Hızlı ekleme
quickForm.onsubmit = (e) => {
    e.preventDefault();
    tasks.push({ title: document.querySelector("#add-input").value, category: "Genel", completed: false });
    document.querySelector("#add-input").value = "";
    renderTasks();
};

// İlk yükleme
renderTasks();