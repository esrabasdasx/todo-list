// LocalStorage kaydetme kısmı
let tasks = JSON.parse(localStorage.getItem("todoTasks")) || [];
let editIndex = null;


const todoList = document.querySelector("#todo-list");
const quickForm = document.querySelector("#quick-add-form");
const detailedForm = document.querySelector("#detailed-add-form");
const modal = document.querySelector("#detailed-modal");

// Filtreleme maddeleri
const searchInput = document.querySelector("#search-input");
const categoryFilter = document.querySelector("#category-filter");
const statusFilter = document.querySelector("#status-filter");
const sortSelect = document.querySelector("#sort-select");

// Detaylı Görev eklemek için modal ekran (pop up  mesajlar gibi)
document.querySelector("#open-details-btn").onclick = () => {
    editIndex = null;
    detailedForm.reset();
    document.querySelector("#modal-title").innerText = "Yeni Detaylı Görev";
    modal.showModal();
};
document.querySelector("#close-modal-btn").onclick = () => modal.close();

// Kategori Listesini Güncelleme
// Görevlere eklenen kategoriler listeye eklenir ve oradan seçilir.
function updateCategoryDropdown() {
    const currentCategory = categoryFilter.value; // Seçili olanı kaybetmemek için
    const categories = [...new Set(tasks.map(t => t.category).filter(c => c))];
    
    categoryFilter.innerHTML = '<option value="all">Tüm Kategoriler</option>';
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat.toLocaleLowerCase('tr');
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
    categoryFilter.value = currentCategory;
}

