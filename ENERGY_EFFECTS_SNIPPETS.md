# Energy Effects Code Snippets

Đây là các code snippets cho các hiệu ứng vầng sáng chuyển động và particle effects. Bạn có thể sử dụng chúng độc lập trong bất kỳ project nào.

## 📦 Table of Contents
1. [Multi-Layer Glowing Rings](#1-multi-layer-glowing-rings)
2. [Rotating Gradient Rings](#2-rotating-gradient-rings)
3. [Floating Particles](#3-floating-particles)
4. [Orbiting Particles](#4-orbiting-particles)
5. [Energy Flow Lines](#5-energy-flow-lines)
6. [Complete HTML Example](#6-complete-html-example)

---

## 1. Multi-Layer Glowing Rings

### CSS Code:
```css
/* Base Container */
.glow-container {
    position: relative;
    display: inline-block;
    z-index: 1;
}

/* Glow Ring Layer 1 */
.glow-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 140%;
    height: 140%;
    border-radius: 50%;
    pointer-events: none;
    z-index: 0;
}

/* Multiple Pulsing Layers */
.glow-ring::before,
.glow-ring::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    animation: pulse-glow 2.5s ease-in-out infinite;
}

.glow-ring::before {
    width: 100%;
    height: 100%;
    opacity: 0.7;
    animation-delay: 0s;
    box-shadow: 0 0 30px 10px rgba(251, 191, 36, 0.6),
                0 0 50px 20px rgba(251, 191, 36, 0.4),
                0 0 70px 30px rgba(251, 191, 36, 0.2);
}

.glow-ring::after {
    width: 130%;
    height: 130%;
    opacity: 0.4;
    animation-delay: 0.8s;
    box-shadow: 0 0 40px 15px rgba(251, 191, 36, 0.5),
                0 0 60px 25px rgba(251, 191, 36, 0.3);
}

/* Pulse Animation */
@keyframes pulse-glow {
    0%, 100% {
        transform: translate(-50%, -50%) scale(0.95);
        opacity: 0.8;
    }
    50% {
        transform: translate(-50%, -50%) scale(1.15);
        opacity: 0.2;
    }
}

/* Color Variations */
.glow-solar { --glow-color: rgba(251, 191, 36, 0.6); }
.glow-battery { --glow-color: rgba(34, 197, 94, 0.6); }
.glow-grid { --glow-color: rgba(168, 85, 247, 0.6); }
.glow-load { --glow-color: rgba(239, 68, 68, 0.6); }
```

### HTML Usage:
```html
<div class="glow-container glow-solar">
    <div class="glow-ring"></div>
    <img src="icon.png" alt="Icon" style="width: 80px; height: 80px;">
</div>
```

---

## 2. Rotating Gradient Rings

### CSS Code:
```css
/* Main Spinning Ring */
.spinning-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 160%;
    height: 160%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: conic-gradient(
        from 0deg,
        transparent 0deg,
        var(--glow-color) 70deg,
        transparent 120deg,
        var(--glow-color) 240deg,
        transparent 300deg
    );
    animation: rotate-glow 4s linear infinite;
    opacity: 0.6;
    filter: blur(15px);
    z-index: -1;
}

/* Counter-rotating Ring */
.spinning-ring-2 {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 180%;
    height: 180%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: conic-gradient(
        from 90deg,
        transparent 0deg,
        var(--glow-color) 60deg,
        transparent 150deg
    );
    animation: rotate-glow-reverse 6s linear infinite;
    opacity: 0.4;
    filter: blur(20px);
    z-index: -2;
}

/* Orbiting Pulse Ring */
.orbit-ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 200%;
    height: 200%;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    border: 2px solid var(--glow-color);
    opacity: 0;
    animation: orbit-pulse 3s ease-in-out infinite;
    z-index: -3;
}

/* Rotation Animations */
@keyframes rotate-glow {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
}

@keyframes rotate-glow-reverse {
    0% { transform: translate(-50%, -50%) rotate(360deg); }
    100% { transform: translate(-50%, -50%) rotate(0deg); }
}

@keyframes orbit-pulse {
    0% {
        transform: translate(-50%, -50%) scale(0.5);
        opacity: 0;
    }
    50% {
        opacity: 0.5;
    }
    100% {
        transform: translate(-50%, -50%) scale(1.2);
        opacity: 0;
    }
}
```

### HTML Usage:
```html
<div class="glow-container glow-battery">
    <div class="glow-ring"></div>
    <div class="spinning-ring"></div>
    <div class="spinning-ring-2"></div>
    <div class="orbit-ring"></div>
    <img src="battery-icon.png" alt="Battery">
</div>
```

---

## 3. Floating Particles

### CSS Code:
```css
.energy-particles {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    overflow: visible;
    z-index: 10;
}

.particle {
    position: absolute;
    width: 6px;
    height: 6px;
    background: var(--particle-color, #fbbf24);
    border-radius: 50%;
    animation: float-particle 4s ease-in-out infinite;
    opacity: 0;
    box-shadow: 0 0 15px 3px var(--particle-color, #fbbf24);
    filter: blur(1px);
}

.particle-small {
    width: 3px;
    height: 3px;
    box-shadow: 0 0 8px 2px var(--particle-color, #fbbf24);
}

@keyframes float-particle {
    0% {
        transform: translateY(120%) translateX(0) scale(0) rotate(0deg);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    50% {
        opacity: 0.8;
        transform: translateY(0%) translateX(10px) scale(1) rotate(180deg);
    }
    90% {
        opacity: 0.6;
    }
    100% {
        transform: translateY(-120%) translateX(-10px) scale(0.5) rotate(360deg);
        opacity: 0;
    }
}

/* Particle Positions */
.particle:nth-child(1) { left: 15%; animation-delay: 0s; }
.particle:nth-child(2) { left: 35%; animation-delay: 0.4s; }
.particle:nth-child(3) { left: 55%; animation-delay: 0.8s; }
.particle:nth-child(4) { left: 75%; animation-delay: 1.2s; }
.particle:nth-child(5) { left: 25%; animation-delay: 1.6s; }
.particle:nth-child(6) { left: 45%; animation-delay: 2s; }
.particle:nth-child(7) { left: 65%; animation-delay: 2.4s; }
.particle:nth-child(8) { left: 85%; animation-delay: 2.8s; }
```

### HTML Usage:
```html
<div class="glow-container" style="--particle-color: rgba(251, 191, 36, 0.8);">
    <div class="energy-particles">
        <div class="particle"></div>
        <div class="particle particle-small"></div>
        <div class="particle"></div>
        <div class="particle particle-small"></div>
        <div class="particle"></div>
        <div class="particle"></div>
        <div class="particle particle-small"></div>
        <div class="particle"></div>
    </div>
    <img src="icon.png" alt="Icon">
</div>
```

### JavaScript to Generate Particles:
```javascript
function createParticles(container, count, color) {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'energy-particles';
    particleContainer.style.setProperty('--particle-color', color);

    for (let i = 0; i < count; i++) {
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

// Usage:
const container = document.querySelector('.glow-container');
createParticles(container, 12, 'rgba(251, 191, 36, 0.8)');
```

---

## 4. Orbiting Particles

### CSS Code:
```css
.particle-orbit {
    position: absolute;
    width: 4px;
    height: 4px;
    background: var(--particle-color, #fbbf24);
    border-radius: 50%;
    box-shadow: 0 0 10px 2px var(--particle-color, #fbbf24);
    animation: orbit-particle 3s linear infinite;
}

@keyframes orbit-particle {
    0% {
        transform: rotate(0deg) translateX(60px) scale(1);
        opacity: 0;
    }
    10% {
        opacity: 1;
    }
    90% {
        opacity: 1;
    }
    100% {
        transform: rotate(360deg) translateX(60px) scale(1);
        opacity: 0;
    }
}

.particle-orbit:nth-child(odd) {
    animation-duration: 2.5s;
}

.particle-orbit:nth-child(even) {
    animation-duration: 3.5s;
    animation-direction: reverse;
}
```

### HTML Usage:
```html
<div class="glow-container" style="--particle-color: rgba(34, 197, 94, 0.8);">
    <div class="energy-particles">
        <div class="particle-orbit"></div>
        <div class="particle-orbit"></div>
        <div class="particle-orbit"></div>
        <div class="particle-orbit"></div>
    </div>
    <img src="icon.png" alt="Icon">
</div>
```

---

## 5. Energy Flow Lines

### CSS Code:
```css
.flow-line {
    position: absolute;
    height: 3px;
    background: linear-gradient(
        90deg,
        transparent 0%,
        var(--flow-color) 20%,
        var(--flow-color) 50%,
        var(--flow-color) 80%,
        transparent 100%
    );
    animation: flow-animation 2.5s ease-in-out infinite;
    opacity: 0.7;
    filter: blur(0.5px);
    box-shadow: 0 0 10px var(--flow-color);
}

@keyframes flow-animation {
    0% {
        transform: translateX(-150%);
        opacity: 0;
    }
    10% {
        opacity: 0.7;
    }
    90% {
        opacity: 0.7;
    }
    100% {
        transform: translateX(150%);
        opacity: 0;
    }
}

/* Horizontal Flow */
.flow-line-horizontal {
    top: 50%;
    width: 120%;
    transform: translateY(-50%);
}

/* Vertical Flow */
.flow-line-vertical {
    left: 50%;
    height: 120%;
    width: 3px;
    transform: translateX(-50%);
    animation: flow-animation-vertical 2.5s ease-in-out infinite;
    background: linear-gradient(
        180deg,
        transparent 0%,
        var(--flow-color) 20%,
        var(--flow-color) 50%,
        var(--flow-color) 80%,
        transparent 100%
    );
}

@keyframes flow-animation-vertical {
    0% {
        transform: translateX(-50%) translateY(-150%);
        opacity: 0;
    }
    10% {
        opacity: 0.7;
    }
    90% {
        opacity: 0.7;
    }
    100% {
        transform: translateX(-50%) translateY(150%);
        opacity: 0;
    }
}

/* Dotted Flow */
.flow-dots {
    position: absolute;
    display: flex;
    gap: 10px;
    animation: flow-animation 3s linear infinite;
}

.flow-dot {
    width: 6px;
    height: 6px;
    background: var(--flow-color);
    border-radius: 50%;
    box-shadow: 0 0 10px var(--flow-color);
    animation: pulse-dot 1s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% {
        transform: scale(1);
        opacity: 0.8;
    }
    50% {
        transform: scale(1.5);
        opacity: 1;
    }
}
```

### HTML Usage:
```html
<!-- Horizontal Flow -->
<div style="position: relative; width: 300px; height: 50px;">
    <div class="flow-line flow-line-horizontal" 
         style="--flow-color: rgba(251, 191, 36, 0.8);"></div>
</div>

<!-- Vertical Flow -->
<div style="position: relative; width: 50px; height: 300px;">
    <div class="flow-line flow-line-vertical" 
         style="--flow-color: rgba(34, 197, 94, 0.8);"></div>
</div>

<!-- Dotted Flow -->
<div style="position: relative; width: 300px; height: 50px;">
    <div class="flow-dots" style="--flow-color: rgba(168, 85, 247, 0.8);">
        <div class="flow-dot"></div>
        <div class="flow-dot" style="animation-delay: 0.2s;"></div>
        <div class="flow-dot" style="animation-delay: 0.4s;"></div>
        <div class="flow-dot" style="animation-delay: 0.6s;"></div>
    </div>
</div>
```

---

## 6. Complete HTML Example

Đây là một ví dụ hoàn chỉnh kết hợp tất cả các hiệu ứng:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Energy Effects Demo</title>
    <style>
        body {
            margin: 0;
            padding: 40px;
            background: #0f172a;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            font-family: system-ui, -apple-system, sans-serif;
        }

        .demo-container {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 60px;
            max-width: 1200px;
        }

        .energy-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
        }

        .energy-icon-wrapper {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            padding: 30px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .energy-icon {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            position: relative;
            z-index: 2;
        }

        .label {
            color: white;
            font-size: 16px;
            font-weight: 600;
            text-align: center;
        }

        /* Copy all CSS from sections 1-5 above here */
        
        /* ... (insert all CSS code from above) ... */

        /* Responsive */
        @media (max-width: 768px) {
            .demo-container {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="demo-container">
        <!-- Solar PV with all effects -->
        <div class="energy-item">
            <div class="energy-icon-wrapper">
                <div class="glow-container glow-solar">
                    <div class="glow-ring"></div>
                    <div class="spinning-ring"></div>
                    <div class="spinning-ring-2"></div>
                    <div class="orbit-ring"></div>
                    <div class="energy-particles" style="--particle-color: rgba(251, 191, 36, 0.8);">
                        <div class="particle"></div>
                        <div class="particle particle-small"></div>
                        <div class="particle"></div>
                        <div class="particle"></div>
                        <div class="particle-orbit"></div>
                        <div class="particle-orbit"></div>
                    </div>
                    <div class="energy-icon" style="background: linear-gradient(135deg, #fbbf24, #f59e0b);"></div>
                </div>
            </div>
            <div class="label">Solar PV</div>
        </div>

        <!-- Battery -->
        <div class="energy-item">
            <div class="energy-icon-wrapper">
                <div class="glow-container glow-battery">
                    <div class="glow-ring"></div>
                    <div class="spinning-ring"></div>
                    <div class="spinning-ring-2"></div>
                    <div class="orbit-ring"></div>
                    <div class="energy-particles" style="--particle-color: rgba(34, 197, 94, 0.8);">
                        <div class="particle"></div>
                        <div class="particle particle-small"></div>
                        <div class="particle"></div>
                        <div class="particle"></div>
                        <div class="particle-orbit"></div>
                        <div class="particle-orbit"></div>
                    </div>
                    <div class="energy-icon" style="background: linear-gradient(135deg, #22c55e, #16a34a);"></div>
                </div>
            </div>
            <div class="label">Battery</div>
        </div>

        <!-- Grid -->
        <div class="energy-item">
            <div class="energy-icon-wrapper">
                <div class="glow-container glow-grid">
                    <div class="glow-ring"></div>
                    <div class="spinning-ring"></div>
                    <div class="spinning-ring-2"></div>
                    <div class="orbit-ring"></div>
                    <div class="energy-particles" style="--particle-color: rgba(168, 85, 247, 0.8);">
                        <div class="particle"></div>
                        <div class="particle particle-small"></div>
                        <div class="particle"></div>
                        <div class="particle"></div>
                        <div class="particle-orbit"></div>
                        <div class="particle-orbit"></div>
                    </div>
                    <div class="energy-icon" style="background: linear-gradient(135deg, #a855f7, #9333ea);"></div>
                </div>
            </div>
            <div class="label">Power Grid</div>
        </div>

        <!-- Load -->
        <div class="energy-item">
            <div class="energy-icon-wrapper">
                <div class="glow-container glow-load">
                    <div class="glow-ring"></div>
                    <div class="spinning-ring"></div>
                    <div class="spinning-ring-2"></div>
                    <div class="orbit-ring"></div>
                    <div class="energy-particles" style="--particle-color: rgba(239, 68, 68, 0.8);">
                        <div class="particle"></div>
                        <div class="particle particle-small"></div>
                        <div class="particle"></div>
                        <div class="particle"></div>
                        <div class="particle-orbit"></div>
                        <div class="particle-orbit"></div>
                    </div>
                    <div class="energy-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);"></div>
                </div>
            </div>
            <div class="label">Home Load</div>
        </div>
    </div>

    <script>
        // Optional: Add more particles dynamically
        document.querySelectorAll('.energy-particles').forEach((container, index) => {
            // Add 6 more particles
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.className = i % 2 === 0 ? 'particle' : 'particle particle-small';
                particle.style.left = `${15 + Math.random() * 70}%`;
                particle.style.animationDelay = `${Math.random() * 4}s`;
                particle.style.animationDuration = `${3 + Math.random() * 2}s`;
                container.appendChild(particle);
            }
        });
    </script>
</body>
</html>
```

---

## 🎨 Color Palette

Các màu sắc được sử dụng trong effects:

```css
/* Solar/PV - Yellow/Amber */
--solar-primary: rgba(251, 191, 36, 0.8);
--solar-secondary: rgba(245, 158, 11, 0.6);

/* Battery - Green/Emerald */
--battery-primary: rgba(34, 197, 94, 0.8);
--battery-secondary: rgba(22, 163, 74, 0.6);

/* Grid - Purple/Violet */
--grid-primary: rgba(168, 85, 247, 0.8);
--grid-secondary: rgba(147, 51, 234, 0.6);

/* Load - Red/Rose */
--load-primary: rgba(239, 68, 68, 0.8);
--load-secondary: rgba(220, 38, 38, 0.6);

/* Essential - Orange */
--essential-primary: rgba(249, 115, 22, 0.8);
--essential-secondary: rgba(234, 88, 12, 0.6);
```

---

## 📱 Responsive & Accessibility

### Disable Animations for Reduced Motion:
```css
@media (prefers-reduced-motion: reduce) {
    .glow-ring::before,
    .glow-ring::after,
    .spinning-ring,
    .spinning-ring-2,
    .orbit-ring,
    .particle,
    .particle-orbit,
    .flow-line {
        animation: none !important;
    }
}
```

### Mobile Optimization:
```css
@media (max-width: 768px) {
    .energy-icon {
        width: 60px;
        height: 60px;
    }
    
    /* Reduce glow intensity on mobile */
    .glow-ring::before,
    .glow-ring::after {
        box-shadow: none !important;
    }
    
    /* Hide some effects to improve performance */
    .spinning-ring,
    .spinning-ring-2 {
        display: none;
    }
    
    /* Reduce particle count */
    .particle:nth-child(n+6) {
        display: none;
    }
}
```

---

## ⚡ Performance Tips

1. **Sử dụng `will-change`** cho các elements có animation:
```css
.glow-ring, .spinning-ring, .particle {
    will-change: transform, opacity;
}
```

2. **Giới hạn số lượng particles** trên mobile devices

3. **Sử dụng `transform` thay vì `top/left`** cho animation

4. **Tắt animations** khi element không visible:
```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
        } else {
            entry.target.style.animationPlayState = 'paused';
        }
    });
});

document.querySelectorAll('.glow-container').forEach(el => {
    observer.observe(el);
});
```

---

## 🚀 Browser Compatibility

- Chrome/Edge 90+: ✅ Full support
- Firefox 88+: ✅ Full support
- Safari 14+: ✅ Full support (may need vendor prefixes for older versions)
- Mobile browsers: ✅ Full support with performance optimizations

---

## 📝 License

These code snippets are free to use in any project (personal or commercial).

---

Created for LumenTree Energy Monitor Dashboard 🌳⚡
