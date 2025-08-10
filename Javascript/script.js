// DOM Elements
const amountInput = document.getElementById('amount');
const fromCurrencySelect = document.getElementById('from-currency');
const toCurrencySelect = document.getElementById('to-currency');
const convertBtn = document.getElementById('convert-btn');
const swapBtn = document.getElementById('swap-btn');
const resultContainer = document.getElementById('result-container');
const fromAmountSpan = document.getElementById('from-amount');
const toAmountSpan = document.getElementById('to-amount');
const exchangeRateSpan = document.getElementById('exchange-rate');
const lastUpdateSpan = document.getElementById('last-update');
const fromFlag = document.getElementById('from-flag');
const toFlag = document.getElementById('to-flag');

// Quick amount buttons
const quickBtns = document.querySelectorAll('.quick-btn');
const currencyTiles = document.querySelectorAll('.currency-tile');

// API Configuration
const API_URL = 'https://api.frankfurter.app';

// Currency to country code mapping for flags
const currencyFlags = {
    'USD': 'us', 'EUR': 'eu', 'GBP': 'gb', 'JPY': 'jp', 'AUD': 'au',
    'CAD': 'ca', 'CHF': 'ch', 'CNY': 'cn', 'SEK': 'se', 'NZD': 'nz',
    'MXN': 'mx', 'SGD': 'sg', 'HKD': 'hk', 'NOK': 'no', 'KRW': 'kr',
    'TRY': 'tr', 'RUB': 'ru', 'INR': 'in', 'BRL': 'br', 'ZAR': 'za',
    'DKK': 'dk', 'PLN': 'pl', 'THB': 'th', 'MYR': 'my', 'HUF': 'hu',
    'CZK': 'cz', 'ILS': 'il', 'CLP': 'cl', 'PHP': 'ph', 'AED': 'ae',
    'COP': 'co', 'SAR': 'sa', 'RON': 'ro', 'BGN': 'bg', 'HRK': 'hr'
};

// Initialize the app
async function init() {
    await loadCurrencies();
    setupEventListeners();
    // Perform initial conversion
    if (amountInput.value) {
        convertCurrency();
    }
}

// Load available currencies
async function loadCurrencies() {
    try {
        const response = await fetch(`${API_URL}/currencies`);
        const currencies = await response.json();
        
        // Clear existing options
        fromCurrencySelect.innerHTML = '';
        toCurrencySelect.innerHTML = '';
        
        // Populate currency dropdowns
        for (const [code, name] of Object.entries(currencies)) {
            const optionFrom = new Option(`${code} - ${name}`, code);
            const optionTo = new Option(`${code} - ${name}`, code);
            
            fromCurrencySelect.add(optionFrom);
            toCurrencySelect.add(optionTo);
        }
        
        // Set default currencies
        fromCurrencySelect.value = 'USD';
        toCurrencySelect.value = 'EUR';
        
        // Update flags
        updateFlags();
        
    } catch (error) {
        console.error('Error loading currencies:', error);
        showError('Failed to load currencies. Please refresh the page.');
    }
}

// Update flag images
function updateFlags() {
    const fromCountry = currencyFlags[fromCurrencySelect.value] || 'un';
    const toCountry = currencyFlags[toCurrencySelect.value] || 'un';
    
    fromFlag.src = `https://flagcdn.com/w40/${fromCountry}.png`;
    toFlag.src = `https://flagcdn.com/w40/${toCountry}.png`;
}

