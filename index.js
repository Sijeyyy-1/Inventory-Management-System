const itemCardTemplate = document.querySelector("[data-item-template]")
const itemCardContainer = document.querySelector("[data-item-cards-container]")
const searchInput = document.querySelector("[data-search]")
const itemForm = document.getElementById('itemForm')
const editForm = document.getElementById('editForm')
const editModal = document.getElementById('editModal')
const filterSelect = document.getElementById('filter')

let items = []
let currentEditingItem = null

let sampleItems = JSON.parse(localStorage.getItem('inventoryItems')) || [
    { id: 1, name: 'Apple', price: 99.50, category: 'Fruits' },
    { id: 2, name: 'Banana', price: 49.50, category: 'Fruits' },
    { id: 3, name: 'Orange', price: 124.50, category: 'Fruits' },
    { id: 4, name: 'Grapes', price: 174.50, category: 'Fruits' },
    { id: 5, name: 'Watermelon', price: 299.50, category: 'Fruits' }
]

function saveItems() {
    localStorage.setItem('inventoryItems', JSON.stringify(sampleItems))
}

function createItemCards() {
    itemCardContainer.classList.add('loading')
    
    setTimeout(() => {
        itemCardContainer.innerHTML = ''
        items = []

        sampleItems.forEach(item => {
            const card = itemCardTemplate.content.cloneNode(true).children[0]
            
            const header = card.querySelector("[data-header]")
            const body = card.querySelector("[data-body]")
            const category = card.querySelector("[data-category]")
            
            header.textContent = item.name
            body.textContent = `₱${item.price.toFixed(2)}`
            category.textContent = item.category
            
            const editBtn = card.querySelector('.edit-btn')
            editBtn.addEventListener('click', () => openEditModal(item))
            
            const deleteBtn = card.querySelector('.delete-btn')
            deleteBtn.addEventListener('click', () => deleteItem(item))
            
            items.push({
                id: item.id,
                name: item.name,
                price: item.price.toString(),
                category: item.category,
                element: card
            })

            itemCardContainer.append(card)
        })
        
        setupCardClickHandlers()
        itemCardContainer.classList.remove('loading')
        updateDashboardStats()
    }, 300)
}

itemForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const name = document.getElementById('itemName').value.trim()
    const price = parseFloat(document.getElementById('itemPrice').value)
    const category = document.getElementById('itemCategory').value.trim()
    
    if (!name || !category || isNaN(price)) {
        alert('Please fill in all fields correctly')
        return
    }
    
    addNewItem(name, price, category)
    itemForm.reset()
})

function addNewItem(name, price, category) {
    const newItem = {
        id: Date.now(),
        name: name,
        price: price,
        category: category
    }
    sampleItems.push(newItem)
    saveItems()
    createItemCards()
}

function openEditModal(item) {
    currentEditingItem = item
    document.getElementById('editItemName').value = item.name
    document.getElementById('editItemPrice').value = item.price
    document.getElementById('editItemCategory').value = item.category
    editModal.style.display = 'block'
}

function closeModal() {
    editModal.style.display = 'none'
    currentEditingItem = null
    editForm.reset()
}

editForm.addEventListener('submit', (e) => {
    e.preventDefault()
    if (!currentEditingItem) return

    const name = document.getElementById('editItemName').value.trim()
    const price = parseFloat(document.getElementById('editItemPrice').value)
    const category = document.getElementById('editItemCategory').value.trim()

    if (!name || !category || isNaN(price)) {
        alert('Please fill in all fields correctly')
        return
    }

    const updatedItem = {
        id: currentEditingItem.id,
        name: name,
        price: price,
        category: category
    }

    const index = sampleItems.findIndex(item => item.id === currentEditingItem.id)
    if (index !== -1) {
        sampleItems[index] = updatedItem
        saveItems()
        createItemCards()
        closeModal()
    }
})

function deleteItem(item) {
    if (confirm(`Are you sure you want to delete ${item.name}?`)) {
        const index = sampleItems.findIndex(i => i.id === item.id)
        if (index !== -1) {
            sampleItems.splice(index, 1)
            saveItems()
            createItemCards()
        }
    }
}

const filterBtn = document.getElementById('filterBtn')
const filterTooltip = document.getElementById('filterTooltip')
let currentFilterIndex = 0

const filterStates = [
    { name: 'Default', value: 'none' },
    { name: 'Name (A-Z)', value: 'az' },
    { name: 'Name (Z-A)', value: 'za' },
    { name: 'Price (Low-High)', value: 'lowHigh' },
    { name: 'Price (High-Low)', value: 'highLow' },
    { name: 'Category', value: 'category' }
]

function filterItems(filterValue) {
    let sortedItems = [...sampleItems]
    
    switch(filterValue) {
        case 'az':
            sortedItems.sort((a, b) => a.name.localeCompare(b.name))
            break
        case 'za':
            sortedItems.sort((a, b) => b.name.localeCompare(a.name))
            break
        case 'lowHigh':
            sortedItems.sort((a, b) => a.price - b.price)
            break
        case 'highLow':
            sortedItems.sort((a, b) => b.price - a.price)
            break
        case 'category':
            sortedItems.sort((a, b) => a.category.localeCompare(b.category))
            break
        default:
            return
    }
    
    sampleItems = sortedItems
    saveItems()
    createItemCards()
}

