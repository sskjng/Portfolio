document.addEventListener('DOMContentLoaded', () => {
    const modalBackdrop = document.getElementById('project-modal');
    const closeButton = document.querySelector('.modal-close-btn');
    const projectCards = document.querySelectorAll('#Project .ProjectWrap > div');
    const modalContent = document.querySelector('.modal-content');

    let kedicalCarouselAnimationFrame; 
    let currentPosition = 0;
    let originalWidth = 0;
    let isCarouselRunning = false;

    const CAROUSEL_SPEED = 1; 

    function checkVisibility() {
        const modalScrollTop = modalContent.scrollTop;
        const modalHeight = modalContent.clientHeight;

        document.querySelectorAll('.project-detail').forEach(detail => {
            const detailOffsetTop = detail.offsetTop; 

            if (detailOffsetTop < modalScrollTop + (modalHeight * 0.7)) {
                detail.classList.add('is-scrolled-in');
            } else {
                detail.classList.remove('is-scrolled-in'); 
            }
        });
    }

    function applyParallax() {
        const modalScrollTop = modalContent.scrollTop;
        const modalHeight = modalContent.clientHeight;
        const minScale = 0.8; 
        const maxScale = 1.2; 
        const parallaxFactor = 0.4; // 변화 강도를 50%로 유지하여 부드러움을 확보

        document.querySelectorAll('.project-detail img').forEach(img => {
            const imgOffsetTop = img.offsetTop;
            const imgHeight = img.offsetHeight;
            
            const imgCenterPosition = imgOffsetTop + (imgHeight / 2);
            const relativePosition = imgCenterPosition - modalScrollTop;
            const normalizedPosition = Math.max(0, Math.min(1, relativePosition / modalHeight));
            
            // 중앙(0.5)으로부터의 거리 (0~1)
            const centerDistance = Math.abs(normalizedPosition - 0.5) * 2;
            
            // 이미지 중앙에 있을 때 (centerDistance=0), 스케일 변화량은 최대 (maxScale - minScale) * 1
            // 이미지 외곽에 있을 때 (centerDistance=1), 스케일 변화량은 최소 (maxScale - minScale) * 0
            const scaleChange = (maxScale - minScale) * (1 - centerDistance);
            
            // 💡 여기서 maxScale에 도달하도록 로직 수정:
            // scaleChange를 maxScale - minScale의 범위 내에서만 사용합니다.
            // 그리고 이 변화량을 parallaxFactor로 "희석"시킵니다.
            
            // minScale에서 maxScale까지의 총 변화 폭 (0.2)
            const totalScaleRange = maxScale - minScale; 
            
            // 현재 스크롤 위치에 따른 순수한 스케일 변화율 (0~1)
            const scrollInfluence = 1 - centerDistance; 

            // parallaxFactor를 적용한 최종 스케일 변화량
            const finalScaleChange = totalScaleRange * (minScale / totalScaleRange + scrollInfluence) * parallaxFactor;
            
            // 💡 최종 스케일을 (minScale)에서 (maxScale)까지 변화시키기 위해,
            // 변화량을 'totalScaleRange * scrollInfluence'로 사용하고, 
            // 이 변화량에 '1 - parallaxFactor'를 곱한 값을 'minScale'에 더하는 방식으로 조정합니다.
            
            // scale = minScale + (totalScaleRange * scrollInfluence * parallaxFactor);
            // 👆 이 방식은 1.0에 도달하지 못하므로, 로직을 역으로 바꿉니다.
            
            // minScale에서 maxScale로 가는 최대 변화량 (0.2)
            const maxDelta = maxScale - minScale;
            
            // 중앙에 가까울수록 (1.0), 멀어질수록 (0.0)이 되는 값
            const influence = 1 - centerDistance;

            // 최종 스케일: minScale(0.8) + maxDelta(0.2) * influence(0~1)
            let scale = minScale + maxDelta * influence;

            // 여기서 parallaxFactor를 사용하여 변화를 완화합니다.
            // (scale - minScale) : 실제 변화량
            // (scale - minScale) * parallaxFactor : 원하는 완화된 변화량
            // 최종 scale = minScale + (scale - minScale) * parallaxFactor
            scale = minScale + (scale - minScale) * (1 - parallaxFactor);
            
            // 스케일 값이 1.0을 초과하지 않도록 보정 (안전 장치)
            scale = Math.min(scale, maxScale); 
            
            img.style.transform = `scale(${scale})`;
        });
    }

    const handleScroll = () => {
        checkVisibility();
        applyParallax();
    };


    const animateScroll = () => {
        const carousel = document.getElementById('kedical-carousel');
        if (!carousel || !isCarouselRunning) return;

        currentPosition -= CAROUSEL_SPEED; 

        if (currentPosition <= -originalWidth) {
            currentPosition += originalWidth; 
        }

        carousel.style.transform = `translateX(${currentPosition}px)`;

        kedicalCarouselAnimationFrame = requestAnimationFrame(animateScroll);
    };


    const startKedicalCarousel = () => {
        const carousel = document.getElementById('kedical-carousel');
        if (!carousel || isCarouselRunning) return;

        const content = carousel.innerHTML;
        carousel.innerHTML = content + content; 

        const allListItems = carousel.querySelectorAll('li');
        
        if (allListItems.length > 0) {
            const halfLength = allListItems.length / 2;
            let calculatedWidth = 0;
            
            for (let i = 0; i < halfLength; i++) {
                const item = allListItems[i];
                calculatedWidth += item.offsetWidth; 
            }
            originalWidth = calculatedWidth;
        }

        isCarouselRunning = true;
        kedicalCarouselAnimationFrame = requestAnimationFrame(animateScroll); 
    };

    const stopAnimation = () => {
        if (kedicalCarouselAnimationFrame) {
            cancelAnimationFrame(kedicalCarouselAnimationFrame);
            kedicalCarouselAnimationFrame = null;
        }
        isCarouselRunning = false;
    };
    
    const startAnimation = () => {
        if (!isCarouselRunning) {
            isCarouselRunning = true;
            kedicalCarouselAnimationFrame = requestAnimationFrame(animateScroll);
        }
    };
    
    const stopKedicalCarousel = () => {
        stopAnimation(); 
        
        const carousel = document.getElementById('kedical-carousel');
        if (carousel) {
            carousel.style.transform = 'translateX(0)';
            currentPosition = 0;
            originalWidth = 0;
            
            const originalItems = Array.from(carousel.querySelectorAll('li')).slice(0, 12);
            carousel.innerHTML = ''; 
            originalItems.forEach(item => carousel.appendChild(item)); 
        }
    };


    const openModal = (projectName) => {
        document.querySelectorAll('.project-detail').forEach(detail => {
            detail.classList.remove('is-active');
        });

        const targetDetail = document.getElementById(`modal-${projectName}`);
        if (targetDetail) {
            targetDetail.classList.add('is-active');
        } else {
            console.error(`Modal content for ${projectName} not found.`);
            return;
        }

        modalBackdrop.classList.add('is-open');
        document.body.classList.add('no-scroll'); 

        modalContent.addEventListener('scroll', handleScroll);
        checkVisibility(); 
        applyParallax();

        if (projectName === 'Kedical') {
            setTimeout(startKedicalCarousel, 50); 
        }
    };

    const closeModal = () => {
        modalBackdrop.classList.remove('is-open');
        document.body.classList.remove('no-scroll'); 

        modalContent.removeEventListener('scroll', handleScroll);
        
        document.querySelectorAll('.project-detail.is-scrolled-in').forEach(detail => {
            detail.classList.remove('is-scrolled-in');
        });
        document.querySelectorAll('.project-detail img').forEach(img => {
            img.style.transform = 'scale(0.8)'; 
        });
        
        stopKedicalCarousel(); 
    };
    
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectName = card.className.split(' ').find(cls => 
                ['ISDMS', 'AIA', 'Decorations', 'Kedical', 'Medicare', 'Kyobo'].includes(cls)
            );
            
            if (projectName) {
                openModal(projectName);
            }
        });
    });

    closeButton.addEventListener('click', closeModal);

    modalBackdrop.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-backdrop')) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalBackdrop.classList.contains('is-open')) {
            closeModal();
        }
    });

    modalContent.classList.add('custom-scrollbar');
});