// Convert currency
async function convertCurrency() {
    const amount = parseFloat(amountInput.value);
    const fromCurrency = fromCurrencySelect.value;
    const toCurrency = toCurrencySelect.value;
    
    // Validation
    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }
    
    if (!fromCurrency || !toCurrency) {
        showError('Please select currencies');
        return;
    }
    
    if (fromCurrency === toCurrency) {
        showError('Please select different currencies');
        return;
    }
    
    try {
        // Show loading state
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';
        convertBtn.disabled = true;
        
        // Fetch conversion rate
        const response = await fetch(
            `${API_URL}/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`
        );
        
        if (!response.ok) {
            throw new Error('Conversion failed');
        }
        
        const data = await response.json();
        const convertedAmount = data.rates[toCurrency];
        const rate = convertedAmount / amount;
        
        // Display results
        displayResult(amount, fromCurrency, convertedAmount, toCurrency, rate);
        
        // Update last update time
        updateLastUpdateTime();
        
    } catch (error) {
        console.error('Conversion error:', error);
        showError('Failed to convert. Please try again.');
    } finally {
        // Reset button state
        convertBtn.innerHTML = '<span>Convert</span><i class="fas fa-arrow-right"></i>';
        convertBtn.disabled = false;
    }
}

// Display conversion result
function displayResult(amount, fromCurrency, convertedAmount, toCurrency, rate) {
    // Format numbers
    const formattedAmount = formatNumber(amount);
    const formattedConverted = formatNumber(convertedAmount);
    const formattedRate = rate.toFixed(4);
    
    // Update result display
    fromAmountSpan.textContent = `${formattedAmount} ${fromCurrency}`;
    toAmountSpan.textContent = `${formattedConverted} ${toCurrency}`;
    exchangeRateSpan.textContent = `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`;
    
    // Show result container with animation
    resultContainer.classList.add('show');
}

// Format numbers with commas
function formatNumber(num) {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
}

// Swap currencies
function swapCurrencies() {
    const temp = fromCurrencySelect.value;
    fromCurrencySelect.value = toCurrencySelect.value;
    toCurrencySelect.value = temp;
    
    updateFlags();
    
    // Convert automatically if amount exists
    if (amountInput.value) {
        convertCurrency();
    }
}

// Update last update time
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
    lastUpdateSpan.textContent = `Updated ${timeString}`;
}

// Show error message
function showError(message) {
    // Create or update error element
    let errorDiv = document.querySelector('.error-message');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        resultContainer.parentNode.insertBefore(errorDiv, resultContainer);
    }
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    
    // Hide after 3 seconds
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Convert button
    convertBtn.addEventListener('click', convertCurrency);
    
    // Swap button
    swapBtn.addEventListener('click', swapCurrencies);
    
    // Currency select changes
    fromCurrencySelect.addEventListener('change', () => {
        updateFlags();
        if (amountInput.value) convertCurrency();
    });
    
    toCurrencySelect.addEventListener('change', () => {
        updateFlags();
        if (amountInput.value) convertCurrency();
    });
    
    // Amount input - convert on Enter
    amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertCurrency();
        }
    });
    
    // Quick amount buttons
    quickBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            amountInput.value = btn.dataset.amount;
            convertCurrency();
        });
    });
    
    // Popular currency tiles
    currencyTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            const currency = tile.dataset.currency;
            // Set as "from" currency if clicking with no modifier
            // Set as "to" currency if holding shift
            if (event.shiftKey) {
                toCurrencySelect.value = currency;
            } else {
                fromCurrencySelect.value = currency;
            }
            updateFlags();
            if (amountInput.value) convertCurrency();
        });
    });
}

// Add error message styles
const style = document.createElement('style');
style.textContent = `
    .error-message {
        background: var(--error);
        color: white;
        padding: 12px 24px;
        border-radius: var(--radius);
        margin-bottom: 20px;
        text-align: center;
        display: none;
        animation: shake 0.5s ease-in-out;
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-10px); }
        75% { transform: translateX(10px); }
    }
    
    .convert-button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .currency-tile {
        cursor: pointer;
        transition: all 0.3s ease;
        user-select: none;
    }
    
    .currency-tile:hover {
        background: var(--primary);
        border-color: var(--primary);
        transform: translateY(-2px);
    }
    
    .currency-tile:active {
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