filterBtn.addEventListener('click', () => {
    currentFilterIndex = (currentFilterIndex + 1) % filterStates.length
    const currentFilter = filterStates[currentFilterIndex]
    
    filterTooltip.textContent = `Sort: ${currentFilter.name}`
    filterItems(currentFilter.value)
    filterBtn.classList.toggle('active', currentFilter.value !== 'none')
})

function searchItems(searchTerm) {
    const value = searchTerm.toLowerCase().trim()
    
    items.forEach(item => {
        const isVisible = 
            item.name.toLowerCase().includes(value) ||
            item.price.toString().includes(value) ||
            item.category.toLowerCase().includes(value)
        
        item.element.style.display = isVisible ? "" : "none"
    })
}

createItemCards()

let debounceTimeout
searchInput.addEventListener("input", (e) => {
    clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(() => {
        searchItems(e.target.value)
    }, 300)
})

window.addEventListener('click', (e) => {
    if (e.target === editModal) {
        closeModal()
    }
    if (e.target === document.getElementById('addModal')) {
        closeAddModal()
    }
})

function openAddModal() {
    document.getElementById('addModal').style.display = 'block'
    setupCategorySuggestions()
}

function closeAddModal() {
    document.getElementById('addModal').style.display = 'none'
    itemForm.reset()
}

function setupCardClickHandlers() {
    const cards = document.querySelectorAll('.card')
    const body = document.body
    
    let overlay = document.querySelector('.overlay')
    if (!overlay) {
        overlay = document.createElement('div')
        overlay.className = 'overlay'
        body.appendChild(overlay)
    }
    
    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-actions')) {
                return
            }
            
            cards.forEach(c => {
                if (c !== card) c.classList.remove('expanded')
            })
            
            const isExpanded = card.classList.toggle('expanded')
            overlay.classList.toggle('active', isExpanded)
            
            overlay.onclick = () => {
                card.classList.remove('expanded')
                overlay.classList.remove('active')
            }
        })
    })
}

function updateDashboardStats() {
    const totalItems = document.getElementById('totalItems')
    const totalCategories = document.getElementById('totalCategories')
    
    totalItems.textContent = sampleItems.length
    
    const uniqueCategories = new Set(sampleItems.map(item => item.category))
    totalCategories.textContent = uniqueCategories.size
}

function setupCategorySuggestions() {
    const categoryInput = document.getElementById('itemCategory')
    const suggestionsDiv = document.getElementById('categorySuggestions')
    
    function getUniqueCategories() {
        return [...new Set(sampleItems.map(item => item.category))]
    }
    
    function showSuggestions(input) {
        const value = input.toLowerCase()
        const categories = getUniqueCategories()
        const matches = categories.filter(category => 
            category.toLowerCase().includes(value)
        )
        
        if (matches.length && value) {
            suggestionsDiv.innerHTML = matches
                .map(category => `
                    <div class="category-suggestion" data-value="${category}">
                        ${category}
                    </div>
                `).join('')
            suggestionsDiv.style.display = 'block'
        } else {
            suggestionsDiv.style.display = 'none'
        }
    }
    
    let selectedIndex = -1
    categoryInput.addEventListener('keydown', (e) => {
        const suggestions = suggestionsDiv.querySelectorAll('.category-suggestion')
        
        switch(e.key) {
            case 'ArrowDown':
                selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1)
                updateSelection()
                e.preventDefault()
                break
            case 'ArrowUp':
                selectedIndex = Math.max(selectedIndex - 1, -1)
                updateSelection()
                e.preventDefault()
                break
            case 'Enter':
                if (selectedIndex >= 0) {
                    categoryInput.value = suggestions[selectedIndex].dataset.value
                    suggestionsDiv.style.display = 'none'
                    selectedIndex = -1
                    e.preventDefault()
                }
                break
            case 'Escape':
                suggestionsDiv.style.display = 'none'
                selectedIndex = -1
                break
        }
    })
    
    function updateSelection() {
        const suggestions = suggestionsDiv.querySelectorAll('.category-suggestion')
        suggestions.forEach((s, i) => {
            s.classList.toggle('selected', i === selectedIndex)
            if (i === selectedIndex) {
                s.scrollIntoView({ block: 'nearest' })
            }
        })
    }
    
    categoryInput.addEventListener('input', () => {
        showSuggestions(categoryInput.value)
        selectedIndex = -1
    })
    
    suggestionsDiv.addEventListener('click', (e) => {
        const suggestion = e.target.closest('.category-suggestion')
        if (suggestion) {
            categoryInput.value = suggestion.dataset.value
            suggestionsDiv.style.display = 'none'
        }
    })
    
    document.addEventListener('click', (e) => {
        if (!categoryInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.style.display = 'none'
            selectedIndex = -1
        }
    })
}

document.addEventListener('DOMContentLoaded', setupCategorySuggestions)