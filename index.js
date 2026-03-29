const typeTarget = document.getElementById("heroTypewriter");

if (typeTarget) {
    const words = (typeTarget.dataset.words || "")
        .split(",")
        .map((word) => word.trim())
        .filter(Boolean);

    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const tick = () => {
        const currentWord = words[wordIndex] || "";

        if (!deleting) {
            charIndex += 1;
            typeTarget.textContent = currentWord.slice(0, charIndex);

            if (charIndex === currentWord.length) {
                deleting = true;
                setTimeout(tick, 1600);
                return;
            }
        } else {
            charIndex -= 1;
            typeTarget.textContent = currentWord.slice(0, charIndex);

            if (charIndex === 0) {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        const delay = deleting ? 42 : 86;
        setTimeout(tick, delay);
    };

    if (words.length > 0) {
        tick();
    }
}

const heroSection = document.querySelector(".hero-section");
const canvas = document.getElementById("heroParticles");

if (heroSection && canvas) {
    const context = canvas.getContext("2d");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pointer = { x: 0, y: 0, active: false };
    let stars = [];
    let dust = [];
    let triangles = [];
    let shootingStar = null;
    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let devicePixelRatioValue = Math.min(window.devicePixelRatio || 1, 2);

    const randomBetween = (min, max) => Math.random() * (max - min) + min;

    const resizeCanvas = () => {
        const rect = heroSection.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        devicePixelRatioValue = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = width * devicePixelRatioValue;
        canvas.height = height * devicePixelRatioValue;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        context.setTransform(devicePixelRatioValue, 0, 0, devicePixelRatioValue, 0, 0);

        const starCount = width < 768 ? 85 : 150;
        const dustCount = width < 768 ? 14 : 26;
        const triangleCount = width < 768 ? 10 : 18;

        stars = Array.from({ length: starCount }, () => ({
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            radius: randomBetween(0.4, 1.8),
            speed: randomBetween(0.03, 0.22),
            depth: randomBetween(0.25, 1),
            alpha: randomBetween(0.25, 0.95),
            twinkle: randomBetween(0.003, 0.018),
            hue: Math.random() > 0.82 ? 32 : Math.random() > 0.5 ? 205 : 0
        }));

        dust = Array.from({ length: dustCount }, () => ({
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            radius: randomBetween(90, 220),
            blur: randomBetween(0.12, 0.35),
            driftX: randomBetween(-0.08, 0.08),
            driftY: randomBetween(-0.05, 0.05),
            hue: [18, 205, 265][Math.floor(Math.random() * 3)],
            alpha: randomBetween(0.08, 0.18)
        }));

        triangles = Array.from({ length: triangleCount }, () => ({
            x: randomBetween(-60, width + 60),
            y: randomBetween(-60, height + 60),
            homeX: randomBetween(-60, width + 60),
            homeY: randomBetween(-60, height + 60),
            size: randomBetween(16, 88),
            rotation: randomBetween(0, Math.PI * 2),
            rotationSpeed: randomBetween(-0.0035, 0.0035),
            velocityX: randomBetween(-0.3, 0.3),
            velocityY: randomBetween(-0.25, 0.25),
            depth: randomBetween(0.2, 0.9),
            alpha: randomBetween(0.08, 0.22),
            strokeAlpha: randomBetween(0.16, 0.34),
            hue: [18, 205, 265, 0][Math.floor(Math.random() * 4)],
            filled: Math.random() > 0.62,
            noiseOffset: randomBetween(0, Math.PI * 2),
            wanderRadius: randomBetween(24, 110)
        }));

        shootingStar = null;
    };

    const drawBackgroundGlow = () => {
        const pointerX = pointer.active ? pointer.x : width * 0.72;
        const pointerY = pointer.active ? pointer.y : height * 0.28;

        const baseGlow = context.createRadialGradient(
            width * 0.78,
            height * 0.18,
            0,
            width * 0.78,
            height * 0.18,
            width * 0.55
        );
        baseGlow.addColorStop(0, "rgba(44, 110, 255, 0.16)");
        baseGlow.addColorStop(0.45, "rgba(107, 74, 255, 0.08)");
        baseGlow.addColorStop(1, "rgba(5, 10, 20, 0)");

        const accentGlow = context.createRadialGradient(
            pointerX,
            pointerY,
            0,
            pointerX,
            pointerY,
            width * 0.28
        );
        accentGlow.addColorStop(0, "rgba(255, 153, 77, 0.12)");
        accentGlow.addColorStop(0.45, "rgba(92, 196, 255, 0.08)");
        accentGlow.addColorStop(1, "rgba(0, 0, 0, 0)");

        context.fillStyle = baseGlow;
        context.fillRect(0, 0, width, height);
        context.fillStyle = accentGlow;
        context.fillRect(0, 0, width, height);
    };

    const drawDust = () => {
        dust.forEach((cloud, index) => {
            cloud.x += cloud.driftX;
            cloud.y += cloud.driftY;

            if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius;
            if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius;
            if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius;
            if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius;

            const driftOffsetX = pointer.active ? (pointer.x - width / 2) * 0.008 * (index % 2 === 0 ? 1 : -1) : 0;
            const driftOffsetY = pointer.active ? (pointer.y - height / 2) * 0.008 * (index % 2 === 0 ? -1 : 1) : 0;
            const gradient = context.createRadialGradient(
                cloud.x + driftOffsetX,
                cloud.y + driftOffsetY,
                0,
                cloud.x + driftOffsetX,
                cloud.y + driftOffsetY,
                cloud.radius
            );

            gradient.addColorStop(0, `hsla(${cloud.hue}, 100%, 70%, ${cloud.alpha})`);
            gradient.addColorStop(0.45, `hsla(${cloud.hue}, 100%, 60%, ${cloud.alpha * cloud.blur})`);
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

            context.fillStyle = gradient;
            context.fillRect(0, 0, width, height);
        });
    };

    const drawStars = (time) => {
        stars.forEach((star, index) => {
            star.y += star.speed * star.depth;

            if (star.y > height + 6) {
                star.y = -6;
                star.x = randomBetween(0, width);
            }

            const parallaxX = pointer.active ? (pointer.x - width / 2) * 0.015 * star.depth : 0;
            const parallaxY = pointer.active ? (pointer.y - height / 2) * 0.01 * star.depth : 0;
            const twinkle = 0.55 + Math.sin(time * star.twinkle + index) * 0.45;
            const x = star.x + parallaxX;
            const y = star.y + parallaxY;

            context.beginPath();
            context.fillStyle = star.hue === 0
                ? `rgba(255, 255, 255, ${star.alpha * twinkle})`
                : `hsla(${star.hue}, 100%, 80%, ${star.alpha * twinkle})`;
            context.arc(x, y, star.radius, 0, Math.PI * 2);
            context.fill();

            if (star.radius > 1.25) {
                context.strokeStyle = `rgba(255, 255, 255, ${0.18 * twinkle})`;
                context.lineWidth = 1;
                context.beginPath();
                context.moveTo(x - star.radius * 3, y);
                context.lineTo(x + star.radius * 3, y);
                context.moveTo(x, y - star.radius * 3);
                context.lineTo(x, y + star.radius * 3);
                context.stroke();
            }
        });
    };

    const drawTriangles = (time) => {
        triangles.forEach((triangle, index) => {
            const noiseX = Math.sin(time * 0.00055 + triangle.noiseOffset + index * 0.27);
            const noiseY = Math.cos(time * 0.0007 + triangle.noiseOffset * 1.4 + index * 0.19);
            const wanderTargetX = triangle.homeX + noiseX * triangle.wanderRadius;
            const wanderTargetY = triangle.homeY + noiseY * triangle.wanderRadius;

            triangle.velocityX += (wanderTargetX - triangle.x) * 0.0012;
            triangle.velocityY += (wanderTargetY - triangle.y) * 0.0012;
            triangle.velocityX *= 0.986;
            triangle.velocityY *= 0.986;
            triangle.rotation += triangle.rotationSpeed;

            if (pointer.active) {
                const dx = triangle.x - pointer.x;
                const dy = triangle.y - pointer.y;
                const distance = Math.hypot(dx, dy) || 1;
                const hoverRadius = Math.max(110, triangle.size * 2.1);

                if (distance < hoverRadius) {
                    const force = (hoverRadius - distance) / hoverRadius;
                    triangle.velocityX += (dx / distance) * force * 1.45 * triangle.depth;
                    triangle.velocityY += (dy / distance) * force * 1.25 * triangle.depth;
                    triangle.rotation += force * 0.09;
                }
            }

            triangle.x += triangle.velocityX;
            triangle.y += triangle.velocityY;

            if (triangle.x < -triangle.size * 2 || triangle.x > width + triangle.size * 2) {
                triangle.homeX = randomBetween(-60, width + 60);
                triangle.x = triangle.homeX;
                triangle.velocityX *= -0.4;
            }

            if (triangle.y < -triangle.size * 2 || triangle.y > height + triangle.size * 2) {
                triangle.homeY = randomBetween(-60, height + 60);
                triangle.y = triangle.homeY;
                triangle.velocityY *= -0.4;
            }

            const offsetX = pointer.active ? (pointer.x - width / 2) * 0.018 * triangle.depth : 0;
            const offsetY = pointer.active ? (pointer.y - height / 2) * 0.014 * triangle.depth : 0;
            const pulse = 0.78 + Math.sin(time * 0.0012 + index) * 0.22;
            const centerX = triangle.x + offsetX;
            const centerY = triangle.y + offsetY;

            context.save();
            context.translate(centerX, centerY);
            context.rotate(triangle.rotation);
            context.beginPath();
            context.moveTo(0, -triangle.size);
            context.lineTo(triangle.size * 0.86, triangle.size * 0.62);
            context.lineTo(-triangle.size * 0.86, triangle.size * 0.62);
            context.closePath();

            if (triangle.filled) {
                context.fillStyle = triangle.hue === 0
                    ? `rgba(255, 255, 255, ${triangle.alpha * 0.35 * pulse})`
                    : `hsla(${triangle.hue}, 100%, 72%, ${triangle.alpha * 0.58 * pulse})`;
                context.fill();
            }

            context.strokeStyle = triangle.hue === 0
                ? `rgba(255, 255, 255, ${triangle.strokeAlpha * pulse})`
                : `hsla(${triangle.hue}, 100%, 76%, ${triangle.strokeAlpha * pulse})`;
            context.lineWidth = triangle.size > 52 ? 1.35 : 1;
            context.stroke();

            if (triangle.size > 42) {
                context.beginPath();
                context.moveTo(0, -triangle.size * 0.42);
                context.lineTo(triangle.size * 0.36, triangle.size * 0.2);
                context.lineTo(-triangle.size * 0.36, triangle.size * 0.2);
                context.closePath();
                context.strokeStyle = triangle.hue === 0
                    ? `rgba(255, 255, 255, ${triangle.strokeAlpha * 0.35 * pulse})`
                    : `hsla(${triangle.hue}, 100%, 82%, ${triangle.strokeAlpha * 0.26 * pulse})`;
                context.stroke();
            }

            context.restore();
        });
    };

    const updateShootingStar = () => {
        if (!shootingStar && Math.random() > 0.9935) {
            shootingStar = {
                x: randomBetween(width * 0.15, width * 0.9),
                y: randomBetween(0, height * 0.35),
                length: randomBetween(120, 220),
                speedX: randomBetween(5, 8),
                speedY: randomBetween(2.4, 4.2),
                life: 1
            };
        }

        if (!shootingStar) {
            return;
        }

        const tailX = shootingStar.x - shootingStar.length;
        const tailY = shootingStar.y - shootingStar.length * 0.35;
        const gradient = context.createLinearGradient(
            shootingStar.x,
            shootingStar.y,
            tailX,
            tailY
        );

        gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.life})`);
        gradient.addColorStop(0.35, `rgba(145, 208, 255, ${shootingStar.life * 0.65})`);
        gradient.addColorStop(1, "rgba(255, 255, 255, 0)");

        context.strokeStyle = gradient;
        context.lineWidth = 2;
        context.beginPath();
        context.moveTo(shootingStar.x, shootingStar.y);
        context.lineTo(tailX, tailY);
        context.stroke();

        shootingStar.x += shootingStar.speedX;
        shootingStar.y += shootingStar.speedY;
        shootingStar.life -= 0.015;

        if (shootingStar.life <= 0 || shootingStar.x - shootingStar.length > width || shootingStar.y > height * 0.7) {
            shootingStar = null;
        }
    };

    const renderSpaceScene = () => {
        const time = performance.now();
        context.clearRect(0, 0, width, height);
        drawBackgroundGlow();
        drawDust();
        drawStars(time);
        drawTriangles(time);
        updateShootingStar();

        animationFrame = window.requestAnimationFrame(renderSpaceScene);
    };

    const handlePointerMove = (event) => {
        const rect = heroSection.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = true;
    };

    const handlePointerLeave = () => {
        pointer.active = false;
    };

    resizeCanvas();

    if (!prefersReducedMotion) {
        renderSpaceScene();
        heroSection.addEventListener("pointermove", handlePointerMove);
        heroSection.addEventListener("pointerleave", handlePointerLeave);
        window.addEventListener("resize", resizeCanvas);
    }
}