// Filtreleme ve Sıralama kısmı tanımlamaları
function renderTasks() {
    const searchVal = searchInput.value.toLocaleLowerCase('tr'); //büyük-küçük harf sorununu çözer.
    const selectedStatus = statusFilter.value; //görevlerin durumunu filtrelemeyi sağlar.
    const selectedCategory = categoryFilter.value; //kategorileri seçmemizi sağlar.
    const sortVal = sortSelect.value; //görevleri alfabetik ve tarihsel olarak sıralamamızı sağlar.

    // Görevler burada filtrelenir
    let filtered = tasks.filter(t => {
        const matchesSearch = t.title.toLocaleLowerCase('tr').includes(searchVal);
        const matchesStatus = selectedStatus === "all" || 
                            (selectedStatus === "active" && !t.completed) || 
                            (selectedStatus === "completed" && t.completed);
        const matchesCategory = selectedCategory === "all" || 
                              (t.category && t.category.toLocaleLowerCase('tr') === selectedCategory);
        
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sıralama
    filtered.sort((a, b) => {
        if(a.completed !== b.completed){
            return a.completed ? 1 : -1;
        }
            
        if (sortVal === "alpha-asc") return a.title.localeCompare(b.title, 'tr');
        if (sortVal === "alpha-desc") return b.title.localeCompare(a.title, 'tr');

        // Tarih yoksa en sona atar (0 kullanarak) (hızlı görevler için sıralamada onları en altta gösterir.)
        const dateA = a.endDate ? new Date(a.endDate) : 0;
        const dateB = b.endDate ? new Date(b.endDate) : 0;
        
        if (sortVal === "date-asc") return dateA - dateB;
        if (sortVal === "date-desc") return dateB - dateA;
        return 0;
    });

    todoList.innerHTML = "";
    
    filtered.forEach(task => {
        
        const realIdx = tasks.indexOf(task);
        const statusClass = getStatusClass(task.endDate, task.completed);
        
        const card = document.createElement("article");
        card.className = `task-card ${statusClass}`;
        card.innerHTML = `
            <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
                <span class="category-badge" style="background:#eee; padding:2px 8px; border-radius:4px; font-size:0.8rem;">
                    ${task.category || 'Genel'}
                </span>
                <input type="checkbox" id="check-${realIdx}" ${task.completed ? "checked" : ""} onchange="toggleTask(${realIdx})">
            </div>
            <label for="check-${realIdx}" class="task-title ${task.completed ? 'completed-text' : ''}" style="cursor:pointer; font-weight:bold; font-size:1.0rem; display:block; margin:1px 0;">
                ${task.title}
            </label>
            <div class="task-info">
                <small><b>Başlangıç:</b> ${task.startDate ? task.startDate.replace('T', ' ') : '-'}</small><br>
                <small><b>Bitiş:</b> ${task.endDate ? task.endDate.replace('T', ' ') : '-'}</small>
            </div>
            <div class="card-actions">
                <button onclick="openEditModal(${realIdx})" class="edit-btn">Güncelle</button>
                <button onclick="deleteTask(${realIdx})" class="delete-btn">Sil</button>
            </div>
        `;
        todoList.appendChild(card);
    });

    // Verileri tarayıcıya kaydet ve kategorileri güncelle
    localStorage.setItem("todoTasks", JSON.stringify(tasks));
    updateCategoryDropdown();
}

// Tarih ve duruma göre renklendirme 
function getStatusClass(endDate, isCompleted) {
    if (isCompleted) return "completed-card";
    if (!endDate) return "";
    const now = new Date();
    const end = new Date(endDate);
    const diffMs = end - now;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (end < now) return "overdue";       // Vakti geçmiş -> Kırmızı
    if (diffDays <= 1) return "warning";   // 24 saatten az -> Sarı
    return "";
}

window.toggleTask = (i) => { 
    tasks[i].completed = !tasks[i].completed; 
    renderTasks(); 
};

window.deleteTask = (i) => { 
    if(confirm("Bu görevi silmek istediğinize emin misiniz?")) { 
        tasks.splice(i, 1); 
        renderTasks(); 
    }
};

window.openEditModal = (i) => {
    editIndex = i;
    const t = tasks[i];
    document.querySelector("#det-title").value = t.title;
    document.querySelector("#det-category").value = t.category || "Genel";
    document.querySelector("#det-starting").value = t.startDate || "";
    document.querySelector("#det-ending").value = t.endDate || "";
    document.querySelector("#modal-title").innerText = "Görevi Güncelle";
    modal.showModal();
};

// Detaylı Görev ekleme kısımları
detailedForm.onsubmit = (e) => {
    e.preventDefault();
    const start = document.querySelector("#det-starting").value;
    const end = document.querySelector("#det-ending").value;

    if (start && end && new Date(end) < new Date(start)) {
        alert("Hata: Bitiş tarihi başlangıç tarihinden önce olamaz!");
        return;
    }

    const data = {
        title: document.querySelector("#det-title").value,
        category: document.querySelector("#det-category").value.trim() || "Genel",
        startDate: start,
        endDate: end,
        completed: editIndex !== null ? tasks[editIndex].completed : false
    };

    if (editIndex !== null) tasks[editIndex] = data;
    else tasks.push(data);

    modal.close();
    renderTasks();
};

quickForm.onsubmit = (e) => {
    e.preventDefault();
    const input = document.querySelector("#add-input");
    if(!input.value.trim()) return;

    tasks.push({ 
        title: input.value, 
        category: "Genel", 
        startDate: "", 
        endDate: "", 
        completed: false 
    });
    input.value = "";
    renderTasks();
};

function updateCategorySuggestions() {
    const datalist = document.querySelector("#category-suggestions");
    //benzersiz kategorileri alıp aynı kategorilerin yeniden gelmesi emgeller.
    const categories = [...new Set(tasks.map(t => t.category).filter(c => c))];
    
    datalist.innerHTML = ""; 
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        datalist.appendChild(option);
    });
}

// Bu fonksiyonu renderTasks() fonksiyonunun en sonunda çağırmayı unutma:


// Filtre kısmının çalışması için
searchInput.addEventListener("input", renderTasks);
categoryFilter.addEventListener("change", renderTasks);
statusFilter.addEventListener("change", renderTasks);
sortSelect.addEventListener("change", renderTasks);

// Kategoriler ve çalışması için gereken fonksiyonu çağırıyoruz
updateCategoryDropdown();
updateCategorySuggestions();
renderTasks();

