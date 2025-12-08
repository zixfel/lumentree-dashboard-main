/**
 * Solar Monitor - Frontend JavaScript
 * Version: 08012 - Mobile Optimized + Battery Cell + SOC Chart + Calculator Integration
 * 
 * Features:
 * - Real-time data via SignalR
 * - Battery Cell monitoring (16 cells)
 * - SOC (State of Charge) Chart
 * - Energy flow visualization
 * - Chart.js visualizations
 * - Mobile optimized interface
 */

document.addEventListener('DOMContentLoaded', function () {
    // ========================================
    // INITIALIZATION
    // ========================================
    
    // Set up today's date as default
    const today = new Date();
    const dateInput = document.getElementById('dateInput');
    if (dateInput) {
        dateInput.value = formatDate(today);
    }

    // Get deviceId from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const deviceIdParam = urlParams.get('deviceId');
    if (deviceIdParam) {
        const deviceIdInput = document.getElementById('deviceId');
        if (deviceIdInput) {
            deviceIdInput.value = deviceIdParam;
        }
    }

    // Handle Enter key in deviceId input
    const deviceIdInput = document.getElementById('deviceId');
    if (deviceIdInput) {
        deviceIdInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                fetchData();
            }
        });
    }

    // Configure Chart.js defaults
    configureChartDefaults();

    // Chart objects
    let pvChart, batChart, loadChart, gridChart, essentialChart, socChart;

    // SignalR connection
    let connection;
    let currentDeviceId = '';

    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    // View button
    const viewBtn = document.getElementById('viewBtn');
    if (viewBtn) {
        viewBtn.addEventListener('click', fetchData);
    }

    // Date navigation
    const prevDayBtn = document.getElementById('prevDay');
    const nextDayBtn = document.getElementById('nextDay');
    if (prevDayBtn) prevDayBtn.addEventListener('click', () => changeDate(-1));
    if (nextDayBtn) nextDayBtn.addEventListener('click', () => changeDate(1));

    // Summary card clicks - scroll to section
    const cardSections = [
        { cardId: 'pv-card', sectionId: 'pv-section' },
        { cardId: 'bat-charge-card', sectionId: 'bat-section' },
        { cardId: 'bat-discharge-card', sectionId: 'bat-section' },
        { cardId: 'load-card', sectionId: 'load-section' },
        { cardId: 'grid-card', sectionId: 'grid-section' },
        { cardId: 'essential-card', sectionId: 'essential-section' }
    ];

    cardSections.forEach(({ cardId, sectionId }) => {
        const card = document.getElementById(cardId);
        if (card) {
            card.addEventListener('click', () => scrollToElement(sectionId));
        }
    });

    // Hero section toggle (mobile)
    const heroToggle = document.getElementById('heroToggle');
    const heroContent = document.getElementById('heroContent');
    if (heroToggle && heroContent) {
        heroToggle.addEventListener('click', () => {
            heroContent.classList.toggle('collapsed');
            heroToggle.classList.toggle('rotated');
        });
    }

    // Battery cell section toggle
    const cellSectionHeader = document.getElementById('cellSectionHeader');
    const cellSectionContent = document.getElementById('cellSectionContent');
    const toggleIcon = document.getElementById('toggleIcon');
    const toggleText = document.getElementById('toggleText');
    
    if (cellSectionHeader && cellSectionContent) {
        cellSectionHeader.addEventListener('click', () => {
            const isCollapsed = cellSectionContent.classList.toggle('hidden');
            if (toggleIcon) {
                toggleIcon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
            }
            if (toggleText) {
                toggleText.textContent = isCollapsed ? 'Hiện' : 'Ẩn';
            }
        });
    }

    // Compact search bar toggle
    const compactSearchToggle = document.getElementById('compactSearchToggle');
    const compactSearchBar = document.getElementById('compactSearchBar');
    if (compactSearchToggle && compactSearchBar) {
        compactSearchToggle.addEventListener('click', () => {
            // Show the full search bar
            const searchSection = document.getElementById('search-section');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Initialize SignalR
    initializeSignalRConnection();

    // Auto-fetch if deviceId in URL
    if (deviceIdParam) {
        fetchData();
    }

    // ========================================
    // CHART CONFIGURATION
    // ========================================
    
    function configureChartDefaults() {
        Chart.defaults.font.family = "'Inter', 'Segoe UI', 'Helvetica', 'Arial', sans-serif";
        Chart.defaults.color = '#64748b';
        Chart.defaults.elements.line.borderWidth = 2;
        Chart.defaults.elements.point.hitRadius = 8;

        const isDarkMode = document.documentElement.classList.contains('dark') ||
            (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

        Chart.defaults.scale.grid.color = isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';
        Chart.defaults.scale.ticks.color = isDarkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
    }

    // ========================================
    // SIGNALR CONNECTION
    // ========================================
    
    function initializeSignalRConnection() {
        console.log("Initializing SignalR connection");

        connection = new signalR.HubConnectionBuilder()
            .withUrl("/deviceHub")
            .withAutomaticReconnect([0, 2000, 10000, 30000])
            .build();

        // Handle real-time data
        connection.on("ReceiveRealTimeData", function (data) {
            console.log("Received real-time data:", data);
            updateRealTimeDisplay(data);
            updateConnectionStatus('connected');
        });

        // Handle battery cell data
        connection.on("ReceiveBatteryCellData", function (data) {
            console.log("Received battery cell data:", data);
            updateBatteryCellDisplay(data);
        });

        // Handle SOC data
        connection.on("ReceiveSOCData", function (data) {
            console.log("Received SOC data:", data);
            updateSOCChart(data);
        });

        connection.on("SubscriptionConfirmed", function (deviceId) {
            console.log(`Subscribed to device: ${deviceId}`);
            updateConnectionStatus('connected');
        });

        startSignalRConnection();
    }

    function updateConnectionStatus(status) {
        const indicator = document.getElementById('connectionIndicator');
        const text = document.getElementById('connectionText');

        if (indicator) {
            indicator.className = 'w-2.5 h-2.5 rounded-full';
            if (status === 'connected') {
                indicator.classList.add('status-connected');
            } else if (status === 'connecting') {
                indicator.classList.add('status-connecting');
            } else {
                indicator.classList.add('status-disconnected');
            }
        }

        if (text) {
            if (status === 'connected') {
                text.textContent = 'Đã kết nối';
            } else if (status === 'connecting') {
                text.textContent = 'Đang kết nối...';
            } else {
                text.textContent = 'Mất kết nối';
            }
        }
    }

    async function startSignalRConnection() {
        updateConnectionStatus('connecting');
        try {
            await connection.start();
            console.log("SignalR Connected");
            updateConnectionStatus('connected');

            let deviceToSubscribe = document.getElementById('deviceId')?.value?.trim();
            if (!deviceToSubscribe) {
                deviceToSubscribe = urlParams.get('deviceId');
            }

            if (deviceToSubscribe) {
                subscribeToDevice(deviceToSubscribe);
            }
        } catch (err) {
            console.error("SignalR Connection Error:", err);
            updateConnectionStatus('disconnected');
            setTimeout(startSignalRConnection, 5000);
        }
    }

    function subscribeToDevice(deviceId) {
        if (!deviceId || deviceId === currentDeviceId || !connection || connection.state !== "Connected") {
            return;
        }

        if (currentDeviceId) {
            connection.invoke("UnsubscribeFromDevice", currentDeviceId)
                .catch(err => console.error("Unsubscribe error:", err));
        }

        connection.invoke("SubscribeToDevice", deviceId)
            .then(() => {
                currentDeviceId = deviceId;
                console.log(`Subscribed to: ${deviceId}`);
            })
            .catch(err => console.error("Subscribe error:", err));
    }

    connection.onclose(async () => {
        console.log("SignalR connection closed");
        updateConnectionStatus('disconnected');
        await startSignalRConnection();
    });

    // ========================================
    // DATA FETCHING
    // ========================================
    
    function fetchData() {
        const deviceId = document.getElementById('deviceId')?.value?.trim();
        const date = document.getElementById('dateInput')?.value;

        if (!deviceId) {
            showError('Vui lòng nhập Device ID');
            return;
        }

        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('deviceId', deviceId);
        window.history.pushState({}, '', url);

        // Update title
        document.title = `Solar Monitor - ${deviceId}`;

        // Subscribe to real-time
        subscribeToDevice(deviceId);

        showLoading(true);
        hideError();

        fetch(`/device/${deviceId}?date=${date}`)
            .then(response => {
                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Data received:", data);
                processData(data);
                showCompactSearchBar(deviceId, date);
            })
            .catch(error => {
                console.error("Fetch error:", error);
                showError('Lỗi tải dữ liệu: ' + error.message);
            })
            .finally(() => {
                showLoading(false);
            });
    }

    function showCompactSearchBar(deviceId, date) {
        const compactBar = document.getElementById('compactSearchBar');
        const compactDeviceId = document.getElementById('compactDeviceId');
        const compactDate = document.getElementById('compactDate');

        if (compactBar) {
            compactBar.classList.remove('hidden');
        }
        if (compactDeviceId) {
            compactDeviceId.textContent = deviceId;
        }
        if (compactDate) {
            const dateObj = new Date(date);
            compactDate.textContent = dateObj.toLocaleDateString('vi-VN');
        }
    }

    // ========================================
    // DATA PROCESSING
    // ========================================
    
    function processData(data) {
        // Show sections
        showElement('deviceInfo');
        showElement('summaryStats');
        showElement('chart-section');
        showElement('realTimeFlow');
        showElement('batteryCellSection');
        showElement('socChartSection');

        // Update device info
        updateDeviceInfo(data.deviceInfo);

        // Update summary stats (convert from 0.1kWh to kWh)
        updateValue('pv-total', (data.pv.tableValue / 10).toFixed(1) + ' kWh');
        updateValue('bat-charge', (data.bat.bats[0].tableValue / 10).toFixed(1) + ' kWh');
        updateValue('bat-discharge', (data.bat.bats[1].tableValue / 10).toFixed(1) + ' kWh');
        updateValue('load-total', (data.load.tableValue / 10).toFixed(1) + ' kWh');
        updateValue('grid-total', (data.grid.tableValue / 10).toFixed(1) + ' kWh');
        updateValue('essential-total', (data.essentialLoad.tableValue / 10).toFixed(1) + ' kWh');

        // Update charts
        updateCharts(data);

        // Initialize battery cell display with default values
        initializeBatteryCells();
    }

    function updateDeviceInfo(deviceInfo) {
        let deviceText = deviceInfo.deviceId;
        if (deviceInfo.remarkName && deviceInfo.remarkName.length > 0) {
            deviceText += " - " + deviceInfo.remarkName;
        }

        updateValue('device-id', deviceText.substring(0, 40));
        updateValue('device-type', deviceInfo.deviceType);
        updateValue('inverter-type', deviceInfo.deviceType);
        updateValue('device-status', deviceInfo.onlineStatus === 1 ? 'Online' : 'Offline');

        // Update status color
        const statusEl = document.getElementById('device-status');
        if (statusEl) {
            if (deviceInfo.onlineStatus === 1) {
                statusEl.className = 'text-green-600 dark:text-green-400 font-semibold';
            } else {
                statusEl.className = 'text-red-600 dark:text-red-400 font-semibold';
            }
        }
    }

    // ========================================
    // REAL-TIME DISPLAY UPDATE
    // ========================================
    
    function updateRealTimeDisplay(data) {
        // PV
        updateValue('pv-power', `${data.pvTotalPower}W`);
        if (data.pv2Power) {
            const pvDesc = document.getElementById('pv-desc');
            if (pvDesc) {
                pvDesc.innerHTML = `<span class="text-amber-500">${data.pv1Power}W</span> <span class="text-xs text-gray-500">${data.pv1Voltage}V</span> | <span class="text-amber-600">${data.pv2Power}W</span> <span class="text-xs text-gray-500">${data.pv2Voltage}V</span>`;
            }
        } else {
            updateValue('pv-desc', `${data.pv1Voltage}V`);
        }

        // Grid
        updateValue('grid-power', `${data.gridValue}W`);
        updateValue('grid-voltage', `${data.gridVoltageValue}V`);

        // Battery
        const batteryPercent = data.batteryPercent || 0;
        
        // Update battery percent display in icon
        const batteryPercentIcon = document.getElementById('battery-percent-icon');
        if (batteryPercentIcon) {
            batteryPercentIcon.textContent = `${batteryPercent}%`;
        }
        
        // Update battery fill level
        const batteryFill = document.getElementById('battery-fill');
        if (batteryFill) {
            batteryFill.style.height = `${batteryPercent}%`;
            // Change color based on level
            if (batteryPercent < 20) {
                batteryFill.className = 'battery-fill absolute bottom-0 left-0 right-0 bg-red-400/60';
            } else if (batteryPercent < 50) {
                batteryFill.className = 'battery-fill absolute bottom-0 left-0 right-0 bg-amber-400/60';
            } else {
                batteryFill.className = 'battery-fill absolute bottom-0 left-0 right-0 bg-emerald-400/60';
            }
        }
        
        // Update battery status text
        const batteryStatusText = document.getElementById('battery-status-text');
        if (batteryStatusText) {
            if (data.batteryStatus === "Discharging") {
                batteryStatusText.innerHTML = `<span class="text-red-500">Đang xả</span>`;
            } else if (data.batteryStatus === "Charging") {
                batteryStatusText.innerHTML = `<span class="text-green-500">Đang sạc</span>`;
            } else {
                batteryStatusText.innerHTML = `<span class="text-slate-500">Chờ</span>`;
            }
        }
        
        const batteryPower = document.getElementById('battery-power');
        if (batteryPower) {
            if (data.batteryStatus === "Discharging") {
                batteryPower.innerHTML = `<span class="text-red-600 dark:text-red-400">-${Math.abs(data.batteryValue)}W</span>`;
            } else {
                batteryPower.innerHTML = `<span class="text-green-600 dark:text-green-400">+${Math.abs(data.batteryValue)}W</span>`;
            }
        }

        // Other values
        updateValue('device-temp', `${data.deviceTempValue}°C`);
        updateValue('essential-power', `${data.essentialValue}W`);
        updateValue('load-power', `${data.loadValue}W`);

        // Update AC Out power (from inverterAcOutPower)
        if (data.inverterAcOutPower !== undefined) {
            updateValue('acout-power', `${data.inverterAcOutPower}W`);
        }

        // Update flow statuses
        updateFlowStatus('pv-flow', data.pvTotalPower > 0);
        updateFlowStatus('grid-flow', data.gridValue > 0);
        updateFlowStatus('battery-flow', data.batteryValue !== 0);
        updateFlowStatus('essential-flow', data.essentialValue > 0);
        updateFlowStatus('load-flow', data.loadValue > 0);
    }

    // ========================================
    // BATTERY CELL DISPLAY
    // ========================================
    
    function initializeBatteryCells() {
        // Initialize with placeholder values
        updateValue('cellAvg', '--');
        updateValue('cellMax', '--');
        updateValue('cellMin', '--');
        updateValue('cellDiffValue', '--');
        
        // Show placeholder in cell grid
        const cellGrid = document.getElementById('cellGrid');
        if (cellGrid) {
            cellGrid.innerHTML = `
                <div class="cell-placeholder bg-slate-100 dark:bg-slate-800 rounded-lg h-16 flex items-center justify-center">
                    <span class="text-slate-400 text-xs">Đang chờ dữ liệu cell...</span>
                </div>
            `;
        }
    }

    function updateBatteryCellDisplay(data) {
        if (!data || !data.cells) return;

        const cells = data.cells;
        const validCells = cells.filter(v => v > 0);

        if (validCells.length === 0) return;

        // Calculate statistics
        const avg = validCells.reduce((a, b) => a + b, 0) / validCells.length;
        const max = Math.max(...validCells);
        const min = Math.min(...validCells);
        const diff = max - min;
        
        // Update cell count badge
        const cellCountBadge = document.getElementById('cellCountBadge');
        if (cellCountBadge) {
            cellCountBadge.textContent = `${validCells.length} cell`;
        }

        // Update summary
        updateValue('cellAvg', avg.toFixed(3) + 'V');
        updateValue('cellMax', max.toFixed(3) + 'V');
        updateValue('cellMin', min.toFixed(3) + 'V');
        updateValue('cellDiffValue', (diff * 1000).toFixed(0) + 'mV');
        
        // Update diff color
        const diffEl = document.getElementById('cellDiffValue');
        if (diffEl) {
            diffEl.className = 'text-lg sm:text-2xl font-black';
            if (diff > 0.05) {
                diffEl.classList.add('text-red-600', 'dark:text-red-400');
            } else if (diff > 0.02) {
                diffEl.classList.add('text-amber-600', 'dark:text-amber-400');
            } else {
                diffEl.classList.add('text-green-600', 'dark:text-green-400');
            }
        }

        // Generate cell grid dynamically
        const cellGrid = document.getElementById('cellGrid');
        if (cellGrid) {
            let gridHtml = '<div class="grid">';
            
            cells.forEach((voltage, index) => {
                if (voltage > 0) {
                    const deviation = Math.abs(voltage - avg);
                    let colorClass = 'cell-default';
                    
                    if (deviation < 0.02) {
                        colorClass = 'cell-good';
                    } else if (deviation < 0.05) {
                        colorClass = 'cell-ok';
                    } else {
                        colorClass = 'cell-warning';
                    }
                    
                    gridHtml += `
                        <div class="cell-item ${colorClass}">
                            <span class="cell-label">C${index + 1}</span>
                            <span class="cell-voltage">${voltage.toFixed(3)}V</span>
                        </div>
                    `;
                }
            });
            
            gridHtml += '</div>';
            cellGrid.innerHTML = gridHtml;
        }
    }

    // ========================================
    // SOC CHART
    // ========================================
    
    function updateSOCChart(data) {
        if (!data || !data.history) return;

        const ctx = document.getElementById('socChart');
        if (!ctx) return;

        const labels = data.history.map(item => item.time);
        const values = data.history.map(item => item.soc);

        if (socChart) {
            socChart.destroy();
        }

        socChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'SOC (%)',
                    data: values,
                    borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        min: 0,
                        max: 100,
                        ticks: {
                            callback: value => value + '%'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            autoSkipPadding: 20
                        }
                    }
                }
            }
        });
    }

    // ========================================
    // CHARTS
    // ========================================
    
    function updateCharts(data) {
        const timeLabels = generateTimeLabels();

        const processedData = {
            pv: processChartData(data.pv.tableValueInfo),
            batCharge: processBatteryChargingData(data.bat.tableValueInfo),
            batDischarge: processBatteryDischargingData(data.bat.tableValueInfo),
            load: processChartData(data.load.tableValueInfo),
            grid: processChartData(data.grid.tableValueInfo),
            essentialLoad: processChartData(data.essentialLoad.tableValueInfo)
        };

        const commonOptions = getCommonChartOptions();

        // PV Chart
        pvChart = createChart(pvChart, 'pvChart', 'Sản Lượng PV (W)', timeLabels, processedData.pv,
            'rgb(234, 179, 8)', 'rgba(234, 179, 8, 0.15)', commonOptions);

        // Battery Chart
        updateBatChart(timeLabels, processedData.batCharge, processedData.batDischarge, commonOptions);

        // Load Chart
        loadChart = createChart(loadChart, 'loadChart', 'Tải Tiêu Thụ (W)', timeLabels, processedData.load,
            'rgb(37, 99, 235)', 'rgba(37, 99, 235, 0.15)', commonOptions);

        // Grid Chart
        gridChart = createChart(gridChart, 'gridChart', 'Điện Lưới (W)', timeLabels, processedData.grid,
            'rgb(139, 92, 246)', 'rgba(139, 92, 246, 0.15)', commonOptions);

        // Essential Load Chart
        essentialChart = createChart(essentialChart, 'essentialChart', 'Tải Thiết Yếu (W)', timeLabels, processedData.essentialLoad,
            'rgb(75, 85, 99)', 'rgba(75, 85, 99, 0.15)', commonOptions);
    }

    function createChart(chartObj, canvasId, label, labels, data, borderColor, backgroundColor, options) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (chartObj) chartObj.destroy();

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: label,
                    data: data,
                    borderColor: borderColor,
                    backgroundColor: backgroundColor,
                    fill: true
                }]
            },
            options: options
        });
    }

    function updateBatChart(labels, chargeData, dischargeData, options) {
        const ctx = document.getElementById('batChart');
        if (!ctx) return;

        if (batChart) batChart.destroy();

        batChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sạc Pin (W)',
                        data: chargeData,
                        borderColor: 'rgb(22, 163, 74)',
                        backgroundColor: 'rgba(22, 163, 74, 0.15)',
                        fill: true
                    },
                    {
                        label: 'Xả Pin (W)',
                        data: dischargeData,
                        borderColor: 'rgb(220, 38, 38)',
                        backgroundColor: 'rgba(220, 38, 38, 0.15)',
                        fill: true
                    }
                ]
            },
            options: options
        });
    }

    function getCommonChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            elements: {
                point: { radius: 0, hoverRadius: 4 },
                line: { borderWidth: 2, tension: 0.2 }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(50, 50, 50, 0.9)'
                },
                legend: {
                    position: 'top',
                    labels: { boxWidth: 12, padding: 10, font: { size: 11 } }
                }
            },
            scales: {
                x: {
                    ticks: { font: { size: 10 }, maxRotation: 0, autoSkip: true, autoSkipPadding: 30 },
                    grid: { display: true, color: 'rgba(200, 200, 200, 0.1)' }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: { size: 10 },
                        callback: function (value) {
                            if (value >= 1000) return (value / 1000).toFixed(1) + 'k';
                            return value;
                        }
                    },
                    grid: { display: true, color: 'rgba(200, 200, 200, 0.1)' },
                    title: { display: true, text: 'Watt', font: { size: 11 } }
                }
            }
        };
    }

    // ========================================
    // DATA PROCESSING HELPERS
    // ========================================
    
    function generateTimeLabels() {
        const labels = [];
        for (let hour = 0; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 5) {
                labels.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
            }
        }
        return labels;
    }

    function processChartData(data) {
        return data ? [...data] : [];
    }

    function processBatteryChargingData(data) {
        if (!data) return [];
        return data.map(value => value < 0 ? Math.abs(value) : 0);
    }

    function processBatteryDischargingData(data) {
        if (!data) return [];
        return data.map(value => value > 0 ? value * -1 : 0);
    }

    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function changeDate(offset) {
        const dateInput = document.getElementById('dateInput');
        if (!dateInput) return;

        let currentDate = new Date(dateInput.value);
        currentDate.setDate(currentDate.getDate() + offset);
        dateInput.value = formatDate(currentDate);
        fetchData();
    }

    function scrollToElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    }

    function updateValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
            element.classList.add('value-updated');
            setTimeout(() => element.classList.remove('value-updated'), 300);
        }
    }

    function updateFlowStatus(flowId, isActive) {
        const flow = document.getElementById(flowId);
        if (flow) {
            if (isActive) {
                flow.classList.remove('inactive');
                flow.classList.add('active');
            } else {
                flow.classList.add('inactive');
                flow.classList.remove('active');
            }
        }
    }

    function showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    function showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        const errorText = document.getElementById('errorText');
        if (errorDiv && errorText) {
            errorText.textContent = message;
            errorDiv.classList.remove('hidden');
        }
    }

    function hideError() {
        const errorDiv = document.getElementById('errorMessage');
        if (errorDiv) {
            errorDiv.classList.add('hidden');
        }
    }

    // ========================================
    // AUTO REFRESH
    // ========================================
    
    setInterval(() => {
        const deviceId = document.getElementById('deviceId')?.value?.trim();
        if (deviceId) {
            console.log("Auto-refreshing data");
            fetchData();
        }
    }, 5 * 60 * 1000); // 5 minutes

    // Listen for theme changes
    const observer = new MutationObserver(() => {
        configureChartDefaults();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
});
