/**
 * Класс для управления каталогом курсов
 * Отвечает за фильтрацию, поиск и отображение карточек
 */
class CourseCatalog {
    constructor() {
        this.courses = coursesData; // Все доступные курсы
        this.filteredCourses = [...this.courses]; // Отфильтрованные курсы для отображения
        this.currentCategory = 'all'; // Текущая выбранная категория
        this.searchQuery = ''; // Текст поискового запроса
        this.cardsPerPage = 9; // Количество карточек на странице
        this.currentPage = 1; // Текущая страница пагинации

        this.init();
    }

    /**
     * Инициализация каталога: рендеринг карточек, настройка событий, обновление счетчиков
     */
    init() {
        this.renderCourses();
        this.setupEventListeners();
        this.updateCategoryCounts();
    }

    /**
     * Настройка обработчиков событий для фильтров, поиска и кнопки "Load more"
     */
    setupEventListeners() {
        // Обработчики кликов по фильтрам категорий
        const filters = document.querySelectorAll('.filter');
        filters.forEach(filter => {
            filter.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.setCategory(category);
            });
        });

        // Обработчик ввода текста в поле поиска (live search)
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => {
            this.setSearchQuery(e.target.value);
        });

        // Обработчик клика по кнопке "Load more"
        const loadMoreBtn = document.getElementById('load-more-btn');
        loadMoreBtn.addEventListener('click', () => {
            this.loadMore();
        });
    }

    /**
     * Установка активной категории фильтра
     * @param {string} category - Название категории ('all', 'marketing', 'management', и т.д.)
     */
    setCategory(category) {
        this.currentCategory = category;
        this.currentPage = 1; // Сбрасываем пагинацию при смене категории
        
        // Обновление визуального состояния активного фильтра
        document.querySelectorAll('.filter').forEach(btn => {
            btn.classList.remove('filter--active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('filter--active');

        this.applyFilters();
    }

    /**
     * Установка поискового запроса
     * @param {string} query - Текст для поиска
     */
    setSearchQuery(query) {
        this.searchQuery = query.toLowerCase().trim();
        this.currentPage = 1; // Сбрасываем пагинацию при поиске
        this.applyFilters();
    }

    /**
     * Применение фильтров: по категории и поисковому запросу
     * Обновляет список отфильтрованных курсов и перерисовывает карточки
     */
    applyFilters() {
        this.filteredCourses = this.courses.filter(course => {
            // Фильтр по категории
            const matchesCategory = this.currentCategory === 'all' || course.category === this.currentCategory;
            
            // Фильтр по поисковому запросу (поиск в названии и авторе)
            const matchesSearch = !this.searchQuery || 
                course.title.toLowerCase().includes(this.searchQuery) ||
                course.author.toLowerCase().includes(this.searchQuery);

            return matchesCategory && matchesSearch;
        });

        this.renderCourses();
        this.updateLoadMoreButton();
    }

    /**
     * Обновление счетчиков количества курсов в каждой категории
     * Счетчики показывают общее количество курсов, а не отфильтрованное
     */
    updateCategoryCounts() {
        const categories = {
            all: this.courses.length,
            marketing: this.courses.filter(c => c.category === 'marketing').length,
            management: this.courses.filter(c => c.category === 'management').length,
            hr: this.courses.filter(c => c.category === 'hr').length,
            design: this.courses.filter(c => c.category === 'design').length,
            development: this.courses.filter(c => c.category === 'development').length
        };

        Object.keys(categories).forEach(category => {
            const filterBtn = document.querySelector(`[data-category="${category}"]`);
            if (filterBtn) {
                const countElement = filterBtn.querySelector('.filter__count');
                if (countElement) {
                    countElement.textContent = categories[category];
                }
            }
        });
    }

    /**
     * Рендеринг карточек курсов в контейнер
     * Отображает только курсы для текущей страницы пагинации
     */
    renderCourses() {
        const container = document.getElementById('courses-container');
        const coursesToShow = this.filteredCourses.slice(0, this.cardsPerPage * this.currentPage);

        if (coursesToShow.length === 0) {
            container.innerHTML = '<div class="courses__empty">No courses found</div>';
            return;
        }

        container.innerHTML = coursesToShow.map(course => this.createCourseCard(course)).join('');
    }

    /**
     * Создание HTML-разметки карточки курса
     * @param {Object} course - Объект с данными курса
     * @returns {string} HTML-разметка карточки
     */
    createCourseCard(course) {
        const categoryLabels = {
            marketing: 'Marketing',
            management: 'Management',
            hr: 'HR & Recruting',
            design: 'Design',
            development: 'Development'
        };

        return `
            <article class="course-card">
                <img src="${course.image}" alt="${course.title}" class="course-card__image">
                <div class="course-card__content">
                    <span class="course-card__category course-card__category--${course.category}">
                        ${categoryLabels[course.category]}
                    </span>
                    <h3 class="course-card__title">${course.title}</h3>
                    <div class="course-card__footer">
                        <span class="course-card__price">$${course.price}</span>
                        <span class="course-card__separator"></span>
                        <span class="course-card__author">by ${course.author}</span>
                    </div>
                </div>
            </article>
        `;
    }

    /**
     * Загрузка следующей страницы карточек (пагинация)
     */
    loadMore() {
        const totalPages = Math.ceil(this.filteredCourses.length / this.cardsPerPage);
        if (this.currentPage < totalPages) {
            this.currentPage++;
            this.renderCourses();
            this.updateLoadMoreButton();
        }
    }

    /**
     * Обновление видимости кнопки "Load more"
     * Скрывает кнопку, если все карточки уже отображены
     */
    updateLoadMoreButton() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        const totalPages = Math.ceil(this.filteredCourses.length / this.cardsPerPage);
        
        if (this.currentPage >= totalPages) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.style.display = 'flex';
        }
    }
}

// Инициализация каталога после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
    new CourseCatalog();
});

