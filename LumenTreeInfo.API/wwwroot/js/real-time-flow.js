/**
 * Real-Time Energy Flow Module
 * Handles dynamic updates for the energy flow cards
 */

const RealTimeFlow = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        updateInterval: 1000, // 1 second
        animationDuration: 300
    };

    // DOM Elements
    const elements = {
        // Solar
        solarCard: null,
        solarValue: null,
        solarVoltage: null,
        solarCurrent: null,
        solarFrequency: null,

        // Device
        deviceCard: null,
        deviceName: null,
        deviceTemp: null,

        // Grid
        gridCard: null,
        gridValue: null,
        gridVoltageDetail: null,

        // Battery
        batteryCard: null,
        batteryValue: null,
        batteryDetails: null,
        batteryPercentageSvg: null,
        batteryLevelSvg: null,
        chargeArrow: null,
        dischargeArrow: null,

        // Essential
        essentialCard: null,
        essentialValue: null,

        // Load
        loadCard: null,
        loadValue: null
    };

    /**
     * Initialize the module
     */
    function init() {
        cacheElements();
        console.log('RealTimeFlow module initialized');
    }

    /**
     * Cache DOM elements
     */
    function cacheElements() {
        // Solar
        elements.solarCard = document.getElementById('solar-card');
        elements.solarValue = document.getElementById('solar-value');
        elements.solarVoltage = document.getElementById('solar-voltage');
        elements.solarCurrent = document.getElementById('solar-current');
        elements.solarFrequency = document.getElementById('solar-frequency');

        // Device
        elements.deviceCard = document.getElementById('device-card');
        elements.deviceName = document.getElementById('device-name');
        elements.deviceTemp = document.getElementById('device-temp');

        // Grid
        elements.gridCard = document.getElementById('grid-card');
        elements.gridValue = document.getElementById('grid-value');
        elements.gridVoltageDetail = document.getElementById('grid-voltage-detail');

        // Battery
        elements.batteryCard = document.getElementById('battery-card');
        elements.batteryValue = document.getElementById('battery-value');
        elements.batteryDetails = document.getElementById('battery-details');
        elements.batteryPercentageSvg = document.getElementById('battery-percentage-svg');
        elements.batteryLevelSvg = document.getElementById('battery-level-svg');
        elements.chargeArrow = document.querySelector('.charge-arrow');
        elements.dischargeArrow = document.querySelector('.discharge-arrow');

        // Essential
        elements.essentialCard = document.getElementById('essential-card');
        elements.essentialValue = document.getElementById('essential-value');

        // Load
        elements.loadCard = document.getElementById('load-card');
        elements.loadValue = document.getElementById('load-value');
    }

    /**
     * Update solar data
     */
    function updateSolar(data) {
        if (!elements.solarValue) return;

        const power = data.pvPower || 0;
        const voltage = data.pvVoltage || 0;
        const current = data.pvCurrent || 0;
        const frequency = data.acFrequency || 50;

        elements.solarValue.textContent = formatPower(power);
        if (elements.solarVoltage) elements.solarVoltage.textContent = `${voltage.toFixed(0)}V`;
        if (elements.solarCurrent) elements.solarCurrent.textContent = `${current.toFixed(1)}A`;
        if (elements.solarFrequency) elements.solarFrequency.textContent = `${frequency.toFixed(1)}Hz`;

        // Set active/inactive state
        if (power > 0) {
            elements.solarCard?.classList.remove('inactive-card');
        } else {
            elements.solarCard?.classList.add('inactive-card');
        }
    }

    /**
     * Update device/inverter data
     */
    function updateDevice(data) {
        if (!elements.deviceName) return;

        const deviceId = data.deviceId || 'SUNT-8.0KW-P';
        const temp = data.temperature || 0;

        elements.deviceName.textContent = deviceId;
        if (elements.deviceTemp) {
            elements.deviceTemp.textContent = `${temp.toFixed(0)}°C`;
        }
    }

    /**
     * Update grid data
     */
    function updateGrid(data) {
        if (!elements.gridValue) return;

        const power = data.gridPower || 0;
        const voltage = data.gridVoltage || 0;

        elements.gridValue.textContent = formatPower(Math.abs(power));
        if (elements.gridVoltageDetail) {
            elements.gridVoltageDetail.textContent = `${voltage.toFixed(0)}V`;
        }

        // Set active/inactive state
        if (Math.abs(power) > 1) {
            elements.gridCard?.classList.remove('inactive-card');
        } else {
            elements.gridCard?.classList.add('inactive-card');
        }
    }

    /**
     * Update battery data with charge/discharge indication
     */
    function updateBattery(data) {
        if (!elements.batteryValue) return;

        const power = data.batteryPower || 0;
        const percentage = data.batteryPercentage || 0;
        const isCharging = power > 0;
        const isDischarging = power < 0;

        // Update power value
        const powerText = isCharging ? `+${formatPower(power)}` : formatPower(Math.abs(power));
        elements.batteryValue.textContent = powerText;

        // Update percentage
        if (elements.batteryPercentageSvg) {
            elements.batteryPercentageSvg.textContent = `${percentage.toFixed(0)}%`;
        }

        // Update battery level visualization
        if (elements.batteryLevelSvg) {
            const levelWidth = Math.max(5, (percentage / 100) * 44);
            elements.batteryLevelSvg.setAttribute('width', levelWidth);
            
            // Change color based on percentage
            let color = '#10B981'; // Green
            if (percentage < 20) {
                color = '#EF4444'; // Red
            } else if (percentage < 50) {
                color = '#F59E0B'; // Orange
            }
            elements.batteryLevelSvg.setAttribute('fill', color);
            if (elements.batteryPercentageSvg) {
                elements.batteryPercentageSvg.setAttribute('fill', color);
            }
        }

        // Update charge/discharge state
        if (elements.batteryCard) {
            if (isCharging) {
                elements.batteryCard.setAttribute('data-state', 'charging');
                elements.batteryValue.classList.remove('discharge-text');
                elements.batteryValue.classList.add('charge-text');
                elements.chargeArrow?.classList.remove('hidden');
                elements.dischargeArrow?.classList.add('hidden');
                if (elements.batteryDetails) {
                    elements.batteryDetails.textContent = 'Charging';
                    elements.batteryDetails.style.color = '#10B981';
                }
            } else if (isDischarging) {
                elements.batteryCard.setAttribute('data-state', 'discharging');
                elements.batteryValue.classList.remove('charge-text');
                elements.batteryValue.classList.add('discharge-text');
                elements.chargeArrow?.classList.add('hidden');
                elements.dischargeArrow?.classList.remove('hidden');
                if (elements.batteryDetails) {
                    elements.batteryDetails.textContent = 'Discharging';
                    elements.batteryDetails.style.color = '#EF4444';
                }
            } else {
                elements.batteryCard.setAttribute('data-state', 'idle');
                elements.batteryValue.classList.remove('charge-text', 'discharge-text');
                elements.chargeArrow?.classList.add('hidden');
                elements.dischargeArrow?.classList.add('hidden');
                if (elements.batteryDetails) {
                    elements.batteryDetails.textContent = 'Idle';
                    elements.batteryDetails.style.color = 'rgba(255, 255, 255, 0.5)';
                }
            }
        }

        // Set active/inactive state
        if (Math.abs(power) > 1) {
            elements.batteryCard?.classList.remove('inactive-card');
        } else if (percentage > 0) {
            elements.batteryCard?.classList.remove('inactive-card');
        } else {
            elements.batteryCard?.classList.add('inactive-card');
        }
    }

    /**
     * Update essential load data
     */
    function updateEssential(data) {
        if (!elements.essentialValue) return;

        const power = data.essentialPower || 0;

        elements.essentialValue.textContent = formatPower(power);

        // Set active/inactive state
        if (power > 0) {
            elements.essentialCard?.classList.remove('inactive-card');
        } else {
            elements.essentialCard?.classList.add('inactive-card');
        }
    }

    /**
     * Update home load data
     */
    function updateLoad(data) {
        if (!elements.loadValue) return;

        const power = data.loadPower || 0;

        elements.loadValue.textContent = formatPower(power);

        // Set active/inactive state
        if (power > 0) {
            elements.loadCard?.classList.remove('inactive-card');
        } else {
            elements.loadCard?.classList.add('inactive-card');
        }
    }

    /**
     * Update all cards with device data
     */
    function updateAll(data) {
        if (!data) return;

        updateSolar(data);
        updateDevice(data);
        updateGrid(data);
        updateBattery(data);
        updateEssential(data);
        updateLoad(data);
    }

    /**
     * Format power value with appropriate unit
     */
    function formatPower(watts) {
        if (watts === 0) return '0W';
        
        if (watts >= 1000) {
            return (watts / 1000).toFixed(1) + 'kW';
        } else {
            return Math.round(watts) + 'W';
        }
    }

    /**
     * Animate card on update
     */
    function animateCard(card) {
        if (!card) return;
        
        card.style.transform = 'scale(1.02)';
        setTimeout(() => {
            card.style.transform = '';
        }, CONFIG.animationDuration);
    }

    /**
     * Public API
     */
    return {
        init: init,
        updateSolar: updateSolar,
        updateDevice: updateDevice,
        updateGrid: updateGrid,
        updateBattery: updateBattery,
        updateEssential: updateEssential,
        updateLoad: updateLoad,
        updateAll: updateAll,
        formatPower: formatPower
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => RealTimeFlow.init(), 500);
    });
} else {
    setTimeout(() => RealTimeFlow.init(), 500);
}

// Export for use in other modules
window.RealTimeFlow = RealTimeFlow;
