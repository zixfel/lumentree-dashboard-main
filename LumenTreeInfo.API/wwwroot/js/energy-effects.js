/**
 * Energy Effects Module
 * Handles particle systems, glowing rings, and energy flow animations
 */

const EnergyEffects = (function() {
    'use strict';

    // Configuration
    const CONFIG = {
        particles: {
            count: 15,
            minSize: 3,
            maxSize: 6,
            orbitParticles: 4
        },
        colors: {
            solar: 'rgba(251, 191, 36, 0.8)',    // Yellow
            battery: 'rgba(34, 197, 94, 0.8)',   // Green
            grid: 'rgba(168, 85, 247, 0.8)',     // Purple
            load: 'rgba(239, 68, 68, 0.8)',      // Red
            essential: 'rgba(249, 115, 22, 0.8)' // Orange
        }
    };

    /**
     * Initialize all energy effects for a specific component
     * @param {string} containerId - ID of the container element
     * @param {string} colorType - Type of color (solar, battery, grid, load, essential)
     */
    function initializeEffects(containerId, colorType) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        // Clear existing effects
        clearEffects(container);

        // Add glow container if not exists
        const glowContainer = ensureGlowContainer(container, colorType);

        // Create particle systems
        createFloatingParticles(glowContainer, colorType);
        createOrbitParticles(glowContainer, colorType);

        // Add additional glow rings
        addMultiLayerGlowRings(glowContainer);
    }

    /**
     * Clear all existing effects from container
     */
    function clearEffects(container) {
        const particles = container.querySelectorAll('.energy-particles');
        const rings = container.querySelectorAll('.spinning-ring-2, .orbit-ring');
        
        particles.forEach(p => p.remove());
        rings.forEach(r => r.remove());
    }

    /**
     * Ensure glow container exists
     */
    function ensureGlowContainer(container, colorType) {
        let glowContainer = container.querySelector('.glow-container');
        
        if (!glowContainer) {
            // Find icon or create wrapper
            const icon = container.querySelector('.energy-icon, img[class*="icon"]');
            if (icon) {
                const wrapper = document.createElement('div');
                wrapper.className = `glow-container glow-${colorType}`;
                icon.parentNode.insertBefore(wrapper, icon);
                wrapper.appendChild(icon);
                glowContainer = wrapper;
            }
        } else {
            // Ensure proper class
            if (!glowContainer.classList.contains(`glow-${colorType}`)) {
                glowContainer.className = `glow-container glow-${colorType}`;
            }
        }

        return glowContainer;
    }

    /**
     * Create floating particles
     */
    function createFloatingParticles(container, colorType) {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'energy-particles';
        particleContainer.style.setProperty('--particle-color', CONFIG.colors[colorType] || CONFIG.colors.solar);

        for (let i = 0; i < CONFIG.particles.count; i++) {
            const particle = document.createElement('div');
            particle.className = i % 3 === 0 ? 'particle particle-small' : 'particle';
            
            // Randomize position and delay
            particle.style.left = `${10 + Math.random() * 80}%`;
            particle.style.animationDelay = `${Math.random() * 4}s`;
            particle.style.animationDuration = `${3 + Math.random() * 3}s`;
            
            particleContainer.appendChild(particle);
        }

        container.appendChild(particleContainer);
    }

    /**
     * Create orbiting particles around the icon
     */
    function createOrbitParticles(container, colorType) {
        const orbitContainer = document.createElement('div');
        orbitContainer.className = 'energy-particles';
        orbitContainer.style.setProperty('--particle-color', CONFIG.colors[colorType] || CONFIG.colors.solar);

        for (let i = 0; i < CONFIG.particles.orbitParticles; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle-orbit';
            particle.style.animationDelay = `${i * (3 / CONFIG.particles.orbitParticles)}s`;
            
            orbitContainer.appendChild(particle);
        }

        container.appendChild(orbitContainer);
    }

    /**
     * Add multi-layer spinning rings
     */
    function addMultiLayerGlowRings(container) {
        // Remove existing extra rings
        const existingRings = container.querySelectorAll('.spinning-ring-2, .orbit-ring');
        existingRings.forEach(ring => ring.remove());

        // Add spinning ring 2
        const spinningRing2 = document.createElement('div');
        spinningRing2.className = 'spinning-ring-2';
        container.appendChild(spinningRing2);

        // Add orbit ring
        const orbitRing = document.createElement('div');
        orbitRing.className = 'orbit-ring';
        container.appendChild(orbitRing);
    }

    /**
     * Update effects state (active/inactive)
     */
    function updateEffectState(containerId, isActive) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const card = container.closest('.energy-card');
        if (!card) return;

        if (isActive) {
            card.classList.remove('inactive');
            card.classList.add('active');
        } else {
            card.classList.remove('active');
            card.classList.add('inactive');
        }
    }

    /**
     * Create energy flow lines between two elements
     */
    function createFlowLine(fromId, toId, colorType, direction = 'horizontal') {
        const fromElement = document.getElementById(fromId);
        const toElement = document.getElementById(toId);
        
        if (!fromElement || !toElement) {
            console.warn(`Flow line elements not found: ${fromId} -> ${toId}`);
            return;
        }

        // Get positions
        const fromRect = fromElement.getBoundingClientRect();
        const toRect = toElement.getBoundingClientRect();

        // Create flow line container
        const flowLineContainer = document.createElement('div');
        flowLineContainer.className = 'flow-line-container';
        flowLineContainer.style.position = 'absolute';
        flowLineContainer.style.pointerEvents = 'none';
        flowLineContainer.style.zIndex = '5';

        // Calculate position and size
        if (direction === 'horizontal') {
            const left = Math.min(fromRect.right, toRect.left);
            const width = Math.abs(fromRect.right - toRect.left);
            const top = (fromRect.top + fromRect.bottom) / 2;

            flowLineContainer.style.left = `${left}px`;
            flowLineContainer.style.top = `${top}px`;
            flowLineContainer.style.width = `${width}px`;
            flowLineContainer.style.height = '20px';

            // Add flow lines
            for (let i = 0; i < 3; i++) {
                const flowLine = document.createElement('div');
                flowLine.className = 'flow-line flow-line-horizontal-multi';
                flowLine.style.setProperty('--flow-color', CONFIG.colors[colorType] || CONFIG.colors.solar);
                flowLineContainer.appendChild(flowLine);
            }
        } else {
            const top = Math.min(fromRect.bottom, toRect.top);
            const height = Math.abs(fromRect.bottom - toRect.top);
            const left = (fromRect.left + fromRect.right) / 2;

            flowLineContainer.style.left = `${left}px`;
            flowLineContainer.style.top = `${top}px`;
            flowLineContainer.style.width = '20px';
            flowLineContainer.style.height = `${height}px`;

            // Add vertical flow line
            const flowLine = document.createElement('div');
            flowLine.className = 'flow-line flow-line-vertical';
            flowLine.style.setProperty('--flow-color', CONFIG.colors[colorType] || CONFIG.colors.solar);
            flowLineContainer.appendChild(flowLine);
        }

        document.body.appendChild(flowLineContainer);

        // Store reference for cleanup
        if (!window.energyFlowLines) {
            window.energyFlowLines = [];
        }
        window.energyFlowLines.push(flowLineContainer);
    }

    /**
     * Clear all flow lines
     */
    function clearFlowLines() {
        if (window.energyFlowLines) {
            window.energyFlowLines.forEach(line => {
                if (line && line.parentNode) {
                    line.parentNode.removeChild(line);
                }
            });
            window.energyFlowLines = [];
        }
    }

    /**
     * Initialize all energy effects on page load
     */
    function initializeAll() {
        // Initialize effects for each energy component
        const components = [
            { id: 'pv-power', type: 'solar' },
            { id: 'battery-power', type: 'battery' },
            { id: 'grid-power', type: 'grid' },
            { id: 'home-load-power', type: 'load' },
            { id: 'essential-power', type: 'essential' }
        ];

        components.forEach(component => {
            // Find parent card
            const element = document.getElementById(component.id);
            if (element) {
                const card = element.closest('.energy-card');
                if (card && card.id) {
                    initializeEffects(card.id, component.type);
                }
            }
        });

        console.log('Energy effects initialized');
    }

    /**
     * Public API
     */
    return {
        init: initializeAll,
        initializeEffects: initializeEffects,
        updateState: updateEffectState,
        createFlowLine: createFlowLine,
        clearFlowLines: clearFlowLines,
        CONFIG: CONFIG
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        // Delay initialization to ensure all elements are loaded
        setTimeout(() => EnergyEffects.init(), 500);
    });
} else {
    // DOM is already ready
    setTimeout(() => EnergyEffects.init(), 500);
}
