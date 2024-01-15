const getData = async (url: string) => {
    const resp = await fetch(url)
    const json = await resp.json()
    return json
}

const debounce = (func: Function, delay: number) => {
    let timer: ReturnType<typeof setTimeout>
    return (...args: any[]) => {
        clearTimeout(timer)
        timer = setTimeout(func, delay, ...args)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput") as HTMLInputElement;
    const suggestionsList = document.getElementById("suggestions") as HTMLUListElement;
    const fullInfo = document.querySelector('.content-block') as HTMLDivElement;
    const searchHistoryList = document.getElementById("searchHistory") as HTMLUListElement;
    
    //загрузить историю поиска из localStorage
    const searchHistory = JSON.parse(localStorage.getItem("searchHistory") || "[]")
    searchHistory.slice(-3).forEach((query: string) => {
        const item = document.createElement('div')
        item.innerText = query
        searchHistoryList.appendChild(item)
    })

    searchInput.addEventListener('input', debounce(async () => {
        suggestionsList.innerHTML = ''
        if (searchInput.value === "") return
        const query = encodeURIComponent(searchInput.value) 
        const { meals } = await getData(
            `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
        ) as { meals: Record<string, any>[] | null }
        if (!meals) return

        const inputText = searchInput.value.toLowerCase()
        const results: Record<string, any>[] = searchHistory
            .filter((q: string) => q.toLowerCase().includes(inputText))
            .map((q: string) => ({
                name: q,
                fromHistory: true,
                data: meals.find(m => m.strMeal === q)
            }))
            .slice(0, 5)
        results.push(
            ...meals
                .filter(m => !results.find((item) => item.name === m.strMeal))
                .slice(0, 10 - results.length)
                .map((m: Record<string, unknown>) => ({
                    name: m.strMeal,
                    fromHistory: false,
                    data: m
                }))
        )

        results.forEach((item) => {
            const elem = document.createElement('div')
            elem.innerText = item.name
            suggestionsList.appendChild(elem)
            elem.addEventListener('click', async () => {
                if (!item.fromHistory) {
                    searchHistory.push(item.name) 
                    localStorage.setItem('searchHistory', JSON.stringify(searchHistory))
                }
                
                fullInfo.innerHTML = `
                    <div><img class="img" src="${item.data.strMealThumb}" alt></div>
                    <div>${item.name}</div>
                `
                suggestionsList.innerHTML = ''
                searchHistoryList.innerHTML = ''
                searchHistory.slice(-3).forEach((query: string) => {
                    const item = document.createElement('div')
                    item.innerText = query
                    searchHistoryList.appendChild(item)
                })
            })
        })
    }, 500))
})
