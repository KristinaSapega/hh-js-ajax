"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const getData = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const resp = yield fetch(url);
    if (resp.status >= 400) {
        throw new Error('Произошла ошибка при выполнении запроса. Статус ответа: ' + resp.status);
    }
    const json = yield resp.json();
    return json;
});
const debounce = (func, delay) => {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(func, delay, ...args);
    };
};
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const suggestionsList = document.getElementById("suggestions");
    const fullInfo = document.querySelector('.content-block');
    const searchHistoryList = document.getElementById("searchHistory");
    const getSearchHistory = () => {
        try {
            return JSON.parse(localStorage.getItem("searchHistory") || "[]");
        }
        catch (error) {
            return [];
        }
    };
    let searchHistory = getSearchHistory();
    //загрузить историю поиска из localStorage
    const createHistiryItem = (query) => {
        const item = document.createElement('div');
        item.innerText = query;
        searchHistoryList.appendChild(item);
    };
    const updateSearchHistory = () => {
        searchHistoryList.innerHTML = '';
        searchHistory.slice(-3).forEach((query) => {
            const item = document.createElement('div');
            item.innerText = query;
            searchHistoryList.appendChild(item);
        });
    };
    searchHistory.slice(-3).forEach(createHistiryItem);
    window.addEventListener('storage', (event) => {
        if (event.key === 'searchHistory') {
            searchHistory = getSearchHistory();
            updateSearchHistory();
        }
    });
    searchInput.addEventListener('input', debounce(() => __awaiter(void 0, void 0, void 0, function* () {
        suggestionsList.innerHTML = '';
        if (searchInput.value === "")
            return;
        const query = encodeURIComponent(searchInput.value);
        try {
            const { meals } = yield getData(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
            if (!meals)
                return;
            const inputText = searchInput.value.toLowerCase();
            const results = searchHistory
                .filter((q) => q.toLowerCase().includes(inputText))
                .map((q) => ({
                name: q,
                fromHistory: true,
                data: meals.find(m => m.strMeal === q)
            }))
                .slice(0, 5);
            results.push(...meals
                .filter(m => !results.find((item) => item.name === m.strMeal))
                .slice(0, 10 - results.length)
                .map((m) => ({
                name: m.strMeal,
                fromHistory: false,
                data: m
            })));
            results.forEach((item) => {
                const elem = document.createElement('div');
                elem.innerText = item.name;
                suggestionsList.appendChild(elem);
                elem.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
                    if (!item.fromHistory) {
                        searchHistory.push(item.name);
                        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
                        updateSearchHistory();
                    }
                    fullInfo.innerHTML = `
                        <div><img class="img" src="${item.data.strMealThumb}" alt></div>
                        <div>${item.name}</div>
                    `;
                    suggestionsList.innerHTML = '';
                }));
            });
        }
        catch (e) {
            alert('Произошла ошибка при взаимодействии с сервером');
        }
    }), 500));
});
