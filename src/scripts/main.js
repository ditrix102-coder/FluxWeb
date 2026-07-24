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
            
            // Scroll suave hacia la sección
            const targetId = element.getAttribute('href');
            if(targetId && targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if(targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 100,
                        behavior: 'smooth'
                    });
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

            // Matar cualquier animación previa activa
            if (masterTL) masterTL.kill();

            masterTL = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.5 }); // Pequeño delay inicial

            // 0. Resetear propiedades
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

        // Ejecutar animación cuando la página carga completamente
        window.addEventListener('DOMContentLoaded', () => {
            // Solo animar si estamos en escritorio (lg: >= 1024px)
            if (window.innerWidth >= 1024) {
                buildGSAPAnimation();
            } else {
                // Asegurarse de que el mobile header esté visible
                const mobileHeader = document.querySelector('.lg\\:hidden');
                if (mobileHeader) mobileHeader.style.opacity = 1;
            }
            initScrollSpy();
            initMobileMenu();
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

        /* Lógica del Menú Móvil */
        function initMobileMenu() {
            const toggleBtn = document.getElementById('mobileMenuToggle');
            const menuOverlay = document.getElementById('mobileMenuOverlay');
            const menuIcon = document.getElementById('menuIcon');
            const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
            let isMenuOpen = false;

            if (!toggleBtn || !menuOverlay) return;

            function openMenu() {
                isMenuOpen = true;
                menuOverlay.classList.remove('opacity-0', 'pointer-events-none');
                menuIcon.setAttribute('data-lucide', 'x');
                document.body.style.overflow = 'hidden'; // Prevenir scroll
                lucide.createIcons();
                // Añadir hash para que el botón "Atrás" de Android funcione
                if (window.location.hash !== '#menu') {
                    window.history.pushState({ menu: true }, '', '#menu');
                }
            }

            function closeMenu() {
                isMenuOpen = false;
                menuOverlay.classList.add('opacity-0', 'pointer-events-none');
                menuIcon.setAttribute('data-lucide', 'menu');
                document.body.style.overflow = '';
                lucide.createIcons();
                // Si el hash es #menu, lo quitamos
                if (window.location.hash === '#menu') {
                    window.history.back();
                }
            }

            toggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (isMenuOpen) {
                    closeMenu();
                } else {
                    openMenu();
                }
            });

            // Cerrar menú si el usuario presiona el botón "Atrás" en su celular
            window.addEventListener('popstate', (e) => {
                if (isMenuOpen && window.location.hash !== '#menu') {
                    // El usuario presionó atrás, cerramos el menú pero sin llamar a history.back() de nuevo
                    isMenuOpen = false;
                    menuOverlay.classList.add('opacity-0', 'pointer-events-none');
                    menuIcon.setAttribute('data-lucide', 'menu');
                    document.body.style.overflow = '';
                    lucide.createIcons();
                }
            });

            mobileNavItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = item.getAttribute('href');
                    
                    if (isMenuOpen) {
                        closeMenu();
                    }
                    
                    if(targetId && targetId !== '#') {
                        // Esperar un instante para que el overflow:hidden se quite y el DOM respire
                        setTimeout(() => {
                            const targetElement = document.querySelector(targetId);
                            if(targetElement) {
                                // Calculamos la posición exacta
                                const elementPosition = targetElement.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.scrollY - 80;
                                
                                window.scrollTo({
                                    top: offsetPosition,
                                    behavior: 'smooth'
                                });
                                
                                // Actualizamos la URL para navegación normal
                                window.history.pushState(null, '', targetId);
                            }
                        }, 50);
                    }
                });
            });
        }

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