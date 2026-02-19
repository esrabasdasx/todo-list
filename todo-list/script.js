const inputTask = document.querySelector('#inputTask');
const inputCategory = document.querySelector('#inputCategory');

const addTaskBtn = document.querySelector('#task');
const categoryBtn = document.querySelector('#categorySubmit');

const taskSelect = document.querySelector('#taskSelect');
const categorySelect = document.querySelector('#categorySelect');


const taskContainer = document.querySelector('#taskList');

const taskList = [];
const categoryList = [];

// Görev ekleme butonu için kullanılan fonksiyon
addTaskBtn.addEventListener('click', function(e) {

    e.preventDefault();

    const taskName = inputTask.value.trim();
    
    const selectedCategory = taskSelect.value;

    const startDate = document.querySelector('#starting').value;
    const endDate = document.querySelector('#ending').value;


    if(taskName === ""){
        alert("Lütfen bir görev giriniz.");
        return;
    }
    const isQuickTask = (selectedCategory === "" || selectedCategory === "Görev Seçin"); 
    const newTask = {
        id: Date.now(),
        text: taskName,
        category: isQuickTask ? "Hızlı Görev" : selectedCategory, // Kategori yoksa isimlendirelim
        genre: isQuickTask ? "hizli" : "normal", 
        completed: false,
        addition: new Date(),
        start: startDate || null,
        end: endDate || null
    };
    taskList.push(newTask);
    render();
    inputTask.value = "";
    document.querySelector('#starting').value = " ";
    document.querySelector('#ending').value = " ";
    
});

//Kategori ekleme işlemi için kullanılan buton 
categoryBtn.addEventListener('click', function(e) {
    e.preventDefault();

    const categoryName = inputCategory.value.trim();

    if(categoryName === ""){
        alert("Lütfen bir kategori giriniz");
    }else if(categoryList.includes(categoryName)){
        alert("Bu kategori zaten mevcut");
    }else{
        categoryList.push(categoryName);
        updateMenus();
        saveToLocalStorage();
        inputCategory.value = "";
    }
});

//Eklenen kategoriler ve görevlerin LocalStorage kısmından alınması için gerekli
function loadFromLocalStorage() {
    const savedCategories = localStorage.getItem('myCategories');
    const savedTasks = localStorage.getItem('myTasks');

    if (savedCategories) {
        categoryList.push(...JSON.parse(savedCategories));
        updateMenus();
    }
    
    if (savedTasks) {
        taskList.push(...JSON.parse(savedTasks));
        render();
    }
}

//LocalStorage içine verileri gönder.
function saveToLocalStorage(){
    localStorage.setItem('myCategories', JSON.stringify(categoryList));
    localStorage.setItem('myTask',JSON.stringify(taskList));

}

//Kategoriler ve görevler kısmını güncellemeyi sağlar.
function updateMenus(){
    taskSelect.innerHTML = '<option value="">Kategori Ata</option>';
    categorySelect.innerHTML = '<option value="">Mevcut Kategoriler</option>';

    categoryList.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;

        categorySelect.appendChild(option);
        taskSelect.appendChild(option.cloneNode(true));
    });

}

//Kullanıcı tarafından girilen görevler buraya aktarılır, liste şeklinde görünür.
function render(){
    taskContainer.innerHTML = "";

    taskList.forEach(task => {
        const li = document.createElement('li');    //Her görev için bir liste elemanı oluşturuluyor.

        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span>${task.text}</span>
            <small>(${task.category})</small>
            <button class="delete-btn">Sil</button>
        `;
        if(task.genre == "hizli"){
            li.style.borderLeft = "5px solid yellow";
        }
        taskContainer.appendChild(li);        
    });   
}



