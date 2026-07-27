import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// 1. Registrar GSAP y detectar preferencia de movimiento
gsap.registerPlugin(ScrollTrigger);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis;

if (!prefersReducedMotion) {
    // 2. Inicializar Lenis (Configuración de inercia más flotante y suave)
    lenis = new Lenis({
        duration: 1.8, // Duración de la animación más larga para mayor suavidad
        easing: (t) => 1 - Math.pow(1 - t, 4), // Easing Quartic Out para una deceleración más lenta y elegante
        wheelMultiplier: 0.8, // Atenúa los movimientos bruscos de la rueda del mouse
        smooth: true,
    });

    // 3. Sincronizar Lenis con GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    // 4. Unir Lenis al requestAnimationFrame (ticker) de GSAP
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0); // Previene saltos en la animación
}

/* Inicializar Lucide Icons */
lucide.createIcons();

/* Inicializar AOS Animations */
AOS.init({
    once: true, // Animación ocurre solo la primera vez que se hace scroll
    offset: 50, // Offset para gatillar
    easing: 'ease-out-cubic',
});

/* Lógica del Menú Cápsula (GSAP) */
let masterTL;

function updateActiveNavItem(element) {
    const items = document.querySelectorAll('.nav-item');
    items.forEach(item => {
        item.classList.remove('active', 'bg-white/20', 'text-white', 'font-semibold');
        item.classList.add('text-indigo-100', 'hover:bg-white/10', 'font-medium');
    });

    element.classList.add('active', 'bg-white/20', 'text-white', 'font-semibold');
    element.classList.remove('text-indigo-100', 'hover:bg-white/10', 'font-medium');
}

