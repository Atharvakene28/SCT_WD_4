document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const prioritySelect = document.getElementById('priority-select');
    const todoList = document.getElementById('todo-list');
    const emptyState = document.getElementById('empty-state');
    const progressText = document.getElementById('progress-text');
    const progressCircle = document.querySelector('.progress-ring__circle');
    const currentDateDisplay = document.getElementById('current-date');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed');

    let todos = JSON.parse(localStorage.getItem('mindsparkTodos')) || [];
    let currentFilter = 'all';

    // Set Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);

    // Circle Configuration
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

    function setProgress(percent) {
        const offset = circumference - (percent / 100 * circumference);
        progressCircle.style.strokeDashoffset = offset;
        progressText.textContent = `${Math.round(percent)}%`;
    }

    function saveTodos() {
        localStorage.setItem('mindsparkTodos', JSON.stringify(todos));
        updateStats();
    }

    function updateStats() {
        if (todos.length === 0) {
            setProgress(0);
            return;
        }
        const completed = todos.filter(t => t.completed).length;
        const percentage = (completed / todos.length) * 100;
        setProgress(percentage);
    }

    function renderTodos() {
        todoList.innerHTML = '';
        const filteredTodos = todos.filter(todo => {
            if (currentFilter === 'active') return !todo.completed;
            if (currentFilter === 'completed') return todo.completed;
            return true;
        });

        if (todos.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', todo.id);

            li.innerHTML = `
                <div class="checkbox" onclick="toggleTodo(${todo.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <div class="todo-content" onclick="toggleTodo(${todo.id})">
                    <div class="todo-text">${escapeHtml(todo.text)}</div>
                    <div class="todo-meta">
                        <span class="badge ${todo.priority}">${todo.priority}</span>
                    </div>
                </div>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})" aria-label="Delete Task">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            todoList.appendChild(li);
        });
        updateStats();
    }

    window.toggleTodo = (id) => {
        todos = todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        saveTodos();
        renderTodos();
    };

    window.deleteTodo = (id) => {
        const item = document.querySelector(`.todo-item[data-id="${id}"]`);
        if (item) {
            item.style.transform = 'translateX(20px)';
            item.style.opacity = '0';
        }
        setTimeout(() => {
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }, 300);
    };

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        const priority = prioritySelect.value;

        if (text) {
            const newTodo = {
                id: Date.now(),
                text,
                priority,
                completed: false
            };
            todos.unshift(newTodo);
            saveTodos();
            todoInput.value = '';
            renderTodos();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    clearCompletedBtn.addEventListener('click', () => {
        todos = todos.filter(todo => !todo.completed);
        saveTodos();
        renderTodos();
    });

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    renderTodos();
});