window.selectNavItem = function(element, event) {
    if (event) event.preventDefault();

    updateActiveNavItem(element);

    // Micro-animación elástica al hacer clic en las opciones del menú
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(element, { scale: 0.9 }, { scale: 1, duration: 0.35, ease: "back.out(3)" });
    }
    
    // Scroll suave hacia la sección (sincronizado con Lenis)
    const targetId = element.getAttribute('href');
    if(targetId && targetId !== '#') {
        const targetElement = document.querySelector(targetId);
        if(targetElement) {
            if (lenis) {
                lenis.scrollTo(targetElement, {
                    offset: -100,
                    duration: 1.2
                });
            } else {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        }
    }
}

        function initScrollSpy() {
            const navItems = document.querySelectorAll('.nav-item');
            const sections = Array.from(navItems).map(item => {
                const id = item.getAttribute('href');
                if (!id || id === '#') return null;
                return document.querySelector(id);
            }).filter(Boolean);

            if (sections.length === 0) return;

            const observerOptions = {
                root: null,
                rootMargin: '-40% 0px -60% 0px',
                threshold: 0
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = '#' + entry.target.id;
                        const activeItem = document.querySelector(`.nav-item[href="${id}"]`);
                        if (activeItem) {
                            updateActiveNavItem(activeItem);
                        }
                    }
                });
            }, observerOptions);

            sections.forEach(section => observer.observe(section));
        }

        function buildGSAPAnimation() {
            const centerCapsule = document.getElementById('centerCapsule');
            const leftSocket = document.getElementById('leftSocket');
            const rightSocket = document.getElementById('rightSocket');
            const leftContent = document.getElementById('leftContent');
            const rightContent = document.getElementById('rightContent');
            const navItems = document.querySelectorAll('.nav-item');

            if(!centerCapsule) return; // Si no existe el menú, salir

            // Guardar el ancho completo original de la cápsula
            const targetWidth = centerCapsule.offsetWidth;

            const isDesktop = window.innerWidth >= 1024;

            // Matar cualquier animación previa activa
            if (masterTL) masterTL.kill();

            masterTL = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.3 }); // Pequeño delay inicial

            if (isDesktop) {
                // RESET DESKTOP NAVBAR
                gsap.set([centerCapsule, leftSocket, rightSocket, leftContent, rightContent, navItems], {
                    clearProps: "all"
                });

                // Ocultar contenidos internos inicialmente
                gsap.set([leftContent, rightContent], { opacity: 0, scale: 0.85, y: 3 });
                gsap.set(navItems, { opacity: 0, scale: 0.7, y: 12 });

                // Posición inicial: la cápsula empieza siendo un pequeño círculo en el centro
                gsap.set(centerCapsule, {
                    width: 52,
                    paddingLeft: 0,
                    paddingRight: 0,
                    scale: 0.2,
                    opacity: 0,
                    transformOrigin: "center center"
                });

                // Ocultar las lengüetas replegadas detrás del centro
                gsap.set(leftSocket, { x: 100, opacity: 0, scaleX: 0.8 });
                gsap.set(rightSocket, { x: -100, opacity: 0, scaleX: 0.8 });

                // PASO 1: Aparece el círculo central con efecto muelle
                masterTL.to(centerCapsule, {
                    duration: 0.45,
                    opacity: 1,
                    scale: 1,
                    ease: "back.out(2)"
                });

                // PASO 2: El círculo se expande suavemente a los lados transformándose en la cápsula completa
                masterTL.to(centerCapsule, {
                    duration: 0.75,
                    width: targetWidth,
                    paddingLeft: "1rem",
                    paddingRight: "1rem",
                    ease: "elastic.out(1, 0.75)"
                }, "-=0.1");

                // PASO 3: Salen las lengüetas laterales desde los costados
                masterTL.to([leftSocket, rightSocket], {
                    duration: 0.6,
                    x: 0,
                    opacity: 1,
                    scaleX: 1,
                    stagger: 0.05,
                    ease: "back.out(1.5)"
                }, "-=0.45");

                // PASO 4: Aparecen el Logo (izquierda) y el Botón de presupuesto (derecha)
                masterTL.to([leftContent, rightContent], {
                    duration: 0.4,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    stagger: 0.1,
                    ease: "power2.out"
                }, "-=0.3");

                // PASO 5: Se revelan en cascada los ítems del menú con rebote individual
                masterTL.to(navItems, {
                    duration: 0.45,
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    stagger: 0.07,
                    ease: "back.out(2)"
                }, "-=0.25");
            }

            // ANIMACIÓN DE LA SECCIÓN DE INICIO (HERO)
            const heroElements = ["#heroTitle", "#heroText", "#heroButtons"];
            
            // Ocultamos elementos inicialmente
            gsap.set(heroElements, { opacity: 0, y: 30 });
            gsap.set("#heroMockup", { opacity: 0, x: isDesktop ? 50 : 0, y: isDesktop ? 0 : 30 });
            gsap.set(["#heroGlow1", "#heroGlow2"], { opacity: 0, scale: 0.6 });

            // Entrada coordinada
            const heroStartTime = isDesktop ? "-=0.2" : "0";

            masterTL.to(heroElements, {
                duration: 0.8,
                opacity: 1,
                y: 0,
                stagger: 0.15,
                ease: "power3.out"
            }, heroStartTime)
            .to("#heroMockup", {
                duration: 1,
                opacity: 1,
                x: 0,
                y: 0,
                ease: "power3.out"
            }, "-=0.6")
            .to(["#heroGlow1", "#heroGlow2"], {
                duration: 1.2,
                opacity: 0.5,
                scale: 1,
                stagger: 0.2,
                ease: "power2.out"
            }, "-=0.3");
        }

        function initAsesoriaButton() {
            const btnAsesoria = document.getElementById('btn-asesoria');
            const btnText = document.getElementById('btn-asesoria-text');
            const btnProgress = document.getElementById('btn-asesoria-progress');
            
            if (btnAsesoria && btnText && btnProgress) {
                let isAnimating = false;
                let countdownInterval;
                
                btnAsesoria.addEventListener('click', (e) => {
                    if (isAnimating) {
                        e.preventDefault();
                        return;
                    }
                    
                    e.preventDefault();
                    isAnimating = true;
                    
                    btnAsesoria.style.pointerEvents = 'none';
                    
                    btnProgress.style.transition = 'none';
                    btnProgress.style.width = '0%';
                    btnProgress.getBoundingClientRect(); // Force reflow
                    btnProgress.style.transition = 'width 4000ms linear';
                    btnProgress.style.width = '100%';
                    
                    const svg = btnAsesoria.querySelector('svg');
                    if (svg) {
                        svg.classList.remove('rotate-45');
                        svg.classList.add('animate-spin');
                    }
                    
                    let timeLeft = 4;
                    btnText.textContent = `Agendando en ${timeLeft}s...`;
                    
                    countdownInterval = setInterval(() => {
                        timeLeft -= 1;
                        if (timeLeft > 0) {
                            btnText.textContent = `Agendando en ${timeLeft}s...`;
                        } else {
                            clearInterval(countdownInterval);
                            btnText.textContent = '¡Listo!';
                            
                            setTimeout(() => {
                                isAnimating = false;
                                btnAsesoria.style.pointerEvents = 'auto';
                                btnText.textContent = 'Agendar asesoría gratuita';
                                btnProgress.style.transition = 'none';
                                btnProgress.style.width = '0%';
                                if (svg) {
                                    svg.classList.remove('animate-spin');
                                    svg.classList.add('rotate-45');
                                }
                                
                                const targetElement = document.querySelector('#contacto');
                                if (targetElement) {
                                    if (lenis) {
                                        lenis.scrollTo(targetElement, {
                                            offset: -100,
                                            duration: 1.2
                                        });
                                    } else {
                                        window.scrollTo({
                                            top: targetElement.offsetTop - 100,
                                            behavior: 'smooth'
                                        });
                                    }
                                }
                            }, 500);
                        }
                    }, 1000);
                });
            }
        }

        function startPageAnimations() {
            if (window.innerWidth >= 1024) {
                buildGSAPAnimation();
            }
            initScrollSpy();
            initAsesoriaButton();
        }

        // Ejecutar animación cuando la página carga completamente
        window.addEventListener('DOMContentLoaded', () => {
            startPageAnimations();
        });

        // Reconstruir animación si la ventana cambia de tamaño cruzando el umbral
        let wasDesktop = window.innerWidth >= 1024;
        window.addEventListener('resize', () => {
            const isDesktop = window.innerWidth >= 1024;
            if (isDesktop && !wasDesktop) {
                buildGSAPAnimation();
            }
            wasDesktop = isDesktop;
        });

        /* Función mock para WhatsApp (Evitar uso de alerts) */
        function openWhatsApp() {
            // En un entorno real esto abre el link de api.whatsapp.com
            // Ejemplo: window.open('https://wa.me/1234567890?text=Hola,%20quiero%20información', '_blank');
            console.log("Simulando apertura de WhatsApp para conversión...");
            
            // Creamos un modal simple para simular el mensaje ya que no usamos alert()
            const modal = document.createElement('div');
            modal.className = 'fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 opacity-0 transition-opacity duration-300';
            modal.innerHTML = `
                <div class="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl transform scale-95 transition-transform duration-300">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 mx-auto">
                        <i data-lucide="check" class="w-6 h-6"></i>
                    </div>
                    <h3 class="text-xl font-bold text-center text-gray-900 mb-2">¡Casi listo!</h3>
                    <p class="text-center text-gray-600 mb-6 text-sm">En un entorno real, esto abriría tu aplicación de WhatsApp con un mensaje predeterminado para iniciar la venta.</p>
                    <button id="close-modal" class="w-full bg-gray-900 text-white rounded-full py-3 font-medium hover:bg-gray-800 transition-colors">
                        Entendido
                    </button>
                </div>
            `;
            document.body.appendChild(modal);
            lucide.createIcons();
            
            // Fade in
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.querySelector('div').classList.remove('scale-95');
            }, 10);

            // Cerrar
            document.getElementById('close-modal').addEventListener('click', (e) => {
                e.preventDefault();
                modal.classList.add('opacity-0');
                modal.querySelector('div').classList.add('scale-95');
                setTimeout(() => modal.remove(), 300);
            });
        }

        /* Lógica para Modo Oscuro / Claro */
        const themeToggleBtn = document.getElementById('themeToggle');
        const htmlElement = document.documentElement;

        // Comprobar preferencia previa o preferencia del sistema
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            htmlElement.classList.add('dark');
        } else {
            htmlElement.classList.remove('dark');
        }
        
        lucide.createIcons(); // Refrescar iconos

        if (themeToggleBtn) {
            themeToggleBtn.addEventListener('click', () => {
                if (htmlElement.classList.contains('dark')) {
                    htmlElement.classList.remove('dark');
                    localStorage.theme = 'light';
                } else {
                    htmlElement.classList.add('dark');
                    localStorage.theme = 'dark';
                }
            });
        }

        /* Lógica de Animación y Ordenamiento para Sección Servicios (.arch) */
        window.addEventListener('DOMContentLoaded', () => {
            const archRight = document.querySelector('.arch__right');
            if (!archRight) return; // Si no estamos en la página con servicios, salir

            // Set z-index for images
            document.querySelectorAll(".arch__right .img-wrapper").forEach((element) => {
                const order = element.getAttribute("data-index");
                if (order !== null) {
                    element.style.zIndex = order;
                }
            });

            // Mobile layout handler (only handle order)
            function handleMobileLayout() {
                const isMobile = window.matchMedia("(max-width: 768px)").matches;
                const leftItems = gsap.utils.toArray(".arch__left .arch__info");
                const rightItems = gsap.utils.toArray(".arch__right .img-wrapper");

                if (isMobile) {
                    // Interleave items using order
                    leftItems.forEach((item, i) => {
                        item.style.order = i * 2;
                    });
                    rightItems.forEach((item, i) => {
                        item.style.order = i * 2 + 1;
                    });
                } else {
                    // Clear order for desktop
                    leftItems.forEach((item) => {
                        item.style.order = "";
                    });
                    rightItems.forEach((item) => {
                        item.style.order = "";
                    });
                }
            }

            // Debounce resize for performance
            let resizeTimeout;
            window.addEventListener("resize", () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(handleMobileLayout, 100);
            });

            // Run on initial load
            handleMobileLayout();

            const imgs = gsap.utils.toArray(".img-wrapper img");

            // GSAP Animation with Media Query
            ScrollTrigger.matchMedia({
                "(min-width: 769px)": function () {
                    const mainTimeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: ".arch",
                            start: "top 70px",
                            end: "bottom bottom",
                            pin: ".arch__right",
                            scrub: true
                        }
                    });

                    gsap.set(imgs, {
                        clipPath: "inset(0)",
                        objectPosition: "0px 0%"
                    });

                    imgs.forEach((_, index) => {
                        const currentImage = imgs[index];
                        const nextImage = imgs[index + 1] ? imgs[index + 1] : null;

                        const sectionTimeline = gsap.timeline();

                        if (nextImage) {
                            sectionTimeline
                                .to(
                                    "#servicios",
                                    {
                                        backgroundColor: () => document.documentElement.classList.contains('dark') 
                                            ? ["#1e293b", "#0f172a", "#1e1b4b"][index] 
                                            : ["#EDF9FF", "#FFECF2", "#FFE8DB"][index],
                                        duration: 1.5,
                                        ease: "power2.inOut"
                                    },
                                    0
                                )
                                .to(
                                    currentImage,
                                    {
                                        clipPath: "inset(0px 0px 100%)",
                                        objectPosition: "0px 60%",
                                        duration: 1.5,
                                        ease: "none"
                                    },
                                    0
                                )
                                .to(
                                    nextImage,
                                    {
                                        objectPosition: "0px 40%",
                                        duration: 1.5,
                                        ease: "none"
                                    },
                                    0
                                );
                        }

                        mainTimeline.add(sectionTimeline);
                    });
                },
                "(max-width: 768px)": function () {
                    /* INACTIVADO MOMENTÁNEAMENTE: anterior efecto móvil
                    const mobileCards = gsap.utils.toArray(".mobile-service-card");
                    const totalMobileCards = mobileCards.length;

                    if (totalMobileCards === 0) return;

                    gsap.set(mobileCards[0], { y: "0%", scale: 1, rotation: 0, opacity: 1, pointerEvents: "auto" });
                    for (let i = 1; i < totalMobileCards; i++) {
                        gsap.set(mobileCards[i], { y: "130%", scale: 1, rotation: 0, opacity: 0, pointerEvents: "none" });
                    }

                    const mobileTimeline = gsap.timeline({
                        scrollTrigger: {
                            trigger: ".mobile-sticky-trigger",
                            start: "top 70px",
                            end: () => `+=${window.innerHeight * (totalMobileCards - 1)}`,
                            pin: true,
                            scrub: 0.5,
                            pinSpacing: true,
                        }
                    });

                    for (let i = 0; i < totalMobileCards - 1; i++) {
                        const currentCard = mobileCards[i];
                        const nextCard = mobileCards[i + 1];
                        const position = i;

                        mobileTimeline.to(
                            currentCard,
                            {
                                scale: 0.7,
                                rotation: 5,
                                pointerEvents: "none",
                                duration: 1,
                                ease: "none"
                            },
                            position
                        );

                        mobileTimeline.to(
                            nextCard,
                            {
                                y: "0%",
                                opacity: 1,
                                pointerEvents: "auto",
                                duration: 1,
                                ease: "none"
                            },
                            position
                        );

                        mobileTimeline.to(
                            "#servicios",
                            {
                                backgroundColor: () => document.documentElement.classList.contains('dark') 
                                    ? ["#1e293b", "#0f172a", "#1e1b4b"][i] 
                                    : ["#EDF9FF", "#FFECF2", "#FFE8DB"][i],
                                duration: 1,
                                ease: "power2.inOut"
                            },
                            position
                        );
                    }

                    const resizeObserver = new ResizeObserver(() => {
                        ScrollTrigger.refresh();
                    });
                    
                    const triggerContainer = document.querySelector(".mobile-services-container");
                    if (triggerContainer) {
                        resizeObserver.observe(triggerContainer);
                    }

                    return () => {
                        resizeObserver.disconnect();
                    };
                    */

                    // NUEVO EFECTO CARD STACKING ALTERNATIVO
                    let cards = gsap.utils.toArray(".stackCard");
                    if (cards.length === 0) return;

                    let stickDistance = 0;

                    let firstCardST = ScrollTrigger.create({
                        trigger: cards[0],
                        start: "center center"
                    });

                    let lastCardST = ScrollTrigger.create({
                        trigger: cards[cards.length - 1],
                        start: "center center"
                    });

                    let createdTriggers = [];

                    cards.forEach((card, index) => {
                        var scale = 1 - (cards.length - index) * 0.025;
                        
                        // Obtenemos el origen dinámico
                        let scaleDown = gsap.to(card, {
                            scale: scale, 
                            'transform-origin': `50% ${lastCardST.start + stickDistance}px`
                        });

                        let trigger = ScrollTrigger.create({
                            trigger: card,
                            start: "center center",
                            end: () => lastCardST.start + stickDistance,
                            pin: true,
                            markers: false, // markers desactivados
                            pinSpacing: false,
                            ease: "none",
                            animation: scaleDown,
                            toggleActions: "restart none none reverse"
                        });
                        
                        createdTriggers.push(trigger);
                    });

                    // Devolvemos una función de limpieza para desmontar los disparadores en caso de cambiar de resolución
                    return () => {
                        firstCardST.kill();
                        lastCardST.kill();
                        createdTriggers.forEach(t => t.kill());
                    };
                }
            });
        });